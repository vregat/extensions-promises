import MangaDex from './sources/Mangadex'
import MangaPark from './sources/Mangapark'
import Source from './sources/Source'
import Manga from './models/Manga'
import Chapter from './models/Chapter'
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
	async getHomePageSections() {
		let sectionUrls = this.mangadex.getHomePageSectionUrls()
		let keys = Object.keys(sectionUrls)
		let urls: string[] = Object.values(sectionUrls)

		try {
			var data: any = await Promise.all(urls.map(axios.get))
		}
		catch (e) {
			console.log(e)
			return []
		}
		
		// Promise.all retains order
		let sections = []
		for (let i = 0; i < data.length; i++) {
			sections.push(this.mangadex.getHomePageSections(keys[i], data[i].data))
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
	async filterUpdatedManga(ids: string[], referenceTime: Date): Promise<number[]> {
		let currentPage = 1
		let hasResults = true
		let info = this.mangadex.filterUpdatedMangaUrls(ids, referenceTime)
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

		let manga: number[] = []
		while (hasResults) {
			let results: any = this.mangadex.filterUpdatedManga(data, info.titles.metadata)
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

	async getMangaDetails(source: Source, ids: string[]): Promise<Manga[]> {
		/*let mangaDetailUrls = this.mangadex.getMangaDetailsUrls(ids)
		let url = mangaDetailUrls.manga.url*/
		let info = source.getMangaDetailsUrls(ids)
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
		let mangaDetailUrls = this.mangadex.getMangaDetailsUrls(ids)
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

	async getChapters(source: Source, mangaId: string) {
		let info = source.getChapterUrls(mangaId)
		let url = info.manga.request.url
		let config = info.manga.request.config
		let headers: any = config.headers
		headers['Cookie'] = ""
		for (let cookie of info.manga.request.cookies) {
				headers['Cookie'] += `${cookie.key}=${cookie.value};`
		}
		try {
			var data = await axios.get(url + mangaId, config)
		}
		catch (e) {
			console.log(e)
			return []
		}

		return source.getChapters(mangaId, data)
	}

	async getChapterDetails(chapterId: string) {

	}

	/**
	 * 
	 * @param query 
	 * @param page Still not sure how this fits in with the api
	 */
	async searchManga(query: SearchRequest, page: number): Promise<Manga[]> {
		let url = this.mangadex.getSearchUrls(query).url
		try {
			var data = await axios.get(url + query + `&p=${page}`)
		}
		catch (e) {
			console.log(e)
			return []
		}

		return this.mangadex.searchManga(data)
	}

	async searchMangaCached(query: SearchRequest, page: number): Promise<Manga[]> {
		let url = this.mangadex.getSearchUrls(query).url
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
let application = new APIWrapper(new MangaDex(), new MangaPark())
//application.getHomePageSections().then((data => console.log(data)))
//application.getMangaDetailsBulk(["4","2","3","4"])
//application.getHomePageSections()
application.getChapters(new MangaPark(), "radiation-house")
//application.searchManga("tag_mode_exc=any&tag_mode_inc=all&tags=-37&title=Radiation%20house", 1)
//application.filterUpdatedManga(["1", "47057", "47151"], new Date("2020-04-29 02:33:30 UTC"))
//application.getMangaDetails(new MangaPark(), ["one-piece"])