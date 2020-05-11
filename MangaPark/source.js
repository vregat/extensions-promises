(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LanguageCode;
(function (LanguageCode) {
    LanguageCode["UNKNOWN"] = "_unknown";
    LanguageCode["BENGALI"] = "bd";
    LanguageCode["BULGARIAN"] = "bg";
    LanguageCode["BRAZILIAN"] = "br";
    LanguageCode["CHINEESE"] = "cn";
    LanguageCode["CZECH"] = "cz";
    LanguageCode["GERMAN"] = "de";
    LanguageCode["DANISH"] = "dk";
    LanguageCode["ENGLISH"] = "gb";
    LanguageCode["SPANISH"] = "es";
    LanguageCode["FINNISH"] = "fi";
    LanguageCode["FRENCH"] = "fr";
    LanguageCode["WELSH"] = "gb";
    LanguageCode["GREEK"] = "gr";
    LanguageCode["CHINEESE_HONGKONG"] = "hk";
    LanguageCode["HUNGARIAN"] = "hu";
    LanguageCode["INDONESIAN"] = "id";
    LanguageCode["ISRELI"] = "il";
    LanguageCode["INDIAN"] = "in";
    LanguageCode["IRAN"] = "ir";
    LanguageCode["ITALIAN"] = "it";
    LanguageCode["JAPANESE"] = "jp";
    LanguageCode["KOREAN"] = "kr";
    LanguageCode["LITHUANIAN"] = "lt";
    LanguageCode["MONGOLIAN"] = "mn";
    LanguageCode["MEXIAN"] = "mx";
    LanguageCode["MALAY"] = "my";
    LanguageCode["DUTCH"] = "nl";
    LanguageCode["NORWEGIAN"] = "no";
    LanguageCode["PHILIPPINE"] = "ph";
    LanguageCode["POLISH"] = "pl";
    LanguageCode["PORTUGUESE"] = "pt";
    LanguageCode["ROMANIAN"] = "ro";
    LanguageCode["RUSSIAN"] = "ru";
    LanguageCode["SANSKRIT"] = "sa";
    LanguageCode["SAMI"] = "si";
    LanguageCode["THAI"] = "th";
    LanguageCode["TURKISH"] = "tr";
    LanguageCode["UKRAINIAN"] = "ua";
    LanguageCode["VIETNAMESE"] = "vn";
})(LanguageCode = exports.LanguageCode || (exports.LanguageCode = {}));

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MangaStatus;
(function (MangaStatus) {
    MangaStatus[MangaStatus["ONGOING"] = 0] = "ONGOING";
    MangaStatus[MangaStatus["COMPLETED"] = 1] = "COMPLETED";
})(MangaStatus = exports.MangaStatus || (exports.MangaStatus = {}));

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Source_1 = require("../Source");
const Manga_1 = require("../../models/Manga/Manga");
const Languages_1 = require("../../models/Languages/Languages");
class MangaPark extends Source_1.Source {
    constructor(cheerio) {
        super(cheerio);
        this.MP_DOMAIN = 'https://mangapark.net';
    }
    get version() { return '1.0.4'; }
    get name() { return 'MangaPark'; }
    get icon() { return 'icon.png'; }
    get author() { return 'Daniel Kovalevich'; }
    get authorWebsite() { return 'https://github.com/DanielKovalevich'; }
    get description() { return 'Extension that pulls manga from MangaPark, includes Advanced Search and Updated manga fetching'; }
    get hentaiSource() { return false; }
    getMangaDetailsRequest(ids) {
        let requests = [];
        for (let id of ids) {
            let metadata = { 'id': id };
            requests.push(createRequestObject({
                url: `${this.MP_DOMAIN}/manga/${id}`,
                cookies: [createCookie({ name: 'set', value: 'h=1', domain: this.MP_DOMAIN })],
                metadata: metadata,
                method: 'GET'
            }));
        }
        return requests;
    }
    getMangaDetails(data, metadata) {
        var _a, _b, _c, _d, _e, _f, _g;
        let $ = this.cheerio.load(data);
        let tagSections = [createTagSection({ id: '0', label: 'genres', tags: [] }),
            createTagSection({ id: '1', label: 'format', tags: [] })];
        // let id: string = (($('head').html() ?? "").match((/(_manga_name\s*=\s)'([\S]+)'/)) ?? [])[2]
        let image = (_a = $('img', '.manga').attr('src')) !== null && _a !== void 0 ? _a : "";
        let rating = $('i', '#rating').text();
        let tableBody = $('tbody', '.manga');
        let titles = [];
        let title = $('.manga').find('a').first().text();
        titles.push(title.substring(0, title.lastIndexOf(' ')));
        let hentai = false;
        let author = "";
        let artist = "";
        let views = 0;
        let status = Manga_1.MangaStatus.ONGOING;
        for (let row of $('tr', tableBody).toArray()) {
            let elem = $('th', row).html();
            switch (elem) {
                case 'Author(s)':
                    author = $('a', row).text();
                    break;
                case 'Artist(s)':
                    artist = $('a', row).first().text();
                    break;
                case 'Popularity': {
                    let pop = ((_b = /has (\d*(\.?\d*\w)?)/g.exec($('td', row).text())) !== null && _b !== void 0 ? _b : [])[1];
                    if (pop.includes('k')) {
                        pop = pop.replace('k', '');
                        views = Number(pop) * 1000;
                    }
                    else {
                        views = (_c = Number(pop)) !== null && _c !== void 0 ? _c : 0;
                    }
                    break;
                }
                case 'Alternative': {
                    let alts = $('td', row).text().split('  ');
                    for (let alt of alts) {
                        let trim = alt.trim().replace(/(;*\t*)/g, '');
                        if (trim != '')
                            titles.push(trim);
                    }
                    break;
                }
                case 'Genre(s)': {
                    for (let genre of $('a', row).toArray()) {
                        let item = (_d = $(genre).html()) !== null && _d !== void 0 ? _d : "";
                        let id = (_f = (_e = $(genre).attr('href')) === null || _e === void 0 ? void 0 : _e.split('/').pop()) !== null && _f !== void 0 ? _f : '';
                        let tag = item.replace(/<[a-zA-Z\/][^>]*>/g, "");
                        if (item.includes('Hentai')) {
                            hentai = true;
                        }
                        tagSections[0].tags.push(createTag({ id: id, label: tag }));
                    }
                    break;
                }
                case 'Status': {
                    let stat = $('td', row).text();
                    if (stat.includes('Ongoing'))
                        status = Manga_1.MangaStatus.ONGOING;
                    else if (stat.includes('Completed')) {
                        status = Manga_1.MangaStatus.COMPLETED;
                    }
                    break;
                }
                case 'Type': {
                    let type = $('td', row).text().split('-')[0].trim();
                    let id = '';
                    if (type.includes('Manga'))
                        id = 'manga';
                    else if (type.includes('Manhwa'))
                        id = 'manhwa';
                    else if (type.includes('Manhua'))
                        id = 'manhua';
                    else
                        id = 'unknown';
                    tagSections[1].tags.push(createTag({ id: id, label: type.trim() }));
                }
            }
        }
        let summary = (_g = $('.summary').html()) !== null && _g !== void 0 ? _g : "";
        return [createManga({
                id: metadata.id,
                titles: titles,
                image: image.replace(/(https:)?\/\//gi, 'https://'),
                rating: Number(rating),
                status: status,
                artist: artist,
                author: author,
                tags: tagSections,
                views: views,
                desc: summary,
                hentai: hentai
            })];
    }
    getChaptersRequest(mangaId) {
        let metadata = { 'id': mangaId };
        return createRequestObject({
            url: `${this.MP_DOMAIN}/manga/${mangaId}`,
            method: "GET",
            metadata: metadata
        });
    }
    getChapters(data, metadata) {
        var _a, _b, _c, _d;
        let $ = this.cheerio.load(data);
        let chapters = [];
        for (let elem of $('#list').children('div').toArray()) {
            // streamNum helps me navigate the weird id/class naming scheme
            let streamNum = ((_b = /(\d+)/g.exec((_a = $(elem).attr('id')) !== null && _a !== void 0 ? _a : "")) !== null && _b !== void 0 ? _b : [])[0];
            let groupName = $(`.ml-1.stream-text-${streamNum}`, elem).text();
            let volNum = 1;
            let chapNum = 1;
            let volumes = $('.volume', elem).toArray().reverse();
            for (let vol of volumes) {
                let chapterElem = $('li', vol).toArray().reverse();
                for (let chap of chapterElem) {
                    let chapId = (_c = $(chap).attr('id')) === null || _c === void 0 ? void 0 : _c.replace('b-', 'i');
                    let name;
                    let nameArr = ((_d = $('a', chap).html()) !== null && _d !== void 0 ? _d : "").replace(/(\t*\n*)/g, '').split(':');
                    name = nameArr.length > 1 ? nameArr[1].trim() : undefined;
                    let time = this.convertTime($('.time', chap).text().trim());
                    chapters.push(createChapter({
                        id: chapId !== null && chapId !== void 0 ? chapId : '',
                        mangaId: metadata.id,
                        name: name,
                        chapNum: chapNum,
                        volume: volNum,
                        time: time,
                        group: groupName,
                        langCode: Languages_1.LanguageCode.ENGLISH
                    }));
                    chapNum++;
                }
                volNum++;
            }
        }
        return chapters;
    }
    getChapterDetailsRequest(mangaId, chId) {
        let metadata = { 'mangaId': mangaId, 'chapterId': chId, 'nextPage': false, 'page': 1 };
        return createRequestObject({
            url: `${this.MP_DOMAIN}/manga/${mangaId}/${chId}`,
            method: "GET",
            metadata: metadata,
            cookies: [createCookie({ name: 'set', value: 'h=1', domain: this.MP_DOMAIN })]
        });
    }
    getChapterDetails(data, metadata) {
        var _a;
        let script = JSON.parse(((_a = /var _load_pages = (.*);/.exec(data)) !== null && _a !== void 0 ? _a : [])[1]);
        let pages = [];
        for (let page of script) {
            pages.push(page.u);
        }
        let chapterDetails = createChapterDetails({
            id: metadata.chapterId,
            mangaId: metadata.mangaId,
            pages: pages,
            longStrip: false
        });
        // Unused, idk if you'll need this later so keeping it
        let returnObject = {
            'details': chapterDetails,
            'nextPage': metadata.nextPage,
            'param': null
        };
        return chapterDetails;
    }
    filterUpdatedMangaRequest(ids, time, page) {
        let metadata = { 'ids': ids, 'referenceTime': time };
        return createRequestObject({
            url: `${this.MP_DOMAIN}/latest/${page}`,
            method: 'GET',
            metadata: metadata,
            cookies: [createCookie({ name: 'set', value: 'h=1', domain: this.MP_DOMAIN })]
        });
    }
    filterUpdatedManga(data, metadata) {
        var _a, _b;
        let $ = this.cheerio.load(data);
        let returnObject = {
            'updatedMangaIds': [],
            'nextPage': true
        };
        for (let item of $('.item', '.ls1').toArray()) {
            let id = (_b = ((_a = $('a', item).first().attr('href')) !== null && _a !== void 0 ? _a : '').split('/').pop()) !== null && _b !== void 0 ? _b : '';
            let time = $('.time').first().text();
            if (this.convertTime(time) > metadata.referenceTime) {
                if (metadata.ids.includes(id)) {
                    returnObject.updatedMangaIds.push(id);
                }
            }
            else {
                returnObject.nextPage = false;
                return returnObject;
            }
        }
        return returnObject;
    }
    getHomePageSectionRequest() {
        let request = createRequestObject({ url: `${this.MP_DOMAIN}`, method: 'GET' });
        let section1 = createHomeSection({ id: 'popular_titles', title: 'POPULAR MANGA' });
        let section2 = createHomeSection({ id: 'popular_new_titles', title: 'POPULAR MANGA UPDATES' });
        let section3 = createHomeSection({ id: 'recently_updated', title: 'RECENTLY UPDATED TITLES' });
        return [createHomeSectionRequest({ request: request, sections: [section1, section2, section3] })];
    }
    getHomePageSections(data, sections) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        let $ = this.cheerio.load(data);
        let popManga = [];
        let newManga = [];
        let updateManga = [];
        for (let item of $('li', '.top').toArray()) {
            let id = (_b = ((_a = $('.cover', item).attr('href')) !== null && _a !== void 0 ? _a : '').split('/').pop()) !== null && _b !== void 0 ? _b : '';
            let title = (_c = $('.cover', item).attr('title')) !== null && _c !== void 0 ? _c : '';
            let image = (_d = $('img', item).attr('src')) !== null && _d !== void 0 ? _d : '';
            let subtitle = (_e = $('.visited', item).text()) !== null && _e !== void 0 ? _e : '';
            let sIcon = 'clock.fill';
            let sText = $('i', item).text();
            popManga.push(createMangaTile({
                id: id,
                image: image.replace(/(https:)?\/\//gi, 'https://'),
                title: createIconText({ text: title }),
                subtitleText: createIconText({ text: subtitle }),
                secondaryText: createIconText({ text: sText, icon: sIcon })
            }));
        }
        for (let item of $('ul', '.mainer').toArray()) {
            for (let elem of $('li', item).toArray()) {
                let id = (_g = ((_f = $('a', elem).first().attr('href')) !== null && _f !== void 0 ? _f : '').split('/').pop()) !== null && _g !== void 0 ? _g : '';
                let title = (_h = $('img', elem).attr('alt')) !== null && _h !== void 0 ? _h : '';
                let image = (_j = $('img', elem).attr('src')) !== null && _j !== void 0 ? _j : '';
                let subtitle = (_k = $('.visited', elem).text()) !== null && _k !== void 0 ? _k : '';
                newManga.push(createMangaTile({
                    id: id,
                    image: image.replace(/(https:)?\/\//gi, 'https://'),
                    title: createIconText({ text: title }),
                    subtitleText: createIconText({ text: subtitle })
                }));
            }
        }
        for (let item of $('.item', 'article').toArray()) {
            let id = (_m = ((_l = $('.cover', item).attr('href')) !== null && _l !== void 0 ? _l : '').split('/').pop()) !== null && _m !== void 0 ? _m : '';
            let title = (_o = $('.cover', item).attr('title')) !== null && _o !== void 0 ? _o : '';
            let image = (_p = $('img', item).attr('src')) !== null && _p !== void 0 ? _p : '';
            let subtitle = (_q = $('.visited', item).text()) !== null && _q !== void 0 ? _q : '';
            let sIcon = 'clock.fill';
            let sText = (_r = $('li.new', item).first().find('i').last().text()) !== null && _r !== void 0 ? _r : '';
            updateManga.push(createMangaTile({
                id: id,
                image: image.replace(/(https:)?\/\//gi, 'https://'),
                title: createIconText({ text: title }),
                subtitleText: createIconText({ text: subtitle }),
                secondaryText: createIconText({ text: sText, icon: sIcon })
            }));
        }
        // console.log(updateManga)
        sections[0].items = popManga;
        sections[1].items = newManga;
        sections[2].items = updateManga;
        return sections;
    }
    getViewMoreRequest(key, page) {
        let param = '';
        switch (key) {
            case 'popular_titles': {
                param = `/genre/${page}`;
                break;
            }
            case 'popular_new_titles': {
                param = `/search?orderby=views&page=${page}`;
                break;
            }
            case 'recently_updated': {
                param = `/latest/${page}`;
                break;
            }
            default: return null;
        }
        return createRequestObject({
            url: `${this.MP_DOMAIN}${param}`,
            method: 'GET'
        });
    }
    getViewMoreItems(data, key) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        let $ = this.cheerio.load(data);
        let manga = [];
        if (key == 'popular_titles') {
            for (let item of $('.item', '.row.mt-2.ls1').toArray()) {
                let id = (_b = (_a = $('a', item).first().attr('href')) === null || _a === void 0 ? void 0 : _a.split('/').pop()) !== null && _b !== void 0 ? _b : '';
                let title = (_c = $('a', item).first().attr('title')) !== null && _c !== void 0 ? _c : '';
                let image = (_d = $('img', item).attr('src')) !== null && _d !== void 0 ? _d : '';
                let elems = $('small.ml-1', item);
                let rating = $(elems[0]).text().trim();
                let rank = $(elems[1]).text().split('-')[0].trim();
                let chapters = $('span.small', item).text().trim();
                manga.push(createMangaTile({
                    id: id,
                    image: image.replace(/(https:)?\/\//gi, 'https://'),
                    title: createIconText({ text: title }),
                    subtitleText: createIconText({ text: chapters }),
                    primaryText: createIconText({ text: rating, icon: 'star.fill' }),
                    secondaryText: createIconText({ text: rank, icon: 'chart.bar.fill' })
                }));
            }
        }
        else if (key == 'popular_new_titles') {
            for (let item of $('.item', '.manga-list').toArray()) {
                let id = (_f = (_e = $('.cover', item).attr('href')) === null || _e === void 0 ? void 0 : _e.split('/').pop()) !== null && _f !== void 0 ? _f : '';
                let title = (_g = $('.cover', item).attr('title')) !== null && _g !== void 0 ? _g : '';
                let image = (_h = $('img', item).attr('src')) !== null && _h !== void 0 ? _h : '';
                let rank = $('[title=rank]', item).text().split('·')[1].trim();
                let rating = $('.rate', item).text().trim();
                let time = $('.justify-content-between', item).first().find('i').text();
                manga.push(createMangaTile({
                    id: id,
                    image: image.replace(/(https:)?\/\//gi, 'https://'),
                    title: createIconText({ text: title }),
                    subtitleText: createIconText({ text: time }),
                    primaryText: createIconText({ text: rating, icon: 'star.fill' }),
                    secondaryText: createIconText({ text: rank, icon: 'chart.bar.fill' })
                }));
            }
        }
        else if (key == 'recently_updated') {
            for (let item of $('.item', '.ls1').toArray()) {
                let id = (_k = (_j = $('.cover', item).attr('href')) === null || _j === void 0 ? void 0 : _j.split('/').pop()) !== null && _k !== void 0 ? _k : '';
                let title = (_l = $('.cover', item).attr('title')) !== null && _l !== void 0 ? _l : '';
                let image = (_m = $('img', item).attr('src')) !== null && _m !== void 0 ? _m : '';
                let chapter = $('.visited', item).first().text();
                let time = $('.time', item).first().text();
                manga.push(createMangaTile({
                    id: id,
                    image: image.replace(/(https:)?\/\//gi, 'https://'),
                    title: createIconText({ text: title }),
                    subtitleText: createIconText({ text: chapter }),
                    secondaryText: createIconText({ text: time, icon: 'clock.fill' })
                }));
            }
        }
        else
            return null;
        return manga;
    }
    searchRequest(query, page) {
        var _a, _b, _c, _d;
        let genres = ((_a = query.includeGenre) !== null && _a !== void 0 ? _a : []).join(',');
        let excluded = ((_b = query.excludeGenre) !== null && _b !== void 0 ? _b : []).join(',');
        // will not let you search across more than one format
        let format = ((_c = query.includeFormat) !== null && _c !== void 0 ? _c : [])[0];
        let status = "";
        switch (query.status) {
            case 0:
                status = 'completed';
                break;
            case 1:
                status = 'ongoing';
                break;
            default: status = '';
        }
        let search = `q=${encodeURI((_d = query.title) !== null && _d !== void 0 ? _d : '')}&`;
        search += `autart=${encodeURI(query.author || query.artist || '')}&`;
        search += `&genres=${genres}&genres-exclude=${excluded}&page=${page}`;
        search += `&types=${format}&status=${status}&st-ss=1`;
        let metadata = { 'search': search };
        return createRequestObject({
            url: `${this.MP_DOMAIN}/search?${search}`,
            method: 'GET',
            metadata: metadata,
            cookies: [createCookie({ name: 'set', value: `h=${query.hStatus ? 1 : 0}`, domain: this.MP_DOMAIN })]
        });
    }
    search(data) {
        var _a, _b, _c, _d;
        let $ = this.cheerio.load(data);
        let mangaList = $('.manga-list');
        let manga = [];
        for (let item of $('.item', mangaList).toArray()) {
            let id = (_b = (_a = $('a', item).first().attr('href')) === null || _a === void 0 ? void 0 : _a.split('/').pop()) !== null && _b !== void 0 ? _b : '';
            let img = $('img', item);
            let image = (_c = $(img).attr('src')) !== null && _c !== void 0 ? _c : '';
            let title = (_d = $(img).attr('title')) !== null && _d !== void 0 ? _d : '';
            let rate = $('.rate', item);
            let rating = Number($(rate).find('i').text());
            let author = "";
            for (let field of $('.field', item).toArray()) {
                let elem = $('b', field).first().text();
                if (elem == 'Authors/Artists:') {
                    let authorCheerio = $('a', field).first();
                    author = $(authorCheerio).text();
                }
            }
            let lastUpdate = $('ul', item).find('i').text();
            manga.push(createMangaTile({
                id: id,
                image: image.replace(/(https:)?\/\//gi, 'https://'),
                title: createIconText({ text: title }),
                subtitleText: createIconText({ text: author }),
                primaryText: createIconText({ text: rating.toString(), icon: 'star.fill' }),
                secondaryText: createIconText({ text: lastUpdate, icon: 'clock.fill' })
            }));
        }
        return manga;
    }
    getTagsRequest() {
        return createRequestObject({
            url: `${this.MP_DOMAIN}/search?`,
            method: "GET",
            cookies: [createCookie({ name: 'set', value: 'h=1', domain: this.MP_DOMAIN })],
        });
    }
    getTags(data) {
        var _a, _b;
        let tagSections = [createTagSection({ id: '0', label: 'genres', tags: [] }),
            createTagSection({ id: '1', label: 'format', tags: [] })];
        let $ = this.cheerio.load(data);
        for (let genre of $('span', '[name=genres]').toArray())
            tagSections[0].tags.push(createTag({ id: (_a = $(genre).attr('rel')) !== null && _a !== void 0 ? _a : '', label: $(genre).text() }));
        for (let type of $('span', '[name=types]').toArray())
            tagSections[1].tags.push(createTag({ id: (_b = $(type).attr('rel')) !== null && _b !== void 0 ? _b : '', label: $(type).text() }));
        return tagSections;
    }
}
exports.MangaPark = MangaPark;

},{"../../models/Languages/Languages":1,"../../models/Manga/Manga":2,"../Source":4}],4:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Source {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
    /**
     * An optional field where the author may put a link to their website
     */
    get authorWebsite() { return null; }
    /**
     * An optional field that defines the language of the extension's source
     */
    get language() { return 'all'; }
    // <-----------        OPTIONAL METHODS        -----------> //
    /**
     * (OPTIONAL METHOD) Different sources have different tags available for searching. This method
     * should target a URL which allows you to parse apart all of the available tags which a website has.
     * This will populate tags in the iOS application where the user can use
     * @returns A request object which can provide HTML for determining tags that a source uses
     */
    getTagsRequest() { return null; }
    /**
     * (OPTIONAL METHOD) A function which should handle parsing apart HTML returned from {@link Source.getTags}
     * and generate a list of {@link TagSection} objects, determining what sections of tags an app has, as well as
     * what tags are associated with each section
     * @param data HTML which can be parsed to get tag information
     */
    getTags(data) { return null; }
    /**
     * (OPTIONAL METHOD) A function which should handle generating a request for determining whether or
     * not a manga has been updated since a specific reference time.
     * This method is different depending on the source. A current implementation for a source, as example,
     * is going through multiple pages of the 'latest' section, and determining whether or not there
     * are entries available before your supplied date.
     * @param ids The manga IDs which you are searching for updates on
     * @param time A {@link Date} marking the point in time you'd like to search up from.
     * Eg, A date of November 2020, when it is currently December 2020, should return all instances
     * of the image you are searching for, which has been updated in the last month
     * @param page A page number parameter may be used if your update scanning requires you to
     * traverse multiple pages.
     */
    filterUpdatedMangaRequest(ids, time, page) { return null; }
    /**
     * (OPTIONAL METHOD) A function which should handle parsing apart HTML returned from {@link Source.filterUpdatedMangaRequest}
     * and generate a list manga which has been updated within the timeframe specified in the request.
     * @param data HTML which can be parsed to determine whether or not a Manga has been updated or not
     * @param metadata Anything passed to the {@link Request} object in {@link Source.filterUpdatedMangaRequest}
     * with the key of metadata will be available to this method here in this parameter
     * @returns A list of mangaID which has been updated. Also, a nextPage parameter is required. This is a flag
     * which should be set to true, if you need to traverse to the next page of your search, in order to fully
     * determine whether or not you've gotten all of the updated manga or not. This will increment
     * the page number in the {@link Source.filterUpdatedMangaRequest} method and run it again with the new
     * parameter
     */
    filterUpdatedManga(data, metadata) { return null; }
    /**
     * (OPTIONAL METHOD) A function which should generate a {@link HomeSectionRequest} with the intention
     * of parsing apart a home page of a source, and grouping content into multiple categories.
     * This does not exist for all sources, but sections you would commonly see would be
     * 'Latest Manga', 'Hot Manga', 'Recommended Manga', etc.
     * @returns A list of {@link HomeSectionRequest} objects. A request for search section on the home page.
     * It is likely that your request object will be the same in all of them.
     */
    getHomePageSectionRequest() { return null; }
    /**
     * (OPTIONAL METHOD) A function which should handle parsing apart HTML returned from {@link Source.getHomePageSectionRequest}
     * and finish filling out the {@link HomeSection} objects.
     * Generally this simply should update the parameter obejcts with all of the correct contents, and
     * return the completed array
     * @param data The HTML which should be parsed into the {@link HomeSection} objects. There may only be one element in the array, that is okay
     * if only one section exists
     * @param section The list of HomeSection objects which are unfinished, and need filled out
     */
    getHomePageSections(data, section) { return null; }
    /**
     * (OPTIONAL METHOD) For many of the home page sections, there is an ability to view more of that selection
     * Calling this function should generate a {@link Request} targeting a new page of a given key
     * @param key The current page that is being viewed
     * @param page The page number which you are currently searching
     */
    getViewMoreRequest(key, page) { return null; }
    /**
     * (OPTIONAL METHOD) A function which should handle parsing apart a page
     * and generate different {@link MangaTile} objects which can be found on it
     * @param data HTML which should be parsed into a {@link MangaTile} object
     * @param key
     */
    getViewMoreItems(data, key) { return null; }
    /**
     * Returns the number of calls that can be done per second from the application
     * This is to avoid IP bans from many of the sources
     * Can be adjusted per source since different sites have different limits
     */
    getRateLimit() { return 2; }
    // <-----------        PROTECTED METHODS        -----------> //
    // Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
    convertTime(timeAgo) {
        var _a;
        let time;
        let trimmed = Number(((_a = /\d*/.exec(timeAgo)) !== null && _a !== void 0 ? _a : [])[0]);
        trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
        if (timeAgo.includes('minutes')) {
            time = new Date(Date.now() - trimmed * 60000);
        }
        else if (timeAgo.includes('hours')) {
            time = new Date(Date.now() - trimmed * 3600000);
        }
        else if (timeAgo.includes('days')) {
            time = new Date(Date.now() - trimmed * 86400000);
        }
        else if (timeAgo.includes('year') || timeAgo.includes('years')) {
            time = new Date(Date.now() - trimmed * 31556952000);
        }
        else {
            time = new Date(Date.now());
        }
        return time;
    }
}
exports.Source = Source;

},{}]},{},[3])(3)
});
