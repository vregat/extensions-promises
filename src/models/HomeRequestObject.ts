import { RequestObject } from "./RequestObject";
import { MangaTile } from "./MangaTile";

export interface HomeRequestObject {
  request: RequestObject
  sections: Section[]
}

interface Section {
  id: string
  title: string
  items: MangaTile[]
  view_more: boolean
}

export function createSection(id: string, title: string, items: MangaTile[], view_more: boolean = false) {
  return { 'id': id, 'title': title, 'items': items, 'view_more': view_more}
}

export function createHomeRequestObject(request: RequestObject, sections: Section[]): HomeRequestObject {
  return { request, sections }
}