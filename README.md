# `shopify-webhooks`

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Receive Shopify webhooks in your app without any middleware.

## Installation

```bash
$ npm install -S shopify-webhooks
```

## API

### registerWebhook

```typescript
function registerWebhook(options: {
	address: string;
	topic: Topic;
	accessToken: string;
	shop: string;
	apiVersion: ApiVersion;
}): Promise<{ success: boolean; result: any; }>
```

Registers a webhook for the given `topic` which will send requests to the given `address`. Returns an object with success `true` / `false` to indicate success or failure, as well as the parsed JSON of the response from Shopify. This function will throw if the fetch request it makes encounters an error.

### receiveWebhook

```typescript
function receiveWebhook<Payload = any>(options: {
    secret: string;
    headers: Record<string, string>;
    rawBody: string;
}): Promise<{
	statusCode: StatusCode.Accepted | StatusCode.Forbidden;
	webhookState: WebhookState<Payload> | null;
}>;
```

Validates the HMAC from headers and extracts webhook data.

## Usage

### Example using Zeit Now serverless functions

##### Register a webhook

```typescript
import { NowRequest, NowResponse } from "@now/node";
import { registerWebhook, ApiVersion } from "shopify-webhooks";

async function zeitNowRegisterWebhook(req: NowRequest, res: NowResponse) {
    const registration = await registerWebhook({
        address: `https://${APP_URL}/api/webhooks/app/uninstalled`,
        topic: "app/uninstalled",
        accessToken: req.cookies.shopifyToken,
        shop: req.cookies.shopOrigin,
        apiVersion: ApiVersion.January20,
    });
    
    if (registration.success) {
        console.log(`Successfully registered webhook "app/uninstalled"`);
    } else {
        console.log(`Failed to register webhook "app/uninstalled";`, JSON.stringify(registration.result, null, 4));
    }
}
```

##### Receive a webhook

```typescript
import { NowRequest, NowResponse } from "@now/node";
import getRawBody from "raw-body";
import { receiveWebhook } from "shopify-webhooks";

async function zeitNowReceiveWebhook(req: NowRequest, res: NowResponse) {
	const rawBody = await getRawBody(req);

	const { statusCode, webhookState } = await receiveWebhook({
		secret: SHOPIFY_API_SECRET_KEY,
		headers: req.headers as Record<string, string>,
		rawBody: rawBody.toString(),
	});

	if (statusCode === StatusCode.Forbidden || webhookState === null) {
		res.status(StatusCode.Forbidden).end();
	} else {
		res.status(200).end();
	}

	console.log("webhookState", webhookState);
}
```

## Gotchas

Make sure to install a fetch polyfill, since internally we use it to make HTTP requests.

In your terminal
`$ npm install -S isomorphic-fetch`

In your app
`import "isomorphic-fetch"`

OR

`require("isomorphic-fetch")`
