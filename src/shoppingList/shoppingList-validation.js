const Joi = require("joi");

const shoppingListCreateSchema = Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).allow("", null),
    invites: Joi.array()
        .items(
            Joi.object({
                email: Joi.string().email().required(),
                token: Joi.string().optional()
            })
        )
        .optional()
});

const shoppingListGetSchema = Joi.object({
    id: Joi.string().required()
});

const shoppingListListMySchema = Joi.object({
    pageIndex: Joi.number().integer().min(0).default(0),
    pageSize: Joi.number().integer().min(1).max(100).default(50)
});

module.exports = {
    shoppingListCreateSchema,
    shoppingListGetSchema,
    shoppingListListMySchema
};
