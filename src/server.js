const app = require("./app");
const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`ShoppingListBackend running at http://localhost:${PORT}`);
});
