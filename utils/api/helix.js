import { response } from 'express';
import config from '../../config.js';


export const helix = async (endpoint, method = 'GET', body = {}, useBotAuth = false) => {
  const url = `https://api.twitch.tv/helix/${endpoint}`;

  const auth = useBotAuth ? await getBotAuthToken() : await getAppAuthToken();

  const options = {
    method: method,
    headers: {
      'Client-Id': config.twitch.clientId,
      'Authorization': `Bearer ${auth}`,
      'Content-Type': 'application/json'
    },
    body: (method === "POST" || method === "PATCH") ? JSON.stringify(body) : null,
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorDetails = await response.json();
      bot.log.error(`Error in ${method} ${url}: ${response.status} ${response.statusText} - ${errorDetails.message || 'No detailed message'}`);

      return null;
    }
    try {
      if (response.status === 204) {
        return null;
      }
    
      return await response.json();
    }
    catch (e) {
      bot.log.error(`Failed to parse JSON response from ${method} ${url}, content may not be JSON: ${e}`);
      return null;
    }
  } catch (e) {
    bot.log.error(`Network error in ${method} ${endpoint}: ${e}`);
    return null;
  }
};

export const getBotAuthToken = async () => {
  const tokenData = await db.queryOne(
    'SELECT access_token, expires_at, refresh_token FROM tokens WHERE name = ?',
    ['bot-token']
  );

  const currentTime = Date.now();

  if (tokenData && Number(tokenData.expires_at) > currentTime) {
    return tokenData.access_token;
  }

  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: config.twitch.clientId,
      client_secret: config.twitch.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: tokenData.refresh_token ?? null
    })
  });

  const newTokenData = await response.json();

  const expires_at = currentTime + newTokenData.expires_in * 1000;
  await db.query(
    'REPLACE INTO tokens (name, access_token, expires_at, refresh_token) VALUES (?, ?, ?, ?)',
    ['bot-token', newTokenData.access_token, expires_at, newTokenData.refresh_token]
  );

  return newTokenData.access_token;
};

export const getAppAuthToken = async () => {
  const tokenData = await db.queryOne(
    'SELECT access_token, expires_at FROM tokens WHERE name = ?',
    ['app-token']
  );

  if (tokenData && Number(tokenData.expires_at) > Date.now()) {
    return tokenData.access_token;
  }

  const url = new URL('https://id.twitch.tv/oauth2/token');
  url.search = new URLSearchParams({
    client_id: config.twitch.clientId,
    client_secret: config.twitch.clientSecret,
    grant_type: 'client_credentials'
  }).toString();

  const response = await fetch(url, {
    method: 'POST'
  });

  const newTokenData = await response.json();
  const expires_at = Date.now() + (newTokenData.expires_in * 1000);

  await db.query(
    'REPLACE INTO tokens (name, access_token, expires_at) VALUES (?, ?, ?)',
    ['app-token', newTokenData.access_token, expires_at]
  );

  return newTokenData.access_token;
};


export const getModeratingChannels = async () => {
  const channelIds = new Set([config.bot.userId]);
  let cursor;

  do {
    const response = await helix(`moderation/channels?user_id=${config.bot.userId}&after=${cursor || ''}`, 'GET', null, true);
    cursor = response?.pagination?.cursor || null;

    for (const channel of response?.data || []) {
      channelIds.add(channel.broadcaster_id);
    }

  } while (cursor);

  return channelIds;
};

export const sendMessage = async (channelId, message, parent = '') => {
  const body = {
    broadcaster_id: channelId,
    sender_id: config.bot.userId,
    message: message,
    reply_parent_message_id: parent
  };

  return await helix('chat/messages', 'POST', body, true);
};

export const sendAction = async (channelId, message, parent = '') => {
  const body = {
    broadcaster_id: channelId,
    sender_id: config.bot.userId,
    message: `/me ${message}`,
    reply_parent_message_id: parent
  };

  try {
    const response = await helix('chat/messages', 'POST', body, true);
    if (response?.data?.[0]?.is_sent === false) {
      bot.log.error(`Failed to send Message #${channelId}: ${message} - Reason: ${JSON.stringify(response.data[0].drop_reason)}`);
    }

    return response;
  } catch (e) {
    bot.log.error(`Failed to send Message #${channelId}: ${message}`);
  }
};

