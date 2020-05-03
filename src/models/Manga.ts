export interface Manga {
	id: string
	image: string
	artist: string
	author: string
	avgRating: number
	content: Tag[]
	covers: string[]
	demographic: Tag[]
	description: string
	follows: number
	format: Tag[]
	genre: Tag[]
	langFlag: string
	langName: string
	rating: number
	status: number
	theme: Tag[]
	titles: string[]
	users: number
	views: number
	hentai: boolean
	related: number
	relatedManga?: Manga[]
	lastUpdate?: string
}

declare global {

	function createManga(id: string, image: string, artist: string, author: string, avgRating: number,
		content: Tag[], covers: string[], demographic: Tag[], description: string,
		follows: number, format: Tag[], genre: Tag[], langFlag: string, langName: string,
		rating: number, status: number, theme: Tag[], titles: string[], users: number,
		views: number, hentai: boolean, related: number, relatedManga: Manga[], lastUpdate: string): Manga
}