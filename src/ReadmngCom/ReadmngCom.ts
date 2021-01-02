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
    SourceInfo
} from "paperback-extensions-common"

const READMNGCOM_DOMAIN = 'https://www.readmng.com'

export const ReadmngComInfo: SourceInfo = {
    version: '0.0.1',
    name: 'Readmng.com',
    description: 'Extension that pulls mangas from readmng.com',
    author: 'Vregat',
    authorWebsite: 'https://github.com/vregat',
    icon: 'logo.png',
    hentaiSource: false,
    websiteBaseURL: READMNGCOM_DOMAIN
}

export class ReadmngCom extends Source {
    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        let request = createRequestObject({
            url: `${READMNGCOM_DOMAIN}/${mangaId}/${chapterId}/all-pages`,
            method: 'GET'
        })

        let data = await this.requestManager.schedule(request, 1)

        let $ = this.cheerio.load(data.data)

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

    async getChapters(mangaId: string): Promise<Chapter[]> {
        let request = createRequestObject({
            url: `${READMNGCOM_DOMAIN}/${mangaId}`,
            method: 'GET'
        })

        const data = await this.requestManager.schedule(request, 1)

        let $ = this.cheerio.load(data.data)
        let allChapters = $('.chp_lst')
        let chapters: Chapter[] = []
        let chNum: number = $('li', allChapters).toArray().length - 1
        for (let chapter of $('li', allChapters).toArray()) {
            let id: string = $('a', chapter).attr('href')?.split('/').pop() ?? ''
            let name: string = $('a > .val', chapter).text().trim() ?? ''
            let time: Date = new Date($('a > .dte', chapter).attr('title').replace('Published on', '').trim() ?? '')

            chapters.push(createChapter({
                id: id,
                mangaId: mangaId,
                name: name,
                langCode: LanguageCode.ENGLISH,
                chapNum: chNum,
                time: time
            }))

            chNum--
        }
        return chapters
    }

    async getMangaDetails(mangaId: string): Promise<Manga> {
        let request = createRequestObject({
            url: `${READMNGCOM_DOMAIN}/${mangaId}`,
            method: 'GET'
        })

        const data = await this.requestManager.schedule(request, 1)

        let $ = this.cheerio.load(data.data)
        let panel = $('.panel-body')
        let title = $('.img-responsive', panel).attr('alt') ?? ''
        let image = $('.img-responsive', panel).attr('src') ?? ''

        let titles = [title].concat($('.dl-horizontal > dd:nth-child(2)', panel).text().split(/,|;/))
        let status = $('.dl-horizontal > dd:nth-child(3)', panel).text() === "Completed" ? MangaStatus.COMPLETED : MangaStatus.ONGOING
        let views = Number($('.dl-horizontal > dd:nth-child(10)', panel).text().replace(',', ''))
        let tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: [] })]

        for (let tagElement of $('.dl-horizontal > dd:nth-child(6)', panel).find('a').toArray()) {
            let id = $(tagElement).attr('href').replace(`${READMNGCOM_DOMAIN}/`, '')
            let text = $(tagElement).contents().text()
            tagSections[0].tags.push(createTag({ id: id, label: text }))
        }

        let description = $('.movie-detail').text().trim()

        let author = '' //TODO
        let artist = '' //TODO

        let rating = 0 //TODO

        return createManga({
            id: mangaId,
            titles: titles,
            image: image,
            rating: rating,
            status: status,
            views: views,
            desc: description,
            tags: tagSections,
            author: author,
            artist: artist
        })
    }

    async searchRequest(query: SearchRequest, metadata: any): Promise<PagedResults> {

    }

    getMangaShareUrl(mangaId: string): string | null { return `${READMNGCOM_DOMAIN}/${mangaId}` }
}