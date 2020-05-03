import { RequestObject, Cookie, DataRequest } from './RequestObject'
export { }

const _global = global as any

_global.createCookie = function (name: string, value: string, domain?: string, path?: string, created?: Date, expires?: Date): Cookie {
    return {
        name: name,
        value: value,
        domain: domain,
        path: path,
        created: created,
        expires: expires
    }
}

_global.createRequestObject = function (
    metadata: any,
    url: string,
    cookies?: Cookie[],
    param?: string,
    method?: string,
    data?: any,
    timeout?: any,
    headers?: Record<string, string>,
    incognito: boolean = true): RequestObject {

    headers = (headers == undefined) ? {} : headers
    cookies = (cookies == undefined) ? [] : cookies

    let request: DataRequest = {
        url: url,
        method: method,
        headers: headers,
        data: data,
        timeout: timeout,
        param: param,
        cookies: cookies,
        incognito: incognito
    }

    return {
        metadata,
        request
    }
}
