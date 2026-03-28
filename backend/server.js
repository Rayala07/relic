import app from "./src/app.js";
import connectToDB from "./src/config/database.js";
import { connectToRedis } from "./src/config/redis.js";
import { generateEmbedding } from "./src/services/embedder.js";
import "dotenv/config";

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  await connectToDB();
  await connectToRedis();

  // Eager warmup — load MiniLM now so the first real URL save doesn't
  // pay the cold-start cost (~3-5s model download/load from cache).
  try {
    await generateEmbedding({ title: "warmup", body: "warmup" });
    console.log("Embedding model ready");
  } catch (err) {
    console.error("Embedding model warmup failed:", err.message);
  }
});

