import { ConduitShardClient } from './ConduitShardClient.js';
import * as subscriptions from '../utils/subscriptions.js';
import { addShardsToConduit, createSubscription, deleteSubscription, getConduitId } from '../utils/api/conduits.js';
import config from '../config.js';
import { sleep } from '../utils/utils.js';

export class ConduitClient {
	topics = [
		subscriptions.channelChatMessage,
		subscriptions.streamOnline,
		subscriptions.streamOffline
	];

	botTopics = [
		subscriptions.userWhisperMessage
	];

	constructor() {
		this.conduitId = null;
		this.shard = new ConduitShardClient();
	}

	async initialize() {
		this.conduitId = await getConduitId();
		bot.log.conduit('conduit-id: ', this.conduitId)

		await this.shard.initialize();
		bot.log.conduit('shard initialized')

		const shard = {
			id: 0,
			transport: {
				method: 'websocket',
				session_id: this.shard.sessionId
			}
		};

		await addShardsToConduit(this.conduitId, [shard]);

		const channels = await db.query('SELECT user_id FROM channels');
		const channelIds = channels.map(c => c.user_id);
		bot.channels = new Set(channelIds);

		await Promise.all([
			this.subscribeToEvents([config.bot.userId], this.botTopics),
			this.subscribeToEvents(channelIds, this.topics)
		]);
	}

	async addSubscriptions(channelId, subscriptionTopics) {
		for (const topic of subscriptionTopics) {
			const conditionStr = JSON.stringify(topic.condition).replace(/{channelId}/g, channelId);
			const subscriptionSettings = {
				type: topic.type,
				version: topic.version,
				condition: JSON.parse(conditionStr)
			};

			const subscriptionExists = await db.entryExists('SELECT id FROM subscriptions WHERE type=? AND version=? AND channel_id=?', [topic.type, topic.version, channelId]);
			if (subscriptionExists) {
				continue;
			}

			await sleep(250);
			const subscriptionResponse = await createSubscription(subscriptionSettings);
			if (subscriptionResponse?.id) {
				await db.query('INSERT INTO subscriptions (id, type, version, channel_id) VALUES (?, ?, ?, ?)', [subscriptionResponse.id, topic.type, topic.version, channelId]);
			}
		}
	}

	async removeSubscriptions(channelId, subscriptionTopics) {
		for (const topic of subscriptionTopics) {
			const subscription = await db.queryOne('SELECT id FROM subscriptions WHERE channel_id = ? AND type = ?', [channelId, topic.type]);
			if (subscription) {
				await deleteSubscription(subscription.id);
				await db.query('DELETE FROM subscriptions WHERE id=?', [subscription.id]);
			}
		}
	}

	async subscribeToEvents(channelIds, subscriptionTopics) {
		if (!subscriptionTopics) {
			subscriptionTopics = this.topics;
		}

		for (const channelId of channelIds) {
			await this.addSubscriptions(channelId, subscriptionTopics);
		}
	}

	async unsubscribeFromEvents(channelIds, subscriptionTopics) {
		if (!subscriptionTopics) {
		  subscriptionTopics = this.topics;
		}
	  
		for (const channelId of channelIds) {
		  await this.removeSubscriptions(channelId, subscriptionTopics);
		}
	  }
	  
}