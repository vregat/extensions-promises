export interface RequestObject {
  metadata: any
  request: DataRequest
}

export interface DataRequest {
  url: string
  method?: string // defaults to GET when no method is supplied
  headers?: Record<string, string>
  data?: any
  timeout?: number
  param?: string // parameters need to be formatted to be attached to url
  cookies: Cookie[] // cookies need to be formatted to be put into headers
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
  function createRequestObject(
    metadata: any,
    url: string,
    cookies?: Cookie[],
    param?: string,
    method?: string,
    data?: any,
    timeout?: any,
    headers?: Record<string, string>,
    incognito?: boolean | boolean): RequestObject

  function createCookie(name: string, value: string, domain?: string, path?: string, created?: Date, expires?: Date): Cookie
}
