const { v4: uuidv4 } = require("uuid");
const store = require("../data/store");
const {
    membershipAddUserSchema,
    membershipGetListMembersSchema
} = require("./membership-validation");

function addUserToList(req, res) {
    const uuAppErrorMap = {};

    const { error, value } = membershipAddUserSchema.validate(req.body, {
        abortEarly: false
    });

    if (error) {
        uuAppErrorMap["membershipAddUser/invalidDtoIn"] = {
            message: "DtoIn is not valid.",
            details: error.details.map((d) => d.message),
            severity: "error"
        };
        return res.status(400).json({ uuAppErrorMap });
    }

    const listExists = store.shoppingLists.some((l) => l.id === value.listId);
    if (!listExists) {
        uuAppErrorMap["membershipAddUser/listDoesNotExist"] = {
            message: `Shopping list with id '${value.listId}' does not exist.`,
            severity: "error"
        };
        return res.status(404).json({ uuAppErrorMap });
    }

    const alreadyMember = store.memberships.find(
        (m) => m.listId === value.listId && m.userId === value.userId
    );

    if (alreadyMember) {
        uuAppErrorMap["membershipAddUser/alreadyMember"] = {
            message: "User is already member of this list.",
            severity: "error"
        };
        return res.status(400).json({ uuAppErrorMap });
    }

    const now = new Date().toISOString();

    const membership = {
        id: uuidv4(),
        listId: value.listId,
        userId: value.userId,
        role: value.role,
        createdAt: now
    };

    store.memberships.push(membership);

    return res.json({
        ...membership,
        uuAppErrorMap
    });
}

function getListMembers(req, res) {
    const uuAppErrorMap = {};

    const { error, value } = membershipGetListMembersSchema.validate(req.query, {
        abortEarly: false
    });

    if (error) {
        uuAppErrorMap["membershipGetListMembers/invalidDtoIn"] = {
            message: "DtoIn is not valid.",
            details: error.details.map((d) => d.message),
            severity: "error"
        };
        return res.status(400).json({ uuAppErrorMap });
    }

    const members = store.memberships.filter((m) => m.listId === value.listId);

    return res.json({
        members,
        uuAppErrorMap
    });
}

module.exports = {
    addUserToList,
    getListMembers
};
