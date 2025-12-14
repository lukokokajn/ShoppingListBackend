const { mongoose } = require("../db/mongo");
const { Schema } = mongoose;


const InviteSchema = new Schema(
    {
        email: { type: String, required: true },
        token: { type: String }
    },
    { _id: false }
);

const ShoppingListSchema = new Schema(
    {
        ownerId: { type: String, required: true }, // uuIdentity
        title: { type: String, required: true },
        description: { type: String, default: "" },
        invites: { type: [InviteSchema], default: [] }
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

const ShoppingList = mongoose.model("ShoppingList", ShoppingListSchema);

module.exports = ShoppingList;
