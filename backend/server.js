import app from "./src/app.js";
import connectToDB from "./src/config/database.js";
import "dotenv/config";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

connectToDB();
