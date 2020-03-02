import fetch from "isomorphic-fetch";
import { Header, Method } from "@shopify/network";

import { ApiVersion, TopicGraphQL, WebhookHeader } from "./types";

function buildQuery(topic: string, callbackUrl: string) {
	return `
    mutation webhookSubscriptionCreate {
      webhookSubscriptionCreate(topic: ${topic}, webhookSubscription: {callbackUrl: "${callbackUrl}"}) {
        userErrors {
          field
          message
        }
        webhookSubscription {
          id
        }
      }
    }
  `;
}


type Options = {
	address: string;
	topic: TopicGraphQL;
	accessToken: string;
	shop: string;
	apiVersion: ApiVersion;
}

export async function registerWebhookGraphQL({
	address,
	topic,
	accessToken,
	shop,
	apiVersion,
}: Options): Promise<{ success: boolean; result: any; }> {
	const response = await fetch(
		`https://${shop}/admin/api/${apiVersion}/graphql.json`,
		{
			method: Method.Post,
			body: buildQuery(topic, address),
			headers: {
				[WebhookHeader.AccessToken]: accessToken,
				[Header.ContentType]: "application/graphql",
			},
		},
	);

	const result = await response.json();

	if (result.data?.webhookSubscriptionCreate?.webhookSubscription) {
		return { success: true, result };
	} else {
		return { success: false, result };
	}
}
