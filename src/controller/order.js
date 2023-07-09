const express = require("express");
const res = require("express/lib/response");
const order = require("../models/order");
const orderSchema = require("../models/order");
const ImageModel = require("../models/product");

// exports.postOrder = async (req, res, next) => {
//   console.log("Congrats! The postOrder API has been hit.");
//   const {
//     customerId,
//     firstName,
//     lastName,
//     phoneNo,
//     town,
//     streetNo,
//     houseNo,
//     shippingMethod,
//     paymentMethod,
//     orderItems,
//     additionalComments,
//     orderDate, // Date of mongodb
//     deliveryDate,
//     subTotal,
//     shippingCost,
//     totalPrice,
//     orderId,
//     status, // should be pending from backend
//   } = req.body;

//   console.log(orderId);
//   console.log(status);
//   console.log(orderItems[0].productId);
//   let products = [];
//   for (let i = 0; i < orderItems.length; i++) {
//     console.log(orderItems[i].productId);

//     products[i] = await ImageModel.findOne({ _id: orderItems[i].productId });
//     // Do something with the product...
//   }
//   let productQuantity = [];
//   for (let i = 0; i < orderItems.length; i++) {
//     productQuantity[i] = orderItems[i].productQuantity;
//     if (productQuantity <= 0) {
//       return res.send("Please enter a positive number for quantity");
//     }
//   }
//   console.log(productQuantity);
//   //
//   let productId = [];
//   for (let i = 0; i < orderItems.length; i++) {
//     productId[i] = orderItems[i].productId;
//     console.log("Product ID:", productId);
//   }
//   // if (product.stock < 0) {
//   //   return res.send(
//   //     "Not enough products available. Decrease the quantity or contact the administration"
//   //   );
//   // }

//   for (let i = 0; i < orderItems.length; i++) {
//     console.log(orderItems[i].productId);
//     products[i] = await ImageModel.findOne({ _id: orderItems[i].productId });
//     if (products[i].stock < 0) {
//       return res.send(
//         "Not enough products available. Decrease the quantity or contact the administration"
//       );
//     }

//     // products.push(product); // Add the product to the products array
//   }
//   // const stockMinusQuantity = await
//   const checkForDuplicay = await orderSchema.findOne({
//     orderId: orderId,
//   });
//   if (checkForDuplicay) {
//     return res.status(403).json({ message: "Please Enter a unique orderId" });
//   }
//   //stock minus quantity
//   const stock = [];
//   for (let i = 0; i < orderItems.length; i++) {
//     const productStock = await ImageModel.findOne({
//       productName: orderItems[i].productName,
//     });
//     stock[i] = parseFloat(products[i].stock);
//     console.log(stock[i]);
//   }
//   //temporary loop
//   for (let i = 0; i < orderItems.length; i++) {
//     console.log("products[i].stock)= " + products[i].stock);
//   }

//   for (let i = 0; i < orderItems.length; i++) {
//     products[i].stock = stock[i] - productQuantity[i];
//     await products[i].save();
//   }
//   //decrease quantity from product.stock
//   // await product.save();
//   for (let i = 0; i < orderItems.length; i++) {
//     if (products[i].stock < 0) {
//       console.log(i + "=" + orderItems[i].productQuantity);
//       products[i].stock = products[i].stock + orderItems[i].productQuantity;
//       await products[i].save();
//       return res.send("Not enough products");
//     }
//   }
// }

// 444444444444444444444444444444444444444

