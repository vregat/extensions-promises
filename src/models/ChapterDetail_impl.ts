import { ChapterDetails } from "./ChapterDetails"

const _global = global as any

_global.createChapterDetails = function (id: string, mangaId: string, pages: string[], longStrip: boolean): ChapterDetails {
    return {
        'id': id,
        'mangaId': mangaId,
        'pages': pages,
        'longStrip': longStrip
    }
}