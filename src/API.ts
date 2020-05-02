import {MangaDex} from './sources/Mangadex'
import {MangaPark} from './sources/Mangapark'
import {Source} from './sources/Source'
import {Manga} from './models/Manga'
import {Chapter} from './models/Chapter'
import cheerio from 'cheerio'
import { ChapterDetails } from './models/ChapterDetails'
import { SearchRequest, createSearchRequest } from './models/SearchRequest'
const axios = require('axios').default;

class APIWrapper {
	mangadex: MangaDex
	mangapark: MangaPark
	constructor(mangadex: MangaDex, mangapark: MangaPark) {
		this.mangadex = mangadex
		this.mangapark = mangapark
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
		let url = info.titles.request.url
		let config = info.titles.request.config
		let headers: any = config.headers
		headers['Cookie'] = ""
		for (let cookie of info.titles.request.cookies) {
				headers['Cookie'] += `${cookie.key}=${cookie.value};`
		}

		try {
			var data = await axios.get(url + currentPage, config)
		}
		catch (e) {
			console.log(e)
			return []
		}

		let manga: string[] = []
		while (hasResults) {
			let results: any = source.filterUpdatedManga(data, info.titles.metadata)
			manga = manga.concat(results.updatedMangaIds)
			if (results.nextPage) {
				currentPage++
				try {
					data = await axios.get(url + currentPage, config)
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
		let url = info.manga.request.url
		let config = info.manga.request.config
		let headers: any = config.headers
		headers['Cookie'] = ""
		for (let cookie of info.manga.request.cookies) {
				headers['Cookie'] += `${cookie.key}=${cookie.value};`
		}

		try {
			var data = await Promise.all(ids.map(async (id) => {
				return await axios.get(url + id.toString(), config)
			}))
		}
		catch (e) {
			console.log(e)
			return []
		}

		let manga: Manga[] = []
		for (let item of data) {
			manga.push(source.getMangaDetails(data))
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
		let url = mangaDetailUrls.manga.request.url
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

	async getTags() {
		let url = this.mangadex.getTagsUrl().url
		try {
			var data =  await axios.get(url)
		}
		catch (e) {
			console.log(e)
			return []
		}

		let tags = this.mangadex.getTags(data)
		return tags
	}

	async getChapters(source: Source, mangaId: string): Promise<Chapter[]> {
		let info = source.getChapterRequest(mangaId)
		let url = info.manga.request.url
		let config = info.manga.request.config
		let headers: any = config.headers
		headers['Cookie'] = ""
		for (let cookie of info.manga.request.cookies) {
				headers['Cookie'] += `${cookie.key}=${cookie.value};`
		}
		try {
			var data = await axios.get(url + info.manga.request.param, config)
		}
		catch (e) {
			console.log(e)
			return []
		}

		let chapters: Chapter[] = source.getChapters(data, mangaId)
		return chapters
	}

	async getChapterDetails(source: Source, mangaId: string, chId: string) {
		let info = source.getChapterDetailsRequest(mangaId, chId)
		let url = info.chapters.request.url
		let config = info.chapters.request.config
		let headers: any = config.headers
		headers['Cookie'] = ""
		for (let cookie of info.chapters.request.cookies) {
				headers['Cookie'] += `${cookie.key}=${cookie.value};`
		}

		try {
			var data = await axios.get(url + info.chapters.request.param, config)
		}
		catch (e) {
			console.log(e)
			return []
		}

		let chapterDetails: ChapterDetails = source.getChapterDetails(data, info.chapters.metadata)
		return chapterDetails
	}

	/**
	 * 
	 * @param query 
	 * @param page Still not sure how this fits in with the api
	 */
	async search(source: Source, query: SearchRequest, page: number): Promise<Manga[]> {
		let info = source.searchRequest(query, page)
		let url = info.request.url
		let config = info.request.config
		let headers: any = config.headers
		headers['Cookie'] = ""
		for (let cookie of info.request.cookies) {
				headers['Cookie'] += `${cookie.key}=${cookie.value};`
		}
		try {
			var data = await axios.get(url + info.request.param, config)
		}
		catch (e) {
			console.log(e)
			return []
		}

		return source.search(data)
	}

	async searchMangaCached(query: SearchRequest, page: number): Promise<Manga[]> {
		let url = this.mangadex.searchRequest(query, page).request.url
		try {
			var data = await axios.post(url + `?page=${page}&items=100`, query)
		}
		catch (e) {
			console.log(e)
			return []
		}

		return this.mangadex.searchMangaCached(data.result)
	}
}


// MY TESTING FRAMEWORK - LOL
let application = new APIWrapper(new MangaDex(cheerio), new MangaPark(cheerio))
//application.getHomePageSections(new MangaDex(cheerio)).then((data => console.log(data)))
//application.getMangaDetailsBulk(["4","2","3","4"])
application.getHomePageSections(new MangaPark(cheerio)).then((data) => console.log(data))
//application.getChapters(new MangaPark(cheerio), "radiation-house")
//application.searchManga("tag_mode_exc=any&tag_mode_inc=all&tags=-37&title=Radiation%20house", 1)
// application.filterUpdatedManga(new MangaPark(cheerio), ["no-longer-a-heroine-gi-meng-gi", "the-wicked-queen-shin-ji-sang", "tower-of-god"], new Date("2020-04-25 02:33:30 UTC")).then((data) => {
	// console.log(data)
// })
//application.getMangaDetails(new MangaPark(cheerio), ["one-piece"])
//application.getChapterDetails(new MangaPark(cheerio), "radiation-house", "i1510452")
//let test = createSearchRequest('one piece', ['shounen'], [], [], [], [], [], [], [], [], ['adventure'])
//application.search(new MangaPark(cheerio), test, 1).then((data) => {console.log(data.length)})