const mongoose = require("../db/mongo");
const { Schema } = mongoose;

const MembershipSchema = new Schema(
    {
        listId: { type: Schema.Types.ObjectId, ref: "ShoppingList", required: true },
        userId: { type: String, required: true }, // uuIdentity
        role: { type: String, enum: ["owner", "editor", "viewer"], required: true }
    },
    { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

MembershipSchema.index({ listId: 1, userId: 1 }, { unique: true });

const Membership = mongoose.model("Membership", MembershipSchema);

module.exports = Membership;
