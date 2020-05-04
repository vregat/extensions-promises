export interface Tag {
    id: string
    label: string
}

export interface TagSection {
    id: string
    label: string
    tags: Tag[]
}

declare global {
    function createTag(tag: Tag): Tag
    function createTagSection(tagSection: TagSection): TagSection
}