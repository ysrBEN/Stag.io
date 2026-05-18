const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminController = require("../controllers/adminController");
const appController = require("../controllers/applicationController");

// Admin-only guard middleware
const adminOnly = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
    }
    next();
};

// ==========================
// 📊 STATS & LISTS
// ==========================

// GET /api/admin/stats
router.get("/stats", authMiddleware, adminOnly, adminController.getStats);

// GET /api/admin/students
router.get("/students", authMiddleware, adminOnly, adminController.getStudents);

// GET /api/admin/companies
router.get("/companies", authMiddleware, adminOnly, adminController.getCompanies);


// ==========================
// 🛡️ USER APPROVALS
// ==========================

// GET /api/admin/users?status=pending|approved|rejected
router.get("/users", authMiddleware, adminOnly, adminController.getUsers);

// PUT /api/admin/users/:id/approve
router.put("/users/:id/approve", authMiddleware, adminOnly, adminController.approveUser);

// PUT /api/admin/users/:id/reject
router.put("/users/:id/reject", authMiddleware, adminOnly, adminController.rejectUser);


// ==========================
// 📋 INTERNSHIP VALIDATIONS
// ==========================

// GET /api/admin/internships/pending
router.get("/internships/pending", authMiddleware, adminOnly, appController.getAdminApplications);

// PUT /api/admin/internships/:id/validate
router.put("/internships/:id/validate", authMiddleware, adminOnly, appController.validateApplication);

// PUT /api/admin/internships/:id/refuse
router.put("/internships/:id/refuse", authMiddleware, adminOnly, appController.refuseApplication);


module.exports = router;
