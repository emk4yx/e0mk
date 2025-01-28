import config from '../config.js';
import * as chatMessage from '../misc/events/chatMessage.js';

export const channelChatMessage = {
  type: 'channel.chat.message',
  version: '1',
  condition: {
    broadcaster_user_id: '{channelId}',
    user_id: config.bot.userId
  },
  handler: chatMessage.channelChatMessage
};

export const userWhisperMessage = {
  type: 'user.whisper.message',
  version: '1',
  condition: {
    user_id: config.bot.userId
  },
  handler: () => {}
};

export const streamOnline = {
  type: 'stream.online',
  version: '1',
  condition: {
    broadcaster_user_id: '{channelId}'
  },
  handler: () => {}
};

export const streamOffline = {
  type: 'stream.offline',
  version: '1',
  condition: {
    broadcaster_user_id: '{channelId}'
  },
  handler: () => {}
};