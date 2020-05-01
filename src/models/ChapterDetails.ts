export interface ChapterDetails {
  id: string
  mangaId: string
  pages: string[]
  longStrip: boolean
}

export function createChapterDetails(id: string, mangaId: string, pages: string[], longStrip: boolean): ChapterDetails {
  return {
    'id': id,
    'mangaId': mangaId,
    'pages': pages,
    'longStrip': longStrip
  }
}