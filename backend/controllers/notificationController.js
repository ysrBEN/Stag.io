const Notification = require("../models/Notification");

// GET /api/notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: "Error fetching notifications" });
    }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ message: "Notification marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Error updating notification" });
    }
};

// PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
        res.json({ message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Error updating notifications" });
    }
};

// GET /api/notifications/unread-count
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ userId: req.user.id, isRead: false });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ message: "Error fetching count" });
    }
};
