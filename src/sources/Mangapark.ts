import {Source} from './Source'
import {Manga} from '../models/Manga'
import {Chapter} from '../models/Chapter'
import { ChapterDetails } from '../models/ChapterDetails'

export class MangaPark extends Source {
  constructor(cheerio: CheerioAPI) {
    super(cheerio)
  }

  getMangaDetailsRequest(ids: string[]) {
    return {
      'manga': {
        'metadata': {
          'initialIds': ids
        },
        'request': {
          'url': 'https://mangapark.net/manga/',
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
  }

  getMangaDetails(data: any): any {
    let $ = this.cheerio.load(data[0].data)
    let html = ($('head').html() ?? "").match((/(_manga_name\s*=\s)'([\S]+)'/)) ?? []
    let id: string = html[2]
    let image: string = $('img','.manga').attr('src') ?? ""
    let rating: string = $('i', '#rating').text()
    let tableBody = $('tbody', '.manga')
    let genres = []
    let demographic = []
    let alternatives: string[] = []
    let format = []
    let hentai = false
    let author = ""
    let artist = ""
    let views = 0
    let status = 0
    for (let row of $('tr', tableBody).toArray()) {
      let elem = $('th', row).html()
      switch(elem) {
        case 'Author(s)': author = $('a', row).text(); break
        case 'Artist(s)': artist = $('a', row).text(); break
        case 'Popularity': {
          // incredibly ugly ... i know
          let pop = (/has (\d*(\.?\d*\w)?)/g.exec($('td', row).text()) ?? [])[1]
          if (pop.includes('k')) {
            pop = pop.replace('k', '')
            views = Number(pop) * 1000
          }
          else {
            views = Number(pop) ?? 0
          }
          break
        }
        case 'Alternative': {
          let alts = $('td', row).text().split('  ')
          for (let alt of alts) {
            let trim = alt.trim().replace(/;/g, '')
            if (trim != '')
              alternatives.push(trim)
          }
          break
        }
        case 'Genre(s)': {
          for (let genre of $('a', row).toArray()) {
            let item = $(genre).html() ?? ""
            if (item.includes('<b>')) {
              demographic.push( {
                'id': 0,
                'value': item.replace(/<[a-zA-Z\/][^>]*>/g, "")
              })
            }
            else if (item.includes('Hentai')){
              hentai = true
            }
            else {
              genres.push( {
                'id': 0,
                'value': item.replace(/<[a-zA-Z\/][^>]*>/g, "")
              })
            }
          }
          break
        }
        case 'Status': {
          let stat = $('td', row).text()
          if (stat.includes('Ongoing'))
            status = 1
          else if (stat.includes('Completed')) {
            status = 0
          }
          break
        }
        case 'Type': {
          let type = $('td', row).text().split('-')[0].trim()
          format.push({
            'id': 0,
            'value': type
          })
        }
      }
    }

    let summary = $('.summary').html() ?? ""
    return new Manga(id, image, artist, author, Number(rating), [], [], demographic, summary, 0, format, genres,
      "", 'en', Number(rating), status, [], alternatives, 0, views, hentai, 0, [], "")
  }

  filterUpdatedMangaUrls(ids: any, time: Date): any {
    throw new Error("Method not implemented.")
  }

  filterUpdatedManga(data: any, metadata: any) {
    throw new Error("Method not implemented.")
  }

  getHomePageSectionUrls() {
    throw new Error("Method not implemented.")
  }

  getHomePageSections(key: any, data: any, sections: any) {
    throw new Error("Method not implemented.")
  }

  getChapterUrls(mangaId: string): any {
    return {
      'manga': {
        'metadata': {
          'id': mangaId
        },
        'request': {
          'url': 'https://mangapark.net/manga/',
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
  }

  getChapters(data: any, mangaId: string): Chapter[] {
    let $ = this.cheerio.load(data.data)
    let chapters: Chapter[] = []
    for(let elem of $('#list').children('div').toArray()) {
      // streamNum helps me navigate the weird id/class naming scheme
      let streamNum = (/(\d+)/g.exec($(elem).attr('id') ?? "") ?? [])[0]
      let groupName = $(`.ml-1.stream-text-${streamNum}`, elem).text()

      let volNum = 1
      let chapNum = 1
      let volumes = $('.volume', elem).toArray().reverse()
      for (let vol of volumes) {
        let chapterElem = $('li', vol).toArray().reverse()
        for (let chap of chapterElem) {
          let chapId = $(chap).attr('id')?.replace('b-', 'i')
          let name = ""
          let nameArr = ($('a', chap).html() ?? "").replace(/\t*\n*/g, '').split(':')
          if (nameArr.length > 1) {
            name = nameArr[1].trim()
          }
          else {
            name = $('.txt', chap).text().replace(/:/g, '').trim()
          }

          let time = this.convertTime($('.time', chap).text().trim())
          chapters.push(new Chapter(chapId ?? "",
            mangaId,
            name,
            chapNum,
            volNum,
            groupName,
            0,
            time,
            false,
            'en'))
          chapNum++
        }
        volNum++
      }
    }

    return chapters
  }

  getChapterDetailsUrls(mangaId: string, chId: string) {
    return {
      'chapters': {
        'metadata': {
          'mangaId': mangaId,
          'chapterId': chId
        },
        'request': {
          'url': 'https://mangapark.net/manga/',
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
  }


  getChapterDetails(data: any, metadata: any) {
    let script = JSON.parse((/var _load_pages = (.*);/.exec(data.data)?? [])[1])
    let pages: string[] = []
    for (let page of script) {
      pages.push(page.u)
    }
    return new ChapterDetails(metadata.chapterId, metadata.mangaId, pages, false)
  }

  search(data: any) {
    throw new Error("Method not implemented.")
  }

  advancedSearch(data: any) {
    throw new Error("Method not implemented.")
  }

  private convertTime(timeAgo: string): Date {
    let time: Date
    let trimmed: number = Number((/\d*/.exec(timeAgo) ?? [])[0])
    if (timeAgo.includes('minutes')) {
      time = new Date(Date.now() - trimmed * 60000)
    }
    else if (timeAgo.includes('hours')) {
      time = new Date(Date.now() - trimmed * 3600000)
    }
    else if (timeAgo.includes('days')) {
      time = new Date(Date.now() - trimmed * 86400000)
    }
    else {
      time = new Date(Date.now() - 31556952000)
    }

    return new Date()
  }
}