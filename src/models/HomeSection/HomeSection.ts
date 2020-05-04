import { Request } from '../RequestObject/RequestObject'
import { MangaTile } from '../MangaTile/MangaTile'

export interface HomeSectionRequest {
  request: Request
  sections: HomeSection[]
}

export interface HomeSection {
  id: string
  title: string
  items?: MangaTile[]
  view_more?: boolean
}

declare global {
  function createHomeSection(section: HomeSection): HomeSection
  function createHomeSectionRequest(homeRequestObject: HomeSectionRequest): HomeSectionRequest
}
