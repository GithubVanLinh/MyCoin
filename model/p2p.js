const ws = require("ws");
const { Blockchain } = require("./blockchain");

// P2P network interface
class P2P {
  // P2P instance
  static instance;

  /**
   *
   * @returns {P2P}
   */
  static getInstance() {
    if (!P2P.instance) {
      P2P.instance = new P2P(process.env.P2P_PORT, new Blockchain());
    }
    return P2P.instance;
  }

  constructor(port, blockchain) {
    this.port = port;

    /**
     * @type {Blockchain}
     */
    this.blockchain = blockchain;
    this.sockets = [];
  }

  // as server
  listen() {
    const server = new ws.Server({ port: this.port });
    server.on("connection", (socket) => this.registerSocket(socket));

    console.log(`Listening for peer-to-peer connections on: ${this.port}`);
  }

  registerSocket(socket) {
    socket.send({ type: "request-chain" });
    this.connectSocket(socket);
  }

  /**
   *
   * @param {ws} socket
   * @returns
   */
  connectSocket(socket) {
    if (this.sockets.includes(socket)) {
      return;
    }

    this.sockets.push(socket);
    console.log("Socket connected");
    socket.on("message", (message) => this.messageHandler(message, socket));
    socket.on("close", () => this.disconnectSocket(socket));
  }

  // register peer and broadcast
  registerPeerAndBroadcast(peer) {
    this.connectPeer(peer);
    this.broadcastNewPeer(peer);
  }

  // as client
  connectPeer(peer) {
    const socket = new ws(peer);
    socket.socketURL = peer;

    socket.on("open", () => this.connectSocket(socket));
  }

  connectAllPeers(peers) {
    peers.forEach((peer) => this.connectPeer(peer));
  }

  //broadcast new peer
  broadcastNewPeer(peer) {
    this.sockets.forEach((socket) => {
      socket.send(JSON.stringify({ type: "register-peer", peer }));
    });
  }

  messageHandler(message, socket) {
    const data = JSON.parse(message);

    switch (data.type) {
      case "chain":
        this.blockchain.replaceChain(data.chain);
        break;
      case "transaction":
        this.blockchain.addTransaction(data.transaction);
        break;
      case "clear-transactions":
        this.blockchain.clearTransactions();
        break;
      case "request-chain":
        socket.send(
          JSON.stringify({ type: "chain", chain: this.blockchain.chain })
        );
        break;
      case "request-transactions":
        socket.send(
          JSON.stringify({
            type: "transactions",
            transactions: this.blockchain.transactions,
          })
        );
        break;
      case "register-peer":
        this.connectPeer(data.peer);
        break;
      case "peers":
        this.connectAllPeers(socket);
      case "message":
        console.log("model/p2p.js", "Message", data.data);
      default:
        break;
    }
  }

  broadcastMessage(message) {
    this.sockets.forEach((socket) => {
      socket.send(JSON.stringify(message));
    });
  }

  broadcastChain() {
    this.sockets.forEach((socket) => {
      socket.send(
        JSON.stringify({ type: "chain", chain: this.blockchain.chain })
      );
    });
  }

  broadcastTransaction(transaction) {
    this.sockets.forEach((socket) => {
      socket.send(JSON.stringify({ type: "transaction", transaction }));
    });
  }

  broadcastClearTransactions() {
    this.sockets.forEach((socket) => {
      socket.send(JSON.stringify({ type: "clear-transactions" }));
    });
  }

  disconnectSocket(socket) {
    this.sockets = this.sockets.filter((s) => s !== socket);
  }
}

module.exports = P2P;
