const P2P = require("../model/p2p");
const p2p = P2P.getInstance();

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send(p2p.sockets.length.toString());
});

router.post("/sendMessage", (req, res, next) => {
  const message = req.body.message;

  p2p.broadcastMessage({ type: "message", data: message });

  res.send("Message sent");
});

router.post("/connectPeer", (req, res, next) => {
  const { peer } = req.body;
  p2p.registerPeerAndBroadcast(peer);
  res.send(JSON.stringify({ peer: peer }));
});

module.exports = router;
