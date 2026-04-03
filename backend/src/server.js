require("dotenv").config();

const app = require("./app");
const { connectDb } = require("./config/db");
const { seedMenuIfEmpty } = require("./seed/menu");
const { seedTablesIfEmpty } = require("./seed/tables");

const port = Number(process.env.PORT || 8000);

async function startServer() {
  await connectDb();
  await seedMenuIfEmpty();
  await seedTablesIfEmpty();

  app.listen(port, () => {
    console.log(`POS backend running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
