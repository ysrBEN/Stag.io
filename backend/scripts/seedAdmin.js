const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

const seedAdmin = async () => {
    try {
        // Connect to DB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected for seeding...");

        const adminEmail = "admin@stagbio.com";
        const adminPassword = "Admin@1234";

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log("Admin account already exists. Updating status to approved...");
            existingAdmin.status = "approved";
            await existingAdmin.save();
            console.log("Admin account updated successfully.");
        } else {
            // Create new admin
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await User.create({
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                status: "approved",
            });
            console.log("Admin user seeded successfully.");
        }

        mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seedAdmin();
