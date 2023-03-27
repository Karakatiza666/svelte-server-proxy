// import { URL } from 'url';
import type { RequestHandler } from "@sveltejs/kit/types"

export const makeRedirectEndpoint = <T extends {
   'params': string,
}>(targetDomain: string, headers?: Record<string, string>): RequestHandler<T> => async ({request, fetch, params}) => {
   // Construct the target URL using the target domain and route
   // console.log('makeRedirectEndpoint', targetDomain, '/' + params.params)

   // `targetDomain + '/' + ` allows to use enpoints with sub route, e.g.:
   // `https://cardano-mainnet.blockfrost.io/api/v0`, not just `https://cardano-mainnet.blockfrost.io`
   const targetUrl = new URL(targetDomain + '/' + params.params, targetDomain)

   // // Set the query string from the original request
   // targetUrl.search = request.url.search;
  
   // // Set the body and headers from the original request
   // const options: RequestInit = {
   //   method: request.method,
   //   body: request.body,
   //   headers: request.headers,
   // };
  
   // Send the request to the target domain and get the response
   // console.log('proxied', proxied, request.headers)
   const excludedHeaders = ([k, ]: [string, string]) => ![
      // 'accept',
      // 'accept-encoding',
      // 'accept-language',
      // 'cache-control' ,
      'connection',
      // 'cookie',
      // 'host',
      // 'referer',
      // 'sec-fetch-dest',
      // 'sec-fetch-mode',
      // 'sec-fetch-site', 
      // 'sec-gpc',
      // 'user-agent',
   ].includes(k)
   request.headers.set('host', targetUrl.host)
   for (const [k, v] of Object.entries(headers ?? {})) {
      request.headers.set(k, v)
   }
   const hdrs = Array.from(request.headers.entries()).filter(excludedHeaders)
   const response = await fetch(targetUrl, {
      method: request.method,
      // body: request.body ? (b => new ReadableStream({
      //    start(controller) {
      //       // Forward data from request body to target URL
      //       b.pipeTo(new WritableStream({
      //          write(chunk) {
      //             controller.enqueue(chunk);
      //          },
      //          close() {
      //             controller.close();
      //          }
      //       }));
      //    }
      // }))(request.body) : null,
      body: request.body,
      ...{duplex: request.body ? 'half' : undefined},
      headers: hdrs,
      cache: request.cache}
   )

   return new Response(response.body, {...response})
}
