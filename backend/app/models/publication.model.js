const mongoose = require("mongoose");

const Publication = mongoose.model(
  "Publication",
  new mongoose.Schema({
    dogname: String,
    description: String,
    status: Boolean,
    dogImage: String
  })
);

module.exports = Publication;
