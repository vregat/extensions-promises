export interface MangaTile {
  id: string
  title: IconText
  image: string
  subtitleText?: IconText
  primaryText?: IconText
  secondaryText?: IconText
  badge?: number
}

export interface IconText {
  text: string
  icon?: string
}

declare global {
  function createMangaTile(mangaTile: MangaTile): MangaTile
  function createIconText(iconText: IconText): IconText
}
