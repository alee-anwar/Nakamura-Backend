// const mongoose = require("mongoose");

// const ImageSchema = new mongoose.Schema({
//   productTitle: {
//     type: String,
//     // unique: true,
//     required: [true, "Product Title should be provided"],
//   },
//   sku: {
//     type: Number,
//     unique: true,
//   },
//   color: {
//     type: String,
//   },
//   size: {
//     type: String,
//   },
//   price: {
//     type: Number,
//     required: true,
//   },
//   status: {
//     type: String,
//     required: true,
//   },
//   tag: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     required: true,
//   },
//   stock: {
//     type: Number,
//     required: true,
//   },
//   date: {
//     type: Date,
//     default: Date.now,
//     required: true,
//   },
//   category: {
//     type: String,
//     required: true,
//   },
//   image: {
//     type: String,
//     required: [true, "Please include the product image URL"],
//   },
// });

// const ImageModel = mongoose.model("Image", ImageSchema);

// module.exports = ImageModel;


const mongoose = require("mongoose");

const ImageSchema = mongoose.Schema({
  productTitle: {
    type: String,
    unique: true,
    required: [true, "product Title should be written"],
  },
  sku: {
    type: Number,
    unique: true,

    // required: [true, "Please Include the product sku"],
  },
  color: {
    type: String,
    // required: true,
  },
  size: {
    type: String,
    // required: [true, "Please include the product size"],
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    // validate: {
    //   validator: function (value) {
    //     return value >= 0;
    //   },
    //   message: "Quantity must be greater than 0",
    // },
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: [true, "Please Include the product image URL"],
  },
});

module.exports = ImageModel = mongoose.model("imageModel", ImageSchema);