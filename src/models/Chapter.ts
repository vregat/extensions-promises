export interface Chapter {
  id: string
  mangaId: string
  name: string
  chapNum: number
  volume: number
  group: string
  views: number
  time: Date
  read: boolean
  langCode: string
  downloaded: boolean
}

declare global {
  function createChapter(id: string, mangaId: string, name: string, chapNum: number,
    volume: number, group: string, views: number, time: Date,
    read?: boolean, langCode?: string, downloaded?: boolean): Chapter
}