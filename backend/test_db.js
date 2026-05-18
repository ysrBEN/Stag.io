require('dotenv').config();
const mongoose = require('mongoose');
const Offer = require('./models/Offer');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const offer = await Offer.findOne();
        if (offer) {
            console.log("RAW OFFER FIELDS:", Object.keys(offer.toObject()));
            console.log("RAW OFFER:", JSON.stringify(offer, null, 2));
        } else {
            console.log("No offers found in DB.");
        }
    } catch (e) {
        console.error("ERROR:", e);
    }
    process.exit(0);
}
run();
