export class SearchRequest {
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
    hStatus?: boolean = false

    constructor(_title?: string, _includeDemographic?: string[], _includeTheme?: string[], _includeFormat?: string[], _includeContent?: string[], _includeGenre?: string[], _excludeDemographic?: string[], _excludeTheme?: string[], _excludeFormat?: string[], _excludeContent?: string[], _excludeGenre?: string[], _includeOperator?: number, _excludeOperator?: number, _author?: string, _artist?: string, _status?: number, _hStatus: boolean = true ) {
		this.title = _title;
		this.includeDemographic = _includeDemographic;
		this.includeTheme = _includeTheme;
		this.includeFormat = _includeFormat;
		this.includeContent = _includeContent;
		this.includeGenre = _includeGenre;
		this.excludeDemographic = _excludeDemographic;
		this.excludeTheme = _excludeTheme;
		this.excludeFormat = _excludeFormat;
		this.excludeContent = _excludeContent;
		this.excludeGenre = _excludeGenre;
		this.includeOperator = _includeOperator;
		this.excludeOperator = _excludeOperator;
		this.author = _author;
		this.artist = _artist;
		this.status = _status;
		this.hStatus = _hStatus;
	}
}