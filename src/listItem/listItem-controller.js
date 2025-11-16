const { v4: uuidv4 } = require("uuid");
const store = require("../data/store");
const {
    listItemCreateSchema,
    listItemCheckSchema,
    listItemListSchema
} = require("./listItem-validation");

function createListItem(req, res) {
    const uuAppErrorMap = {};

    const { error, value } = listItemCreateSchema.validate(req.body, {
        abortEarly: false
    });

    if (error) {
        uuAppErrorMap["listItemCreate/invalidDtoIn"] = {
            message: "DtoIn is not valid.",
            details: error.details.map((d) => d.message),
            severity: "error"
        };
        return res.status(400).json({ uuAppErrorMap });
    }

    const listExists = store.shoppingLists.some((l) => l.id === value.listId);
    if (!listExists) {
        uuAppErrorMap["listItemCreate/listDoesNotExist"] = {
            message: `Shopping list with id '${value.listId}' does not exist.`,
            severity: "error"
        };
        return res.status(404).json({ uuAppErrorMap });
    }

    const now = new Date().toISOString();

    const newItem = {
        id: uuidv4(),
        listId: value.listId,
        createdBy: req.user.uuIdentity,
        name: value.name,
        quantity: value.quantity || null,
        note: value.note || "",
        isChecked: false,
        checkedBy: null,
        position:
            typeof value.position === "number"
                ? value.position
                : store.listItems.filter((i) => i.listId === value.listId).length,
        createdAt: now
    };

    store.listItems.push(newItem);

    return res.json({
        ...newItem,
        uuAppErrorMap
    });
}

function checkListItem(req, res) {
    const uuAppErrorMap = {};

    const { error, value } = listItemCheckSchema.validate(req.body, {
        abortEarly: false
    });

    if (error) {
        uuAppErrorMap["listItemCheck/invalidDtoIn"] = {
            message: "DtoIn is not valid.",
            details: error.details.map((d) => d.message),
            severity: "error"
        };
        return res.status(400).json({ uuAppErrorMap });
    }

    const item = store.listItems.find((i) => i.id === value.id);

    if (!item) {
        uuAppErrorMap["listItemCheck/itemDoesNotExist"] = {
            message: `List item with id '${value.id}' does not exist.`,
            severity: "error"
        };
        return res.status(404).json({ uuAppErrorMap });
    }

    item.isChecked = value.isChecked;
    item.checkedBy = value.isChecked ? req.user.uuIdentity : null;

    return res.json({
        ...item,
        uuAppErrorMap
    });
}

function listListItems(req, res) {
    const uuAppErrorMap = {};

    const { error, value } = listItemListSchema.validate(req.query, {
        abortEarly: false
    });

    if (error) {
        uuAppErrorMap["listItemList/invalidDtoIn"] = {
            message: "DtoIn is not valid.",
            details: error.details.map((d) => d.message),
            severity: "error"
        };
        return res.status(400).json({ uuAppErrorMap });
    }

    let items = store.listItems.filter((i) => i.listId === value.listId);

    if (value.onlyUnchecked) {
        items = items.filter((i) => !i.isChecked);
    }

    if (value.sort === "createdAt") {
        items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    } else if (value.sort === "checked") {
        items.sort((a, b) => Number(a.isChecked) - Number(b.isChecked));
    } else {
        // default: position
        items.sort((a, b) => a.position - b.position);
    }

    return res.json({
        items,
        uuAppErrorMap
    });
}

module.exports = {
    createListItem,
    checkListItem,
    listListItems
};
