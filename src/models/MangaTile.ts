export interface MangaTile {
  id: string
  title: IconText
  image: string
  subtitleText: IconText
  primaryText: IconText
  secondaryText: IconText
  badge: number
}

export interface IconText {
  text: string
  icon: string |undefined
}

declare global {
  function createMangaTile(id: string, image: string, title: IconText, subtitleText: IconText | undefined,
    primaryText: IconText | undefined, secondaryText: IconText | undefined, badge: number | undefined): MangaTile
  function createIconText(text: string, icon: string | undefined): IconText
}
