const mongoose = require("mongoose");

const orderShema = mongoose.Schema({
  customerId: {
    type: String,
    unique: true,
  },
  firstName: {
    type: String, //   required: true,
    //type: mongoose.Schema.Types.ObjectId,
    //ref: "orderItem"
  },
  lastName: {
    type: String, //   required: true,
    //type: mongoose.Schema.Types.ObjectId,
    //ref: "orderItem"
  },
  phoneNo: {
    type: String,
    //  required: true,
  },
  town: {
    type: String,
    // require: [true, "product name is required"],
  },
  streetNo: {
    type: String,
    // require: [true, "product name is required"],
  },
  houseNo: {
    type: String,
    // require: [true, "product name is required"],
  },
  shippingMethod: {
    type: String, // required: true,
  },
  paymentMethod: {
    type: String,
  },
  orderId: {
    type: String,
    unique: true,
    //required: true,
  },
  orderItems: [
    {
      productName: String,
      productId: String,
      productQuantity: Number,
      unitPrice: Number,
      productImage: String,
    },
  ],
  additionalComments: {
    type: String,
  },
  orderDate: {
    //when user places order
    type: Date,
    default: Date.now,
    // required: true,
  },
  deliveryDate: {
    // when will the order be delivered
    type: String,
    // required: true,
  },

  subTotal: {
    type: Number,
  },
  shippingCost: {
    type: Number,
  },
  totalPrice: {
    type: Number,
    // required: true,
  },
  status: {
    type: String,
    default: ["pending"],
    //  required: true,
  },
});
module.exports = orderModel = mongoose.model("customersOrders", orderShema);
