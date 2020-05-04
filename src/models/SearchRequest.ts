export interface SearchRequest {
  title: string | undefined

  includeDemographic: string[] | undefined
  includeTheme: string[] | undefined
  includeFormat: string[] | undefined
  includeContent: string[] | undefined
  includeGenre: string[] | undefined

  excludeDemographic: string[] | undefined
  excludeTheme: string[] | undefined
  excludeFormat: string[] | undefined
  excludeContent: string[] | undefined
  excludeGenre: string[] | undefined

  includeOperator: number | undefined
  excludeOperator: number | undefined

  author: string | undefined
  artist: string | undefined
  status: number | undefined
  hStatus: boolean | undefined
}

declare global {

  function createSearchRequest(title: string | undefined, includeDemographic: string[] | undefined, includeTheme: string[] | undefined, includeFormat: string[] | undefined,
    includeContent: string[] | undefined, includeGenre: string[] | undefined, excludeDemographic: string[] | undefined, excludeTheme: string[] | undefined,
    excludeFormat: string[] | undefined, excludeContent: string[] | undefined, excludeGenre: string[] | undefined, includeOperator: number | undefined,
    excludeOperator: number | undefined, author: string | undefined, artist: string | undefined, status: number | undefined, hStatus: boolean | undefined): SearchRequest
}