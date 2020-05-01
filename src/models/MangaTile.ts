export function createMangaTiles(id: string, titleText: string, image: string, subtitleText: string, primaryIcon: string, 
                                  primaryText: string, secondaryIcon: string, secondaryText: string, badge: number = 0) {
  return {
    'id': id,
    'title': {
      'text': titleText
    },
    'image': image,
    'subtitleText': {
      'text': subtitleText
    },
    'primaryText': {
      'icon': primaryIcon,
      'text': primaryText
    },
    'secondaryText': {
      'icon': secondaryIcon,
      'text': secondaryText
    },
    'badge': badge
  }
}