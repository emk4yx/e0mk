import * as fs from 'fs';
import { Logger } from './Logger.js';
import { ConduitClient } from './ConduitClient.js';

export class Bot {
  constructor() {
    this.log = new Logger();
    this.conduitClient = new ConduitClient();
    this.commands = new Map();
    this.channels = new Set();
    this.ignoredUsers = new Set();
    this.uptime = 0;
    this.commandsExecuted = 0;
  }

  async initialize() {
    this.uptime = new Date();

    const [ignoredUsers, channels] = await Promise.all([
      db.query(`SELECT user_id FROM ignored_users`),
      db.query(`SELECT user_id FROM channels`),
      this.loadCommands()
    ]);

    this.ignoredUsers = new Set(ignoredUsers.map(user => user.user_id));
    this.channels = new Set(channels.map(channel => channel.user_id));

    await this.conduitClient.initialize();
  }

  async loadCommands() {
    const commandFiles = fs.readdirSync(`./commands`).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = await import(`../commands/${file}?${Date.now()}`);

      if (!command?.default?.name) {
        this.log.error(`Failed to load Command ${file}`);
        continue;
      }

      this.commands[command.default.name] = command.default;

      for (const alias of command.default.aliases || []) {
        this.commands[alias] = this.commands[command.default.name];
      }
    }
  }
}