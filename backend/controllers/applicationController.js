const Application = require("../models/Application");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Offer = require("../models/Offer");
const PDFDocument = require("pdfkit");

const { notify } = require("../utils/notify");

const checkOverlap = (offer1, offer2) => {
  if (!offer1.startDate || !offer1.endDate || !offer2.startDate || !offer2.endDate) return true;
  const start1 = new Date(offer1.startDate).getTime();
  const end1 = new Date(offer1.endDate).getTime();
  const start2 = new Date(offer2.startDate).getTime();
  const end2 = new Date(offer2.endDate).getTime();
  return start1 <= end2 && end1 >= start2;
};
// ==========================
// 🎓 APPLY (student)
// ==========================
exports.apply = async (req, res) => {
  try {
    const { offerId, message, phone, cv, portfolio, coverLetter } = req.body;

    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(400).json("Student profile not found");
    }

    const targetOffer = await Offer.findById(offerId).populate({
      path: "company",
      populate: { path: "user" },
    });

    if (!targetOffer) return res.status(404).json("Offer not found");

    const existing = await Application.findOne({
      student: student._id,
      offer: offerId,
    });

    if (existing) {
      return res.status(400).json("Already applied");
    }


    const application = await Application.create({
      student: student._id,
      offer: offerId,
      status: "pending",
      message,
      phone,
      cv,
      portfolio,
      coverLetter: coverLetter || '',
    });

    await notify(
      targetOffer.company.user._id,
      `${student.firstName} ${student.lastName} applied to your offer "${targetOffer.title}"`,
      "new_application",
      application._id
    );

    res.json(application);
  } catch (err) {
    console.error("APPLY ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


// ==========================
// 🎓 STUDENT APPLICATIONS
// ==========================
exports.getMyApplications = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
      return res.status(400).json("Student profile not found");
    }

    const apps = await Application.find({ student: student._id })
      .populate({
        path: "offer",
        populate: { path: "company" },
      });

    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ==========================
// 🏢 COMPANY APPLICATIONS
// ==========================
exports.getApplications = async (req, res) => {
  try {
    const company = await Company.findOne({ user: req.user.id });

    if (!company) {
      return res.status(400).json("Company profile not found");
    }

    const apps = await Application.find()
      .populate({
        path: "student",
        populate: { path: "user" },
      })
      .populate({
        path: "offer",
        match: { company: company._id },
        populate: { path: "company" },
      });

    const filtered = apps.filter((a) => a.offer !== null);

    // 🔥 Check overlap for each application
    const studentIds = [...new Set(filtered.map(a => a.student._id.toString()))];
    
    // Fetch all active applications for these students
    const allActiveApps = await Application.find({
      student: { $in: studentIds },
      status: { $in: ["accepted", "validated"] }
    }).populate("offer");

    const result = filtered.map(app => {
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
    console.error(err);
    res.status(500).json(err.message);
  }
};


// ==========================
// 🏢 ACCEPT / REJECT
// ==========================
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json("Invalid status");
    }

    const app = await Application.findById(req.params.id)
      .populate({
        path: "student",
        populate: { path: "user" },
      })
      .populate({
        path: "offer",
        populate: {
          path: "company",
          populate: { path: "user" },
        },
      });

    if (!app) return res.status(404).json("Application not found");

    if (app.status !== "pending") {
      return res.status(400).json("Already processed");
    }

    // 🔥 Check if student is already accepted elsewhere during these dates
    if (status === "accepted") {
      const activeApps = await Application.find({
        student: app.student._id,
        status: { $in: ["accepted", "validated"] },
        _id: { $ne: app._id }
      }).populate("offer");

      for (const active of activeApps) {
        if (checkOverlap(active.offer, app.offer)) {
          return res.status(400).json("This student already has an accepted internship during these dates.");
        }
      }
    }

    app.status = status;
    if (status === 'accepted') {
      app.acceptedAt = new Date();
    }
    await app.save();

    // 🔔 student
    const studentMsg = status === 'accepted'
      ? `Your application to "${app.offer.title}" at ${app.offer.company.user.name || 'Company'} has been accepted! 🎉`
      : `Your application to "${app.offer.title}" at ${app.offer.company.user.name || 'Company'} was not selected.`;

    await notify(
      app.student.user._id,
      studentMsg,
      status === 'accepted' ? 'application_accepted' : 'application_refused',
      app._id
    );

    // 🔔 admin
    if (status === "accepted") {
      const admins = await require("../models/User").find({ role: "admin" });

      for (const admin of admins) {
        await notify(
          admin._id,
          `New accepted application waiting for validation: ${app.student.user.name} at ${app.offer.company.user.name}`,
          'new_application', // Reuse type for admin review
          app._id
        );
      }
    }

    res.json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message);
  }
};


