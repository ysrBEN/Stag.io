const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    // 👤 Student
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    // 💼 Offer
    offer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      required: true,
    },

    // 📊 Status
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "validated"],
      default: "pending",
    },

    // 🔥 PRO FIELDS
    message: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    cv: {
      type: String, // link PDF
      trim: true,
    },

    portfolio: {
      type: String, // GitHub / portfolio
      trim: true,
    },
    acceptedAt: {
      type: Date,
    },
    validatedAt: {
      type: Date,
    },
    refusalReason: {
      type: String,
      enum: ["placed_elsewhere", "manual"],
      default: "manual",
    },

    // 📝 Cover Letter
    coverLetter: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

module.exports = mongoose.model("Application", applicationSchema);