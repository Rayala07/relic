import "dotenv/config";
import app from "./src/app.js";
import connectToDB from "./src/config/database.js";
import "./src/services/queue.js"; // Must be first — activates both BullMQ workers (pipeline + resurface)
import { startResurfacerCron } from "./src/utils/resurfacer.js"; // Depends on queue.js being loaded

const REQUIRED_ENV_VARS = [
  'MONGO_URI',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'GEMINI_API_KEY',
  'MISTRAL_API_KEY',
  'PINECONE_API_KEY',
  'PINECONE_INDEX',
  'GROQ_API_KEY',
];

const missing = REQUIRED_ENV_VARS.filter(
  v => !process.env[v]
);

if (missing.length > 0) {
  console.error(
    'STARTUP ERROR: Missing required environment variables:',
    missing.join(', ')
  );
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// Connect to DB FIRST — server only starts listening once the database is ready.
// This prevents requests from arriving before Mongoose is connected,
// which was causing 40-50 second loading delays due to queued operations.
await connectToDB();
startResurfacerCron();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`[Queue] Pipeline worker is active and listening for jobs`);
});


