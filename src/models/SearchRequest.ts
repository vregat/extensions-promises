export class SearchRequest {
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
    hStatus: boolean = false

    constructor(_title: string , _includeDemographic: number[] , _includeTheme: number[] , _includeFormat: number[] , _includeContent: number[] , _includeGenre: number[] , _excludeDemographic: number[] , _excludeTheme: number[] , _excludeFormat: number[] , _excludeContent: number[] , _excludeGenre: number[] , _includeOperator: number , _excludeOperator: number , _author: string , _artist: string , _status: number , _hStatus: boolean ) {
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