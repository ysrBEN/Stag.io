const Notification = require("../models/Notification");

exports.notify = async (userId, message, type = 'new_application', relatedId = null) => {
  try {
    if (!userId) {
      console.log("❌ notify: userId missing");
      return;
    }

    await Notification.create({
      userId,
      message,
      type,
      relatedId,
      isRead: false,
    });

    console.log("🔔 Notification sent:", message);
  } catch (err) {
    console.error("❌ NOTIFY ERROR:", err);
  }
};