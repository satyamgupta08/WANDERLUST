// if(process.env.NODE_ENV != "production"){
//   require('dotenv').config();
// }
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

// const dbUrl="mongodb+srv://satyamgupta0812:chPF2jxd2pGG9SEg@cluster0.qkeh4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
console.log(dbUrl);
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({...obj,owner: "66f7af7362d2ce2897d7180e"}))
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();