// ==========================
// 👨‍💼 ADMIN LIST
// ==========================
exports.getAdminApplications = async (req, res) => {
  try {
    const { status, limit } = req.query;

    let query = {
      status: { $in: ["accepted", "validated"] }
    };

    if (status) {
      query.status = status;
    }

    const apps = await Application.find(query)
      .populate({
        path: "student",
        populate: { path: "user", select: "name email university fieldOfStudy academicYear wilaya" },
      })
      .populate({
        path: "offer",
        populate: {
          path: "company",
          populate: { path: "user", select: "name email wilaya companyName" }
        },
      })
      .sort({ updatedAt: -1 });

    if (limit) {
      return res.json(apps.slice(0, parseInt(limit)));
    }

    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ==========================
// 👨‍💼 REFUSE VALIDATION
// ==========================
exports.refuseApplication = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json("Access denied");
    }

    const app = await Application.findById(req.params.id)
      .populate({
        path: "student",
        populate: { path: "user" },
      })
      .populate({
        path: "offer",
        populate: {
          path: "company",
          populate: { path: "user" },
        },
      });

    if (!app) return res.status(404).json("Application not found");

    // Can only refuse if it was accepted by company or already validated (to undo)
    if (!["accepted", "validated"].includes(app.status)) {
      return res.status(400).json("Application must be accepted or validated to be refused");
    }

    app.status = "rejected";
    app.refusalReason = "manual";
    await app.save();

    // Notify student
    await notify(
      app.student.user._id,
      `Your internship validation at ${app.offer.company.user.name || 'Company'} was refused by the administration.`,
      'application_refused',
      app._id
    );

    // Notify company
    await notify(
      app.offer.company.user._id,
      `The internship validation for ${app.student.user.name} has been refused by the administration.`,
      'application_refused',
      app._id
    );

    res.json({ message: "Internship validation refused", app });
  } catch (err) {
    console.error("REFUSE ERROR:", err);
    res.status(500).json(err.message);
  }
};


// ==========================
// 👨‍💼 VALIDATE
// ==========================
exports.validateApplication = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json("Access denied");
    }

    const app = await Application.findById(req.params.id)
      .populate({
        path: "student",
        populate: { path: "user" },
      })
      .populate({
        path: "offer",
        populate: {
          path: "company",
          populate: { path: "user" },
        },
      });

    if (!app) return res.status(404).json("Application not found");

    if (app.status !== "accepted") {
      return res.status(400).json("Only accepted can be validated");
    }

    app.status = "validated";
    app.validatedAt = new Date();
    await app.save();

    await notify(
      app.student.user._id,
      `Your internship at ${app.offer.company.user.name || 'Company'} has been officially validated! Download your Convention de Stage. 🎓`,
      'internship_validated',
      app._id
    );

    await notify(
      app.offer.company.user._id,
      `The internship of ${app.student.user.name} has been validated by the university.`,
      'internship_validated',
      app._id
    );

    // 🔥 Auto-refuse overlapping applications
    try {
      const pendingApps = await Application.find({
        student: app.student._id,
        _id: { $ne: app._id },
        status: { $in: ["pending", "accepted"] }
      }).populate({
        path: "offer",
        populate: { path: "company" }
      });

      const overlappingApps = pendingApps.filter(pa => checkOverlap(pa.offer, app.offer));

      if (overlappingApps.length > 0) {
        await Application.updateMany(
          { _id: { $in: overlappingApps.map(oa => oa._id) } },
          { status: "rejected", refusalReason: "placed_elsewhere" }
        );

        // Notify student for each closed application
        for (const oa of overlappingApps) {
          await notify(
            app.student.user._id,
            `Your application to "${oa.offer.title}" at ${oa.offer.company.name} was automatically closed as you have been placed elsewhere during these dates.`,
            'application_refused',
            oa._id
          );
        }
      }
    } catch (autoErr) {
      console.error("AUTO-REFUSE ERROR:", autoErr);
    }

    res.json(app);
  } catch (err) {
    console.error(err);
    res.status(500).json(err.message);
  }
};


// ==========================
// 📄 CONVENTION DATA
// ==========================
exports.getConventionData = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: "student",
        populate: { path: "user" },
      })
      .populate({
        path: "offer",
        populate: {
          path: "company",
          populate: { path: "user" },
        },
      });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json({
      student: {
        name: application.student?.user?.name || "Student",
        university: application.student?.university || application.student?.user?.university || "University",
        fieldOfStudy: application.student?.fieldOfStudy || application.student?.user?.fieldOfStudy || "Field",
        academicYear: application.student?.academicYear || application.student?.user?.academicYear || "Year",
      },
      company: {
        name: application.offer?.company?.user?.name || application.offer?.company?.name || "Company",
        wilaya: application.offer?.company?.user?.wilaya || application.offer?.company?.location || "Wilaya",
      },
      offer: {
        title: application.offer?.title || "Internship",
        type: application.offer?.type || "PFE",
        duration: application.offer?.duration || "Unknown",
      },
      validatedAt: application.validatedAt,
    });
  } catch (err) {
    console.error("CONVENTION DATA ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


// ==========================
// 📄 PDF (LEGACY SERVER-SIDE)
// ==========================
exports.generatePDF = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: "student",
        populate: { path: "user" },
      })
      .populate({
        path: "offer",
        populate: {
          path: "company",
          populate: { path: "user" },
        },
      });

    if (!application) {
      return res.status(404).json("Application not found");
    }

    if (application.status !== "validated") {
      return res.status(400).json("Not validated yet");
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=convention.pdf"
    );

    doc.pipe(res);

    doc.fontSize(20).text("Internship Convention", { align: "center" });
    doc.moveDown();

    doc.text(`Student: ${application.student?.firstName}`);
    doc.text(`Company: ${application.offer.company?.name}`);
    doc.text(`Offer: ${application.offer.title}`);
    doc.text(`Status: ${application.status}`);

    doc.end();
  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json(err.message);
  }
};