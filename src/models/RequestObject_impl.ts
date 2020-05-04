import { RequestObject, Cookie, DataRequest } from './RequestObject'
export { }

const _global = global as any

_global.createCookie = function (name: string, value: string, domain: string | undefined, path: string | undefined, created: Date | undefined, expires: Date | undefined): Cookie {
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
    cookies: Cookie[] | undefined,
    param: string | undefined,
    method: string | undefined,
    data: any | undefined,
    timeout: any | undefined,
    headers: Record<string, string> | undefined,
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
