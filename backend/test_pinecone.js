
import { Pinecone } from '@pinecone-database/pinecone';
const pinecone = new Pinecone({ apiKey: 'pcsk_5nufgH_HPk6XFEkmvP5zUCkVgzvfonFrW323heDy2Lo9nfUgjfeufRkZuTjw9wNhWfY5Ug' });
const index = pinecone.index('relic-chunks');
async function run() {
  try {
    await index.upsert([{ id: 'test1', values: Array(1024).fill(0.1) }]);
    console.log('Success passing array');
  } catch (err) {
    console.error('Array error:', err.message);
  }
}
run();
