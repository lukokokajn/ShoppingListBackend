const { v4: uuidv4 } = require("uuid"); // nepotřebujeme, ale může zůstat
const ShoppingList = require("../models/shoppingList");
const Membership = require("../models/membership");
const {
    shoppingListCreateSchema,
    shoppingListGetSchema,
    shoppingListListMySchema,
    shoppingListDeleteSchema,
    shoppingListUpdateSchema
} = require("./shoppingList-validation");

function toListDto(list, uuAppErrorMap = {}) {
    return {
        id: list._id.toString(),
        ownerId: list.ownerId,
        title: list.title,
        description: list.description,
        invites: list.invites || [],
        createdAt: list.createdAt,
        uuAppErrorMap
    };
}

async function createShoppingList(req, res, next) {
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

    try {
        const list = await ShoppingList.create({
            ownerId: req.user.uuIdentity,
            title: value.title,
            description: value.description || "",
            invites: value.invites || []
        });

        await Membership.create({
            listId: list._id,
            userId: req.user.uuIdentity,
            role: "owner"
        });

        return res.json(toListDto(list, uuAppErrorMap));
    } catch (err) {
        return next(err);
    }
}

async function getShoppingList(req, res, next) {
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

    try {
        const list = await ShoppingList.findById(value.id).lean();
        if (!list) {
            uuAppErrorMap["shoppingListGet/listDoesNotExist"] = {
                message: `Shopping list with id '${value.id}' does not exist.`,
                severity: "error"
            };
            return res.status(404).json({ uuAppErrorMap });
        }

        // můžeš sem doplnit kontrolu membership, když chceš být přísný

        return res.json(toListDto(list, uuAppErrorMap));
    } catch (err) {
        return next(err);
    }
}

async function listMyShoppingLists(req, res, next) {
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

    try {
        const memberships = await Membership.find({
            userId: req.user.uuIdentity
        }).lean();

        const listIds = memberships.map((m) => m.listId);

        const lists = await ShoppingList.find({ _id: { $in: listIds } }).lean();

        const items = lists.map((l) => {
            const m = memberships.find(
                (mem) => mem.listId.toString() === l._id.toString()
            );
            return {
                id: l._id.toString(),
                title: l.title,
                role: m ? m.role : null
            };
        });

        const total = items.length;
        const start = pageIndex * pageSize;
        const pageItems = items.slice(start, start + pageSize);

        return res.json({
            itemList: pageItems,
            pageInfo: {
                pageIndex,
                pageSize,
                total
            },
            uuAppErrorMap
        });
    } catch (err) {
        return next(err);
    }
}

async function deleteShoppingList(req, res, next) {
    const uuAppErrorMap = {};

    const { error, value } = shoppingListDeleteSchema.validate(req.body, {
        abortEarly: false
    });

    if (error) {
        uuAppErrorMap["shoppingListDelete/invalidDtoIn"] = {
            message: "DtoIn is not valid.",
            details: error.details.map((d) => d.message),
            severity: "error"
        };
        return res.status(400).json({ uuAppErrorMap });
    }

    try {
        const list = await ShoppingList.findById(value.id);
        if (!list) {
            uuAppErrorMap["shoppingListDelete/listDoesNotExist"] = {
                message: `Shopping list with id '${value.id}' does not exist.`,
                severity: "error"
            };
            return res.status(404).json({ uuAppErrorMap });
        }

        // jednoduchá autorizace: owner nebo Authorities
        if (
            list.ownerId !== req.user.uuIdentity &&
            req.user.profile !== "Authorities"
        ) {
            uuAppErrorMap["system/unauthorized"] = {
                message: "User is not allowed to delete this list.",
                severity: "error"
            };
            return res.status(403).json({ uuAppErrorMap });
        }

        await ShoppingList.deleteOne({ _id: list._id });
        await Membership.deleteMany({ listId: list._id });
        // klidně můžeš přidat deleteMany z ListItem, když ho naimportuješ

        return res.json({
            id: value.id,
            uuAppErrorMap
        });
    } catch (err) {
        return next(err);
    }
}

async function updateShoppingList(req, res, next) {
    const uuAppErrorMap = {};

    const { error, value } = shoppingListUpdateSchema.validate(req.body, {
        abortEarly: false
    });

    if (error) {
        uuAppErrorMap["shoppingListUpdate/invalidDtoIn"] = {
            message: "DtoIn is not valid.",
            details: error.details.map((d) => d.message),
            severity: "error"
        };
        return res.status(400).json({ uuAppErrorMap });
    }

    try {
        const list = await ShoppingList.findById(value.id);
        if (!list) {
            uuAppErrorMap["shoppingListUpdate/listDoesNotExist"] = {
                message: `Shopping list with id '${value.id}' does not exist.`,
                severity: "error"
            };
            return res.status(404).json({ uuAppErrorMap });
        }

        if (
            list.ownerId !== req.user.uuIdentity &&
            req.user.profile !== "Authorities"
        ) {
            uuAppErrorMap["system/unauthorized"] = {
                message: "User is not allowed to update this list.",
                severity: "error"
            };
            return res.status(403).json({ uuAppErrorMap });
        }

        if (value.title !== undefined) list.title = value.title;
        if (value.description !== undefined)
            list.description = value.description || "";

        await list.save();

        return res.json(toListDto(list, uuAppErrorMap));
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    createShoppingList,
    getShoppingList,
    listMyShoppingLists,
    deleteShoppingList,
    updateShoppingList
};
