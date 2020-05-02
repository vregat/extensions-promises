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
  view_more: string
}