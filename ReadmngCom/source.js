(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Source = void 0;
class Source {
    constructor(cheerio) {
        // <-----------        OPTIONAL METHODS        -----------> //
        /**
         * Manages the ratelimits and the number of requests that can be done per second
         * This is also used to fetch pages when a chapter is downloading
         */
        this.requestManager = createRequestManager({
            requestsPerSecond: 2.5,
            requestTimeout: 5000
        });
        this.cheerio = cheerio;
    }
    /**
     * (OPTIONAL METHOD) This function is called when ANY request is made by the Paperback Application out to the internet.
     * By modifying the parameter and returning it, the user can inject any additional headers, cookies, or anything else
     * a source may need to load correctly.
     * The most common use of this function is to add headers to image requests, since you cannot directly access these requests through
     * the source implementation itself.
     *
     * NOTE: This does **NOT** influence any requests defined in the source implementation. This function will only influence requests
     * which happen behind the scenes and are not defined in your source.
     */
    globalRequestHeaders() { return {}; }
    globalRequestCookies() { return []; }
    /**
     * (OPTIONAL METHOD) Given a manga ID, return a URL which Safari can open in a browser to display.
     * @param mangaId
     */
    getMangaShareUrl(mangaId) { return null; }
    /**
     * If a source is secured by Cloudflare, this method should be filled out.
     * By returning a request to the website, this source will attempt to create a session
     * so that the source can load correctly.
     * Usually the {@link Request} url can simply be the base URL to the source.
     */
    getCloudflareBypassRequest() { return null; }
    /**
     * (OPTIONAL METHOD) A function which communicates with a given source, and returns a list of all possible tags which the source supports.
     * These tags are generic and depend on the source. They could be genres such as 'Isekai, Action, Drama', or they can be
     * listings such as 'Completed, Ongoing'
     * These tags must be tags which can be used in the {@link searchRequest} function to augment the searching capability of the application
     */
    getTags() { return Promise.resolve(null); }
    /**
     * (OPTIONAL METHOD) A function which should scan through the latest updates section of a website, and report back with a list of IDs which have been
     * updated BEFORE the supplied timeframe.
     * This function may have to scan through multiple pages in order to discover the full list of updated manga.
     * Because of this, each batch of IDs should be returned with the mangaUpdatesFoundCallback. The IDs which have been reported for
     * one page, should not be reported again on another page, unless the relevent ID has been detected again. You do not want to persist
     * this internal list between {@link Request} calls
     * @param mangaUpdatesFoundCallback A callback which is used to report a list of manga IDs back to the API
     * @param time This function should find all manga which has been updated between the current time, and this parameter's reported time.
     *             After this time has been passed, the system should stop parsing and return
     */
    filterUpdatedManga(mangaUpdatesFoundCallback, time, ids) { return Promise.resolve(); }
    /**
     * (OPTIONAL METHOD) A function which should readonly allf the available homepage sections for a given source, and return a {@link HomeSection} object.
     * The sectionCallback is to be used for each given section on the website. This may include a 'Latest Updates' section, or a 'Hot Manga' section.
     * It is recommended that before anything else in your source, you first use this sectionCallback and send it {@link HomeSection} objects
     * which are blank, and have not had any requests done on them just yet. This way, you provide the App with the sections to render on screen,
     * which then will be populated with each additional sectionCallback method called. This is optional, but recommended.
     * @param sectionCallback A callback which is run for each independant HomeSection.
     */
    getHomePageSections(sectionCallback) { return Promise.resolve(); }
    /**
     * (OPTIONAL METHOD) This function will take a given homepageSectionId and metadata value, and with this information, should return
     * all of the manga tiles supplied for the given state of parameters. Most commonly, the metadata value will contain some sort of page information,
     * and this request will target the given page. (Incrementing the page in the response so that the next call will return relevent data)
     * @param homepageSectionId The given ID to the homepage defined in {@link getHomePageSections} which this method is to readonly moreata about
     * @param metadata This is a metadata parameter which is filled our in the {@link getHomePageSections}'s return
     * function. Afterwards, if the metadata value returned in the {@link PagedResults} has been modified, the modified version
     * will be supplied to this function instead of the origional {@link getHomePageSections}'s version.
     * This is useful for keeping track of which page a user is on, pagnating to other pages as ViewMore is called multiple times.
     */
    getViewMoreItems(homepageSectionId, metadata) { return Promise.resolve(null); }
    /**
     * (OPTIONAL METHOD) This function is to return the entire library of a manga website, page by page.
     * If there is an additional page which needs to be called, the {@link PagedResults} value should have it's metadata filled out
     * with information needed to continue pulling information from this website.
     * Note that if the metadata value of {@link PagedResults} is undefined, this method will not continue to run when the user
     * attempts to readonly morenformation
     * @param metadata Identifying information as to what the source needs to call in order to readonly theext batch of data
     * of the directory. Usually this is a page counter.
     */
    getWebsiteMangaDirectory(metadata) { return Promise.resolve(null); }
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

},{}],3:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Source"), exports);

},{"./Source":2}],4:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./base"), exports);
__exportStar(require("./models"), exports);
__exportStar(require("./APIWrapper"), exports);

},{"./APIWrapper":1,"./base":3,"./models":22}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],6:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],7:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],8:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageCode = void 0;
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

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaStatus = void 0;
var MangaStatus;
(function (MangaStatus) {
    MangaStatus[MangaStatus["ONGOING"] = 1] = "ONGOING";
    MangaStatus[MangaStatus["COMPLETED"] = 0] = "COMPLETED";
})(MangaStatus = exports.MangaStatus || (exports.MangaStatus = {}));

},{}],11:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],12:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],13:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],14:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],15:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],16:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],17:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],18:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],19:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagType = void 0;
/**
 * An enumerator which {@link SourceTags} uses to define the color of the tag rendered on the website.
 * Five types are available: blue, green, grey, yellow and red, the default one is blue.
 * Common colors are red for (Broken), yellow for (+18), grey for (Country-Proof)
 */
