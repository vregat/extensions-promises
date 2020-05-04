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
  icon?: string
}

declare global {
  function createMangaTile(id: string, image: string, title: IconText, subtitleText?: IconText,
    primaryText?: IconText, secondaryText?: IconText, badge?: number): MangaTile
  function createIconText(text: string, icon?: string): IconText
}
