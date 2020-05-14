(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Source_1 = require("../Source");
class MangaDex extends Source_1.Source {
    constructor(cheerio) {
        super(cheerio);
    }
    get version() { return '1.0.8'; }
    get name() { return 'MangaDex'; }
    get icon() { return 'icon.png'; }
    get author() { return 'Faizan Durrani'; }
    get authorWebsite() { return 'https://github.com/FaizanDurrani'; }
    get description() { return 'Extension that pulls manga from MangaDex, includes Advanced Search and Updated manga fetching'; }
    get hentaiSource() { return false; }
    getMangaDetailsRequest(ids) {
        return [createRequestObject({
                metadata: { ids },
                url: CACHE_MANGA,
                method: 'POST',
                headers: {
                    "content-type": "application/json"
                },
                data: JSON.stringify({
                    id: ids.map(x => parseInt(x))
                })
            })];
    }
    getMangaDetails(data, metadata) {
        let result = JSON.parse(data);
        let mangas = [];
        for (let mangaDetails of result["result"]) {
            mangas.push(createManga({
                id: mangaDetails["id"].toString(),
                titles: mangaDetails["titles"],
                image: mangaDetails["image"],
                rating: mangaDetails["rating"],
                status: mangaDetails["status"],
                langFlag: mangaDetails["langFlag"],
                langName: mangaDetails["langName"],
                artist: mangaDetails["artist"],
                author: mangaDetails["author"],
                avgRating: mangaDetails["avgRating"],
                covers: mangaDetails["covers"],
                desc: mangaDetails["description"],
                follows: mangaDetails["follows"],
                tags: [
                    createTagSection({
                        id: "content",
                        label: "Content",
                        tags: mangaDetails["content"].map((x) => createTag({ id: x["id"].toString(), label: x["value"] }))
                    }),
                    createTagSection({
                        id: "demographic",
                        label: "Demographic",
                        tags: mangaDetails["demographic"].map((x) => createTag({ id: x["id"].toString(), label: x["value"] }))
                    }),
                    createTagSection({
                        id: "format",
                        label: "Format",
                        tags: mangaDetails["format"].map((x) => createTag({ id: x["id"].toString(), label: x["value"] }))
                    }),
                    createTagSection({
                        id: "genre",
                        label: "Genre",
                        tags: mangaDetails["genre"].map((x) => createTag({ id: x["id"].toString(), label: x["value"] }))
                    }),
                    createTagSection({
                        id: "theme",
                        label: "Theme",
                        tags: mangaDetails["theme"].map((x) => createTag({ id: x["id"].toString(), label: x["value"] }))
                    })
                ],
                users: mangaDetails["users"],
                views: mangaDetails["views"],
                hentai: mangaDetails["hentai"],
                relatedIds: mangaDetails["relatedIds"],
                lastUpdate: mangaDetails["lastUpdate"]
            }));
        }
        return mangas;
    }
    getChaptersRequest(mangaId) {
        let metadata = { mangaId };
        return createRequestObject({
            metadata,
            url: `${MD_MANGA_API}/${mangaId}`,
            method: "GET"
        });
    }
    getChapters(data, metadata) {
        let chapters = JSON.parse(data).chapter;
        console.log(data);
        return Object.keys(chapters).map(id => {
            const chapter = chapters[id];
            return createChapter({
                id: id,
                chapNum: parseFloat(chapter.chapter),
                langCode: chapter.lang_code,
                volume: parseFloat(chapter.volume),
                mangaId: metadata.mangaId,
                group: chapter.group_name,
                name: chapter.title,
                time: new Date(chapter.timestamp)
            });
        });
    }
    getChapterDetailsRequest(mangaId, chapId) {
        return createRequestObject({
            url: `${MD_CHAPTER_API}/${chapId}`,
            method: 'GET',
            incognito: true
        });
    }
    getChapterDetails(data, metadata) {
        let chapterDetails = JSON.parse(data);
        return createChapterDetails({
            id: chapterDetails['id'].toString(),
            longStrip: parseInt(chapterDetails['long_strip']) == 1,
            mangaId: chapterDetails['manga_id'].toString(),
            pages: chapterDetails['page_array'].map((x) => `${chapterDetails['server']}${chapterDetails['hash']}/${x}`)
        });
    }
    filterUpdatedMangaRequest(ids, time, page) {
        return null;
        // let metadata = { 'ids': ids, 'referenceTime': time }
        // let cookies = [
        //   createCookie({
        //     name: 'mangadex_title_mode',
        //     value: '2'
        //   })
        // ]
        // return createRequestObject(metadata, 'https://mangadex.org/titles/0/', cookies, page.toString(), undefined, undefined, undefined, undefined, true)
    }
    filterUpdatedManga(data, metadata) {
        var _a, _b;
        let $ = this.cheerio.load(data);
        let returnObject = {
            'updatedMangaIds': [],
            'nextPage': true
        };
        for (let elem of $('.manga-entry').toArray()) {
            let id = elem.attribs['data-id'];
            if (new Date((_b = (_a = $(elem).find('time').attr('datetime')) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : "") > metadata.referenceTime) {
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
        console.log(JSON.stringify(this));
        let request1 = createRequestObject({
            url: 'https://mangadex.org',
            method: "GET"
        });
        let request2 = createRequestObject({
            url: 'https://mangadex.org/updates',
            method: 'GET'
        });
        let section1 = createHomeSection({ id: 'featured_titles', title: 'FEATURED TITLES' });
        let section2 = createHomeSection({ id: 'new_titles', title: 'NEW TITLES' });
        let section3 = createHomeSection({ id: 'recently_updated', title: 'RECENTLY UPDATED TITLES' });
        return [
            createHomeSectionRequest({
                request: request1,
                sections: [section1, section2]
            }),
            createHomeSectionRequest({
                request: request2,
                sections: [section3]
            })
        ];
    }
    getHomePageSections(data, sections) {
        console.log(JSON.stringify(this));
        let $ = this.cheerio.load(data);
        return sections.map(section => {
            switch (section.id) {
                case 'featured_titles':
                    section.items = this.parseFeaturedMangaTiles($);
                    break;
                case 'new_titles':
                    section.items = this.parseNewMangaSectionTiles($);
                    break;
                case 'recently_updated':
                    section.items = this.parseRecentlyUpdatedMangaSectionTiles($);
                    break;
            }
            return section;
        });
    }
    parseFeaturedMangaTiles($) {
        let featuredManga = [];
        $("#hled_titles_owl_carousel .large_logo").each(function (i, elem) {
            var _a, _b, _c;
            let title = $(elem);
            let img = title.find("img").first();
            let links = title.find("a");
            let idStr = links.first().attr("href");
            let id = (_a = idStr.match(/(\d+)(?=\/)/)) !== null && _a !== void 0 ? _a : "-1";
            let caption = title.find(".car-caption p:nth-child(2)");
            let bookmarks = caption.find("span[title=Follows]").text();
            let rating = caption.find("span[title=Rating]").text();
            featuredManga.push(createMangaTile({
                id: id[0],
                image: (_b = img.attr("data-src")) !== null && _b !== void 0 ? _b : "",
                title: createIconText({ text: (_c = img.attr("title")) !== null && _c !== void 0 ? _c : "" }),
                primaryText: createIconText({ text: bookmarks, icon: 'bookmark.fill' }),
                secondaryText: createIconText({ text: rating, icon: 'star.fill' })
            }));
        });
        return featuredManga;
    }
    parseNewMangaSectionTiles($) {
        let newManga = [];
        $("#new_titles_owl_carousel .large_logo").each(function (i, elem) {
            var _a, _b, _c, _d;
            let title = $(elem);
            let img = title.find("img").first();
            let links = title.find("a");
            let idStr = links.first().attr("href");
            let id = idStr.match(/(\d+)(?=\/)/);
            let caption = title.find(".car-caption p:nth-child(2)");
            let obj = { name: caption.find("a").text(), group: "", time: Date.parse((_a = caption.find("span").attr("title")) !== null && _a !== void 0 ? _a : " "), langCode: "" };
            let updateTime = (Date.parse((_b = caption.find("span").attr("title")) !== null && _b !== void 0 ? _b : " ")).toString();
            newManga.push(createMangaTile({
                id: id[0],
                image: (_c = img.attr("data-src")) !== null && _c !== void 0 ? _c : " ",
                title: createIconText({ text: (_d = img.attr("title")) !== null && _d !== void 0 ? _d : " " }),
                subtitleText: createIconText({ text: caption.find("a").text() }),
                secondaryText: createIconText({ text: updateTime, icon: 'clock.fill' })
            }));
        });
        return newManga;
    }
    parseRecentlyUpdatedMangaSectionTiles($) {
        var _a, _b, _c, _d, _e;
        let updates = [];
        let elem = $('tr', 'tbody').toArray();
        let i = 0;
        while (i < elem.length) {
            let hasImg = false;
            let idStr = (_a = $('a.manga_title', elem[i]).attr('href')) !== null && _a !== void 0 ? _a : '';
            let id = (_c = ((_b = idStr.match(/(\d+)(?=\/)/)) !== null && _b !== void 0 ? _b : '')[0]) !== null && _c !== void 0 ? _c : '';
            let title = (_d = $('a.manga_title', elem[i]).text()) !== null && _d !== void 0 ? _d : '';
            let image = (_e = (MD_DOMAIN + $('img', elem[i]).attr('src'))) !== null && _e !== void 0 ? _e : '';
            // in this case: badge will be number of updates
            // that the manga has received within last week
            let badge = 0;
            let pIcon = 'eye.fill';
            let sIcon = 'clock.fill';
            let subTitle = '';
            let pText = '';
            let sText = '';
            let first = true;
            i++;
            while (!hasImg && i < elem.length) {
                // for the manga tile, we only care about the first/latest entry
                if (first && !hasImg) {
                    subTitle = $('a', elem[i]).first().text();
                    pText = $('.text-center.text-info', elem[i]).text();
                    sText = $('time', elem[i]).text().replace('ago', '').trim();
                    first = false;
                }
                badge++;
                i++;
                hasImg = $(elem[i]).find('img').length > 0;
            }
            updates.push(createMangaTile({
                id,
                image,
                title: createIconText({ text: title }),
                subtitleText: createIconText({ text: subTitle }),
                primaryText: createIconText({ text: pText, icon: pIcon }),
                secondaryText: createIconText({ text: sText, icon: sIcon }),
                badge
            }));
        }
        return updates;
    }
    searchRequest(query, page) {
        return createRequestObject({
            url: CACHE_SEARCH,
            method: "POST",
            data: {
                title: query.title
            },
            headers: {
                "content-type": "application/json"
            }
        });
    }
    search(data, metadata) {
        let mangas = this.getMangaDetails(data, {});
        return mangas.map(manga => {
            var _a;
            return createMangaTile({
                id: manga.id,
                image: manga.image,
                title: createIconText({
                    text: (_a = manga.titles[0]) !== null && _a !== void 0 ? _a : "UNKNOWN"
                })
            });
        });
    }
}
exports.MangaDex = MangaDex;

},{"../Source":2}],2:[function(require,module,exports){
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

},{}]},{},[1])(1)
});
