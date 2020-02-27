import fetch from "isomorphic-fetch";
import { Header, Method } from "@shopify/network";

import { ApiVersion, Topic, WebhookHeader } from "./types";

type Options = {
	topics: Topic[];
	accessToken: string;
	shop: string;
	apiVersion: ApiVersion;
}

type RegisteredWebhook = {
	id: number;
	address: string;
	topic: Topic;
	created_at: string; // Date ISO string like "2020-02-22T19:34:46+01:00"
	updated_at: string; // Date ISO string like "2020-02-22T19:34:46+01:00"
	format: "json";
	fields: [];
	metafield_namespaces: [];
	api_version: string;
	private_metafield_namespaces: [];
}

export async function unregisterWebhooks({
	topics,
	accessToken,
	shop,
	apiVersion,
}: Options): Promise<{ success: boolean; result: any; }> {
	const response = await fetch(
		`https://${shop}/admin/api/${apiVersion}/webhooks.json`,
		{
			method: Method.Get,
			headers: {
				[WebhookHeader.AccessToken]: accessToken,
				[Header.ContentType]: "application/json",
			},
		},
	);
	const result: { webhooks: RegisteredWebhook[] } = await response.json();

	if (response.status !== 200) {
		return { success: false, result };
	}

	let success = true;
	await Promise.all(
		result.webhooks.map(async (webhook) => {
			if (topics.includes(webhook.topic)) {
				const response = await fetch(
					`https://${shop}/admin/api/${apiVersion}/webhooks/${webhook.id}.json`,
					{
						method: Method.Delete,
						headers: {
							[WebhookHeader.AccessToken]: accessToken,
							[Header.ContentType]: "application/json",
						},
					},
				);

				if (response.status !== 200 && response.status !== 404) {
					success = false;
				}
			}
		}),
	);

	return { success, result };
}
