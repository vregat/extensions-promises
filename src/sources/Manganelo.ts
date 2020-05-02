import { Source } from "./Source";
import { SearchRequest, createSearchRequest } from "../models/SearchRequest";
import { Manga, createManga } from "../models/Manga";

export class Manganelo extends Source {
  allDemogrpahic: string[]
  constructor(cheerio: CheerioAPI) {
    super(cheerio)
    this.allDemogrpahic = ["Shounen", "Shoujo", "Seinen", "Josei"]
  }

  getMangaDetailsRequest(ids: string[]) {
    return {
      'manga': {
        'metadata': {
          'initialIds': ids
        },
        'request': {
          'url': 'https://manganelo.com/manga/',
          'config': {
            'headers' : {
              
            },
          },
          'incognito':  true,
          'cookies': []
        }
      }
    }
  }

  getMangaDetails(data: any, mangaId: string): Manga {
    let $ = this.cheerio.load(data)
    let panel = $('.panel-story-info')
    let title = $('.img-loading', panel).attr('title') ?? ''
    let image = $('.img-loading', panel).attr('src') ?? ''
    let table = $('.variations-tableInfo', panel)
    let i = 0
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
        let timeStr = $('.stre-value', row).text().replace(',', ' ').split('-')[0].trim()
        let time = new Date(timeStr)
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

  getChapterRequest(mangaId: string) {
    return {
      'metadata': {
        'id': mangaId
      },
      'request': {
        'url': 'https://mangapark.net/manga/',
        'param': mangaId,
        'config': {
          'headers' : {
            
          },
        },
        'cookies':[
          { 
            'key': 'set',
            'value': 'h=1'
          },
        ]
      }
    }
  }

  getChapters(data: any, mangaId: string) {
    throw new Error("Method not implemented.");
  }

  getChapterDetailsRequest(mangaId: string, chapId: string) {
    throw new Error("Method not implemented.");
  }

  getChapterDetails(data: any, metadata: any) {
    throw new Error("Method not implemented.");
  }

  filterUpdatedMangaRequest(ids: any, time: Date, page: number) {
    throw new Error("Method not implemented.");
  }

  filterUpdatedManga(data: any, metadata: any) {
    throw new Error("Method not implemented.");
  }

  getHomePageSectionRequest() {
    throw new Error("Method not implemented.");
  }

  getHomePageSections(key: any, data: any, sections: any) {
    throw new Error("Method not implemented.");
  }

  searchRequest(query: SearchRequest, page: number) {
    throw new Error("Method not implemented.");
  }

  search(data: any) {
    throw new Error("Method not implemented.");
  }
}