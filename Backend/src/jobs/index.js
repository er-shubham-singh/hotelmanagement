import cron from "node-cron";
import { config } from "../config/env.js";
import { runHoldExpiryJob } from "./holdExpiry.job.js";
import { runActivateBookingsJob } from "./activateBookings.job.js";
import { runCheckoutReminderJob } from "./checkoutReminder.job.js";
import { runOverduePenaltyJob } from "./overduePenalty.job.js";
import { runNoShowJob } from "./noShow.job.js";
import { runSlotCleanupJob } from "./slotCleanup.job.js";

const JOBS = [
  { name: "holdExpiry", schedule: config.cron.holdExpiry, run: runHoldExpiryJob },
  { name: "activateBookings", schedule: config.cron.activateBookings, run: runActivateBookingsJob },
  { name: "checkoutReminder", schedule: config.cron.checkoutReminder, run: runCheckoutReminderJob },
  { name: "overduePenalty", schedule: config.cron.overduePenalty, run: runOverduePenaltyJob },
  { name: "noShow", schedule: config.cron.noShow, run: runNoShowJob },
  { name: "slotCleanup", schedule: config.cron.slotCleanup, run: runSlotCleanupJob },
];

const tasks = [];

// Wraps a job so one throwing error never kills the process or blocks the
// next scheduled tick.
const wrap = (job) => async () => {
  try {
    await job.run();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[jobs] ${job.name} failed:`, error.message);
  }
};

export const startJobs = () => {
  if (!config.jobsEnabled) {
    // eslint-disable-next-line no-console
    console.log("[jobs] JOBS_ENABLED=false — cron jobs are disabled");
    return;
  }

  for (const job of JOBS) {
    const task = cron.schedule(job.schedule, wrap(job));
    tasks.push(task);
  }

  // eslint-disable-next-line no-console
  console.log(`[jobs] Started ${tasks.length} cron job(s): ${JOBS.map((j) => j.name).join(", ")}`);
};

export const stopJobs = () => {
  for (const task of tasks) task.stop();
  tasks.length = 0;
};

export default { startJobs, stopJobs };
