const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userID: { type: Schema.ObjectId, ref: "User", required: true },
  cartData: {
    type: [
      {
        productId: { type: Schema.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    required: true,
  },
});

module.exports = mongoose.model("Cart", cartSchema);
