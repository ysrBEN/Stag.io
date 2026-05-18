const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: String,
    password: { type: String, required: false },
    googleId: { type: String, required: false },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    role: {
      type: String,
      enum: ["student", "company", "admin"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    profilePicture: { type: String, default: "" },
    // 🔐 Password Reset
    resetPasswordCode: String,
    resetPasswordExpires: Date,
    // 🎓 Student fields
    name: String,
    university: String,
    fieldOfStudy: String,
    academicYear: String,
    skills: [String],
    githubUrl: String,
    portfolioUrl: String,
    bio: String,
    // 🏢 Company fields
    companyName: String,
    description: String,
    wilaya: String,
    industry: String,
    websiteUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
