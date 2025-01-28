import { timeSince } from '../utils/utils.js';
import { permissions } from '../utils/permissions.js';
import { duration } from '../utils/cooldown.js';
import os from 'os'; // For CPU and memory usage
import { performance } from 'perf_hooks'; // For latency measurement
import si from 'systeminformation';
import { ircClient } from '../utils/api/irc.js';


export default {
  name: 'ping',
  description: 'Displays bot statistics and performance metrics',
  aliases: ['pong'],
  access: permissions.default,
  cooldown: duration.veryShort,
  async execute(msg, response) {
    const start = performance.now();

    // Memory usage
    const memoryUsage = `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)}MB`;

    // Uptime
    const botUptime = timeSince(bot.uptime);

    // CPU usage
    const cpuUsage = `${os.loadavg()[0].toFixed(2)}%`; // 1-minute average CPU load

    let cpuTemperature = 'N/A';
    if (process.platform === 'darwin') { // Only fetch CPU temperature on macOS
      try {
        const temp = await si.cpuTemperature(); // Get the CPU temperature using systeminformation
        cpuTemperature = temp.main || 'N/A'; // Extract the main temperature value
      } catch (error) {
        cpuTemperature = 'Error retrieving temperature';
      }
    }


    const databaseUptimeInSeconds = await db.getDatabaseUptime();

    // Convert seconds to days, hours, minutes, and seconds
    const days = Math.floor(databaseUptimeInSeconds / 86400); // 86400 = seconds in a day
    const hours = Math.floor((databaseUptimeInSeconds % 86400) / 3600); // 3600 = seconds in an hour
    const minutes = Math.floor((databaseUptimeInSeconds % 3600) / 60); // 60 = seconds in a minute
    const seconds = databaseUptimeInSeconds % 60;

    // Format the uptime string
    const formattedDatabaseUptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    // Total commands executed
    const totalCommandsExecuted = bot.commandsExecuted;

    // Redis keys count
    const redisKeys = await redis.dbsize();

    // Total channels the bot is in
    const totalChannels = bot.channels.size;

    const channelDb = await db.queryOne(
      'SELECT is_modded FROM channels WHERE user_id = ?',
      [msg.channel.id] // Assuming `msg.channel.id` exists
    );
    const isModded = channelDb?.is_modded || false; // If modded, use Helix

    // Latency calculation based on mode
    let latency = 0;
    let latencyType = '';

    if (isModded) {
      // Use internal performance latency for Helix
      latency = Math.round(performance.now() - start);
      latencyType = 'Internal';
    } else {
      // Use IRC ping logic for non-modded channels
      const startTime = Date.now();
      await ircClient.ping();
      latency = Date.now() - startTime;
      latencyType = 'IRC';
    }
    // Message construction
    const messages = [
      `🏓 ${msg.command.trigger === 'pong' ? 'PING' : 'PONG'}`,
      `Latency: ${latency}ms (${latencyType})`,
      `Memory Usage: ${memoryUsage}`,
      `CPU: ${cpuUsage}`,
      `CPU Temperature: ${cpuTemperature}°C`,
      `Uptime: ${botUptime}`,
      `Channels: ${totalChannels}`,
      `Commands Executed: ${totalCommandsExecuted}`,
      `Database Uptime: ${formattedDatabaseUptime}`,
      `Redis Keys: ${redisKeys}`
    ];

    return msg.sendAction(messages.join(' • '));
  }
};
