import { permissions } from '../utils/permissions.js';
import { getUserPermissionInChannel } from '../utils/permissions.js';
import * as twitch from '../utils/api/helix.js';
import * as gql from '../utils/api/gql.js';
import * as conduits from '../utils/api/conduits.js';
import * as ivrHelper from '../utils/api/ivr.js';
import { isBotModded } from '../utils/permissions.js';
import * as chat from '../misc/events/chatMessage.js';
import * as irc from '../utils/api/irc.js';

export default {
  name: 'eval',
  description: 'evaluates a given js code',
  access: permissions.owner,
  async execute(msg, response) {
    if (!msg.args.length) return response(`??`);

    try {
      const result = await eval(`(async () => {
				${msg.text}
			})()`);

      if (result) {
        return response(`✅ output: ${String(result)}`);
      }

    } catch (e) {
      bot.log.error(e);
      return response(`FeelsDankMan Error ${e}`);
    }
  }
};