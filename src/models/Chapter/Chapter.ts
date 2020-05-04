export interface Chapter {
  id: string
  mangaId: string
  chapNum: number
  langCode: string
  name?: string
  volume?: number
  group?: string
  time?: Date
}

declare global {
  function createChapter(chapter: Chapter): Chapter
}