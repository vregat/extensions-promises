import {MangaDex} from './sources/Mangadex'
import {MangaPark} from './sources/Mangapark'
import {Source} from './sources/Source'
import {Manga} from './models/Manga'
import {Chapter} from './models/Chapter'
import cheerio from 'cheerio'
import { ChapterDetails } from './models/ChapterDetails'
import { SearchRequest, createSearchRequest } from './models/SearchRequest'
import { Manganelo } from './sources/Manganelo'
import { RequestObject } from './models/RequestObject'
const axios = require('axios').default;

class APIWrapper {
	mangadex: MangaDex
	constructor(mangadex: MangaDex) {
		this.mangadex = mangadex
	}

	/**
	 * Retrieves all relevant metadata from a source 
	 * about particular manga
	 * 
	 * @param source 
	 * @param ids 
	 */
	async getMangaDetails(source: Source, ids: string[]): Promise<Manga[]> {
		/*let mangaDetailUrls = this.mangadex.getMangaDetailsUrls(ids)
		let url = mangaDetailUrls.manga.url*/
		let info = source.getMangaDetailsRequest(ids)
		let config = info.request.config
		let url = config.url
		let headers: any = config.headers
		headers['Cookie'] = this.formatCookie(info)
		try {
			var data = await Promise.all(ids.map(async (id) => {
				config.url = url + id
				return await axios.request(config)
			}))
		}
		catch (e) {
			console.log(e)
			return []
		}

		let manga: Manga[] = []
		for (let i = 0; i < data.length; i++) {
			manga.push(source.getMangaDetails(data[i].data, info.metadata.ids[i]))
		}

		return manga
	}

	/**
	 * Returns the json payload from the cache server
	 * 
	 * @param ids 
	 */
	async getMangaDetailsBulk(ids: string[]): Promise<Manga[]> {
		let mangaDetailUrls = this.mangadex.getMangaDetailsRequest(ids)
		let url = mangaDetailUrls.request.config.url
		let payload = {'id': ids}
		try {
			var data = await axios.post(url, payload)
		}
		catch (e) {
			console.log(e)
			return []
		}

		let manga: Manga[] = this.mangadex.getMangaDetailsBulk(data)
		return manga
	}

	/**
	 * Retrieves all the chapters for a particular manga
	 * 
	 * @param source 
	 * @param mangaId 
	 */
	async getChapters(source: Source, mangaId: string): Promise<Chapter[]> {
		let info = source.getChapterRequest(mangaId)
		let config = info.request.config
		let url = config.url
		let headers: any = config.headers
		headers['Cookie'] = this.formatCookie(info)

		try {
			config.url = url + info.request.param
			var data = await axios.request(config)
		}
		catch (e) {
			console.log(e)
			return []
		}

		let chapters: Chapter[] = source.getChapters(data.data, mangaId)
		return chapters
	}

	/**
	 * Retrieves the images for a particular chapter of a manga
	 * 
	 * @param source 
	 * @param mangaId 
	 * @param chId 
	 */
	async getChapterDetails(source: Source, mangaId: string, chId: string) {
		let info = source.getChapterDetailsRequest(mangaId, chId)
		let config = info.request.config
		let url = config.url
		let metadata = info.metadata
		let headers: any = config.headers
		headers['Cookie'] = this.formatCookie(info)

		try {
			config.url = url + info.request.param
			var data = await axios.request(config)
		}
		catch (e) {
			console.log(e)
			return []
		}

		let response = source.getChapterDetails(data.data, metadata)
		let details: ChapterDetails = response.details

		// there needs to be a way to handle sites that only show one page per link
		while (response.nextPage && metadata.page) {
			metadata.page++ 
			try {
				config.url = url + info.request.param
				data = await axios.request(config)
			}
			catch (e) {
				console.log(e)
				return details
			}

			response = source.getChapterDetails(data.data, metadata)
			details.pages.push(response.details.pages[0])
		}

		return details
	}

	/**
	 * This would take in all the ids that the user is reading
	 * then determines whether an update has come out since
	 * 
	 * @param ids 
	 * @param referenceTime will only get manga up to this time
	 * @returns List of the ids of the manga that were recently updated
	 */
	async filterUpdatedManga(source: Source, ids: string[], referenceTime: Date): Promise<string[]> {
		let currentPage = 1
		let hasResults = true
		let info = source.filterUpdatedMangaRequest(ids, referenceTime, currentPage)
		let config = info.request.config
		let url = config.url
		let headers: any = config.headers
		headers['Cookie'] = this.formatCookie(info)

		try {
			config.url = url + currentPage
			var data = await axios.request(config)
		}
		catch (e) {
			console.log(e)
			return []
		}

		let manga: string[] = []
		while (hasResults) {
			let results: any = source.filterUpdatedManga(data.data, info.metadata)
			manga = manga.concat(results.updatedMangaIds)
			if (results.nextPage) {
				currentPage++
				try {
					config.url = url + currentPage
					data = await axios.request(config)
				}
				catch (e) {
					console.log(e)
					return manga
				}
			}
			else {
				hasResults = false
			}
		}

		return manga
	}

