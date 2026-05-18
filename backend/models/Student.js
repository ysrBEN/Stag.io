const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  user: { // 🔥 بدل userId
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  firstName: String,
  lastName: String,
  skills: [String],
  github: String,
  university: String,
  fieldOfStudy: String,
  academicYear: String,
  portfolio: String,
  bio: String,
});

module.exports = mongoose.model("Student", studentSchema);