const { mongoose } = require("../db/mongo");
const { Schema } = mongoose;


const QuantitySchema = new Schema(
    {
        value: { type: Number, required: true },
        unit: { type: String, required: true }
    },
    { _id: false }
);

const ListItemSchema = new Schema(
    {
        listId: { type: Schema.Types.ObjectId, ref: "ShoppingList", required: true },
        createdBy: { type: String, required: true }, // uuIdentity
        name: { type: String, required: true },
        quantity: { type: QuantitySchema, default: null },
        note: { type: String, default: "" },
        isChecked: { type: Boolean, default: false },
        checkedBy: { type: String, default: null },
        position: { type: Number, default: 0 }
    },
    { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

ListItemSchema.index({ listId: 1, position: 1 });

const ListItem = mongoose.model("ListItem", ListItemSchema);

module.exports = ListItem;
