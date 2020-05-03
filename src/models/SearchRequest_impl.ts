import { SearchRequest } from "./SearchRequest"

const _global = global as any

_global.createSearchRequest = function (title?: string, includeDemographic?: string[], includeTheme?: string[], includeFormat?: string[],
    includeContent?: string[], includeGenre?: string[], excludeDemographic?: string[], excludeTheme?: string[],
    excludeFormat?: string[], excludeContent?: string[], excludeGenre?: string[], includeOperator?: number,
    excludeOperator?: number, author?: string, artist?: string, status?: number, hStatus: boolean = false): SearchRequest {
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