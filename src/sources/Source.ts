import { SearchRequest } from "../models/SearchRequest"

export abstract class Source {
  protected cheerio: CheerioAPI
  constructor(cheerio: CheerioAPI) {
    this.cheerio = cheerio
  }

  abstract getMangaDetailsRequest(ids: string[]): any
  abstract getMangaDetails(data: any): any

  abstract filterUpdatedMangaRequest(ids: any, time: Date, page: number): any
  abstract filterUpdatedManga(data: any, metadata: any): any

  abstract getChapterRequest(mangaId: string): any
  abstract getChapters(data: any, mangaId: string): any

  abstract getChapterDetailsRequest(mangaId: string, chapId: string):any
  abstract getChapterDetails(data: any, metadata: any): any

  abstract getHomePageSectionRequest(): any
  abstract getHomePageSections(key: any, data: any, sections: any): any
  
  abstract searchRequest(query: SearchRequest, page: number): any
  abstract search(data: any): any

  protected convertTime(timeAgo: string): Date {
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

    return time
  }
}