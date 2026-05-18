const router = require("express").Router();
const Student = require("../models/Student");
const User = require("../models/User");
const Application = require("../models/Application");
const authMiddleware = require("../middleware/authMiddleware");


// ==========================
// ✅ CREATE / UPDATE PROFILE
// ==========================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, skills, github, university, fieldOfStudy, academicYear, portfolio, bio } = req.body;

    let student = await Student.findOne({ user: req.user.id });

    if (student) {
      // update
      student.firstName = firstName;
      student.lastName = lastName;
      student.skills = skills;
      student.github = github;
      student.university = university;
      student.fieldOfStudy = fieldOfStudy;
      student.academicYear = academicYear;
      student.portfolio = portfolio;
      student.bio = bio;

      await student.save();
    } else {
      // create
      student = await Student.create({
        user: req.user.id,
        firstName,
        lastName,
        skills,
        github,
        university,
        fieldOfStudy,
        academicYear,
        portfolio,
        bio,
      });
    }

    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


// ==========================
// ✅ GET MY PROFILE
// ==========================
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// ✅ UPDATE PROFILE
// ==========================
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, university, fieldOfStudy, academicYear, skills, githubUrl, portfolioUrl, bio, wilaya, profilePicture } = req.body;

    // 1. Update User model (Primary)
    const updateData = { name, university, fieldOfStudy, academicYear, skills, githubUrl, portfolioUrl, bio, wilaya };
    if (profilePicture !== undefined) {
      updateData.profilePicture = profilePicture;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { returnDocument: 'after' }
    ).select("-password");

    // 2. Sync with Student model (Legacy compatibility)
    const [firstName, ...lastNameParts] = (name || "").split(" ");
    const lastName = lastNameParts.join(" ");

    await Student.findOneAndUpdate(
      { user: req.user.id },
      { firstName, lastName, university, fieldOfStudy, academicYear, skills, github: githubUrl, portfolio: portfolioUrl, bio, wilaya },
      { upsert: true }
    );

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


// ==========================
// ✅ GET STUDENT STATS
// ==========================
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ message: "Student profile not found" });

    const total = await Application.countDocuments({ student: student._id });
    const pending = await Application.countDocuments({ student: student._id, status: "pending" });
    const accepted = await Application.countDocuments({ student: student._id, status: "accepted" });
    const rejected = await Application.countDocuments({ student: student._id, status: "rejected" });
    const validated = await Application.countDocuments({ student: student._id, status: "validated" });

    res.json({
      total,
      pending,
      accepted,
      rejected,
      validated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==========================
// ✅ GET MY PROFILE (LEGACY /me)
// ==========================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id }).populate("user", "email");
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==========================
// 🔥 GET STUDENT BY ID (IMPORTANT)
// ==========================
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("user", "email");

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;