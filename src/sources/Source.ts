import cheerio from 'cheerio'

abstract class Source {
  protected cheerio: CheerioAPI
  constructor() {
    this.cheerio = cheerio
  }

  abstract getMangaDetailsUrls(ids: string[]): any
  abstract getMangaDetails(data: any): any

  abstract filterUpdatedMangaUrls(ids: any, time: Date): any
  abstract filterUpdatedManga(data: any, metadata: any): any

  abstract getChapterUrls(mangaId: string): any
  abstract getChapters(mangaId: string, data: any): any

}

export default Source