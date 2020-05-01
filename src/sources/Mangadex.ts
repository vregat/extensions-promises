import {Manga} from '../models/Manga'
import {Chapter, createChapter} from '../models/Chapter'
import {Source} from './Source'
import {createMangaTiles, MangaTile} from '../models/MangaTile'
import { SearchRequest } from '../models/SearchRequest'

export class MangaDex extends Source {
  private hMode: number
  constructor(cheerio: CheerioAPI) {
    super(cheerio)
    this.hMode = 0
  }

  getHomePageSectionRequest() {
    return {
      "featured_new": {
        "request": {
          'url': 'https://mangadex.org'
        }, // REQUEST OBJECT HERE
        "sections": [
          {
            "id": "featured_titles",
            "title": "FEATURED TITLES",
            "items": [] // scraped items here
          },
          {
            "id": "new_titles",
            "title": "NEW TITLES",
            "items": [], // scraped items here
            "view_more": {} // request object here if this section supports "view all" button
          }
        ]
      },
      "recently_updated": {
        "request": {
          'url': 'https://mangadex.org/updates'
        }, // REQUEST OBJECT HERE
        "sections": [
          {
            "id": "recently_updated",
            "title": "RECENTLY UPDATED TITLES",
            "items": [],
            "view_more": {} // REQUEST OBJECT HERE
          }
        ]
      }
    }
  }
  
  getHomePageSections(key: string, data: any, sections: any) {
    let $ = this.cheerio.load(data)
    switch (key) {
      case "featured_new": sections = this.getFeaturedNew($, sections); break
      case "recently_updated": sections = this.getRecentUpdates($, sections); break
    }
    return sections
  }
  
  getFeaturedNew($: CheerioSelector, section: any) {
    let featuredManga: MangaTile[] = []
    let newManga: MangaTile[] = []
  
    $("#hled_titles_owl_carousel .large_logo").each(function (i: any, elem: any) {
      let title = $(elem)
  
      let img = title.find("img").first()
      let links = title.find("a")
  
      let idStr: any = links.first().attr("href")
      let id = idStr!!.match(/(\d+)(?=\/)/) ?? "-1"
  
      let caption = title.find(".car-caption p:nth-child(2)")
      let bookmarks = caption.find("span[title=Follows]").text()
      let rating = caption.find("span[title=Rating]").text()
      featuredManga.push(createMangaTiles(id[0], img.attr("title") ?? " ", img.attr("data-src") ?? " ", '', 'bookmark.fill', bookmarks, 'star.fill', rating))
    })
  
    $("#new_titles_owl_carousel .large_logo").each(function (i: any, elem: any) {
      let title = $(elem)
  
      let img = title.find("img").first()
      let links = title.find("a")
  
      let idStr: any = links.first().attr("href")
      let id = idStr.match(/(\d+)(?=\/)/)
  
      let caption = title.find(".car-caption p:nth-child(2)")
      let obj: any = {  name: caption.find("a").text(), group: "", time: Date.parse(caption.find("span").attr("title") ?? " "), langCode: "" }
      newManga.push(createMangaTiles(id[0], img.attr("title") ?? " ", img.attr("data-src") ?? " ", caption.find("a").text(), '', '', 'clock.fill', (Date.parse(caption.find("span").attr("title") ?? " ")).toString()))
    })
    section[0].items = featuredManga
    section[1].items = newManga
    return section
  }
  
  getRecentUpdates($: CheerioSelector, section: any) {
    let updates: MangaTile[] = []
    let elem = $('tr', 'tbody').toArray()
    let i = 0
    while (i < elem.length) {
      let hasImg: boolean = false
      let idStr: string = $('a.manga_title', elem[i]).attr('href') ?? ''
      let id: string = (idStr.match(/(\d+)(?=\/)/) ?? '')[0] ?? ''
      let title: string = $('a.manga_title', elem[i]).text() ?? ''
      let image: string = $('img', elem[i]).attr('src') ?? ''

      // in this case: badge will be number of updates
      // that the manga has received within last week
      let badge = 0
      let pIcon = 'eye.fill'
      let sIcon = 'clock.fill'
      let subTitle = ''
      let pText = ''
      let sText = ''

      let first = true
      i++
      while (!hasImg && i < elem.length) {
        // for the manga tile, we only care about the first/latest entry
        if (first && !hasImg) {
          subTitle = $('a', elem[i]).first().text()
          pText = $('.text-center.text-info', elem[i]).text()
          sText = $('time', elem[i]).text().replace('ago', '').trim()
          first = false
        }
        badge++
        i++

        hasImg = $(elem[i]).find('img').length > 0
      }

      updates.push(createMangaTiles(id, title, image, subTitle, pIcon, pText, sIcon, sText, badge))
    }

    section[2].items = updates
    return section
  }

