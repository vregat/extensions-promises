class Chapter {
    id: number
    mangaId: number
    name: string
    number: number
    volume: number
    group: string
    views: number
    time: Date
    read: boolean
    langCode: string
    downloaded: boolean = false

    constructor(_id: number , _mangaId: number , _name: string , _number: number , _volume: number , _group: string , _views: number , _time: Date , _read: boolean , _langCode: string ) {
		this.id = _id;
		this.mangaId = _mangaId;
		this.name = _name;
		this.number = _number;
		this.volume = _volume;
		this.group = _group;
		this.views = _views;
		this.time = _time;
		this.read = _read;
		this.langCode = _langCode;
	}

}

export default Chapter