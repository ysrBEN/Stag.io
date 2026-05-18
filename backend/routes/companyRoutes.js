const router = require("express").Router();
const Company = require("../models/Company");
const User = require("../models/User");
const Application = require("../models/Application");
const authMiddleware = require("../middleware/authMiddleware");
const offerController = require("../controllers/offerController");

// ==========================
// ✅ PROFILE
// ==========================

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { companyName, description, wilaya, industry, websiteUrl, profilePicture, techStacks, skills } = req.body;

    // 1. Update User model (Primary)
    const updateData = { companyName, description, wilaya, industry, websiteUrl };
    if (profilePicture !== undefined) {
      updateData.profilePicture = profilePicture;
    }
    const finalSkills = skills || techStacks;
    if (finalSkills !== undefined) {
      updateData.skills = finalSkills;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { returnDocument: 'after' }
    ).select("-password");

    // 2. Sync with Company model (Legacy compatibility)
    await Company.findOneAndUpdate(
      { user: req.user.id },
      { name: companyName, description, location: wilaya, industry, website: websiteUrl },
      { upsert: true }
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// ✅ OFFERS MANAGEMENT
// ==========================

// GET /api/company/offers -> My offers
router.get("/offers", authMiddleware, offerController.getMyOffers);

// POST /api/company/offers -> Create offer
router.post("/offers", authMiddleware, offerController.createOffer);

// PUT /api/company/offers/:id -> Update offer
router.put("/offers/:id", authMiddleware, offerController.updateOffer);

// DELETE /api/company/offers/:id -> Delete offer
router.delete("/offers/:id", authMiddleware, offerController.deleteOffer);

// GET /api/company/offers/:id/applications -> Get applications for specific offer
router.get("/offers/:id/applications", authMiddleware, async (req, res) => {
  try {
    const apps = await Application.find({ offer: req.params.id })
      .populate({
        path: "student",
        populate: { path: "user" }
      })
      .populate("offer");

    const studentIds = [...new Set(apps.map(a => a.student._id.toString()))];
    
    // Fetch all active applications for these students
    const allActiveApps = await Application.find({
      student: { $in: studentIds },
      status: { $in: ["accepted", "validated"] }
    }).populate("offer");

    const checkOverlap = (offer1, offer2) => {
      if (!offer1.startDate || !offer1.endDate || !offer2.startDate || !offer2.endDate) return true;
      const start1 = new Date(offer1.startDate).getTime();
      const end1 = new Date(offer1.endDate).getTime();
      const start2 = new Date(offer2.startDate).getTime();
      const end2 = new Date(offer2.endDate).getTime();
      return start1 <= end2 && end1 >= start2;
    };

    const result = apps.map(app => {
      const appObj = app.toObject();
      const studentActiveApps = allActiveApps.filter(active => 
        active.student.toString() === app.student._id.toString() &&
        active._id.toString() !== app._id.toString()
      );
      
      let hasOverlap = false;
      for (const active of studentActiveApps) {
        if (checkOverlap(active.offer, app.offer)) {
          hasOverlap = true;
          break;
        }
      }
      
      appObj.hasOverlap = hasOverlap;
      return appObj;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==========================
// ✅ LEGACY / MISC
// ==========================

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description, location, website, industry } = req.body;
    let company = await Company.findOneAndUpdate(
      { user: req.user.id },
      { name, description, location, website, industry },
      { upsert: true, returnDocument: 'after' }
    );
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user.id });
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;