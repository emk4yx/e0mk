import config from '../config.js';
import { fetchUserBadgesInChannel } from './api/gql.js';
import { getUserId } from './api/ivr.js';
import { getModeratingChannels } from './api/helix.js';


export const permissions = {
  default: 0,
  vip: 1,
  moderator: 2,
  broadcaster: 3,
  admin: 4,
  owner: 5
};

export const getUserPermissionForBot = async (userId) => {
  const result = await db.queryOne(`SELECT permission FROM permissions WHERE user_id = ?`, [userId]);
  return result?.permission || 0;
};

export const setUserPermissionForBot = async (userId, permission) => {
  await db.query(`INSERT INTO permissions (user_id, permission) VALUES (?, ?) ON DUPLICATE KEY UPDATE permission = ?`, [userId, permission, permission]);
};

export const getUserPermission = async (userId, badges = []) => {
  const savedPermission = await getUserPermissionForBot(userId);

  const userPermissions = [savedPermission];

  for (const badge of badges || []) {
    if (badge?.set_id === 'vip') userPermissions.push(permissions.vip);
    if (badge?.set_id === 'moderator') userPermissions.push(permissions.moderator);
    if (badge?.set_id === 'broadcaster') userPermissions.push(permissions.broadcaster);
  }

  if (userId === config.owner.userId) userPermissions.push(permissions.owner);

  return Math.max(...userPermissions);
};

export const getUserPermissionInChannel = async (userLogin, channelLogin) => {

  const badges = await fetchUserBadgesInChannel(channelLogin, userLogin);

  const userId = await getUserId(userLogin); // This will now correctly fetch the user ID based on the username

  if (!userId) {
    throw new Error('User not found');
  }

  const userPermissions = [];

  for (const badge of badges) {
    if (badge?.title === 'VIP') userPermissions.push(permissions.vip);
    if (badge?.title === 'Moderator') userPermissions.push(permissions.moderator);
    if (badge?.title === 'Broadcaster') userPermissions.push(permissions.broadcaster);
  }

  const savedPermission = await getUserPermissionForBot(userId);
  userPermissions.push(savedPermission);

  if (userId === config.owner.userId) {
    userPermissions.push(permissions.owner);
  }

  return Math.max(...userPermissions);
};

export const isBotModded = async (channelId) => {
  try {
    const moderatedChannels = await getModeratingChannels(); // Assuming it fetches a list of channels the bot is a moderator in
    return moderatedChannels.has(channelId);
  } catch (error) {
    console.error(`Error checking moderation status: ${error.message}`);
    return false;
  }
};