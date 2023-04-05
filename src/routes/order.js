const express = require("express");
const orderControler = require("../controller/order");
const router = express.Router();
router.get("/viewOrders", orderControler.viewOrders);
router.post("/postOrder", orderControler.postOrder);
router.delete("/deleteOrder/:id", orderControler.deleteOrder);
router.get("/searchOrders", orderControler.searchOrders);
module.exports = router;