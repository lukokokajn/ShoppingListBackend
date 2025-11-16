const { v4: uuidv4 } = require("uuid");
const store = require("../data/store");
const {
    shoppingListCreateSchema,
    shoppingListGetSchema,
    shoppingListListMySchema
} = require("./shoppingList-validation");

function createShoppingList(req, res) {
    const uuAppErrorMap = {};

    const { error, value } = shoppingListCreateSchema.validate(req.body, {
        abortEarly: false
    });

    if (error) {
        uuAppErrorMap["shoppingListCreate/invalidDtoIn"] = {
            message: "DtoIn is not valid.",
            details: error.details.map((d) => d.message),
            severity: "error"
        };
        return res.status(400).json({ uuAppErrorMap });
    }

    const now = new Date().toISOString();

    const newList = {
        id: uuidv4(),
        ownerId: req.user.uuIdentity,
        title: value.title,
        description: value.description || "",
        invites: value.invites || [],
        createdAt: now
    };

    store.shoppingLists.push(newList);

    // automaticky membership pro ownera
    store.memberships.push({
        id: uuidv4(),
        listId: newList.id,
        userId: req.user.uuIdentity,
        role: "owner",
        createdAt: now
    });

    return res.json({
        ...newList,
        uuAppErrorMap
    });
}

function getShoppingList(req, res) {
    const uuAppErrorMap = {};

    const { error, value } = shoppingListGetSchema.validate(req.query, {
        abortEarly: false
    });

    if (error) {
        uuAppErrorMap["shoppingListGet/invalidDtoIn"] = {
            message: "DtoIn is not valid.",
            details: error.details.map((d) => d.message),
            severity: "error"
        };
        return res.status(400).json({ uuAppErrorMap });
    }

    const list = store.shoppingLists.find((l) => l.id === value.id);

    if (!list) {
        uuAppErrorMap["shoppingListGet/listDoesNotExist"] = {
            message: `Shopping list with id '${value.id}' does not exist.`,
            severity: "error"
        };
        return res.status(404).json({ uuAppErrorMap });
    }

    return res.json({
        ...list,
        uuAppErrorMap
    });
}

function listMyShoppingLists(req, res) {
    const uuAppErrorMap = {};

    const { error, value } = shoppingListListMySchema.validate(req.query, {
        abortEarly: false
    });

    if (error) {
        uuAppErrorMap["shoppingListListMy/invalidDtoIn"] = {
            message: "DtoIn is not valid.",
            details: error.details.map((d) => d.message),
            severity: "error"
        };
        return res.status(400).json({ uuAppErrorMap });
    }

    const { pageIndex, pageSize } = value;

    const myMemberships = store.memberships.filter(
        (m) => m.userId === req.user.uuIdentity
    );

    const myListIds = myMemberships.map((m) => m.listId);

    const myLists = store.shoppingLists
        .filter((l) => myListIds.includes(l.id))
        .map((l) => {
            const membership = myMemberships.find((m) => m.listId === l.id);
            return {
                id: l.id,
                title: l.title,
                role: membership ? membership.role : null
            };
        });

    const total = myLists.length;
    const start = pageIndex * pageSize;
    const end = start + pageSize;

    const pageItems = myLists.slice(start, end);

    return res.json({
        itemList: pageItems,
        pageInfo: {
            pageIndex,
            pageSize,
            total
        },
        uuAppErrorMap
    });
}

module.exports = {
    createShoppingList,
    getShoppingList,
    listMyShoppingLists
};
