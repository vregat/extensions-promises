import { RequestObject } from "./RequestObject"
import { Section, HomeRequestObject } from "./HomeRequestObject"
import { MangaTile } from "./MangaTile"

const _global = global as any

_global.createSection = function (id: string, title: string, items: MangaTile[], view_more: boolean = false) {
    return { 'id': id, 'title': title, 'items': items, 'view_more': view_more }
}

_global.createHomeRequestObject = function (request: RequestObject, sections: Section[]): HomeRequestObject {
    return { request, sections }
}