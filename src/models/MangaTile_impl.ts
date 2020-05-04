import { MangaTile, IconText } from "./MangaTile"

const _global = global as any
_global.createMangaTile = function (id: string, title: IconText, image: string, subtitleText: IconText,
    primaryText: IconText, secondaryText: IconText, badge: number = 0): MangaTile {
    return {
        id,
        image,
        title,
        subtitleText,
        primaryText,
        secondaryText,
        badge
    }
}

_global.createIconText = function (text: string, icon?: string): IconText {
    return {
        text, icon
    }
}