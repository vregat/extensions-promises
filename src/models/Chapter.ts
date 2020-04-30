export default class Chapter {
    id: string
    mangaId: string
    name: string
    chapNum: number
    volume: number
    group: string
    views: number
    time: Date
    read: boolean
    langCode: string
    downloaded: boolean = false

    constructor(_id: string , _mangaId: string , _name: string , _chapNum: number , _volume: number , _group: string , _views: number , _time: Date , _read: boolean , _langCode: string ) {
		this.id = _id;
		this.mangaId = _mangaId;
		this.name = _name;
		this.chapNum = _chapNum;
		this.volume = _volume;
		this.group = _group;
		this.views = _views;
		this.time = _time;
		this.read = _read;
		this.langCode = _langCode;
	}
}