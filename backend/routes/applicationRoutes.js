const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

// 🔥 BEST PRACTICE (no destructuring problems)
const controller = require("../controllers/applicationController");

// =====================
// 🎓 STUDENT
// =====================

// apply
router.post("/", auth, controller.apply);

// my applications (student)
router.get("/my", auth, controller.getMyApplications);


// GET /api/applications -> All applications for company (filtered by companyId)
router.get("/", auth, controller.getApplications);

// =====================
// 🏢 COMPANY
// =====================

// accept / reject / update status
router.put("/:id/status", auth, controller.updateStatus);
router.put("/:id", auth, controller.updateStatus); // alias


// convention data for PDF
router.get("/:id/convention", auth, controller.getConventionData);

// =====================
// 📄 PDF
// =====================

router.get("/:id/pdf", auth, controller.generatePDF);

module.exports = router;