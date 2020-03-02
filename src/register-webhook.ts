import { ApiVersion, Topic, TopicGraphQL } from "./types";
import { registerWebhookREST } from "./register-webhook-rest";
import { registerWebhookGraphQL } from "./register-webhook-graphql";

type OptionsREST = {
	topic: Topic;
	requestType: "rest";
};

type OptionsGraphQL = {
	topic: TopicGraphQL;
	requestType: "graphql";
};

type OptionsRequestType = OptionsREST | OptionsGraphQL;

type Options = {
	address: string;
	accessToken: string;
	shop: string;
	apiVersion: ApiVersion;
} & OptionsRequestType;

function isTopicREST(topic: string): topic is Topic {
	return topic.toLowerCase() === topic;
}

function isTopicGraphQL(topic:string): topic is TopicGraphQL {
	return topic.toUpperCase() === topic;
}

export async function registerWebhook(options: Options): Promise<{ success: boolean; result: any; }> {
	const {
		requestType,
		topic,
		...sharedParams
	} = options;

	switch (requestType) {
		case "rest":
			if (!isTopicREST(topic)) {
				throw new Error("Topic is not a REST API compatible topic");
			}

			return registerWebhookREST({ ...sharedParams, topic });
		case "graphql":
			if (!isTopicGraphQL(topic)) {
				throw new Error("Topic is not a REST API compatible topic");
			}

			return registerWebhookGraphQL({ ...sharedParams, topic })
	}
}
