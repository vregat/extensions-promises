export class ChapterDetails {
  id: string
  mangaId: string
  pages: string[]
  longStrip: boolean

  constructor(_id: string, _mangaId: string, _pages: string[], _longStip: boolean) {
    this.id = _id
    this.mangaId = _mangaId
    this.pages = _pages
    this.longStrip = _longStip
  }
}