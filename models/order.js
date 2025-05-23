const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    user: {
      userID: { type: Schema.ObjectId, required: true },
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    products: {
      type: [
        {
          productId: { type: Schema.ObjectId, ref: "Product", required: true },
          quantity: { type: Number, required: true, min: 1 },
        },
      ],
      required: true,
    },
    totalAmount: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      required: true,
      enum: ["Waiting for pay", "completed", "cancelled"],
      default: "Waiting for pay",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