  filterUpdatedMangaRequest(ids: any, time: Date, page: number) {
    return {
      'titles': {
        'metadata': {
          'initialIds': ids,
          'referenceTime': time
        },
        'request': {
          'url': 'https://mangadex.org/titles/0/',
          'param': page,
          'config': {
            'headers' : {
              
            },
          },
          'incognito': true,
          'cookies':[
            { 
              'key': 'mangadex_title_mode',
              'value': 2
            },
            { 
              'key': 'mangadex_h_mode',
              'value': this.hMode
            }
          ]
        }
      }
    }
  }

  filterUpdatedManga(data: any, metadata: any) {
    let $ = this.cheerio.load(data.data)
    
    let returnObject: {'updatedMangaIds': string[], 'nextPage': boolean} = {
      'updatedMangaIds': [],
      'nextPage': true
    }

    for (let elem of $('.manga-entry').toArray()) {
      let id = elem.attribs['data-id']
      if (new Date($(elem).find('time').attr('datetime')?.toString() ?? "") > metadata.referenceTime) {
        if (metadata.initialIds.includes(id)) {
          returnObject.updatedMangaIds.push(id)
        }
      }
      else {
        returnObject.nextPage = false
        return returnObject
      }
    }

    return returnObject
  }

  getMangaDetailsRequest(ids: string[]): any {
    return {
      'manga': {
        'metadata': {
          'initialIds': ids
        },
        'request': {
          'url': 'https://mangadex.org/title/',
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

  // TODO: TO BE IMPLEMENTED
  getMangaDetails(data: any) {
    console.log(data)
  }

  // Manga is already formatted at the cache server level
  getMangaDetailsBulk(data: any): Manga[] {
    let manga: Manga[] = []
    /*let unformatedManga = data.result
    for (let u of unformatedManga) {
      let formattedManga: Manga = new Manga(data.id, data.image, data.artist, data.author, data.avgRating, data.content,
        data.covers, data.demographic, data.description, data.follows, data.format, data.genre, data.langFlag, data.langName,
        data.rating, data.status, data.theme, data.titles, data.users, data.views, data.hentai, data.related, data.relatedManga,
        data.lastUpdate)
      manga.push(formattedManga)
    }*/
    return data.result
  }

  getTagsUrl() {
    return {
      'url': 'url'
    }
  }

  // Tags are already formatted at the cache server level
  getTags(data: any) {
    return data.result
  }

  getChapterRequest(mangaId: string): any {
    return {
      'manga': {
        'metadata': {
          'id': mangaId
        },
        'request': {
          'url': 'https://mangadex.org/api/manga/',
          'param': mangaId,
          'config': {
            'headers' : {
              
            },
          },
          'incognito':  true,
          'cookies':[]
        }
      }
    }
  }

  getChapters(data: any, mangaId: string) {
    data = data.data.chapter
    let entries = Object.entries(data)
    let chapters: Chapter[] = []
    for (let entry of entries) {
      let id: string = entry[0]
      let info: any = entry[1]
      chapters.push(createChapter(id, 
        mangaId, 
        info.title,
        info.chapter,
        info.volume, 
        info.group_name,
        0,
        new Date(info.timestamp),
        false,
        info.lang_code))
    }

    return chapters
  }

  getChapterDetailsRequest(mangaId: string, chapId: string) {
    throw new Error("Method not implemented.")
  }
  
  getChapterDetails(data: any, metadata: any) {
    throw new Error("Method not implemented.")
  }

  //TODO: NOT FULLY IMPLEMENTED FOR search()
  searchRequest(query: SearchRequest, page: number) {
    let search = ''
    return {
      'metadata': {
        'search': search
      },
      'request': {
        'url': 'https://mangadex.org/search?',
        'param': search,
        'config': {
          'headers' : {
            
          },
        },
        'cookies':[
          { 
            'key': '',
            'value': ``
          },
        ]
      }
    }
  }

  search(data: any): any {
    throw new Error("Method not implemented.")
  }

  // manga are already formatted at the cache server level
  searchMangaCached(data: any): any {
    return data.result
  }

}