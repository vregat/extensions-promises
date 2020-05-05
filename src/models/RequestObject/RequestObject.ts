export interface Request {
  url: string
  method: string
  metadata?: any
  headers?: Record<string, string>
  data?: any
  timeout?: number
  param?: string // parameters need to be formatted to be attached to url
  cookies?: Cookie[] // cookies need to be formatted to be put into headers
  incognito?: boolean
}

export interface Cookie {
  name: string
  value: string
  domain?: string
  path?: string
  created?: Date
  expires?: Date
}

declare global {
  function createRequestObject(requestObject: Request): Request
  function createCookie(cookie: Cookie): Cookie
}
