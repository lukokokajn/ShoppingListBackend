const Joi=require("joi");
const userCreateSchema=Joi.object({
  email:Joi.string().email().required(),
  name:Joi.object({
    first:Joi.string().min(1).max(100).required(),
    last:Joi.string().min(1).max(100).required()
  }).required()
});
const userGetSchema=Joi.object({id:Joi.string().required()});
module.exports={userCreateSchema,userGetSchema};
