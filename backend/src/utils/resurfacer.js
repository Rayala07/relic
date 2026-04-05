import cron from 'node-cron';
import Item from '../models/item.model.js';

// Items saved this many days ago will be resurfaced
const RESURFACE_DAYS = [7, 30, 90];

// In-memory store of currently resurfaced items
// Refreshed every time the cron job runs
// Shape: [{ item, daysAgo }]
let resurfacedItems = [];

function getDateRange(daysAgo) {
  // Returns start and end of the day that was
  // exactly daysAgo days ago — midnight to midnight
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

async function runResurface() {
  const found = [];

  for (const daysAgo of RESURFACE_DAYS) {
    const { start, end } = getDateRange(daysAgo);

    const items = await Item.find(
      {
        extractionStatus: 'resolved',
        createdAt: { $gte: start, $lte: end },
      },
      {
        url: 1,
        type: 1,
        title: 1,
        'content.excerpt': 1,
        'ai.tags': 1,
        'ai.summary': 1,
        createdAt: 1,
        user: 1,
      }
    ).lean();

    for (const item of items) {
      found.push({ item, daysAgo });
    }
  }

  resurfacedItems = found;
}

function getResurfacedItems() {
  return resurfacedItems;
}

function startResurfacerCron() {
  // Run once immediately on server start so the
  // endpoint has data without waiting until 9am
  runResurface().catch(err =>
    console.error('Resurfacer initial run failed:', err.message)
  );

  cron.schedule('0 9 * * *', () => {
    runResurface().catch(err =>
      console.error('Resurfacer cron failed:', err.message)
    );
  });
}

export { startResurfacerCron, getResurfacedItems };
