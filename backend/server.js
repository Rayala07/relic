import "dotenv/config";
import app from "./src/app.js";
import connectToDB from "./src/config/database.js";
import { startResurfacerCron } from "./src/utils/resurfacer.js";

const REQUIRED_ENV_VARS = [
  'MONGO_URI',
  'CLERK_SECRET_KEY',
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

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  await connectToDB();
  startResurfacerCron();
});

