const { connect } = require("./db/mongo");
const app = require("./app");

const PORT = process.env.PORT || 3010;

(async () => {
  await connect();
  console.log("✅ Connected to MongoDB");
  app.listen(PORT, () => {
    console.log(`ShoppingListBackend running at http://localhost:${PORT}`);
  });
})();
