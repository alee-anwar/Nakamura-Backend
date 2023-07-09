const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const res = require("express/lib/response");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ImageModel = require("../models/product");

const cloudinary = require("cloudinary").v2;
// const MyModel = require("../models/myModel");

cloudinary.config({
  cloud_name: "dldvi4iyz",
  api_key: "233835657197369",
  api_secret: "8VLn1vP3ZUio2ksC7_oYKv7o4Ks",
});

// mongoose.Schema.Types.Boolean.convertToTrue.add("Active");
// mongoose.Schema.Types.Boolean.convertToFalse.add("Deactive");

// function to save product details with image as url
exports.testPostProduct = async (req, res, next) => {
  console.log("The testPostProduct API has been hit.");
  // ImageModel.deleteMany();
  //active and unactive

  //
  // duplicateProduct = ImageModel.findOne({ productTitle: req.body.productTitle })
  if (await ImageModel.findOne({ productTitle: req.body.productTitle })) {
    return res.status(403).json({
      message: "Product with the same name already exists.",
    });
  }
  if (req.body.price <= 0) {
    return res.status(403).json({ message: "The price should be positive" });
  }
  // if (await ImageModel.findOne({ sku: req.body.sku })) {
  //   return res
  //     .status(403)
  //     .json({ message: "The sku should be a unique value" });
  // }
  try {
    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // make a new File document with the Cloudinary URL
    const file = new ImageModel({
      productTitle: req.body.productTitle,
      sku: req.body.sku,
      color: req.body.color,
      size: req.body.size,
      price: req.body.price,
      status: req.body.status,
      tag: req.body.tag,
      description: req.body.description,
      stock: req.body.stock,
      date: req.body.date,
      category: req.body.category,
      subcategory: req.body.subcategory,
      image: result.secure_url,
    });

    // Save the File document to the MongoDB database
    await file.save();

    res.status(200).json({
      url: result.secure_url,
      success: true,
      message: "Product has been uploaded successfully",
    });
  } catch (err) {
    next(err);
  }
};

// const product = require("../models/product");

// exports.postProduct = async (req, res, next) => {
//   console.log("The uploadProduct API has been called.");

//   const {
//     productTitle,
//     sku,
//     color,
//     price,
//     size,
//     status,
//     tag,
//     description,
//     stock,
//     date,
//     category,
//     image,
//   } = req.body;

//   const checkProduct = await ImageModel.findOne({
//     productTitle: req.body.productTitle,
//   });
//   if (checkProduct) {
//     return res.status(403).json({
//       message: "Product with the same name already exists.",
//     });
//   }
//   if (await ImageModel.findOne({ sku: req.body.sku })) {
//     return res
//       .status(403)
//       .json({ message: "The sku should be a unique value" });
//   }
//   if (req.body.price <= 0) {
//     return res.status(403).json({ message: "The price should be positive" });
//   }
//   try {
//     const newProduct = new ImageModel({
//       productTitle: productTitle,
//       sku: sku,
//       color: color,
//       size: size,
//       price: price,
//       status: status,
//       tag: tag,
//       description: description,
//       stock: stock,
//       date: date,
//       category: category,
//       image: image,
//     });

//     await newProduct.save().then((newProduct) => {
//       res.status(201).json({
//         message: "The product description has been successfully uploaded..",
//       });
//     });
//   } catch (error) {
//     console.log("error = " + error);
//     return res.status(403).json({ message: "Could not upload the product." });
//   }
// };

exports.viewProducts = async (req, res, next) => {
  console.log("The view products API has been hit");
  try {
    const results = await ImageModel.find({}, { __v: 0 });
    res.send(results);
  } catch (error) {
    console.log(error.message);
  }
};

exports.productDescription = async (req, res, next) => {
  console.log("product Descripioin API called");
  const deleteId = req.params.id;
  const productDescription = await ImageModel.findOne(
    { _id: deleteId },
    { __v: 0 }
  );
  try {
    ImageModel.findOne({ _id: deleteId }, function (err, docs) {
      if (err) {
        res.send("Error! You have entered wrong key type.");
      } else {
        if (docs === null) {
          res.send("No record with mentioned id");
        } else {
          res.status(201).json({
            message: "product description fetched from database",
            productdescription: productDescription,
          });
        }
      }
    });
  } catch (error) {
    console.log("error = " + error);
  }
};

