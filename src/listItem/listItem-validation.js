const Joi = require("joi");

const listItemCreateSchema = Joi.object({
    listId: Joi.string().required(),
    name: Joi.string().min(1).max(200).required(),
    quantity: Joi.object({
        value: Joi.number().min(0.0001).required(),
        unit: Joi.string().min(1).max(50).required()
    }).optional(),
    note: Joi.string().max(1000).allow("", null),
    position: Joi.number().integer().min(0).optional()
});

const listItemCheckSchema = Joi.object({
    id: Joi.string().required(),
    isChecked: Joi.boolean().required()
});

const listItemListSchema = Joi.object({
    listId: Joi.string().required(),
    sort: Joi.string().valid("position", "createdAt", "checked").default("position"),
    onlyUnchecked: Joi.boolean().default(false)
});

module.exports = {
    listItemCreateSchema,
    listItemCheckSchema,
    listItemListSchema
};
