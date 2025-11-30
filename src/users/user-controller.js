const { v4: uuidv4 } = require("uuid"); // může klidně zůstat, i když ho nepotřebujeme
const { userCreateSchema, userGetSchema } = require("./user-validation");
const User = require("../models/user");

function mapUserToDto(user, uuAppErrorMap = {}) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    uuAppErrorMap
  };
}

async function createUser(req, res, next) {
  const uuAppErrorMap = {};

  const { error, value } = userCreateSchema.validate(req.body, {
    abortEarly: false
  });

  if (error) {
    uuAppErrorMap["userCreate/invalidDtoIn"] = {
      message: "DtoIn is not valid.",
      details: error.details.map((d) => d.message),
      severity: "error"
    };
    return res.status(400).json({ uuAppErrorMap });
  }

  try {
    const existing = await User.findOne({ email: value.email }).lean();
    if (existing) {
      uuAppErrorMap["userCreate/emailNotUnique"] = {
        message: `User with email '${value.email}' already exists.`,
        severity: "error"
      };
      return res.status(400).json({ uuAppErrorMap });
    }

    const fullName = `${value.name.first} ${value.name.last}`;

    const user = await User.create({
      email: value.email,
      name: {
        first: value.name.first,
        last: value.name.last,
        full: fullName
      }
    });

    return res.json(mapUserToDto(user, uuAppErrorMap));
  } catch (err) {
    return next(err);
  }
}

async function getUser(req, res, next) {
  const uuAppErrorMap = {};

  const { error, value } = userGetSchema.validate(req.query, {
    abortEarly: false
  });

  if (error) {
    uuAppErrorMap["userGet/invalidDtoIn"] = {
      message: "DtoIn is not valid.",
      details: error.details.map((d) => d.message),
      severity: "error"
    };
    return res.status(400).json({ uuAppErrorMap });
  }

  try {
    const user = await User.findById(value.id).lean();

    if (!user) {
      uuAppErrorMap["userGet/userDoesNotExist"] = {
        message: `User with id '${value.id}' does not exist.`,
        severity: "error"
      };
      return res.status(404).json({ uuAppErrorMap });
    }

    return res.json(mapUserToDto(user, uuAppErrorMap));
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createUser,
  getUser
};
