import { Source } from "./Source";
import { SearchRequest, createSearchRequest } from "../models/SearchRequest";
import { Manga, createManga } from "../models/Manga";
import { Chapter, createChapter } from "../models/Chapter";
import { ChapterDetails, createChapterDetails } from "../models/ChapterDetails";
import { RequestObject, createRequestObject, createCookie } from "../models/RequestObject";

export class Manganelo extends Source {
  allDemogrpahic: string[]
  constructor(cheerio: CheerioAPI) {
    super(cheerio)
    this.allDemogrpahic = ["Shounen", "Shoujo", "Seinen", "Josei"]
  }

  getMangaDetailsRequest(ids: string[]): RequestObject {
    let metadata = {'ids': ids}
    return createRequestObject(metadata, 'https://manganelo.com/manga/')
  }

  getMangaDetails(data: any, mangaId: string): Manga {
    let $ = this.cheerio.load(data)
    let panel = $('.panel-story-info')
    let title = $('.img-loading', panel).attr('title') ?? ''
    let image = $('.img-loading', panel).attr('src') ?? ''
    let table = $('.variations-tableInfo', panel)
    let author = ''
    let artist = ''
    let rating = 0
    let demographic: Tag[] = []
    let genres = []
    let status = 0
    let titles = [title]
    let follows = 0
    let views = 0
    let lastUpdate = ''
    let hentai = false

    for (let row of $('tr', table).toArray()) {
      if ($(row).find('.info-alternative').length > 0) {
        let alts = $('h2', table).text().split(';')
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
          }
          if (this.allDemogrpahic.includes(text)) {
            demographic.push({
              'id': this.allDemogrpahic.indexOf(text) + 1,
              'value': text
            })
          }
          else {
            genres.push({'value': text})
          }
        }
      }
    }

    table = $('.story-info-right-extent', panel)
    for (let row of $('p', table).toArray()) {
      if ($(row).find('.info-time').length > 0) {
        let time = new Date($('.stre-value', row).text().replace(/-*(AM)*(PM)*/g, ''))
        lastUpdate = time.toDateString()
      }
      else if ($(row).find('.info-view').length > 0) {
        views = Number($('.stre-value', row).text().replace(/,/g, ''))
      }
    }

    rating = Number($('[property=v\\:average]', table).text())
    follows = Number($('[property=v\\:votes]', table).text())
    let summary = $('.panel-story-info-description', panel).text()

    return createManga(mangaId, image, artist, author, rating, [], [], demographic, summary, follows, [], genres, 'en', 'english', rating, status, [], titles, 0, views, hentai, 0, [], lastUpdate)
  }

  getChapterRequest(mangaId: string): RequestObject {
    let metadata = {'id': mangaId}
    return createRequestObject(metadata, 'https://manganelo.com/manga/', [], mangaId)
  }

  getChapters(data: any, mangaId: string): Chapter[] {
    let $ = this.cheerio.load(data)
    let allChapters = $('.row-content-chapter', '.body-site')
    let chapters: Chapter[] = []
    for (let chapter of $('li', allChapters).toArray()) {
      let id: string = $('a', chapter).attr('href')?.split('/').pop() ?? ''
      let name: string = $('a', chapter).text() ?? ''
      let chNum: number = Number((/Chapter (\d*)/g.exec(name) ?? [])[1] ?? '')
      let views: number = Number($('.chapter-view', chapter).text().replace(',', ''))
      let time: Date = new Date($('.chapter-time', chapter).attr('title') ?? '')
      chapters.push(createChapter(id, mangaId, name, chNum, 0, '', views, time))
    }
    return chapters
  }

  getChapterDetailsRequest(mangaId: string, chId: string): RequestObject {
    let metadata = {'mangaId': mangaId, 'chapterId': chId, 'nextPage': false}
    let cookie = createCookie('content_lazyload', 'off')
    return createRequestObject(metadata, 'https://manganelo.com/chapter/', [cookie], `${mangaId}/${chId}`)
  }

  getChapterDetails(data: any, metadata: any): {'details': ChapterDetails, 'nextPage': boolean} {
    let $ = this.cheerio.load(data)
    let pages: string[] = []
    for (let item of $('img', '.container-chapter-reader').toArray()) {
      pages.push($(item).attr('src') ?? '')
    }

    let chapterDetails = createChapterDetails(metadata.chapterId, metadata.mangaId, pages, false)
    let returnObject = {
      'details': chapterDetails,
      'nextPage': metadata.nextPage
    }
    return returnObject
  }

  filterUpdatedMangaRequest(ids: any, time: Date, page: number): RequestObject {
    throw new Error("Method not implemented.");
  }

  // FIXME: Current issue with site not loading the newest pages properly
  // I will consider coming back to this later
  filterUpdatedManga(data: any, metadata: any): {'updatedMangaIds': string[], 'nextPage': boolean} {
    let $ = this.cheerio.load(data)
    
    let returnObject: {'updatedMangaIds': string[], 'nextPage': boolean} = {
      'updatedMangaIds': [],
      'nextPage': true
    }

    throw new Error("Method not implemented.");
  }

  getHomePageSectionRequest() {
    throw new Error("Method not implemented.");
  }

  getHomePageSections(key: any, data: any, sections: any) {
    throw new Error("Method not implemented.");
  }

  searchRequest(query: SearchRequest, page: number): RequestObject {
    throw new Error("Method not implemented.");
  }

  search(data: any) {
    throw new Error("Method not implemented.");
  }
}