exports.postOrder = async (req, res, next) => {
  console.log("Congrats! The postOrder API has been hit.");
  const {
    customerId,
    firstName,
    lastName,
    phoneNo,
    town,
    streetNo,
    houseNo,
    shippingMethod,
    paymentMethod,
    orderItems,
    additionalComments,
    deliveryDate,
    subTotal,
    shippingCost,
    totalPrice,
    orderId,
    status,
  } = req.body;

  console.log(orderId);
  console.log(status);
  console.log(orderItems[0].productId);

  // Retrieve product information for each order item
  let products = [];
  let productQuantities = [];

  for (let i = 0; i < orderItems.length; i++) {
    console.log(orderItems[i].productId);

    const product = await ImageModel.findOne({ _id: orderItems[i].productId });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < orderItems[i].productQuantity) {
      return res.send(
        "Not enough products available. Decrease the quantity or contact the administration"
      );
    }

    products.push(product);
    productQuantities.push(orderItems[i].productQuantity);
  }

  console.log(productQuantities);

  // Decrease product stock and check if stock is sufficient
  // for (let i = 0; i < products.length; i++) {
  //   products[i].stock -= productQuantities[i];

  //   if (products[i].stock < 0) {
  //     // Revert the stock changes and send an error response
  //     products[i].stock += productQuantities[i];
  //     await products[i].save();

  //     return res.send("Not enough products");
  //   }

  //   await products[i].save();
  // }

  // Decrease product stock and check if stock is sufficient
  for (let i = 0; i < products.length; i++) {
    // Check if product quantity is a valid number
    if (isNaN(productQuantities[i])) {
      // Handle the case where product quantity is not a valid number
      // You can choose to skip the stock decrease or handle it differently
      continue;
    }

    products[i].stock -= productQuantities[i];

    if (products[i].stock < 0) {
      // Revert the stock changes and send an error response
      products[i].stock += productQuantities[i];
      await products[i].save();

      return res.send("Not enough products");
    }

    await products[i].save();
  }

  // Check for duplicate orderId
  const checkForDuplicate = await orderSchema.findOne({ orderId: orderId });
  if (checkForDuplicate) {
    return res.status(403).json({ message: "Please enter a unique orderId" });
  }

  const order = new orderSchema({
    customerId,
    firstName,
    lastName,
    phoneNo,
    town,
    streetNo,
    houseNo,
    shippingMethod,
    paymentMethod,
    orderItems,
    additionalComments,
    orderDate: new Date(), // Date of mongodb
    deliveryDate,
    subTotal,
    shippingCost,
    totalPrice,
    orderId,
    status, // should be pending
  });

  // Save the order in the database
  const savedOrder = await order.save();
  res.status(201).json({
    orderDetails: savedOrder,
    message: "Your order has been successfully stored.",
  });
};

exports.deleteOrder = async (req, res, next) => {
  console.log("Congratulation! The delete order API has been called");
  const orderId = req.params.id;
  // const OID = orderId
  console.log("orderid = " + orderId);
  orderSchema.findOneAndDelete({ orderId: orderId }, function (error, docs) {
    if (error) {
      res.send("Error occured.");
    } else {
      if (docs === null) {
        res.send("Wrong ID! No product with this id in the database");
      } else {
        res.send("The order with id = " + orderId + " has been deleted.");
        console.log("data = " + docs);
      }
    }
  });
};

exports.viewOrders = async (req, res, next) => {
  console.log("Congratulatios my brother! The  view orders API has been hit.");
  try {
    const results = await orderSchema.find({});
    res.send(results);
  } catch (error) {
    console.log(
      "An error occured while we were displaying the orders: which is:= " +
        error.message
    );
  }
};

//single order api is below
exports.viewSingleOrder = async (req, res, next) => {
  console.log("viewSingleOrder API called");
  const id = req.params.id;
  console.log(id);
  try {
    const singleOrder = await orderSchema.findOne({ orderId: id });
    res.send(singleOrder);
  } catch (error) {
    res.send("wrong order id entered");
  }
};

exports.searchOrders = async (req, res, next) => {
  console.log("The filter products API has been called.");
  // const { totalPrice } = req.query.totalPrice;
  // console.log(totalPrice);
  // const queryObject = {};

  // console.log(queryObject);
  // const totalPricee = req.params.key;
  console.log(req.query);

  const myData = await orderSchema.find(req.query, { __v: 0 });
  res.status(200).json({
    status: "success",
    NoOfresults: myData.length,
    data: {
      myData,
    },
  });
};


exports.updateOrderStatus = async (req, res, next) => {
  console.log("updateOrderStatus API called");
  const orderId = req.params.id;
  const { status } = req.body;

  try {
    const order = await orderSchema.findOne({ orderId: orderId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status" });
  }
};
