export interface MangaTile {
  id: string
  title: IconText
  image: string
  subtitleText: IconText
  primaryText: IconText
  secondaryText: IconText
  badge: number
}

interface IconText {
  icon: string
  text: string
}

declare global {
  function createMangaTile(id: string, titleText: string, image: string, subtitleText: string, primaryIcon: string,
    primaryText: string, secondaryIcon: string, secondaryText: string, badge?: number): MangaTile
}
