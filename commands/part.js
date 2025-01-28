import { permissions } from '../utils/permissions.js';
import { getUserId } from '../utils/api/ivr.js';
import { antiPing } from '../utils/utils.js';
import { getUserPermissionInChannel } from '../utils/permissions.js'; // Import the permission function
import config from '../config.js';

export default {
  name: 'part',
  description: 'part (leave) a channel',
  access: permissions.default,  // Allow everyone to use the command
  usage: 'part a channel',
  async execute(msg, response) {
    // Check if no argument is provided
    if (msg.args.length < 1) {
      // If the command is issued in the bot's or owner's channel, part the bot from the user's chat
      if (msg.channel.id === config.bot.userId || msg.channel.id === config.owner.userId) {
        const channelId = await getUserId(msg.user.name);
        // Check if the bot is in the user's channel
        if (!bot.channels.has(channelId)) {
          return response(`the bot is not in your channel ${msg.user.name} to part from`);
        }

        // Part from the user's chat
        await Promise.all([
          bot.conduitClient.unsubscribeFromEvents([channelId]),
          db.query(`DELETE FROM channels WHERE user_id = ?`, [channelId]),
          bot.channels.delete(channelId)
        ]);

        return response(`parted from your channel, ${msg.user.name}`);
      }

      const userPermission = await getUserPermissionInChannel(msg.user.name, msg.channel.name);
      if (userPermission < permissions.moderator) {
        return response(`you need to be a moderator in ${antiPing(channel)} to part from the bot`);
      }
      // Otherwise, part from the broadcaster's channel if the command is typed in another channel
      const broadcasterId = msg.channel.id;
      await Promise.all([
        bot.conduitClient.unsubscribeFromEvents([broadcasterId]),
        db.query(`DELETE FROM channels WHERE user_id = ?`, [broadcasterId]),
        bot.channels.delete(broadcasterId)
      ]);

      return response(`parted from broadcaster's channel ${antiPing(msg.channel.name)}`);
    }

    // If a specific channel is provided, continue with the regular part behavior
    const channel = msg.args[0].toLowerCase().replace(/[#@,]/g, '');
    const channelId = await getUserId(channel);

    if (!channelId) {
      return response(`FeelsDankMan channel ${channel} not found`);
    }

    // Check if the user who typed the command is a moderator in the target channel
    const userPermission = await getUserPermissionInChannel(msg.user.name, channel);
    if (userPermission < permissions.moderator) {
      return response(`you need to be a moderator in ${antiPing(channel)} to part from the bot`);
    }

    // Check if the bot is not in the channel
    if (!bot.channels.has(channelId)) {
      return response(`the bot is not in ${antiPing(channel)} to part from`);
    }

    // Part (leave) the channel
    await Promise.all([
      bot.conduitClient.unsubscribeFromEvents([channelId]),
      db.query(`DELETE FROM channels WHERE user_id = ?`, [channelId]),
      bot.channels.delete(channelId)
    ]);

    return response(`parted from channel ${antiPing(channel)}`);
  }
};
