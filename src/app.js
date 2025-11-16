const express = require("express");
const auth = require("./middleware/auth");
const authorize = require("./middleware/authorize");
const errorHandler = require("./middleware/errorHandler");

const userController = require("./users/user-controller");
const shoppingListController = require("./shoppingList/shoppingList-controller");
const membershipController = require("./membership/membership-controller");
const listItemController = require("./listItem/listItem-controller");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("ShoppingListBackend is running 🚀");
});

app.use(auth);



// USERS
app.post("/user/create", authorize(["Authorities"]), userController.createUser);
app.get("/user/get", authorize(["Authorities","User","Viewer"]), userController.getUser);

// SHOPPING LISTS
app.post("/shoppingList/create", authorize(["Authorities","User"]), shoppingListController.createShoppingList);
app.get("/shoppingList/get", authorize(["Authorities","User","Viewer"]), shoppingListController.getShoppingList);
app.get("/shoppingList/listMy", authorize(["Authorities","User","Viewer"]), shoppingListController.listMyShoppingLists);

// MEMBERSHIPS
app.post("/membership/addUser", authorize(["Authorities","User"]), membershipController.addUserToList);
app.get("/membership/getListMembers", authorize(["Authorities","User","Viewer"]), membershipController.getListMembers);

// LIST ITEMS
app.post("/listItem/create", authorize(["Authorities","User"]), listItemController.createListItem);
app.post("/listItem/check", authorize(["Authorities","User"]), listItemController.checkListItem);
app.get("/listItem/list", authorize(["Authorities","User","Viewer"]), listItemController.listListItems);

app.use(errorHandler);
module.exports = app;
