const express = require("express");
const orderControler = require("../controller/order");
const router = express.Router();
const verifyToken = require("../controller/verifyToken"); // import verifyToken file
const isAuthorized = require("../controller/isAuthorized");
const isAdmin = require("../controller/isAdmin");

router.get(
  "/viewOrders",
  // verifyToken,
  // isAuthorized,
  // isAdmin,
  orderControler.viewOrders
);
//single order route is below
router.get("/view-single-order/:id", orderControler.viewSingleOrder);
router.post(
  "/postOrder",
  // verifyToken,
  // isAuthorized,
  // isAdmin,
  orderControler.postOrder
);
router.delete(
  "/deleteOrder/:id",
  // verifyToken,
  // isAuthorized,
  // isAdmin,
  orderControler.deleteOrder
);
router.get(
  "/searchOrders",
  // verifyToken,
  // isAuthorized,
  // isAdmin,
  orderControler.searchOrders
);
// Update order status
router.put(
  "/updateOrderStatus/:id",
  // verifyToken,
  // isAuthorized,
  // isAdmin,
  orderControler.updateOrderStatus
);
module.exports = router;
