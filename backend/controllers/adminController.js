const User = require("../models/User");

// GET /api/admin/users?status=pending|approved|rejected
const getUsers = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && ["pending", "approved", "rejected"].includes(status)) {
            filter.status = status;
        }

        const users = await User.find(filter)
            .select("-password")
            .lean();

        res.json(users);
    } catch (err) {
        console.error("GET USERS ERROR:", err);
        res.status(500).json({ message: "Error fetching users" });
    }
};

// PUT /api/admin/users/:id/approve
const approveUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: "approved" },
            { returnDocument: 'after' }
        ).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        // 🔔 Notify user
        const { notify } = require("../utils/notify");
        await notify(user._id, "Your account has been approved! You can now login to Stag.io 🎉", "new_registration");

        res.json({ message: "User approved", user });
    } catch (err) {
        console.error("APPROVE ERROR:", err);
        res.status(500).json({ message: "Error approving user" });
    }
};

// PUT /api/admin/users/:id/reject
const rejectUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: "rejected" },
            { returnDocument: 'after' }
        ).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        // 🔔 Notify user
        const { notify } = require("../utils/notify");
        await notify(user._id, "Your account registration has been rejected.", "new_registration");

        res.json({ message: "User rejected", user });
    } catch (err) {
        console.error("REJECT ERROR:", err);
        res.status(500).json({ message: "Error rejecting user" });
    }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
    try {
        const Student = require("../models/Student");
        const Company = require("../models/Company");
        const Application = require("../models/Application");
        const Offer = require("../models/Offer");

        const [totalStudents, totalCompanies, validatedApps, pendingApps, totalOffers] = await Promise.all([
            Student.countDocuments(),
            Company.countDocuments(),
            Application.countDocuments({ status: "validated" }),
            Application.countDocuments({ status: { $in: ["accepted", "pending"] } }),
            Offer.countDocuments()
        ]);

        // Aggregate users by wilaya (both students and companies for richer charts)
        const studentsByWilaya = await User.aggregate([
            { $match: { wilaya: { $exists: true, $ne: "" } } },
            { $group: { _id: '$wilaya', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 },
            { $project: { wilaya: '$_id', count: 1, _id: 0 } }
        ]);

        // Aggregate applications by month
        const appsOverTime = await Application.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } },
            { $project: { month: "$_id", count: 1, _id: 0 } }
        ]);

        // Aggregate top skills
        const topSkills = await Offer.aggregate([
            { $unwind: "$technologies" },
            { $group: { _id: "$technologies", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 8 },
            { $project: { skill: "$_id", count: 1, _id: 0 } }
        ]);

        // Application Status Distribution
        const statusDist = await Application.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $project: { status: "$_id", count: 1, _id: 0 } }
        ]);

        res.json({ 
            // 📱 Expected by mobile admin_statistics_screen.dart & standard adminController
            totalStudents, 
            totalCompanies, 
            totalOffers, 
            validatedApps, 
            pendingApps, 
            placementRate: totalStudents > 0 ? Math.round((validatedApps / totalStudents) * 100) : 0,
            // 💻 Expected by frontend AdminDashboard.jsx
            students: totalStudents,
            companies: totalCompanies,
            // 📱 Expected by mobile admin_dashboard_screen.dart
            totalInternships: validatedApps,
            pendingApprovals: pendingApps,
            // 📊 Charts data
            studentsByWilaya,
            appsOverTime,
            topSkills,
            statusDist
        });
    } catch (err) {
        console.error("STATS FETCH ERROR:", err);
        res.status(500).json({ message: "Error fetching stats" });
    }
};

// GET /api/admin/students
const getStudents = async (req, res) => {
    try {
        const Student = require("../models/Student");
        const Application = require("../models/Application");

        const students = await Student.find().populate("user", "name email status university fieldOfStudy academicYear wilaya");

        // Enrich with placement status
        const enriched = await Promise.all(students.map(async (s) => {
            const hasValidated = await Application.exists({ student: s._id, status: 'validated' });
            return {
                ...s.toObject(),
                name: s.user?.name || s.firstName + " " + s.lastName,
                university: s.user?.university || s.university,
                fieldOfStudy: s.user?.fieldOfStudy || s.fieldOfStudy,
                academicYear: s.user?.academicYear || s.academicYear,
                wilaya: s.user?.wilaya || s.wilaya,
                placed: hasValidated
            };
        }));

        res.json(enriched);
    } catch (err) {
        console.error("GET STUDENTS ERROR:", err);
        res.status(500).json({ message: "Error fetching students" });
    }
};

// GET /api/admin/companies
const getCompanies = async (req, res) => {
    try {
        const Company = require("../models/Company");
        const Offer = require("../models/Offer");

        const companies = await Company.find().populate("user", "email status");

        // Enrich with offer count
        const enriched = await Promise.all(companies.map(async (c) => {
            const offerCount = await Offer.countDocuments({ company: c._id });
            return {
                ...c.toObject(),
                offerCount
            };
        }));

        res.json(enriched);
    } catch (err) {
        console.error("GET COMPANIES ERROR:", err);
        res.status(500).json({ message: "Error fetching companies" });
    }
};

module.exports = { getUsers, approveUser, rejectUser, getStats, getStudents, getCompanies };
