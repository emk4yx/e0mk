// File: ./utils/api/irc.js
import { ChatClient, AlternateMessageModifier, SlowModeRateLimiter, ConnectionRateLimiter, JoinRateLimiter } from '@kararty/dank-twitch-irc';
import config from '../../config.js';
import { getBotAuthToken } from './helix.js';

let ircClient;

/**
 * Initializes the IRC client and connects to the Twitch chat.
 */
export async function initializeIrcClient() {
  try {
    const token = await getBotAuthToken();

    ircClient = new ChatClient({
      username: config.bot.username,
      password: `oauth:${token}`,
      rateLimits: 'verifiedBot',
      ignoreUnhandledPromiseRejections: true,
    });

    ircClient.use(new AlternateMessageModifier(ircClient));
    ircClient.use(new JoinRateLimiter(ircClient));
    ircClient.use(new ConnectionRateLimiter(ircClient));
    ircClient.use(new SlowModeRateLimiter(ircClient, 10));

    await ircClient.connect();

    console.log('IRC client successfully connected');
    
    const channels = await db.query(`SELECT login FROM channels`);
    const channelLogins = channels.map((row) => row.login); // No need for .toLowerCase()

    // Join all fetched channels
    if (channelLogins.length > 0) {
      await ircClient.joinAll(channelLogins);
      console.log(`Joined ${channelLogins.length} channels:`, channelLogins);
    } else {
      console.log('No channels found in the database to join.');
    }

  } catch (error) {
    console.error('Failed to initialize IRC client:', error);
    throw error;
  }
}

export async function sendMessageIRC(channel, message) {
  if (!ircClient) {
    throw new Error('IRC client is not initialized');
  }
  ircClient.say(channel, message);
}

export async function sendActionIRC(channel, action, parentMessageID) {
  if (!ircClient) throw new Error('IRC client is not initialized');
  
  const rawCommand = parentMessageID
    ? `@reply-parent-msg-id=${parentMessageID} PRIVMSG #${channel} :/me ${action}`
    : `PRIVMSG #${channel} :/me ${action}`;

  await ircClient.sendRaw(rawCommand);
}

// Export the ircClient itself for external access
export { ircClient };
