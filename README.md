# jungle-gateway-squidex

With this gateway you can load content from the headless cms [Squidex](https://squidex.io).
Squidex can be self hosted, or you use the hosted version on [Squidex.io](https://squidex.io).

## Configuration

```
/* jungle.config.js */

const gatewaySquidex = require('jungle-gateway-squidex');

module.exports = async () => {
    const token = await gatewaySquidex.getToken({
        client_id: SQUIDEX_CLIENT_ID,
        client_secret: SQUIDEX_CLIENT_SECRET,
        url: SQUIDEX_BASE_URL
    });

    const jungleGateway = junglePreprocess({
        gateways: {
            squidex: SQUIDEX_GRAPHQL_URL
        },
        gatewayContext: ctx => {
            if (ctx === "squidex") {
                const extraHeaders = {"X-Languages": "de"};
                return gatewaySquidex.gatewayContext(extraHeaders);
            }
            return {};
        },
        middlewareContext: {
            squidex: [
                gatewaySquidex.middlewareContext, // removes flatData, necessary if you use [slug].svelete
                {
                    Page: async (data) => {
                        data.content = marked(data.content);
                    }
                }
            ]
        }
    });
};


```
