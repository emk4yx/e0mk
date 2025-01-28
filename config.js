import dotenv from 'dotenv';
dotenv.config();

const config = {
  bot: {
    prefix: '-',
    userId: process.env.BOT_USER_ID,
    username: process.env.BOT_USERNAME
  },
  owner: {
    userId: process.env.BOT_OWNER_USER_ID,
    username: process.env.BOT_OWNER_USERNAME
  },
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET
  },
  db: {
    host: process.env.DB_HOST,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS
  }
};

export default config;