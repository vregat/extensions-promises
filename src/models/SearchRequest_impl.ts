import { SearchRequest } from "./SearchRequest"

const _global = global as any

_global.createSearchRequest = function (title: string | undefined, includeDemographic: string[] | undefined, includeTheme: string[] | undefined, includeFormat: string[] | undefined,
    includeContent: string[] | undefined, includeGenre: string[] | undefined, excludeDemographic: string[] | undefined, excludeTheme: string[] | undefined,
    excludeFormat: string[] | undefined, excludeContent: string[] | undefined, excludeGenre: string[] | undefined, includeOperator: number | undefined,
    excludeOperator: number | undefined, author: string | undefined, artist: string | undefined, status: number | undefined, hStatus: boolean = false): SearchRequest {
    return {
        title: title,
        includeDemographic: includeDemographic,
        includeTheme: includeTheme,
        includeFormat: includeFormat,
        includeContent: includeContent,
        includeGenre: includeGenre,
        excludeDemographic: excludeDemographic,
        excludeTheme: excludeTheme,
        excludeFormat: excludeFormat,
        excludeContent: excludeContent,
        excludeGenre: excludeGenre,
        includeOperator: includeOperator,
        excludeOperator: excludeOperator,
        author: author,
        artist: artist,
        status: status,
        hStatus: hStatus
    }
}