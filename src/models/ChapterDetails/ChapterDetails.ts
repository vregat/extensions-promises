export interface ChapterDetails {
  id: string
  mangaId: string
  pages: string[]
  longStrip: boolean
}

declare global {

  function createChapterDetails(chapterDetails: ChapterDetails): ChapterDetails
}