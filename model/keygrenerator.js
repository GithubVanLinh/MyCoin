const Wallet = require("ethereumjs-wallet").default;
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

// generate a key pair
const key = ec.genKeyPair();

// generate a public key
const publicKey = key.getPublic("hex");

// generate a private key
const privateKey = key.getPrivate("hex");

// log to console
console.log("publicKey: ", publicKey);
console.log("privateKey: ", privateKey);

module.exports.generateKeyStore = async function (password) {
  const wallet = Wallet.generate();
  const privateKey = wallet.getPrivateKey();
  const publicKey = wallet.getPublicKey();
  const address = wallet.getAddressString();
  const keystore = await wallet.toV3String(password);
  console.log("privateKey: ", privateKey);
  console.log("publicKey: ", publicKey);
  console.log("address: ", address);
  console.log("keystore: ", keystore);
  return keystore;
};
