export default class Manga {
	private id: string 
	private image: string 
	private artist: string 
	private author: string 
	private avgRating: number 
	private content: Tag[] 
	private covers: string[] 
	private demographic: Tag[] 
	private description: string 
	private follows: number 
	private format: Tag[] 
	private genre: Tag[] 
	private langFlag: string 
	private langName: string 
	private rating: number 
	private status: number 
	private theme: Tag[] 
	private titles: string[] 
	private users: number 
	private views: number 
	private hentai: boolean 
	private related: number 
	private relatedManga: Manga[] | undefined
	private lastUpdate: string | undefined

	constructor(_id: string , _image: string , _artist: string , _author: string , 
		_avgRating: number , _content: Tag[] , _covers: string[] , _demographic: Tag[] , 
		_description: string , _follows: number , _format: Tag[] , _genre: Tag[] , 
		_langFlag: string , _langName: string , _rating: number , _status: number , 
		_theme: Tag[] , _titles: string[] , _users: number , _views: number , 
		_hentai: boolean , _related: number , _relatedManga: Manga[] , _lastUpdate: string) {
		this.id = _id;
		this.image = _image;
		this.artist = _artist;
		this.author = _author;
		this.avgRating = _avgRating;
		this.content = _content;
		this.covers = _covers;
		this.demographic = _demographic;
		this.description = _description;
		this.follows = _follows;
		this.format = _format;
		this.genre = _genre;
		this.langFlag = _langFlag;
		this.langName = _langName;
		this.rating = _rating;
		this.status = _status;
		this.theme = _theme;
		this.titles = _titles;
		this.users = _users;
		this.views = _views;
		this.hentai = _hentai;
		this.related = _related;
		this.relatedManga = _relatedManga;
		this.lastUpdate = _lastUpdate;
	}

	public static fromJSON(data: any) {
		return new Manga(data.id, data.image, data.artist, data.author, data.avgRating, data.content,
			data.covers, data.demographic, data.description, data.follows, data.format, data.genre, data.langFlag, data.langName,
			data.rating, data.status, data.theme, data.titles, data.users, data.views, data.hentai, data.related, data.relatedManga,
			data.lastUpdate)
	}

}