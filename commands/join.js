import { permissions } from '../utils/permissions.js';
import { getUserId } from '../utils/api/ivr.js';
import { ircClient } from '../utils/api/irc.js';
import { antiPing } from '../utils/utils.js';
import { getUserPermissionInChannel } from '../utils/permissions.js'; // Import the permission function
import config from '../config.js';

export default {
  name: 'join',
  description: 'join a channel',
  access: permissions.default,  // Changed to 'default' to allow everyone
  usage: 'join a channel',
  async execute(msg, response) {
    if (msg.args.length < 1) {
      return response(`usage: ${this.usage}`, { error: true });
    }

    const channel = msg.args[0].toLowerCase().replace(/[#@,]/g, '');
    const channelId = await getUserId(channel);

    if (!channelId) {
      return response(`FeelsDankMan channel ${channel} not found`);
    }

    // Check if the user who typed the command is a moderator in the target channel
    const userPermission = await getUserPermissionInChannel(msg.user.name, channel);
    if (userPermission < permissions.moderator) {
      return response(`you need to be a moderator in ${antiPing(channel)} to join the bot`);
    }

    // Check if the bot is already in the channel
    if (bot.channels.has(channelId)) {
      return response(`already joined channel ${antiPing(channel)}`);
    }

    // Check if the bot is mod in the target channel
    const botPermission = await getUserPermissionInChannel(config.bot.username, channel); // Bot's permissions in the target channel
    if (botPermission < permissions.moderator) {
      await ircClient.join(channel);
      db.query(`INSERT INTO channels (user_id, login, prefix) VALUES (?, ?, ?)`, [channelId, channel, config.bot.prefix]),
      bot.channels.add(channelId);
      return response(`Joined channel. I'm not modded in ${antiPing(channel)}. please add @${config.bot.username} as a moderator in this channel for full functionality.`);
    }

    // Join the channel
    await Promise.all([
      bot.conduitClient.subscribeToEvents([channelId]),
      db.query(`INSERT INTO channels (user_id, login, prefix) VALUES (?, ?, ?)`, [channelId, channel, config.bot.prefix]),
      bot.channels.add(channelId)
    ]);

    return response(`joined channel ${antiPing(channel)}`);
  }
};
