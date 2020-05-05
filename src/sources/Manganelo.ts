
import { Source } from './Source'
import { Manga } from '../models/Manga/Manga'
import { Chapter } from '../models/Chapter/Chapter'
import { MangaTile } from '../models/MangaTile/MangaTile'
import { SearchRequest } from '../models/SearchRequest/SearchRequest'
import { Request } from '../models/RequestObject/RequestObject'
import { ChapterDetails } from '../models/ChapterDetails/ChapterDetails'
import { TagSection } from '../models/TagSection/TagSection'
import { HomeSectionRequest, HomeSection } from '../models/HomeSection/HomeSection'

const MN_DOMAIN = 'https://manganelo.com'

export class Manganelo extends Source {
  allDemogrpahic: string[]
  constructor(cheerio: CheerioAPI) {
    super(cheerio)
    this.allDemogrpahic = ["Shounen", "Shoujo", "Seinen", "Josei"]
  }

  getMangaDetailsRequest(ids: string[]): Request[] {
    let requests: Request[] = []
    for (let id of ids) {
      let metadata = { 'id': id }
      requests.push(createRequestObject({
        url: `${MN_DOMAIN}/manga/`,
        metadata: metadata,
        method: 'GET',
        param: id
      }))
    }
    return requests
  }

  getMangaDetails(data: any[], metadata: any[]): Manga[] {
    let manga: Manga[] = []
    for (let [i, response] of data.entries()) {
      let $ = this.cheerio.load(response)
      let panel = $('.panel-story-info')
      let title = $('.img-loading', panel).attr('title') ?? ''
      let image = $('.img-loading', panel).attr('src') ?? ''
      let table = $('.variations-tableInfo', panel)
      let author = ''
      let artist = ''
      let rating = 0
      let status = 0
      let titles = [title]
      let follows = 0
      let views = 0
      let lastUpdate = ''
      let hentai = false

      let tagSections: TagSection[] = [createTagSection({ id: '0', label: 'genres', tags: [] }),
      createTagSection({ id: '1', label: 'demographic', tags: [] }),
      createTagSection({ id: '2', label: 'format', tags: [] })]

      for (let row of $('tr', table).toArray()) {
        if ($(row).find('.info-alternative').length > 0) {
          let alts = $('h2', table).text().split(/,|;/)
          for (let alt of alts) {
            titles.push(alt.trim())
          }
        }
        else if ($(row).find('.info-author').length > 0) {
          let autart = $('.table-value', row).find('a').toArray()
          author = $(autart[0]).text()
          if (autart.length > 1) {
            artist = $(autart[1]).text()
          }
        }
        else if ($(row).find('.info-status').length > 0) {
          status = $('.table-value', row).text() == 'Ongoing' ? 1 : 0
        }
        else if ($(row).find('.info-genres').length > 0) {
          let elems = $('.table-value', row).find('a').toArray()
          for (let elem of elems) {
            let text = $(elem).text()
            if (text.toLowerCase().includes('smut')) {
              hentai = true
              tagSections[0].tags.push(createTag({ id: text, label: text }))
            }
            if (this.allDemogrpahic.includes(text)) {
              tagSections[1].tags.push(createTag({ id: text, label: text }))
            }
            else {
              tagSections[0].tags.push(createTag({ id: text, label: text }))
            }
          }
        }
      }

      table = $('.story-info-right-extent', panel)
      for (let row of $('p', table).toArray()) {
        if ($(row).find('.info-time').length > 0) {
          let time = new Date($('.stre-value', row).text().replace(/(-*(AM)*(PM)*)/g, ''))
          lastUpdate = time.toDateString()
        }
        else if ($(row).find('.info-view').length > 0) {
          views = Number($('.stre-value', row).text().replace(/,/g, ''))
        }
      }

      rating = Number($('[property=v\\:average]', table).text())
      follows = Number($('[property=v\\:votes]', table).text())
      let summary = $('.panel-story-info-description', panel).text()

      manga.push({
        id: metadata[i].id,
        titles: titles,
        image: image,
        rating: Number(rating),
        status: status,
        artist: artist,
        author: author,
        tags: tagSections,
        views: views,
        follows: follows,
        lastUpdate: lastUpdate,
        description: summary,
        hentai: hentai
      })
    }

    return manga
  }

  getChaptersRequest(mangaId: string): Request {
    let metadata = { 'id': mangaId }
    return createRequestObject({
      url: `${MN_DOMAIN}/manga/`,
      metadata: metadata,
      method: 'GET',
      param: mangaId
    })
  }

  getChapters(data: any, metadata: any): Chapter[] {
    let $ = this.cheerio.load(data)
    let allChapters = $('.row-content-chapter', '.body-site')
    let chapters: Chapter[] = []
    for (let chapter of $('li', allChapters).toArray()) {
      let id: string = $('a', chapter).attr('href')?.split('/').pop() ?? ''
      let name: string = $('a', chapter).text() ?? ''
      let chNum: number = Number((/Chapter (\d*)/g.exec(name) ?? [])[1] ?? '')
      let time: Date = new Date($('.chapter-time', chapter).attr('title') ?? '')
      chapters.push(createChapter({
        id: id,
        mangaId: metadata.id,
        name: name,
        langCode: 'en',
        chapNum: chNum,
        time: time
      }))
    }
    return chapters
  }

  getChapterDetailsRequest(mangaId: string, chId: string): Request {
    let metadata = { 'mangaId': mangaId, 'chapterId': chId, 'nextPage': false, 'page': 1 }
    return createRequestObject({
      url: `${MN_DOMAIN}/chapter/`,
      method: "GET",
      metadata: metadata,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Cookie: 'content_lazyload=off'
      },
      param: `${mangaId}/${chId}`
    })
  }

  getChapterDetails(data: any, metadata: any): { 'details': ChapterDetails, 'nextPage': boolean, 'param': string | null } {
    let $ = this.cheerio.load(data)
    let pages: string[] = []
    for (let item of $('img', '.container-chapter-reader').toArray()) {
      pages.push($(item).attr('src') ?? '')
    }

    let chapterDetails = createChapterDetails({
      id: metadata.chapterId,
      mangaId: metadata.mangaId,
      pages: pages,
      longStrip: false
    })
    let returnObject = {
      'details': chapterDetails,
      'nextPage': metadata.nextPage,
      'param': null
    }
    return returnObject
  }

  filterUpdatedMangaRequest(ids: any, time: Date, page: number): Request {
    throw new Error("Method not implemented.");
  }

  // FIXME: Current issue with site not loading the newest pages properly
  // I will consider coming back to this later
  filterUpdatedManga(data: any, metadata: any): { 'updatedMangaIds': string[], 'nextPage': boolean } {
    let $ = this.cheerio.load(data)

    let returnObject: { 'updatedMangaIds': string[], 'nextPage': boolean } = {
      'updatedMangaIds': [],
      'nextPage': true
    }

    throw new Error("Method not implemented.");
  }

  getHomePageSectionRequest(): HomeSectionRequest[] {
    throw new Error("Method not implemented.");
  }

  getHomePageSections(data: any, section: HomeSection[]): HomeSection[] | null {
    throw new Error("Method not implemented.");
  }

  getViewMoreRequest(key: string): Request {
    throw new Error("Method not implemented.")
  }

  getViewMoreItems(data: any, key: string, page: number): MangaTile[] {
    throw new Error("Method not implemented.")
  }

  searchRequest(query: SearchRequest, page: number): Request {
    throw new Error("Method not implemented.");
  }

  search(data: any): MangaTile[] | null {
    throw new Error("Method not implemented.");
  }
}