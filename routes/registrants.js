const express = require("express");
const router = express.Router();
const Setting = require("../models/Setting");
const Registrant = require("../models/Registrant");

// ดูรายชื่อ
router.get("/search", async (req, res) => {
  try {
    const search = req.query.search || "";
    const regex = new RegExp(search, "i");

    const registrants = await Registrant.find({ firstName: regex })
      .sort({ registeredAt: -1 })
      .select("firstName");

    res.json(registrants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ลงทะเบียน
router.post("/create", async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  try {
    const setting = await Setting.findOne();
    if (!setting)
      return res.status(400).json({ message: "Settings not found" });
    const count = (await Registrant.countDocuments()) || 0;

    if (!setting || count >= setting.totalSeats) {
      return res.status(400).json({ message: "No seats available" });
    }

    const newRegistrant = new Registrant({ firstName, lastName, phone });
    await newRegistrant.save();

    setting.reservedSeats += 1;
    await setting.save();

    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