var TagType;
(function (TagType) {
    TagType["BLUE"] = "default";
    TagType["GREEN"] = "success";
    TagType["GREY"] = "info";
    TagType["YELLOW"] = "warning";
    TagType["RED"] = "danger";
})(TagType = exports.TagType || (exports.TagType = {}));

},{}],21:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"dup":5}],22:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Chapter"), exports);
__exportStar(require("./ChapterDetails"), exports);
__exportStar(require("./HomeSection"), exports);
__exportStar(require("./Manga"), exports);
__exportStar(require("./MangaTile"), exports);
__exportStar(require("./RequestObject"), exports);
__exportStar(require("./SearchRequest"), exports);
__exportStar(require("./TagSection"), exports);
__exportStar(require("./SourceTag"), exports);
__exportStar(require("./Languages"), exports);
__exportStar(require("./Constants"), exports);
__exportStar(require("./MangaUpdate"), exports);
__exportStar(require("./PagedResults"), exports);
__exportStar(require("./ResponseObject"), exports);
__exportStar(require("./RequestManager"), exports);
__exportStar(require("./RequestHeaders"), exports);
__exportStar(require("./SourceInfo"), exports);

},{"./Chapter":5,"./ChapterDetails":6,"./Constants":7,"./HomeSection":8,"./Languages":9,"./Manga":10,"./MangaTile":11,"./MangaUpdate":12,"./PagedResults":13,"./RequestHeaders":14,"./RequestManager":15,"./RequestObject":16,"./ResponseObject":17,"./SearchRequest":18,"./SourceInfo":19,"./SourceTag":20,"./TagSection":21}],23:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadmngCom = exports.ReadmngComInfo = void 0;
const paperback_extensions_common_1 = require("paperback-extensions-common");
const READMNGCOM_DOMAIN = 'https://www.readmng.com';
exports.ReadmngComInfo = {
    version: '0.0.9',
    name: 'Readmng.com',
    description: 'Extension that pulls mangas from readmng.com',
    author: 'Vregat',
    authorWebsite: 'https://github.com/vregat/extensions-promises',
    icon: 'logo.png',
    hentaiSource: false,
    websiteBaseURL: READMNGCOM_DOMAIN
};
class ReadmngCom extends paperback_extensions_common_1.Source {
    getMangaDetails(mangaId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            let request = createRequestObject({
                url: `${READMNGCOM_DOMAIN}/${mangaId}`,
                method: 'GET'
            });
            let data = yield this.requestManager.schedule(request, 1);
            let $ = this.cheerio.load(data);
            let panel = $('.panel-body');
            let title = (_a = $('.img-responsive', panel).attr('alt')) !== null && _a !== void 0 ? _a : '';
            let image = (_b = $('.img-responsive', panel).attr('src')) !== null && _b !== void 0 ? _b : '';
            let titles = [title].concat($('.dl-horizontal > dd:nth-child(2)', panel).text().split(/,|;/));
            let status = $('.dl-horizontal > dd:nth-child(4)', panel).text().toString() == 'Completed' ? paperback_extensions_common_1.MangaStatus.COMPLETED : paperback_extensions_common_1.MangaStatus.ONGOING;
            let views = +$('.dl-horizontal > dd:nth-child(10)', panel).text().split(',').join('');
            let genres = [];
            for (let tagElement of $('.dl-horizontal > dd:nth-child(6)', panel).find('a').toArray()) {
                let id = $(tagElement).attr('href').replace(`${READMNGCOM_DOMAIN}/category/`, '');
                let text = $(tagElement).contents().text();
                genres.push(createTag({ id: id, label: text }));
            }
            let genresSection = createTagSection({ id: 'genre', label: 'Genre', tags: genres });
            let description = $('.movie-detail').text().trim();
            let castList = $('ul.cast-list');
            let authorElement = $('li:contains("Author")', castList);
            let author = $("li > a", authorElement).text().trim();
            let artistElement = $('li:contains("Artist")', castList);
            let artist = $("li > a", artistElement).text().trim();
            let rating = +$('div.progress-bar-success').attr('title').replace('%', '');
            return createManga({
                id: mangaId,
                titles: titles,
                image: image,
                rating: rating,
                status: status,
                views: views,
                desc: description,
                tags: [genresSection],
                author: author,
                artist: artist
            });
        });
    }
    getChapters(mangaId) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            let request = createRequestObject({
                url: `${READMNGCOM_DOMAIN}/${mangaId}`,
                method: 'GET'
            });
            let data = yield this.requestManager.schedule(request, 1);
            let $ = this.cheerio.load(data);
            let allChapters = $('ul.chp_lst');
            let chapters = [];
            let chNum = $('ul.chp_lst > li').toArray().length - 1;
            for (let chapter of $('li', allChapters).toArray()) {
                let id = (_b = (_a = $('a', chapter).attr('href')) === null || _a === void 0 ? void 0 : _a.split('/').pop()) !== null && _b !== void 0 ? _b : '';
                let name = (_c = $('a > .val', chapter).text().trim()) !== null && _c !== void 0 ? _c : '';
                let time = (_d = $('a > .dte', chapter).text().trim()) !== null && _d !== void 0 ? _d : '';
                let timeValue = +time.split(' ')[0];
                let parsedDate = new Date(Date.now());
                if (time.includes('Second')) {
                    parsedDate.setSeconds(parsedDate.getSeconds() - timeValue);
                }
                else if (time.includes('Minute')) {
                    parsedDate.setMinutes(parsedDate.getMinutes() - timeValue);
                }
                else if (time.includes('Hour')) {
                    parsedDate.setHours(parsedDate.getHours() - timeValue);
                }
                else if (time.includes('Day')) {
                    parsedDate.setDate(parsedDate.getDate() - timeValue);
                }
                else if (time.includes('Week')) {
                    parsedDate.setDate(parsedDate.getDate() - (timeValue * 7));
                }
                else if (time.includes('Month')) {
                    parsedDate.setMonth(parsedDate.getMonth() - timeValue);
                }
                else if (time.includes('Year')) {
                    parsedDate.setFullYear(parsedDate.getFullYear() - timeValue);
                }
                chapters.push(createChapter({
                    id: id,
                    mangaId: mangaId,
                    name: name,
                    langCode: paperback_extensions_common_1.LanguageCode.ENGLISH,
                    chapNum: chNum,
                    time: parsedDate
                }));
                chNum--;
            }
            return chapters;
        });
    }
    getChapterDetails(mangaId, chapterId) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let request = createRequestObject({
                url: `${READMNGCOM_DOMAIN}/${mangaId}/${chapterId}/all-pages`,
                method: 'GET'
            });
            let data = yield this.requestManager.schedule(request, 1);
            let $ = this.cheerio.load(data);
            let pages = [];
            for (const page of $('.page_chapter > .img-responsive').toArray()) {
                pages.push((_a = $(page).attr('src')) !== null && _a !== void 0 ? _a : '');
            }
            let chapterDetails = createChapterDetails({
                id: chapterId,
                mangaId: mangaId,
                pages: pages,
                longStrip: false
            });
            return chapterDetails;
        });
    }
    searchRequest(query, metadata) {
        var _a, _b, _c, _d, _e, _f, _g;
        return __awaiter(this, void 0, void 0, function* () {
            let title = ((_a = query.title) !== null && _a !== void 0 ? _a : '').split(' ').join('+');
            let author = ((_b = query.author) !== null && _b !== void 0 ? _b : '').split(' ').join('+');
            let artist = ((_c = query.artist) !== null && _c !== void 0 ? _c : '').split(' ').join('+');
            let status = '';
            switch (query.status) {
                case 0:
                    status = 'completed';
                    break;
                case 1:
                    status = 'ongoing';
                    break;
                default:
                    status = 'both';
                    break;
            }
            let request = createRequestObject({
                url: `${READMNGCOM_DOMAIN}/service/advanced_search`,
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "X-Requested-With": "XMLHttpRequest"
                },
                data: {
                    'type': 'all',
                    'manga-name': title,
                    'author-name': author,
                    'artist-name': artist,
                    'status': status
                }
            });
            let data = yield this.requestManager.schedule(request, 1);
            let $ = this.cheerio.load(data);
            let manga = [];
            for (let item of $('.style-list > div.box').toArray()) {
                let id = (_e = (_d = $('.title a', item).attr('href')) === null || _d === void 0 ? void 0 : _d.replace(`${READMNGCOM_DOMAIN}/`, '')) !== null && _e !== void 0 ? _e : '';
                let title = (_f = $('.title a', item).attr('title')) !== null && _f !== void 0 ? _f : '';
                let img = (_g = $('.body a > img', item).attr('src')) !== null && _g !== void 0 ? _g : '';
                manga.push(createMangaTile({
                    id: id,
                    title: createIconText({ text: title }),
                    image: img
                }));
            }
            return createPagedResults({
                results: manga
            });
        });
    }
    getMangaShareUrl(mangaId) {
        return `${READMNGCOM_DOMAIN}/${mangaId}`;
    }
    filterUpdatedManga(mangaUpdatesFoundCallback, time, ids) {
        return __awaiter(this, void 0, void 0, function* () {
            let loadNextPage = true;
            let currentPage = 1;
            time.setHours(0, 0, 0, 0); //website does not use hours/minutes/seconds
            while (loadNextPage) {
                let request = createRequestObject({
                    url: `${READMNGCOM_DOMAIN}/latest-releases/${currentPage}`,
                    method: 'GET'
                });
                let data = yield this.requestManager.schedule(request, 1);
                let $ = this.cheerio.load(data);
                let passedTime = false;
                let updatedManga = $('.manga_updates');
                let foundIds = [];
                for (let manga of $('dl', updatedManga).toArray()) {
                    let item = $('dt', manga);
                    let mangaInfo = $('a.manga_info', item).attr('href').replace(`${READMNGCOM_DOMAIN}/`, '');
                    let updatedDate = $('span.time', item).contents().text().split('/');
                    let parsedDate = new Date(+updatedDate[2], (+updatedDate[1]) - 1, +updatedDate[0]);
                    let numChapters = $('dd', manga).toArray().length;
                    passedTime = parsedDate < time;
                    if (!passedTime) {
                        if (ids.includes(mangaInfo)) {
                            for (let c = 0; c < numChapters; c++) {
                                foundIds.push(mangaInfo);
                            }
                        }
                    }
                    else {
                        break;
                    }
                }
                if (!passedTime) {
                    currentPage++;
                }
                else {
                    loadNextPage = false;
                }
                mangaUpdatesFoundCallback(createMangaUpdates({
                    ids: foundIds
                }));
            }
        });
    }
    getHomePageSections(sectionCallback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.parseLatestReleases(sectionCallback);
            this.parseHotManga(sectionCallback);
        });
    }
    parseLatestReleases(sectionCallback) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            let latestSection = createHomeSection({
                id: 'latest_releases',
                title: 'LATEST RELEASES'
            });
            sectionCallback(latestSection);
            let latestRequest = createRequestObject({ url: `${READMNGCOM_DOMAIN}/latest-releases`, method: 'GET' });
            let data = yield this.requestManager.schedule(latestRequest, 1);
            let result = [];
            let $ = this.cheerio.load(data);
            let pages = $('div.content-list div.style-thumbnail');
            for (let item of $('li', pages).toArray()) {
                let id = (_b = (_a = $('.thumbnail', item).attr('href')) === null || _a === void 0 ? void 0 : _a.replace(`${READMNGCOM_DOMAIN}/`, '')) !== null && _b !== void 0 ? _b : '';
                let img = (_c = $('.thumbnail img', item).attr('src')) !== null && _c !== void 0 ? _c : '';
                let title = (_e = (_d = $('.thumbnail', item).attr('title')) === null || _d === void 0 ? void 0 : _d.replace(`${READMNGCOM_DOMAIN}/`, '')) !== null && _e !== void 0 ? _e : '';
                result.push(createMangaTile({
                    id: id,
                    image: img,
                    title: createIconText({ text: title })
                }));
            }
            latestSection.items = result;
            sectionCallback(latestSection);
        });
    }
    parseHotManga(sectionCallback) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function* () {
            let hotSection = createHomeSection({
                id: 'hot_manga',
                title: 'HOT MANGA'
            });
            sectionCallback(hotSection);
            let hotRequest = createRequestObject({ url: `${READMNGCOM_DOMAIN}/hot-manga`, method: 'GET' });
            let data = yield this.requestManager.schedule(hotRequest, 1);
            let result = [];
            let $ = this.cheerio.load(data);
            let pages = $('div.style-list');
            for (let item of $('div.box', pages).toArray()) {
                let id = (_b = (_a = $('.body > .left > a', item).attr('href')) === null || _a === void 0 ? void 0 : _a.replace(`${READMNGCOM_DOMAIN}/`, '')) !== null && _b !== void 0 ? _b : '';
                let img = (_c = $('.body > .left img', item).attr('src')) !== null && _c !== void 0 ? _c : '';
                let title = (_e = (_d = $('.body > .left > a', item).attr('title')) === null || _d === void 0 ? void 0 : _d.replace(`${READMNGCOM_DOMAIN}/`, '')) !== null && _e !== void 0 ? _e : '';
                result.push(createMangaTile({
                    id: id,
                    image: img,
                    title: createIconText({ text: title })
                }));
            }
            hotSection.items = result;
            sectionCallback(hotSection);
        });
    }
}
exports.ReadmngCom = ReadmngCom;

},{"paperback-extensions-common":4}]},{},[23])(23)
});
