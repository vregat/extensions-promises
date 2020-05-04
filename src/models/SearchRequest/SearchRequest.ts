export interface SearchRequest {
  title?: string

  includeDemographic?: string[]
  includeTheme?: string[]
  includeFormat?: string[]
  includeContent?: string[]
  includeGenre?: string[]

  excludeDemographic?: string[]
  excludeTheme?: string[]
  excludeFormat?: string[]
  excludeContent?: string[]
  excludeGenre?: string[]

  includeOperator?: number
  excludeOperator?: number

  author?: string
  artist?: string
  status?: number
  hStatus?: boolean
}

declare global {
  function createSearchRequest(searchRequest: SearchRequest): SearchRequest
}