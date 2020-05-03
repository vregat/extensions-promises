import { Manga } from "./Manga"

const _global = global as any

_global.createManga = function (id: string, image: string, artist: string, author: string, avgRating: number,
    content: Tag[], covers: string[], demographic: Tag[], description: string,
    follows: number, format: Tag[], genre: Tag[], langFlag: string, langName: string,
    rating: number, status: number, theme: Tag[], titles: string[], users: number,
    views: number, hentai: boolean, related: number, relatedManga: Manga[], lastUpdate: string): Manga {
    return {
        id: id,
        image: image,
        artist: artist,
        author: author,
        avgRating: avgRating,
        content: content,
        covers: covers,
        demographic: demographic,
        description: description,
        follows: follows,
        format: format,
        genre: genre,
        langFlag: langFlag,
        langName: langName,
        rating: rating,
        status: status,
        theme: theme,
        titles: titles,
        users: users,
        views: views,
        hentai: hentai,
        related: related,
        relatedManga: relatedManga,
        lastUpdate: lastUpdate
    }
}