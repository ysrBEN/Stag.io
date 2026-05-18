const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'new_application',      // company receives when student applies
      'new_registration',     // admin receives when someone registers
      'application_accepted', // student receives when company accepts
      'application_refused',  // student receives when company refuses
      'internship_validated'  // student + company receive when admin validates
    ],
    required: true
  },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // applicationId or userId
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema);