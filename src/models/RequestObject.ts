export interface RequestObject {
  metadata: any
  request: DataRequest
}

export interface DataRequest {
  url: string
  method: string | undefined // defaults to GET when no method is supplied
  headers: Record<string, string> | undefined
  data: any | undefined
  timeout: number | undefined
  param: string | undefined // parameters need to be formatted to be attached to url
  cookies: Cookie[] | undefined // cookies need to be formatted to be put into headers
  incognito: boolean | undefined
}

export interface Cookie {
  name: string
  value: string
  domain: string | undefined
  path: string | undefined
  created: Date | undefined
  expires: Date | undefined
}

declare global {
  function createRequestObject(
    metadata: any,
    url: string,
    cookies: Cookie[] | undefined,
    param: string | undefined,
    method: string | undefined,
    data: any | undefined,
    timeout: any | undefined,
    headers: Record<string, string> | undefined,
    incognito: boolean | undefined): RequestObject

  function createCookie(name: string, value: string, domain: string | undefined, path: string | undefined, created: Date | undefined, expires: Date | undefined): Cookie
}
