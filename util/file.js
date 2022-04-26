const fs = require("fs");

module.exports.writeJsonToFile = function (json) {
  return new Promise((resolve, reject) => {
    fs.writeFile("./data/blockchain.json", JSON.stringify(json), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports.readJsonFromFile = function () {
  return new Promise((resolve, reject) => {
    fs.readFile("./data/blockchain.json", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
};
