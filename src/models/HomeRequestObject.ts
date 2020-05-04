import { RequestObject } from './RequestObject'
import { MangaTile } from './MangaTile'

export interface HomeRequestObject {
  request: RequestObject
  sections: Section[]
}

export interface Section {
  id: string
  title: string
  items: MangaTile[]
  view_more: boolean
}

declare global {
  function createSection(id: string, title: string, items: MangaTile[], view_more: boolean | undefined): Section
  function createHomeRequestObject(request: RequestObject, sections: Section[]): HomeRequestObject
}
