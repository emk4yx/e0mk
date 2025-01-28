import Redis from 'ioredis';
import { Bot } from './misc/Bot.js';
import { Database } from './misc/Database.js';
import { initializeIrcClient } from './utils/api/irc.js';

try {
  global.db = new Database();
  await db.initialize();
  console.log('Initialized Database!');

  global.redis = new Redis(); // Initialize Redis
  redis.on('connect', () => {
    console.log('Connected to Redis!');
  });
  redis.on('error', (err) => {
    console.error('Redis error:', err);
  });

  global.bot = new Bot();
  await bot.initialize();

  await initializeIrcClient();

  await import('./utils/cronJobs.js');

  bot.log.info('bot ready');
} catch (e) {
  console.error(`An error occurred: ${e}`);
}