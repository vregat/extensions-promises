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

export function createChapter(id: string, mangaId: string, name: string, chapNum: number,
                              volume: number, group: string, views: number, time: Date,
                              read: boolean = false, langCode: string = 'en', downloaded: boolean = false): Chapter {
  return {
    'id': id,
    'mangaId': mangaId,
    'name': name,
    'chapNum': chapNum,
    'volume': volume,
    'group': group,
    'views': views,
    'time': time,
    'read': read,
    'langCode': langCode,
    'downloaded': downloaded
  }
}