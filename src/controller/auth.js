// controllers/authController.js
const User = require("../models/auth");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const secret = require("./config").secret; //contains secret key used to sign tokens
const emailValidator = require("node-email-validation");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

//cloundinary settings
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dldvi4iyz",
  api_key: "233835657197369",
  api_secret: "8VLn1vP3ZUio2ksC7_oYKv7o4Ks",
});

const login = async (req, res, next) => {
  console.log("signin api has been hit");

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };
    let userInfo = await User.find(
      { email: email },
      { __v: 0, password: 0, _id: 0 }
    );

    jwt.sign(payload, secret, { expiresIn: "5 days" }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        User: userInfo,
        message: "Congratulations! You have been successfully logged in",
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const signup = async (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  console.log(firstName);
  console.log("signup api has been hit");
  const passwordLength = password.length;

  //check password and confirmPassword
  if (password != confirmPassword) {
    return res.status(400).json({
      message: "Password and confirm password don't match",
    });
  }

  if (passwordLength < 6) {
    return res.status(400).json({
      message: "Password is too small ",
    });
  }
  if (passwordLength > 30) {
    return res.status(400).json({
      message: "Password is too long ",
    });
  }

  const userExists = await User.findOne({ email });
  const isEmailValid = emailValidator.is_email_valid(email);
  if (!isEmailValid) {
    return res
      .status(403)
      .json({ message: "Please provide a valid email address" });
  }

  if (userExists) {
    return res
      .status(400)
      .json({ message: "User with this email is already registered." });
  }

  const newUser = new User({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
  });

  newUser.save((err, user) => {
    if (err) return res.status(500).send(err);
    res.status(201).json({ message: "User registered successfully." });
  });
};

const adminAccountManagement = async (req, res, next) => {
  console.log("admin account management api called");
  //  let deleteId = req.params.id;

  const userId = req.params.id;

  console.log(userId);
  try {
    const { firstName, lastName, email, phoneNo, age } = req.body;
    const userUpdateInformation = await User.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phoneNo: phoneNo,
        age: age,
      },
      { new: true }
    );
    const fetchUpdateInformation = await User.findOne(
      { _id: userId },
      { __v: 0, password: 0, _id: 0 }
    );
    //  let userInfo = await User.find(
    //   { email: email },
    //   { __v: 0, password: 0, _id: 0 }
    // );
    //send response
    return res.status(200).json({
      message: "Your information has been successfully updated",
      status: true,
      data: fetchUpdateInformation,
    });
  } catch (error) {}

  //sample
  // const userPassword = await users.findOneAndUpdate(
  //   { email: Email },
  //   { password: newPassword },
  //   { new: true }
  // );
};

//Below are customer APIs
const customerSignup = async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    phoneNo,
    age,
  } = req.body;
  console.log(firstName);
  console.log("signup api has been hit");
  //check password adn confirmPassword
  if (password != confirmPassword) {
    return res.status(400).json({
      message: "Password and confirm password don't match",
    });
  }

  //check password length
  const passwordLength = password.length;

  if (passwordLength < 6) {
    return res.status(400).json({
      message: "Password is too small ",
    });
  }
  if (passwordLength > 30) {
    return res.status(400).json({
      message: "Password is too long ",
    });
  }

  const userExists = await User.findOne({ email });
  const isEmailValid = emailValidator.is_email_valid(email);
  if (!isEmailValid) {
    return res
      .status(403)
      .json({ message: "Please provide a valid email address" });
  }

  if (userExists) {
    return res
      .status(400)
      .json({ message: "User with this email is already registered." });
  }

  const newUser = new User({
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password,
    age: age,
    phoneNo: phoneNo,
  });

  newUser.save((err, user) => {
    if (err) return res.status(500).send(err);
    res
      .status(201)
      .json({ message: "Customer has been registered successfully." });
  });
};

// const customerLogin = async (req, res, next) => {

//   console.log("user login api is called");

//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { email, password } = req.body;

//   try {
//     let user = await User.findOne({ email });

//     if (!user) {
//       return res.status(400).json({ message: "Invalid Credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid Credentials" });
//     }

//     const payload = {
//       user: {
//         id: user.id,
//         email: user.email,
//       },
//     };
//     let userInfo = await User.find(
//       { email: email },
//       { __v: 0, password: 0, _id: 0 }
//     );

//     jwt.sign(payload, secret, { expiresIn: "2 days" }, (err, token) => {
//       if (err) throw err;
//       res.json({
//         token,
//         User: userInfo,
//         message: "Congratulations! You have been successfully logged in",
//       });
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server error");
//   }
// };

//customerAccountManagement

//login with phone number.
const customerLogin = async (req, res, next) => {
  console.log("user login api is called");

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { phoneNo, password } = req.body;
  if (phoneNo.length != 10) {
    return res.send("phone number length should be 10");
  }

  try {
    let user = await User.findOne({ phoneNo });

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const payload = {
      user: {
        id: user.id,
        phoneNo: user.phoneNo,
      },
    };
    let userInfo = await User.find(
      { phoneNo: phoneNo },
      { __v: 0, password: 0 }
    );

    jwt.sign(payload, secret, { expiresIn: "2 days" }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        User: userInfo,
        message: "Congratulations! You have been successfully logged in",
      });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
const customerAccountManagement = async (req, res, next) => {
  console.log("Customer account management api called");
  //  let deleteId = req.params.id;

  const userId = req.params.id;
  // var newEmail = req.body.newEmal;
  const checkUser = await User.findOne({ userId });
  if (!checkUser) {
    return res.status(400).json("No  User with this id");
    // console.log("User with give user id does not exist");
  }

  console.log(userId);
  try {
    // console.log("debug");

    const { firstName, lastName, newEmail, phoneNo, age } = req.body;
    //below picture uploading to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // const uploadPictureToCloudinary = await cloudinary.uploader(req.file.path);
    console.log(age);

    const userUpdateInformation = await User.findOneAndUpdate(
      {
        phoneNo: phoneNo,
      },
      {
        firstName: firstName,
        lastName: lastName,
        email: newEmail,
        phoneNo: phoneNo,
        age: age,
        image: result.secure_url,
      },
      { new: true }
    ).then(console.log("user information successfully updated"));
    const fetchUpdateInformation = await User.findOne(
      { _id: userId },
      { __v: 0, password: 0, _id: 0 }
    );
    //  let userInfo = await User.find(
    //   { email: email },
    //   { __v: 0, password: 0, _id: 0 }
    // );
    //send response
    return res.status(200).json({
      url: uploadPictureToCloudinary.secure_url,
      message: "Your account details have been successfully updated",
      status: true,
      data: fetchUpdateInformation,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server error", error });
  }
};
module.exports = {
  signup,
  login,
  adminAccountManagement,
  customerLogin,
  customerSignup,
  customerAccountManagement,
};

//checking pull by ali
