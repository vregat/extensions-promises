import {
    Source,
    Manga,
    MangaStatus,
    Chapter,
    ChapterDetails,
    HomeSection,
    MangaTile,
    SearchRequest,
    LanguageCode,
    TagSection,
    PagedResults,
    SourceInfo,
    MangaUpdates,
    RequestHeaders,
    TagType
} from "paperback-extensions-common"

const READMNGCOM_DOMAIN = 'https://www.readmng.com'

export const ReadmngComInfo: SourceInfo = {
    version: '0.0.9',
    name: 'Readmng.com',
    description: 'Extension that pulls mangas from readmng.com',
    author: 'Vregat',
    authorWebsite: 'https://github.com/vregat/extensions-promises',
    icon: 'logo.png',
    hentaiSource: false,
    websiteBaseURL: READMNGCOM_DOMAIN
}

export class ReadmngCom extends Source {
    async getMangaDetails(mangaId: string): Promise<Manga> {
        let request = createRequestObject({
            url: `${READMNGCOM_DOMAIN}/${mangaId}`,
            method: 'GET'
        })

        let response = await this.requestManager.schedule(request, 1)

        let $ = this.cheerio.load(response.data)
        let panel = $('.panel-body')
        let title = $('.img-responsive', panel).attr('alt') ?? ''
        let image = $('.img-responsive', panel).attr('src') ?? ''

        let titles = [title].concat($('.dl-horizontal > dd:nth-child(2)', panel).text().split(/,|;/))
        let status = $('.dl-horizontal > dd:nth-child(4)', panel).text().toString() == 'Completed' ? MangaStatus.COMPLETED : MangaStatus.ONGOING
        let views = +$('.dl-horizontal > dd:nth-child(10)', panel).text().split(',').join('')

        let genres = []
        for (let tagElement of $('.dl-horizontal > dd:nth-child(6)', panel).find('a').toArray()) {
            let id = $(tagElement).attr('href').replace(`${READMNGCOM_DOMAIN}/category/`, '')
            let text = $(tagElement).contents().text()
            genres.push(createTag({ id: id, label: text }))
        }

        let genresSection = createTagSection({ id: 'genre', label: 'Genre', tags: genres })

        let description = $('.movie-detail').text().trim()

        let castList = $('ul.cast-list')
        let authorElement = $('li:contains("Author")', castList)
        let author = $("li > a", authorElement).text().trim()

        let artistElement = $('li:contains("Artist")', castList)
        let artist = $("li > a", artistElement).text().trim()

        let rating = +$('div.progress-bar-success').attr('title').replace('%', '')

        return createManga({
            id: mangaId,
            titles: titles,
            image: image,
            rating: rating,
            status: status,
            views: views,
            desc: description,
            tags: [genresSection],
            author: author,
            artist: artist
        })
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        let request = createRequestObject({
            url: `${READMNGCOM_DOMAIN}/${mangaId}`,
            method: 'GET'
        })

        let response = await this.requestManager.schedule(request, 1)

        let $ = this.cheerio.load(response.data)
        let allChapters = $('ul.chp_lst')
        let chapters: Chapter[] = []
        let chNum: number = $('ul.chp_lst > li').toArray().length - 1

        for (let chapter of $('li', allChapters).toArray()) {
            let id: string = $('a', chapter).attr('href')?.split('/').pop() ?? ''
            let name: string = $('a > .val', chapter).text().trim() ?? ''

            let time = $('a > .dte', chapter).text().trim() ?? ''
            let timeValue = +time.split(' ')[0]

            let parsedDate = new Date(Date.now())

            if (time.includes('Second')) {
                parsedDate.setSeconds(parsedDate.getSeconds() - timeValue)
            } else if (time.includes('Minute')) {
                parsedDate.setMinutes(parsedDate.getMinutes() - timeValue)
            } else if (time.includes('Hour')) {
                parsedDate.setHours(parsedDate.getHours() - timeValue)
            } else if (time.includes('Day')) {
                parsedDate.setDate(parsedDate.getDate() - timeValue)
            } else if (time.includes('Week')) {
                parsedDate.setDate(parsedDate.getDate() - (timeValue * 7))
            } else if (time.includes('Month')) {
                parsedDate.setMonth(parsedDate.getMonth() - timeValue)
            } else if (time.includes('Year')) {
                parsedDate.setFullYear(parsedDate.getFullYear() - timeValue)
            }

            chapters.push(createChapter({
                id: id,
                mangaId: mangaId,
                name: name,
                langCode: LanguageCode.ENGLISH,
                chapNum: chNum,
                time: parsedDate
            }))
            chNum--
        }
        return chapters
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        let request = createRequestObject({
            url: `${READMNGCOM_DOMAIN}/${mangaId}/${chapterId}/all-pages`,
            method: 'GET'
        })

        let response = await this.requestManager.schedule(request, 1)

        let $ = this.cheerio.load(response.data)

        let pages: string[] = []
        for (const page of $('.page_chapter > .img-responsive').toArray()) {
            pages.push($(page).attr('src') ?? '')
        }

        let chapterDetails = createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: false
        })
        return chapterDetails
    }

    async searchRequest(query: SearchRequest, metadata: any): Promise<PagedResults> {
        let title = (query.title ?? '').split(' ').join('+')
        let author = (query.author ?? '').split(' ').join('+')
        let artist = (query.artist ?? '').split(' ').join('+')

        let status = ''
        switch (query.status) {
            case 0:
                status = 'completed'
                break;
            case 1:
                status = 'ongoing'
                break;
            default:
                status = 'both'
                break;
        }

        let request = createRequestObject({
            url: `${READMNGCOM_DOMAIN}/service/advanced_search`,
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-Requested-With": "XMLHttpRequest"
            },
            data: {
                'type': 'all',
                'manga-name': title,
                'author-name': author,
                'artist-name': artist,
                'status': status
            }
        })

        let response = await this.requestManager.schedule(request, 1)

        let $ = this.cheerio.load(response.data)

        let manga: MangaTile[] = []

        for (let item of $('.style-list > div.box').toArray()) {
            let id = $('.title a', item).attr('href')?.replace(`${READMNGCOM_DOMAIN}/`, '') ?? ''
            let title = $('.title a', item).attr('title') ?? ''
            let img = $('.body a > img', item).attr('src') ?? ''

            manga.push(createMangaTile({
                id: id,
                title: createIconText({ text: title }),
                image: img
            }))
        }

        return createPagedResults({
            results: manga
        })
    }

    getMangaShareUrl(mangaId: string): string {
        return `${READMNGCOM_DOMAIN}/${mangaId}`
    }

    async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        let loadNextPage: boolean = true
        let currentPage: number = 1
        time.setHours(0, 0, 0, 0) //website does not use hours/minutes/seconds

        while (loadNextPage) {
            let request = createRequestObject({
                url: `${READMNGCOM_DOMAIN}/latest-releases/${currentPage}`,
                method: 'GET'
            })
            let response = await this.requestManager.schedule(request, 1)
            let $ = this.cheerio.load(response.data)

            let passedTime = false
            let updatedManga = $('.manga_updates')
            let foundIds: string[] = []

            for (let manga of $('dl', updatedManga).toArray()) {
                let item = $('dt', manga)
                let mangaInfo = $('a.manga_info', item).attr('href').replace(`${READMNGCOM_DOMAIN}/`, '')
                let updatedDate = $('span.time', item).contents().text().split('/')
                let parsedDate = new Date(+updatedDate[2], (+updatedDate[1]) - 1, +updatedDate[0])

                let numChapters = $('dd', manga).toArray().length

                passedTime = parsedDate < time
                if (!passedTime) {
                    if (ids.includes(mangaInfo)) {
                        for (let c = 0; c < numChapters; c++) {
                            foundIds.push(mangaInfo)
                        }
                    }
                } else {
                    break
                }
            }
            if (!passedTime) {
                currentPage++
            } else {
                loadNextPage = false
            }

            mangaUpdatesFoundCallback(createMangaUpdates({
                ids: foundIds
            }))
        }
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        this.parseLatestReleases(sectionCallback)
        this.parseHotManga(sectionCallback)
    }

    async parseLatestReleases(sectionCallback: (section: HomeSection) => void) {
        let latestSection = createHomeSection({
            id: 'latest_releases',
            title: 'LATEST RELEASES'
        })
        sectionCallback(latestSection)

        let latestRequest = createRequestObject({ url: `${READMNGCOM_DOMAIN}/latest-releases`, method: 'GET' })
        let response = await this.requestManager.schedule(latestRequest, 1)

        let result: MangaTile[] = []
        let $ = this.cheerio.load(response.data)
        let pages = $('div.content-list div.style-thumbnail')

        for (let item of $('li', pages).toArray()) {
            let id = $('.thumbnail', item).attr('href')?.replace(`${READMNGCOM_DOMAIN}/`, '') ?? ''
            let img = $('.thumbnail img', item).attr('src') ?? ''
            let title = $('.thumbnail', item).attr('title')?.replace(`${READMNGCOM_DOMAIN}/`, '') ?? ''

            result.push(createMangaTile({
                id: id,
                image: img,
                title: createIconText({ text: title })
            }))
        }

        latestSection.items = result
        sectionCallback(latestSection)
    }

    async parseHotManga(sectionCallback: (section: HomeSection) => void) {
        let hotSection = createHomeSection({
            id: 'hot_manga',
            title: 'HOT MANGA'
        })
        sectionCallback(hotSection)

        let hotRequest = createRequestObject({ url: `${READMNGCOM_DOMAIN}/hot-manga`, method: 'GET' })
        let response = await this.requestManager.schedule(hotRequest, 1)

        let result: MangaTile[] = []
        let $ = this.cheerio.load(response.data)
        let pages = $('div.style-list')
        for (let item of $('div.box', pages).toArray()) {
            let id = $('.body > .left > a', item).attr('href')?.replace(`${READMNGCOM_DOMAIN}/`, '') ?? ''
            let img = $('.body > .left img', item).attr('src') ?? ''
            let title = $('.body > .left > a', item).attr('title')?.replace(`${READMNGCOM_DOMAIN}/`, '') ?? ''

            result.push(createMangaTile({
                id: id,
                image: img,
                title: createIconText({ text: title })
            }))
        }
        hotSection.items = result
        sectionCallback(hotSection)
    }
}