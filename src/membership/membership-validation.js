const Joi = require("joi");

const membershipAddUserSchema = Joi.object({
    listId: Joi.string().required(),
    userId: Joi.string().required(),
    role: Joi.string().valid("owner", "editor", "viewer").required()
});

const membershipGetListMembersSchema = Joi.object({
    listId: Joi.string().required()
});

module.exports = {
    membershipAddUserSchema,
    membershipGetListMembersSchema
};
