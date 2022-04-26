const P2P = require("../model/p2p");
const fs = require("fs");

const p2p = P2P.getInstance();

var express = require("express");
const { generateKeyStore } = require("../model/keygrenerator");
const { default: Wallet } = require("ethereumjs-wallet");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  if (req.session.privateKey) {
    res.render("homepage", {
      title: "Homepage",
      publicKey: req.session.privateKey,
    });
  } else {
    res.render("index", { title: "Express", chain: p2p.blockchain.toJson() });
  }
});

router.get("/create-new-wallet", function (req, res, next) {
  console.log("routes/users.js", "response", "new wallet");
  res.render("new_wallet", { title: "Create New Wallet" });
});

router.post("/create-new-wallet", async function (req, res, next) {
  const password = req.body.password;
  if (password) {
    const keystore = await generateKeyStore(password);

    res.attachment("keystore");
    res.send(keystore);
  } else {
    res.send({ message: "missing password" });
  }
});

router.get("/access-wallet", function (req, res, next) {
  res.render("access_wallet", { title: "Access Wallet" });
});

router.post("/access-wallet", async function (req, res, next) {
  try {
    const keystore = req.files.keystore;
    const password = req.body.password;
    const keyString = keystore.data.toString();
    const wallet = await Wallet.fromV3(keyString, password);

    req.session.privateKey = wallet.getPrivateKey().toString("hex");
    req.session.save();

    console.log("routes/index.js", "session after", req.session);

    res.redirect("/");
  } catch (error) {
    res.status(400).send("ERROR");
  }
});

module.exports = router;
