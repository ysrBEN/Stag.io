const Offer = require("../models/Offer");
const Company = require("../models/Company");

// ✅ CREATE OFFER
exports.createOffer = async (req, res) => {
  try {
    const { title, description, location, duration, type, technologies, startDate, endDate } = req.body;

    // 🔐 غير company تقدر تنشئ
    if (req.user.role !== "company") {
      return res.status(403).json("Only companies can create offers");
    }

    console.log('Creating offer for company:', req.user.id);
    console.log('Offer data:', req.body);

    // 🔥 نستعمل user (مش userId)
    const company = await Company.findOne({ user: req.user.id });

    if (!company) {
      console.log('Error: Company profile not found for user:', req.user.id);
      return res.status(400).json("Company profile not found");
    }

    const offer = await Offer.create({
      title,
      description,
      location,
      duration,
      type,
      technologies,
      startDate,
      endDate,
      company: company._id,
    });

    res.json(offer);
  } catch (err) {
    console.error("CREATE OFFER ERROR:", err);
    res.status(500).json("Create offer failed");
  }
};

// ✅ GET ALL OFFERS (With Filtering & Skill-Based Matching)
exports.getOffers = async (req, res) => {
  try {
    const { keyword, location, type, skills, workMode, sortBy = 'match' } = req.query;
    let query = {};
    const User = require("../models/User");

    // 1. Keyword search (Title or Description)
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 2. Exact match filters
    if (location) query.location = location;
    if (type) query.type = type;
    if (workMode) query.workMode = workMode;

    // 3. Skills match (using $in for "any of")
    if (skills) {
      const skillsArray = skills.split(',');
      query.technologies = { $in: skillsArray.map(s => new RegExp(s, 'i')) };
    }

    // Fetch offers
    let offers = await Offer.find(query)
      .populate("company", "name location industry")
      .lean();

    // 4. Skill-Based Scoring (if student is logged in)
    let studentSkills = [];
    if (req.user && req.user.role === 'student') {
      const student = await User.findById(req.user.id).select('skills');
      studentSkills = student?.skills || [];
    }

    // Map scores
    offers = offers.map(offer => {
      const offerSkills = offer.technologies || [];
      const matchCount = offerSkills.filter(skill =>
        studentSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase())
      ).length;

      const matchScore = offerSkills.length > 0
        ? Math.round((matchCount / offerSkills.length) * 100)
        : 0;

      return {
        ...offer,
        matchScore,
        matchCount,
        studentSkills // return for frontend highlighting
      };
    });

    // 5. Sorting Logic
    if (sortBy === 'match' && studentSkills.length > 0) {
      offers.sort((a, b) => b.matchScore - a.matchScore || new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      offers.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      // Default: newest first
      offers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(offers);
  } catch (err) {
    console.error("GET OFFERS ERROR:", err);
    res.status(500).json(err.message);
  }
};

// ✅ GET MY OFFERS
exports.getMyOffers = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user.id });

    if (!company) {
      return res.status(400).json("Company not found");
    }

    console.log('Fetching offers for company:', req.user.id);
    const offers = await Offer.find({ company: company._id });
    console.log('Found offers:', offers.length);

    res.json(offers);
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ✅ DELETE OFFER
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json("Offer not found");
    }

    const company = await Company.findOne({ user: req.user.id });

    if (!company || offer.company.toString() !== company._id.toString()) {
      return res.status(403).json("Not authorized");
    }

    await offer.deleteOne();

    res.json("Offer deleted");
  } catch (err) {
    res.status(500).json(err.message);
  }
};

// ✅ UPDATE OFFER
exports.updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json("Offer not found");
    }

    const company = await Company.findOne({ user: req.user.id });

    if (!company || offer.company.toString() !== company._id.toString()) {
      return res.status(403).json("Not authorized");
    }

    const updated = await Offer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after' }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json(err.message);
  }
};