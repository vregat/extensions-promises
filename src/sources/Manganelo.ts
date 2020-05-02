import { Source } from "./Source";
import { SearchRequest } from "../models/SearchRequest";
import { Manga } from "../models/Manga";

export class Manganelo extends Source {
  constructor(cheerio: CheerioAPI) {
    super(cheerio)
  }

  getMangaDetailsRequest(ids: string[]) {
    throw new Error("Method not implemented.");
  }

  getMangaDetails(data: any): Manga {
    throw new Error("Method not implemented.");
  }

  getChapterRequest(mangaId: string) {
    throw new Error("Method not implemented.");
  }

  getChapters(data: any, mangaId: string) {
    throw new Error("Method not implemented.");
  }

  getChapterDetailsRequest(mangaId: string, chapId: string) {
    throw new Error("Method not implemented.");
  }

  getChapterDetails(data: any, metadata: any) {
    throw new Error("Method not implemented.");
  }

  filterUpdatedMangaRequest(ids: any, time: Date, page: number) {
    throw new Error("Method not implemented.");
  }

  filterUpdatedManga(data: any, metadata: any) {
    throw new Error("Method not implemented.");
  }

  getHomePageSectionRequest() {
    throw new Error("Method not implemented.");
  }

  getHomePageSections(key: any, data: any, sections: any) {
    throw new Error("Method not implemented.");
  }

  searchRequest(query: SearchRequest, page: number) {
    throw new Error("Method not implemented.");
  }

  search(data: any) {
    throw new Error("Method not implemented.");
  }
}