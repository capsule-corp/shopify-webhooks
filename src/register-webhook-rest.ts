import fetch from "isomorphic-fetch";
import { Header, Method } from "@shopify/network";

import { ApiVersion, Topic, WebhookHeader } from "./types";

type Options = {
	address: string;
	topic: Topic;
	accessToken: string;
	shop: string;
	apiVersion: ApiVersion;
}

export async function registerWebhookREST({
	address,
	topic,
	accessToken,
	shop,
	apiVersion,
}: Options): Promise<{ success: boolean; result: any; }> {
	const body = {
		webhook: {
			topic,
			address,
			format: "json",
		},
	};
	const response = await fetch(
		`https://${shop}/admin/api/${apiVersion}/webhooks.json`,
		{
			method: Method.Post,
			body: JSON.stringify(body),
			headers: {
				[WebhookHeader.AccessToken]: accessToken,
				[Header.ContentType]: "application/json",
			},
		},
	);
	const result = await response.json();

	if (result?.webhook?.id) {
		return { success: true, result };
	} else {
		return { success: false, result };
	}
}
