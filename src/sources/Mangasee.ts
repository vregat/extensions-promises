/* Disabling this until it's updated for the new Api


import { Source } from './Source'
import { Manga } from '../models/Manga/Manga'
import { Chapter } from '../models/Chapter/Chapter'
import { MangaTile } from '../models/MangaTile/MangaTile'
import { SearchRequest } from '../models/SearchRequest/SearchRequest'
import { Request } from '../models/RequestObject/RequestObject'
import { ChapterDetails } from '../models/ChapterDetails/ChapterDetails'
import { Tag } from '../models/TagSection/TagSection'

export class Mangasee extends Source {
  allDemogrpahic: string[]
  constructor(cheerio: CheerioAPI) {
    super(cheerio)
    this.allDemogrpahic = ["Shounen", "Shoujo", "Seinen", "Josei"]
  }

  getMangaDetailsRequest(ids: string[]): Request {
    let metadata = { 'ids': ids }
    // return createRequestObject(metadata, 'https://mangaseeonline.us/manga/', undefined, undefined, undefined, undefined, undefined, undefined, true)
    return createRequestObject({
      metadata: metadata,
      config: createDataRequest({
        url: "https://mangaseeonline.us/manga/",
        headers: {
          "content-type": "application/x-www-form-urlencoded"
        },
        method: "GET"
      })
    })
  }

  getMangaDetails(data: any, mangaId: string): Manga {
    let $ = this.cheerio.load(data)
    let info = $('.row')
    let image = $('img', '.row').attr('src') ?? ''
    let title = $('.SeriesName', info).text() ?? ''
    let titles = [title]
    let details = $('.details', info)
    let author = ''

    let genres: Tag[] = []
    let demographic: Tag[] = []
    let format: Tag[] = []

    let status = 1
    let summary = ''
    let hentai = false

    for (let row of $('.row', details).toArray()) {
      let text = $('b', row).text()
      switch (text) {
        case 'Alternate Name(s): ': {
          titles.push($(row).text().replace(/(Alternate Name\(s\):)(*\t*\n*)/g, '').trim())
break
        }
        case 'Author(s): ': {
  author = $(row).text().replace(/(Author\(s\):)(*\t*\n*)/g, '').trim()
  break
}
        case 'Genre(s): ': {
  let items = $(row).text().replace(/(Genre\(s\):)(*\t*\n*)/g, '').split(',')
  for (let item of items) {
    if (item.toLowerCase().includes('hentai')) {
      hentai = true
      genres.push(createTag({ id: item.trim(), label: item.trim() }))
    }
    else if (this.allDemogrpahic.includes(item.trim())) {
      demographic.push(createTag({ id: item.trim(), label: item.trim() }))
    }
    else {
      genres.push(createTag({ id: item.trim(), label: item.trim() }))
    }
  }
  break
}
        case 'Type:': {
  let type = $(row).text().replace(/(Type:)(*\t*\n*)/g, '').trim()
  format.push(createTag({ id: type.trim(), label: type.trim() }))
  break
}
        case 'Status: ': {
  status = $(row).text().includes('Ongoing') ? 1 : 0
  break
}
        case 'Description: ': {
  summary = $('.description', row).text()
  break
}
      }
    }

// return createManga(mangaId, image, '', author, 0, [], [], demographic, summary, 0, format, genres, 'en', 'english', 0, status, [], titles, 0, 0, hentai, 0, [], '')
return createManga({
  id: mangaId,
  image,
  author,
  rating: 0,
  tags: [
    createTagSection({
      id: "demographic",
      label: "Demographic",
      tags: demographic
    }),
    createTagSection({
      id: "genre",
      label: "Genre",
      tags: genres
    }),
    createTagSection({
      id: "format",
      label: "Format",
      tags: format
    })
  ],
  description: summary,
  status: status,
  titles: titles,
  hentai: hentai
})
  }

getChapterRequest(mangaId: string): Request {
  let metadata = { 'id': mangaId }
  // return createRequestObject(metadata, 'https://mangaseeonline.us/manga/', [], mangaId, undefined, undefined, undefined, undefined, true)
  return createRequestObject({
    metadata: metadata,
    config: createDataRequest({
      url: "https://mangaseeonline.us/manga/",
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      method: "GET"
    })
  })
}

getChapters(data: any, mangaId: string): Chapter[] {
  let $ = this.cheerio.load(data)
  let chapters: Chapter[] = []
  for (let item of $('.list-group-item', '.list.chapter-list').toArray()) {
    let id = ($(item).attr('href')?.split('/').pop() ?? '').replace('.html', '')
    let chNum = Number($(item).attr('chapter') ?? 0)
    let title = $('.chapterLabel', item).text() ?? ''

    let time = new Date($('time', item).attr('datetime') ?? '')
    // chapters.push(createChapter(id, mangaId, title, chNum, 0, '', 0, time))
    chapters.push(createChapter({
      id: id,
      mangaId: mangaId,
      name: title,
      chapNum: chNum,
      time: time,
      group: "",
      langCode: "en",
      read: false,
      downloaded: false,
      views: 0,
      volume: 0
    }))
  }
  return chapters
}

getChapterDetailsRequest(mangaId: string, chapId: string): Request {
  let metadata = { 'mangaId': mangaId, 'chapterId': chapId, 'nextPage': false, 'page': 1 }
  // return createRequestObject(metadata, 'https://mangaseeonline.us/read-online/', [], chapId, undefined, undefined, undefined, undefined, true)
  return createRequestObject({
    metadata: metadata,
    config: createDataRequest({
      url: "https://mangaseeonline.us/read-online/",
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      method: "GET"
    })
  })
}

getChapterDetails(data: any, metadata: any): { 'details': ChapterDetails, 'nextPage': boolean } {
  let script = JSON.parse((/PageArr=(.*);/g.exec(data) ?? [])[1])
  let pages: string[] = []
  let images: string[] = Object.values(script)
  for (let [i, image] of images.entries()) {
    if (i != image.length) {
      pages.push(image)
    }
  }

  let chapterDetails = createChapterDetails({
    id: metadata.chapterId,
    mangaId: metadata.mangaId,
    pages, longStrip: false
  })
  let returnObject = {
    'details': chapterDetails,
    'nextPage': metadata.nextPage
  }
  return returnObject
}

filterUpdatedMangaRequest(ids: any, time: Date, page: number): Request {
  let metadata = { 'ids': ids, 'referenceTime': time }
  let data: any = { 'page': page }
  data = Object.keys(data).map(function (key: any) { return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]) }).join('&')
  // return createRequestObject(metadata, 'https://mangaseeonline.us/home/latest.request.php', [], '', 'POST', data, undefined, undefined, true)
  return createRequestObject({
    metadata: metadata,
    config: createDataRequest({
      url: "https://mangaseeonline.us/home/latest.request.php",
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      data: data
    })
  })
}

filterUpdatedManga(data: any, metadata: any): { 'updatedMangaIds': string[], 'nextPage': boolean } {
  let $ = this.cheerio.load(data)
  let returnObject: { 'updatedMangaIds': string[], 'nextPage': boolean } = {
    'updatedMangaIds': [],
    'nextPage': true
  }

  for (let item of $('a').toArray()) {
    if (new Date($('time', item).attr('datetime') ?? '') > metadata.referenceTime) {
      let id = ($(item).attr('href')?.split('/').pop()?.match(/(.*)-chapter/) ?? [])[1] ?? ''
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
  return null
}

getHomePageSections(data: any, key: any, sections: any) {
  return null
}

getViewMoreRequest(key: string): Request {
  throw new Error("Method not implemented.")
}

getViewMoreItems(data: any, key: string, page: number): MangaTile[] {
  throw new Error("Method not implemented.")
}

searchRequest(query: SearchRequest, page: number): Request {
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
    case 0: status = 'Completed'; break
    case 1: status = 'Ongoing'; break
    default: status = ''
  }
  let data: any = {
    'page': page,
    'keyword': encodeURI(query.title ?? ''),
    'author': encodeURI(query.author || query.artist || ''),
    'sortBy': 'popularity',
    'sortOrder': 'descending',
    'status': status,
    'genre': genres,
    'genreNo': excluded
  }
  let metadata = data
  data = Object.keys(data).map(function (key: any) { return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]) }).join('&')

  return createRequestObject({
    metadata: metadata,
    config: createDataRequest({
      url: "https://mangaseeonline.us/search/request.php",
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      data: data
    })
  })
}

search(data: any) {
  let $ = this.cheerio.load(data)

  return data
}
}


*/