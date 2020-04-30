import Source from './Source'
import Manga from '../models/Manga'

export default class MangaPark extends Source {
  constructor() {
    super()
  }

  getMangaDetailsUrls(ids: string[]) {
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
    let rating: string = $('i', '#rating').html() ?? "0"
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
        case 'Author(s)': author = $('a', row).html() ?? ""; break
        case 'Artist(s)': artist = $('a', row).html() ?? ""; break
        case 'Popularity': {
          // incredibly ugly ... i know
          let pop = $('td', row).html() ?? ""
          let regex = /has (\d*(\.?\d*\w)?)/g
          pop = (regex.exec(pop) ?? [])[1]
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
          let alts = ($('td', row).html() ?? "").replace(/\t*\n*/g, '').split('  ')
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
          let stat = $('td', row).html() ?? ""
          if (stat.includes('Ongoing'))
            status = 1
          else if (stat.includes('Completed')) {
            status = 0
          }
          break
        }
        case 'Type': {
          let type = ($('td', row).html()?.replace(/\t/g, '').split('-')[0].trim()) ?? ""
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

  }

  filterUpdatedManga(data: any, metadata: any) {

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

  getChapters(mangaId: string, data: any): any {
    let $ = this.cheerio.load(data.data)
    let chaptersByGroup = []
    for(let elem of $('#list').children('div').toArray()) {
      let streamNum = $(elem).contents()
      console.log(streamNum)
    }
  }

}