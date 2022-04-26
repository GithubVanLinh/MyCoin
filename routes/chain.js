const express = require("express");

const p2p = require("../model/p2p").getInstance();
const router = express.Router();

router.get("/", (req, res, next) => {
  res.send(p2p.blockchain.toJson());
});

module.exports = router;
