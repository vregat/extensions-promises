import {Source} from './Source'
import {Manga, createManga} from '../models/Manga'
import {Chapter, createChapter} from '../models/Chapter'
import { ChapterDetails, createChapterDetails } from '../models/ChapterDetails'
import { SearchRequest } from '../models/SearchRequest'
import { MangaTile, createMangaTile } from '../models/MangaTile'
import { RequestObject, createRequestObject, createCookie } from '../models/RequestObject'
import { createSection, createHomeRequestObject } from '../models/HomeRequestObject'

export class MangaPark extends Source {
  constructor(cheerio: CheerioAPI) {
    super(cheerio)
  }

  getMangaDetailsRequest(ids: string[]): RequestObject {
    let metadata = {'ids': ids}
    let cookies = createCookie('set', 'h=1')
    return createRequestObject(metadata, 'https://mangapark.net/manga/', [cookies])
  }

  // FIXME: I need to figure out the proper Ids of the Tags
  getMangaDetails(data: any, mangaId: string): Manga {
    let $ = this.cheerio.load(data)
    let html = ($('head').html() ?? "").match((/(_manga_name\s*=\s)'([\S]+)'/)) ?? []
    let id: string = html[2]
    let image: string = $('img','.manga').attr('src') ?? ""
    let rating: string = $('i', '#rating').text()
    let tableBody = $('tbody', '.manga')
    let titles: string[] = []
    let title = $('.manga').find('a').first().text()
    titles.push(title.substring(0, title.lastIndexOf(' ')))
    let genres = []
    let demographic = []
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
            let trim = alt.trim().replace(/;*\t*/g, '')
            if (trim != '')
              titles.push(trim)
          }
          break
        }
        case 'Genre(s)': {
          for (let genre of $('a', row).toArray()) {
            let item = $(genre).html() ?? ""
            if (item.includes('<b>')) {
              demographic.push( {
                'value': item.replace(/<[a-zA-Z\/][^>]*>/g, "")
              })
            }
            else if (item.includes('Hentai')){
              hentai = true
            }
            else {
              genres.push( {
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
            'value': type
          })
        }
      }
    }

    let summary = $('.summary').html() ?? ""
    return createManga(id, image, artist, author, Number(rating), [], [], demographic, summary, 0, format, genres,
      "", 'en', Number(rating), status, [], titles, 0, views, hentai, 0, [], "")
  }

  getChapterRequest(mangaId: string): RequestObject {
    let metadata = {'id': mangaId}
    let cookie = createCookie('set', 'h=1')
    return createRequestObject(metadata, 'https://mangapark.net/manga/', [cookie], mangaId)
  }

  getChapters(data: any, mangaId: string): Chapter[] {
    let $ = this.cheerio.load(data)
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
          chapters.push(createChapter(chapId ?? "",
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

  getChapterDetailsRequest(mangaId: string, chId: string): RequestObject {
    let metadata = {'mangaId': mangaId, 'chapterId': chId, 'nextPage': false}
    let cookie = createCookie('set', 'h=1')
    return createRequestObject(metadata, 'https://mangapark.net/manga/', [cookie], `${mangaId}/${chId}`)
  }


  getChapterDetails(data: any, metadata: any): {'details': ChapterDetails, 'nextPage': boolean} {
    let script = JSON.parse((/var _load_pages = (.*);/.exec(data)?? [])[1])
    let pages: string[] = []
    for (let page of script) {
      pages.push(page.u)
    }

    let chapterDetails = createChapterDetails(metadata.chapterId, metadata.mangaId, pages, false)
    let returnObject = {
      'details': chapterDetails,
      'nextPage': metadata.nextPage
    }
    return returnObject
  }

  filterUpdatedMangaRequest(ids: any, time: Date, page: number): any {
    let metadata = {'ids': ids,'referenceTime': time}
    let cookie = createCookie('set', 'h=1')
    return createRequestObject(metadata, 'https://mangapark.net/latest/', [cookie], page.toString())
  }

  filterUpdatedManga(data: any, metadata: any): {'updatedMangaIds': string[], 'nextPage': boolean} {
    let $ = this.cheerio.load(data)
    
    let returnObject: {'updatedMangaIds': string[], 'nextPage': boolean} = {
      'updatedMangaIds': [],
      'nextPage': true
    }

    for (let item of $('.item', '.ls1').toArray()) {
      let id = ($('a', item).first().attr('href') ?? '').split('/').pop() ?? ''
      let time = $('.time').first().text()
      if (this.convertTime(time) > metadata.referenceTime) {
        if (metadata.ids.includes(id)) {
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

  getHomePageSectionRequest() {
    let request = createRequestObject({}, 'https://mangapark.net/')
    let section1 = createSection('popular_titles', 'POPULAR MANGA', [])
    let section2 = createSection('popular_new_titles', 'POPULAR MANGA UPDATES', [])
    let section3 = createSection('recently_updated', 'RECENTLY UPDATED TITLES', [])

    return {'featured_new': createHomeRequestObject(request, [section1, section2, section3])}
  }

  getHomePageSections(data: any, key: any, sections: any) {
    let $ = this.cheerio.load(data)
    let popManga: MangaTile[] = []
    let newManga: MangaTile[] = []
    let updateManga: MangaTile[] = []

    for (let item of $('li', '.top').toArray()) {
      let id: string = ($('.cover', item).attr('href') ?? '').split('/').pop() ?? ''
      let title: string = $('.cover', item).attr('title') ?? ''
      let image: string = $('img', item).attr('src') ?? ''
      let subtitle: string = $('.visited', item).text() ?? ''

      let sIcon = 'clock.fill'
      let sText = $('i', item).text()
      popManga.push(createMangaTile(id, title, image, subtitle, '', '', sIcon, sText))
    }

    for (let item of $('ul','.mainer').toArray()) {
      for (let elem of $('li', item).toArray()) {
        let id: string = ($('a', elem).first().attr('href') ?? '').split('/').pop() ?? ''
        let title: string = $('img', elem).attr('alt') ?? ''
        let image: string = $('img', elem).attr('src') ?? ''
        let subtitle: string = $('.visited', elem).text() ?? ''

        newManga.push(createMangaTile(id, title, image, subtitle, '', '', '', ''))
      }
    }

    for (let item of $('.item', 'article').toArray()) {
      let id: string = ($('.cover', item).attr('href') ?? '').split('/').pop() ?? ''
      let title: string = $('.cover', item).attr('title') ?? ''
      let image: string = $('img', item).attr('src') ?? ''
      let subtitle: string = $('.visited', item).text() ?? ''

      let sIcon = 'clock.fill'
      let sText = $('li.new', item).first().find('i').last().text() ?? ''
      updateManga.push(createMangaTile(id, title, image, subtitle, '', '', sIcon, sText))
    }

    // console.log(updateManga)
    sections[0].items = popManga
    sections[1].items = newManga
    sections[2].items = updateManga
    return sections
  }

  getViewMoreRequest(key: string): RequestObject {
    throw new Error("Method not implemented.")
  }

  getViewMoreItems(data: any, key: string, page: number): MangaTile[] {
    throw new Error("Method not implemented.")
  }

  searchRequest(query: SearchRequest, page: number): RequestObject {
    let genres = ''
    for (let genre of (query.includeGenre ?? []).concat(query.includeDemographic ?? [])) {
      genres += genre + ','
    }
    let excluded = ''
    for (let genre of (query.excludeGenre ?? []).concat(query.excludeDemographic ?? [])) {
      excluded += genre + ','
    }
    let status = ""
    switch (query.status) {
      case 0: status = 'completed'; break
      case 1: status = 'ongoing'; break
      default: status = ''
    }
    let search: string = `q=${encodeURI(query.title ?? '')}&`
    search += `autart=${encodeURI(query.author || query.artist || '')}&`
    search += `&genres=${genres}&genres-exclude=${excluded}&page=${page}`
    search += `&status=${status}&st-ss=1`

    let metadata = {'search': search}
    let cookie = createCookie('set', `h=${query.hStatus ? 1 : 0}`)
    return createRequestObject(metadata, 'https://mangapark.net/search?', [cookie], search)
  }

  search(data: any) {
    let $ = this.cheerio.load(data)
    let mangaList = $('.manga-list')
    let manga: Manga[] = []
    for (let item of $('.item', mangaList).toArray()) {
      let id = $('a', item).first().attr('href')?.split('/').pop() ?? ''
      let img = $('img', item) 
      let image = $(img).attr('src') ?? ''
      let title = $(img).attr('title') ?? ''
      let titles: string[] = [title]
      let rate = $('.rate', item)
      let rating = Number($(rate).find('i').text())
      let follows = Number($(rate).attr('title')?.match(/(\d+)(?!.*\d)/))
      
      let author = ""
      let artist = ""
      let status = 0
      let genres = []
      let demographic = []
      let hentai = false

      for (let field of $('.field', item).toArray()) {
        let elem = $('b', field).first().text()
        switch(elem) {
          case 'Alternative:': {
            let info = $(field).text().replace(/\t*\n*(Alternative:)*/g, '').split(',')
            for (let title of info) {
              titles.push(title.trim())
            }
            break
          }
          case 'Authors/Artists:': {
            let authorCheerio = $('a', field).first()
            author = $(authorCheerio).text()
            if ($(authorCheerio).next().attr('class') == 'pd') {
              status = $('.pd', field).next().text() == 'Ongoing' ? 1 : 0
            }
            else {
              artist = $(authorCheerio).next().text()
            }
            break
          }
          case 'Genres:': {
            for (let genre of $('a', field).toArray()) {
              let item = $(genre).html() ?? ""
              if (item.includes('<b>')) {
                demographic.push( {
                  'value': item.replace(/<[a-zA-Z\/][^>]*>/g, "")
                })
              }
              else if (item.includes('Hentai')){
                hentai = true
              }
              else {
                genres.push( {
                  'value': item.replace(/<[a-zA-Z\/][^>]*>/g, "")
                })
              }
            }
          }
        }
      }

      let summary = $('.summary', item).text().trim()
      let lastUpdate = $('ul', item).find('i').text()

      manga.push(createManga(id, image, artist, author, rating, [], [], demographic, summary, follows, [], genres, 'en', 'english', rating, status, [], titles, 0, 0, hentai, 0, [], lastUpdate))
    }

    return manga
  }
}