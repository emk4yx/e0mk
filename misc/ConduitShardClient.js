import WebSocket from 'ws';
import * as subscriptions from '../utils/subscriptions.js';
import { addShardsToConduit } from '../utils/api/conduits.js';

export class ConduitShardClient {
  socket = null;
  sessionId = null;

  async initialize() {
    return new Promise((resolve, reject) => {
      this.createWebSocket(resolve, reject);
    });
  }

  createWebSocket(resolve, reject) {
    this.socket = new WebSocket('wss://eventsub.wss.twitch.tv/ws');

    this.socket.addEventListener('open', () => {
      bot.log.conduit('websocket: created connection to twitch');
    });

    this.socket.addEventListener('close', async (e) => {
      bot.log.conduit('websocket: disconnected from twitch', e);
      await this.reconnect();
    });

    this.socket.addEventListener('error', async (e) => {
      bot.log.conduit('websocket: error occurred', e);
      await this.reconnect();
    });

    this.socket.addEventListener('message', async (data) => {
      const message = JSON.parse(data.data);
      switch (message.metadata.message_type) {
        case 'session_welcome': {
          const newSessionId = message.payload.session.id;

          if (this.sessionId !== null) {
            await this.reconnectWebSocket(newSessionId);
          }

          this.sessionId = newSessionId;
          bot.log.conduit('websocket: received welcome message. session id:', this.sessionId);
          resolve();
          return;
        }

        case 'session_reconnect': {
          const url = message.payload.session.reconnect_url;
          bot.log.conduit('websocket: received reconnect message. reconnecting to:', url);
          await this.reconnect(url);
          return;
        }

        case 'revocation': {
          return bot.db.query(`DELETE FROM subscriptions WHERE id = ?`, [message.payload.subscription.id]);
        }


        default: {
          const event = message.payload.event;
          const subscriptionType = message?.metadata?.subscription_type ?? '';
          if (!subscriptionType || !event) return;

          const subscription = Object.values(subscriptions).find(sub => sub.type === subscriptionType);
          if (!subscription || !subscription.handler) {
            return;
          }

          subscription.handler(event);
        }
      }
    });
  }

  async reconnect() {
    this.createWebSocket(() => {
      bot.log.conduit('websocket: reconnected to twitch');
    }, (err) => {
      bot.log.conduit('websocket: failed to reconnect', err);
    });
  }

  async reconnectWebSocket(newSessionId) {
    const conduitId = bot.conduitClient.conduitId;
    bot.log.conduit(`reattached conduit-shard (new session id: ${newSessionId}) to conduit-id: ${conduitId}`);

    const newShard = {
      id: 0,
      transport: {
        method: 'websocket',
        session_id: newSessionId
      }
    };

    await addShardsToConduit(conduitId, [newShard]);
  }
}
