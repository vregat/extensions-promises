import { MangaTile } from "./MangaTile"

const _global = global as any
_global.createMangaTile = function (id: string, titleText: string, image: string, subtitleText: string, primaryIcon: string,
    primaryText: string, secondaryIcon: string, secondaryText: string, badge: number = 0): MangaTile {
    return {
        id: id,
        title: {
            text: titleText
        },
        image: image,
        subtitleText: {
            text: subtitleText
        },
        primaryText: {
            icon: primaryIcon,
            text: primaryText
        },
        secondaryText: {
            icon: secondaryIcon,
            text: secondaryText
        },
        badge: badge
    }
}