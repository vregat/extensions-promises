import Source from './Source'

class MangaPark extends Source {
  constructor() {
    super()
  }

  getMangaDetailsUrls(ids: string[]) {
    return {
      'manga': {
        'metadata': {
          'initialIds': ids
        },
        'url': 'https://mangapark.net/manga/'
      }
    }
  }

  getMangaDetails(data: any): any {
    data = data.data
    
  }

  filterUpdatedMangaUrls(ids: any, time: Date): any {

  }

  filterUpdatedManga(data: any, metadata: any) {

  }

  getChapterUrls(mangaId: string): any {

  }

  getChapters(mangaId: string, data: any): any {

  }

}

export default MangaPark