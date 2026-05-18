const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true, // شركة وحدة لكل user
  },
  name: String,
  description: String,
  location: String,
  website: String,
  industry: String,
});

module.exports = mongoose.model("Company", companySchema);