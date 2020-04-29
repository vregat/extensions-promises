interface SearchRequest {
    title: string | undefined

    includeDemographic: number[] | undefined
    includeTheme: number[] | undefined
    includeFormat: number[] | undefined
    includeContent: number[] | undefined
    includeGenre: number[] | undefined

    excludeDemographic: number[] | undefined
    excludeTheme: number[] | undefined
    excludeFormat: number[] | undefined
    excludeContent: number[] | undefined
    excludeGenre: number[] | undefined

    includeOperator: number | undefined
    excludeOperator: number | undefined

    author: string | undefined
    artist: string | undefined
    status: number | undefined
    hStatus: boolean
}