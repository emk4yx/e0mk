import config from '../config.js';
import { getUserPermissionForBot, permissions, setUserPermissionForBot } from '../utils/permissions.js';
import { antiPing } from '../utils/utils.js';
import { getUserId } from '../utils/api/ivr.js';
import { duration } from '../utils/cooldown.js';

export default {
  name: 'permission',
  description: 'get/update a users permission',
  cooldown: duration.short,
  usage: '<status | default | admin> <user>',
  async execute(msg, response) {
    if (!msg.args.length) return response(`usage: ${this.usage}`, { error: true });

    const permission = msg.args[0].toLowerCase();
    const user = msg.args[1]?.toLowerCase()?.replace(/[#@,]/g, '') || msg.user.login;

    const userId = await getUserId(user);
    if (!userId) {
      return response(`FeelsDankMan user ${user} not found`);
    }

    const isCurrentUser = userId === msg.user.id;

    const currentPermission = await getUserPermissionForBot(userId);
    const currentPermissionName = Object.keys(permissions).find(key => permissions[key] === currentPermission);

    if (permission === 'status') {
      const userText = isCurrentUser ? 'your' : `${antiPing(user)}'s`;
      return response(`${userText} current permission is ${currentPermissionName}`);
    }

    if (msg.user.perms < permissions.admin) return response('NOIDONTTHINKSO you have to be an admin to update permissions');
    if (userId === config.owner.userId) return response(`NOIDONTTHINKSO you can't update the owner's permission`);
    if (permission === 'owner') return response('NOIDONTTHINKSO you cannot give another user owner permissions');

    const permissionId = permissions[permission];
    if (permissionId === undefined) {
      return response(`FeelsDankMan permission ${permission} doesn't exist. ${Object.keys(permissions).join(', ')}`);
    }

    if (currentPermission === permissionId) {
      return response(`FeelsDankMan user ${antiPing(user)} already has the permission ${permission}`);
    }

    await setUserPermissionForBot(userId, permissionId);
    return response(`user ${antiPing(user)} now has the permission ${permission}`);
  }
};