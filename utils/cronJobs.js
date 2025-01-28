import { parseCronExpression } from 'cron-schedule';
import { getModeratingChannels } from './api/helix.js'; // Use the existing function
import { TimerBasedCronScheduler as scheduler } from 'cron-schedule/schedulers/timer-based.js';


async function updateModStatus() {
  try {
    console.log(`[${new Date().toISOString()}] Starting mod status check...`);
    const moddedChannels = await getModeratingChannels(); // Get modded channel IDs

    // Reset all channels to `is_modded = FALSE`
    await db.query(`UPDATE channels SET is_modded = FALSE`);

    // Update the database for channels where the bot is modded
    for (const channelId of moddedChannels) {
      await db.query(`UPDATE channels SET is_modded = TRUE WHERE user_id = ?`, [channelId]);
    }

    console.log(`[${new Date().toISOString()}] Mod status check complete.`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to update mod status:`, error);
  }
}

// Create a cron expression (every 5 minutes)
const cron = parseCronExpression('*/300 * * * *');
console.log(cron.getNextDate(new Date()));

// Set up the cron job using the TimerBasedCronScheduler
const handle = scheduler.setInterval(cron, updateModStatus);

console.log('Mod status cron job initialized and started.');
console.log(cron.getNextDate(new Date()));
export function startCronJobs() {
  // The job is already running with the setInterval from above.
  // You can add more logic here if needed for managing the scheduler.
}
