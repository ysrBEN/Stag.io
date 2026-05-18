const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  duration: String,
  type: String,
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  workMode: { type: String, enum: ['on-site', 'remote', 'hybrid'], default: 'on-site' },
  technologies: [String],
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
});

module.exports = mongoose.model("Offer", offerSchema);