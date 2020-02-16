import { createHmac } from "crypto";
import safeCompare from "safe-compare";
import { StatusCode } from "@shopify/network";

import { WebhookHeader, Topic, WebhookState } from "./types";

interface Options {
	secret: string;
	headers: Record<string, string>;
	rawBody: string;
}

export async function receiveWebhook<Payload = any>({
	secret,
	headers,
	rawBody,
}: Options): Promise<{
	statusCode: StatusCode.Accepted | StatusCode.Forbidden;
	webhookState: WebhookState<Payload> | null;
}> {
	const hmac = headers[WebhookHeader.Hmac] || headers[WebhookHeader.Hmac.toLowerCase()] || "";
	const topic = headers[WebhookHeader.Topic] || headers[WebhookHeader.Topic.toLowerCase()] || "";
	const domain = headers[WebhookHeader.Domain] || headers[WebhookHeader.Domain.toLowerCase()] || "";

	const generatedHash = createHmac("sha256", secret)
		.update(Buffer.from(rawBody))
		.digest("base64");

	if (safeCompare(generatedHash, hmac)) {
		return {
			statusCode: StatusCode.Accepted,
			webhookState: {
				topic: topic as Topic,
				domain,
				payload: JSON.parse(rawBody),
			},
		};
	} else {
		return {
			statusCode: StatusCode.Forbidden,
			webhookState: null,
		};
	}
}
