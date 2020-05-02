import { Source } from "./Source";
import { SearchRequest, createSearchRequest } from "../models/SearchRequest";
import { Manga, createManga } from "../models/Manga";
import { Chapter, createChapter } from "../models/Chapter";
import { ChapterDetails, createChapterDetails } from "../models/ChapterDetails";
import { RequestObject } from "../models/RequestObject";

export class Mangasee extends Source {
  allDemogrpahic: string[]
  constructor(cheerio: CheerioAPI) {
    super(cheerio)
    this.allDemogrpahic = ["Shounen", "Shoujo", "Seinen", "Josei"]
  }

  getMangaDetailsRequest(ids: string[]): RequestObject {
    throw new Error("Method not implemented.");
  }
  getMangaDetails(data: any, mangaId: string): Manga {
    throw new Error("Method not implemented.");
  }
  getChapterRequest(mangaId: string): RequestObject {
    throw new Error("Method not implemented.");
  }
  getChapters(data: any, mangaId: string): Chapter[] {
    throw new Error("Method not implemented.");
  }
  getChapterDetailsRequest(mangaId: string, chapId: string): RequestObject {
    let metadata = {'mangaId': mangaId, 'chapterId': chapId, 'nextPage': true, 'page': 1}
    throw new Error("Method not implemented.");
  }
  getChapterDetails(data: any, metadata: any): {'details': ChapterDetails, 'nextPage': boolean} {
    throw new Error("Method not implemented.");
  }
  filterUpdatedMangaRequest(ids: any, time: Date, page: number): RequestObject {
    throw new Error("Method not implemented.");
  }
  filterUpdatedManga(data: any, metadata: any): {'updatedMangaIds': string[], 'nextPage': boolean} {
    throw new Error("Method not implemented.");
  }
  getHomePageSectionRequest() {
    throw new Error("Method not implemented.");
  }
  getHomePageSections(key: any, data: any, sections: any) {
    throw new Error("Method not implemented.");
  }
  searchRequest(query: SearchRequest, page: number): RequestObject {
    throw new Error("Method not implemented.");
  }
  search(data: any) {
    throw new Error("Method not implemented.");
  }
}