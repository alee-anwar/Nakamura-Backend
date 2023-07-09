// controllers/authController.js
const User = require("../models/auth");
const adminSchema = require("../models/adminAuth");

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

//twilio setup
const accountSid = "AC4e37b072f05cf2e67c7683c14f505972";
const authToken = "6abc2b2f213ca1c5a9076a4bcafba037";
const client = require("twilio")(accountSid, authToken);
const generateOTP = () => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

//signup function is below
const signup = async (req, res, next) => {
  const { userName, email, password, confirmPassword, registeredAt } = req.body;
  console.log(userName);
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

  const userExists = await adminSchema.findOne({ email });
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

  const newUser = new adminSchema({
    userName: userName,
    email: email,
    password: password,
    registeredAt: registeredAt,
  });

  newUser.save((err, user) => {
    if (err) return res.status(500).send(err);
    res.status(201).json({ message: "User registered successfully." });
  });
};
const login = async (req, res, next) => {
  console.log("signin api has been hit");

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await adminSchema.findOne({ email });

    if (!user) {
      console.log("if (!user) { called");
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    //   return res.status(400).json({ message: "Invalid Credentials" });
    // }
    if (password != user.password) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };
    let userInfo = await adminSchema.find({ email: email });

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

const adminAccountManagement = async (req, res, next) => {
  console.log("admin account management api called");
  //  let deleteId = req.params.id;

  const userId = req.params.id;

  console.log(userId);
  try {
    const { userName, email, password } = req.body;
    const userUpdateInformation = await adminSchema.findByIdAndUpdate(
      {
        _id: userId,
      },
      {
        userName: userName,
        email: email,
        password: password,
      },
      { new: true }
    );
    const fetchUpdateInformation = await adminSchema.findOne({ _id: userId });
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
  const { firstName, lastName, phoneNo, town, streetNo, houseNo, age } =
    req.body;
  console.log(firstName);
  console.log("signup api has been hit");
  //check password adn confirmPassword

  //check password length

  const userExists = await User.findOne({ phoneNo });
  // const userEmailExists = await User.findOne({ email });
  // const isEmailValid = emailValidator.is_email_valid(email);
  // if (email) {
  //   if (!isEmailValid) {
  //     return res
  //       .status(403)
  //       .json({ message: "Please provide a valid email address" });
  //   }
  //   //email exists
  //   if (userEmailExists) {
  //     return res
  //       .status(403)
  //       .json({ message: "User with this email already exists" });
  //   }
  // }
  if (userExists) {
    return res
      .status(400)
      .json({ message: "User with this phone number is already registered." });
  }

  const newUser = new User({
    firstName: firstName,
    lastName: lastName,
    // email: email,
    phoneNo: phoneNo,
    town: town,
    streetNo: streetNo,
    houseNo: houseNo,
    age: age,
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
// const customerLogin = async (req, res, next) => {
//   console.log("customer login api is called");

//   //then don't send otp, rather send token

//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const {
//     firstName,
//     lastName,
//     email,
//     phoneNo,
//     town,
//     streetNo,
//     houseNo,
//     age,
//     otp,
//   } = req.body;
//   console.log(firstName);

//   //if user not registered, call signup function
//   const checkSignup = await User.findOne({ phoneNo });
//   //signUp function
//   const signUp = (phoneNo, firstName, email, town, streetNo, houseNo) => {
//     console.log("The signup function has been called");
//     const newUser = new User({
//       firstName: firstName,
//       lastName: lastName,
//       email: email,
//       phoneNo: phoneNo,
//       town: town,
//       streetNo,
//       houseNo,
//       age: age,
//     });

//     newUser.save((err, user) => {
//       if (err) return res.status(500).send(err);
//       res.send("User has been successfully registered");
//       registerSendToken(phoneNo);
//     });
//   };
//   if (!checkSignup) {
//     console.log("checksignup check called");
//     signUp(phoneNo, firstName, email, town, streetNo, houseNo);
//   }

//   //validate otp function
//   const validateOTP = (userEnteredOTP, otp) => {
//     return userEnteredOTP === otp; //otp is one which we generate and send to the user
//   };
//   //send token
//   const registerSendToken = async (phoneNo) => {
//     // sendOTP(phoneNo);

//     try {
//       let user = await User.findOne({ phoneNo });

//       if (!user) {
//         return res.status(400).json({ message: "Invalid Credentials" });
//       }

//       const payload = {
//         user: {
//           id: user.id,
//           phoneNo: user.phoneNo,
//         },
//       };

//       jwt.sign(payload, secret, { expiresIn: "5 days" }, (err, token) => {
//         if (err) throw err;
//         res.json({
//           token,
//           // User: userInfo,
//           message: "Congratulations! You have been successfully logged in",
//         });
//       });
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).send("Server error");
//     }
//   };
//   //check if login has been recalled for OTP validation
//   if (otp != null) {
//     console.log("if (otp != null) called");
//     validateOTP(otp);
//     console.log("otp validated");
//     // res.send("OTP has successfully been sent.");
//     if (validateOTP() === true) {
//       registerSendToken(phoneNo);
//     }
//   }
//   //twilio otp
//   // Send the OTP via SMS
//   const sendOTP = (phoneNo) => {
//     console.log("sendOTP() called");
//     const otp = generateOTP();

//     client.messages
//       .create({
//         body: `Your OTP is: ${otp}`,
//         from: "+1 339 300 1794",
//         to: phoneNo,
//       })
//       .then((message) => console.log(`OTP sent successfully to ${phoneNo}`))
//       .catch((error) => console.error(`Failed to send OTP: ${error}`));
//   };

//   sendOTP(phoneNo);
// };

//

//below we send otp

//global variable to store otp
let otpStorage = {};

const sendOTP = async (req, res, next) => {
  console.log("sendOTP function called");
  const { phoneNo } = req.body;

  //check
  const check = await User.findOne({ phoneNo: phoneNo });
  if (!check) {
    console.log("  if (!check) {");
    return res.send("Please register your account first");
  }
  // Send the OTP via SMS
  const sendOTP = (phoneNo) => {
    console.log("sendOTP() called");
    const otp = generateOTP();

    otpStorage[phoneNo] = otp;
    // console.log("otpStorage outside =" + otpStorage[phoneNo]);

    client.messages
      .create({
        body: `Your OTP is: ${otp}`,
        from: "+1 361 315 2515",
        to: phoneNo,
      })
      .then((message) => {
        console.log(`OTP sent successfully to the given number`);
        console.log("otpGenerated " + otp);
        return res.send("otp has been successfully sent to the give number");
      })
      .catch((error) => {
        console.error(`Failed to send OTP: ${error}`);
        return res.send("failed to send OTP");
      });
  };
  // const otp = sendOTP(phoneNo);
  // console.log("otp =" + otpStorage);
  // const otp =
  // otpStorage[phoneNo] = otp;
  sendOTP(phoneNo);
};

//below is buyerLogin
// const buyerLogin = async (req, res, next) => {
//   console.log("buyerLogin API has been called");
//   const { phoneNo, otpByUser } = req.body;
//   //below variable will be used for comparison of otps
//   const otpAlreadySent = otpStorage[phoneNo];
//   // console.log(otpByUser);
//   // const otpAlreadySent = 784233;
//   console.log(otpByUser);
//   console.log("otpAlreadySent = " + otpAlreadySent);

//   const validateOTP = (otpByUser, otpAlreadySent) => {
//     if (otpByUser === otpAlreadySent) {
//       return true;
//     } else {
//       return false;
//     }
//   };

//   validateOTP;
//   const isOTPValid = validateOTP(otpByUser, otpAlreadySent);
//   if (!isOTPValid) {
//     return res.status(400).json({ message: "Invalid OTP" });
//   }

//   //sendToken function
//   const sendToken = async (phoneNo) => {
//     // sendOTP(phoneNo);

//     try {
//       let user = await User.findOne({ phoneNo });

//       if (!user) {
//         return res.status(400).json({ message: "Invalid Credentials" });
//       }

//       const payload = {
//         user: {
//           id: user.id,
//           phoneNo: user.phoneNo,
//         },
//       };

//       jwt.sign(payload, secret, { expiresIn: "5 days" }, (err, token) => {
//         if (err) throw err;
//         res.json({
//           token,
//           userInfo: user,
//           // User: userInfo,
//           message: "Congratulations! You have been successfully logged in",
//         });
//       });
//     } catch (error) {
//       console.error(error.message);
//       res.status(500).send("Server error");
//     }
//   };
//   validateOTP(otpByUser, otpAlreadySent);
//   if (validateOTP) {
//     sendToken(phoneNo);
//   }
// };

//buyerLogin
//by ali
const buyerLogin = async (req, res, next) => {
  console.log("buyerLogin API has been called");
  const { phoneNo, otpByUser } = req.body;
  const otpAlreadySent = otpStorage[phoneNo];

  console.log(otpByUser);
  console.log("otpAlreadySent = " + otpAlreadySent);

  const validateOTP = (otpByUser, otpAlreadySent) => {
    return otpByUser === otpAlreadySent;
  };

  const isOTPValid = validateOTP(otpByUser, otpAlreadySent);
  if (!isOTPValid) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const sendToken = async (phoneNo) => {
    try {
      let user = await User.findOne({ phoneNo });

      if (!user) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }

      const payload = {
        user: {
          id: user.id,
          phoneNo: user.phoneNo,
        },
      };

      jwt.sign(payload, secret, { expiresIn: "5 days" }, (err, token) => {
        if (err) throw err;
        res.json({
          token,
          userInfo: user,
          message: "Congratulations! You have been successfully logged in",
        });
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  };

  if (isOTPValid) {
    sendToken(phoneNo);
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
    );
    const fetchUpdateInformation = await User.findOne({ _id: userId });
    console.log("code comes here");
    //send response
    return res.status(200).json({
      // url: uploadPictureToCloudinary.secure_url,
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
  // customerLogin,
  customerSignup,
  customerAccountManagement,
  buyerLogin,
  sendOTP,
};
// const phoneNumber = "+923053078123"; // Replace with the recipient's phone number
