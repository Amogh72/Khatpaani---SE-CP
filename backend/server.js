require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const irrigationService = require("./services/irrigationService");
const farmerDB = require("./data/farmers");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ============================
// 📌 SMS CONFIG (Twilio)
// ============================
const twilio = require("twilio");

const client = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH
);

async function sendSMS(phone, message) {
    try {
        const msg = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE,
            to: phone
        });

        console.log("SMS sent:", msg.sid);
    } catch (error) {
        console.error("SMS error:", error.message);
    }
}

// ============================
// 📌 Farmer Registration API
// ============================
app.post("/register", (req, res) => {
    const { name, phone, crop, location } = req.body;

    if (!name || !phone) {
        return res.status(400).json({ error: "Name and phone required" });
    }

    farmerDB.addFarmer({ name, phone, crop, location });

    res.json({ message: "Farmer registered successfully" });
});

// ============================
// 📌 Get All Farmers
// ============================
app.get("/farmers", (req, res) => {
    res.json(farmerDB.getFarmers());
});

// ============================
// 📌 Irrigation + SMS Alert
// ============================
app.get("/calculate", async (req, res) => {
    const result = await irrigationService.runDailyModel();
    const farmers = farmerDB.getFarmers();
    result.results.forEach(farmResult => {
        const farmer = farmers.find(
            f => f.name === farmResult.farmer
        );

        if (!farmer) return;

        let message = "";

        if (farmResult.irrigate) {
            message = `🌾 नमस्ते ${farmer.name},

            आज पाणी आवश्यक आहे: ${farmResult.waterLiters} लिटर
            कृपया आज सिंचन करा.

            आज पानी की आवश्यकता है: ${farmResult.waterLiters} लीटर
            कृपया आज सिंचाई करें।`;
        } else {
            message = `🌾 नमस्ते ${farmer.name},

            आज सिंचनाची गरज नाही.

            आज सिंचाई की आवश्यकता नहीं है।`;
        }
        sendSMS(farmer.phone, message);
    });
    res.json(result);
});

// ============================
app.listen(3000, () => {
    console.log("Server running on port 3000");
});