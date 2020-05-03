export interface ChapterDetails {
  id: string
  mangaId: string
  pages: string[]
  longStrip: boolean
}

declare global {

  function createChapterDetails(id: string, mangaId: string, pages: string[], longStrip: boolean): ChapterDetails
}