	/**
	 * Home page of the application consists of a few discover sections. 
	 * This will contain featured, newly updated, new manga, etc.
	 * 
	 * @param none
	 * @returns {Sections[]} List of sections
	 */
	async getHomePageSections(source: Source) {
		let info = source.getHomePageSectionRequest()
		let keys: any = Object.keys(info)
		let urls: string[] = []
		let sections: any = []
		for (let key of keys) {
			for (let section of info[key].sections)
				sections.push(section)
			urls.push(info[key].request.url)
		}

		try {
			var data: any = await Promise.all(urls.map(axios.get))
		}
		catch (e) {
			console.log(e)
			return []
		}
		
		// Promise.all retains order
		for (let i = 0; i < data.length; i++) {
			sections = source.getHomePageSections(keys[i], data[i].data, sections)
		}

		return sections
	}

	/**
	 * Creates a search query for the source
	 * 
	 * @param query 
	 * @param page
	 */
	async search(source: Source, query: SearchRequest, page: number): Promise<Manga[]> {
		let info = source.searchRequest(query, page)
		let config = info.request.config
		let url = config.url

		let headers: any = config.headers
		headers['Cookie'] = this.formatCookie(info)

		try {
			config.url = url + info.request.param
			var data = await axios.request(config)
		}
		catch (e) {
			console.log(e)
			return []
		}

		return source.search(data.data)
	}

	/**
	 * Returns the json payload from the cache server
	 * 
	 * @param query 
	 * @param page 
	 */
	async searchMangaCached(query: SearchRequest, page: number): Promise<Manga[]> {
		let url = this.mangadex.searchRequest(query, page).request.config.url
		try {
			var data = await axios.post(url + `?page=${page}&items=100`, query)
		}
		catch (e) {
			console.log(e)
			return []
		}

		return this.mangadex.searchMangaCached(data.data)
	}

	async getTags() {
		let url = this.mangadex.getTagsUrl().url
		try {
			var data =  await axios.get(url)
		}
		catch (e) {
			console.log(e)
			return []
		}

		let tags = this.mangadex.getTags(data.data)
		return tags
	}

	private formatCookie(info: RequestObject): string {
		let fCookie = ''
		for (let cookie of info.request.cookies) 
			fCookie += `${cookie.name}=${cookie.value};`
		return fCookie
	}
}

// MY TESTING FRAMEWORK - LOL
let application = new APIWrapper(new MangaDex(cheerio))
//application.getHomePageSections(new MangaDex(cheerio)).then((data => console.log(data)))
//application.getMangaDetailsBulk(["4","2","3","4"])
//application.getHomePageSections(new MangaPark(cheerio)).then((data) => console.log(data))

// MangaDex
// application.getMangaDetails(new MangaDex(cheerio), ['1'])
// application.filterUpdatedManga(new MangaDex(cheerio), ['1'], new Date("2020-04-25 02:33:30 UTC")).then((data) => {console.log(data)})

// MangaPark
// application.getMangaDetails(new MangaPark(cheerio), ['radiation-house', 'boku-no-hero-academia-horikoshi-kouhei']).then((data) => {console.log(data)})
// application.getChapters(new MangaPark(cheerio), "radiation-house").then((data) => {console.log(data)})
// application.getChapterDetails(new MangaPark(cheerio), 'radiation-house', 'i1510452').then((data) => console.log(data))
// application.filterUpdatedManga(new MangaPark(cheerio), ["no-longer-a-heroine-gi-meng-gi", "the-wicked-queen-shin-ji-sang", "tower-of-god"], new Date("2020-04-25 02:33:30 UTC")).then((data) => { console.log(data)})
// let test = createSearchRequest('one piece', ['shounen'], [], [], [], [], [], [], [], [], ['adventure'])
// application.search(new MangaPark(cheerio), test, 1).then((data) => {console.log(data.length)})

// Manganelo
// application.getMangaDetails(new Manganelo(cheerio), ["read_one_piece_manga_online_free4"]).then( (data) => {console.log(data)})
// application.getChapters(new Manganelo(cheerio), 'radiation_house').then((data) => {console.log(data)})
// application.getChapterDetails(new Manganelo(cheerio), 'radiation_house', 'chapter_1').then((data) => {console.log(data)})