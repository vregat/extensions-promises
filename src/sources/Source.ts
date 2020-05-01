export abstract class Source {
  protected cheerio: CheerioAPI
  constructor(cheerio: CheerioAPI) {
    this.cheerio = cheerio
  }

  abstract getMangaDetailsRequest(ids: string[]): any
  abstract getMangaDetails(data: any): any

  abstract filterUpdatedMangaUrls(ids: any, time: Date): any
  abstract filterUpdatedManga(data: any, metadata: any): any

  abstract getChapterUrls(mangaId: string): any
  abstract getChapters(data: any, mangaId: string): any

  abstract getChapterDetailsUrls(mangaId: string, chapId: string):any
  abstract getChapterDetails(data: any, metadata: any): any

  abstract getHomePageSectionUrls(): any
  abstract getHomePageSections(key: any, data: any, sections: any): any
  
  abstract search(data: any): any
  abstract advancedSearch(data: any): any
}