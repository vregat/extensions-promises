export interface RequestObject {
  metadata: any
  request: Request
}

interface Request {
  config: Config
  param?: string // parameters need to be formatted to be attached to url
  cookies: Cookie[] // cookies need to be formatted to be put into headers
  incognito?: boolean
}

interface Config {
  url: string
  method?: string // defaults to GET when no method is supplied
  headers: any
  data?: any
  timeout?: number
}

interface Cookie {
  name: string
  value: string
  domain?: string
  path?: string
  created?: Date
  expires?: Date
}

export function createCookie(name: string, value: string, domain?: string, path?: string, created?: Date, expires?: Date): Cookie {
  return {
    'name': name,
    'value': value,
    'domain': domain,
    'path': path,
    'created': created,
    'expires': expires
  }
}

export function createRequestObject(metadata: any, url: string, cookies?: Cookie[], param?: string,
                                    method?: string, data?: any, timeout?: any, headers?: any, 
                                    incognito: boolean = true): RequestObject {
  headers = (headers == undefined) ? {} : headers
  cookies = (cookies == undefined) ? [] : cookies
  let config: Config = {
    'url': url,
    'method': method,
    'headers': headers,
    'data': data,
    'timeout': timeout
  }
  let request = {
    'config': config,
    'param': param,
    'cookies': cookies,
    'incognito': incognito
  }
  return {
    'metadata': metadata,
    'request': request
  }
}