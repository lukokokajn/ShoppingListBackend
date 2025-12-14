const { mongoose } = require("../db/mongo");
const { Schema } = mongoose;


const UserSchema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        name: {
            first: { type: String, required: true },
            last: { type: String, required: true },
            full: { type: String, required: true }
        }
    },
    { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