exports.updateProduct = async (req, res, next) => {
  console.log("UpdateProduct API has been hit.");

  //write update api code from United Top Tech
  let updatedId = req.params.id;
  // let deleteId = req.params.id;
  //below are checks
  const checkProduct = await ImageModel.findOne({
    productTitle: req.body.productTitle,
  });

  console.log(req.body.productTitle);
  // if (checkProduct && checkProduct != req.body.productTitle) {
  //   //await ImageModel.deleteMany({ productTitle: "coke" }); //this code is for deleteing
  //   // records of database
  //   return res.status(403).json({
  //     message: "Product with the same name already exists.",
  //   });
  // }

  try {
    ImageModel.findOneAndUpdate(
      { _id: updatedId },
      {
        // $set: req.body,
        $set: {
          productTitle: req.body.productTitle,
          color: req.body.color,
          sku: req.body.sku,
          size: req.body.size,
          price: req.body.price,
          status: req.body.status,
          tag: req.body.tag,
          description: req.body.description,
          quantity: req.body.quantity,
          date: req.body.date,
          category: req.body.category,
          subcategory: req.body.subcategory,
          image: req.body.image,
        },
      },
      { new: true },
      (err, data) => {
        if (data === null) {
          res.send("No data found");
        } else {
          // res.send("Congratulation: Data updated. updatedProduct = " + data);
          return res.status(201).json({
            message: "Congratulation: Data updated. updatedProduct = " + data,
          });
        }
      }
    );
  } catch (error) {
    return res.status(201).json({
      message: "Could not update the product",
    });
  }
};

exports.deleteProduct = async (req, res, next) => {
  console.log("The delete product API has been hit.");
  let deleteId = req.params.id;
  console.log(deleteId);
  const productAvailable = ImageModel.find({ _id: deleteId });

  try {
    ImageModel.findOneAndDelete({ _id: deleteId }, function (err, docs) {
      if (err) {
        res.send("Error! You have entered wrong id type.");
      } else {
        if (docs === null) {
          res.send("No record with given id");
        } else {
          res.send(
            "The requested record with id = " + deleteId + " has been deleted"
          );
        }
      }
    });
  } catch (error) {
    console.log("Could not delete the product." + error);
  }
};
exports.searchProducts = async (req, res, next) => {
  console.log("The searchProducts API has been called.");
  const searchedForItem = req.query.productTitle;
  console.log(searchedForItem);

  // make a regular expression pattern for the search term
  const searchTerm = new RegExp(searchedForItem, "i");

  try {
    const searchedForProduct = await ImageModel.find({
      productTitle: searchTerm,
    });

    res.status(200).json({
      status: "success",
      NoOfresults: searchedForProduct.length,
      data: {
        searchedForProduct,
      },
    });
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred while searching for products.",
    });
  }
};

// exports.searchProducts = async (req, res, next) => {
//   console.log("The searchProducts API has been called.");
//   const { productTitle } = req.query;
//   const queryObject = {};
//   if (productTitle) {
//     queryObject.productTitle = productTitle;
//   }
//   console.log(productTitle);

//   // const searchedForProduct = await ImageModel.find(queryObject);

//   const searchedForProduct = await ImageModel.find({
//     productTitle: { $regex: productTitle, $options: "i" },
//   });

//   res.status(200).json({
//     status: "success",
//     NoOfresults: searchedForProduct.length,
//     data: {
//       searchedForProduct,
//     },
//   });
// };

exports.filterProducts = async (req, res, next) => {
  console.log("filterProducts API has been hit.");
  const searchedForItem = req.query;
  console.log(searchedForItem);
  const searchedForProduct = await ImageModel.find(req.query, {
    __v: 0,
  });
  res.status(200).json({
    status: "success",
    NoOfresultsFiltered: searchedForProduct.length,
    data: {
      searchedForProduct,
    },
  });
};
