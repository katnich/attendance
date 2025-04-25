const express = require("express");
const router = express.Router();
const Registrant = require("../models/Registrant");
const Setting = require("../models/Setting");

router.get("/seats", async (req, res) => {
  const setting = await Setting.findById("seats");
  const count = await Registrant.countDocuments();
  const remaining = setting ? setting.totalSeats - count : 0;
  res.json({ total: setting?.totalSeats || 0, remaining });
});

router.post("/register", async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  const setting = await Setting.findById("seats");
  const count = await Registrant.countDocuments();

  if (!setting || count >= setting.totalSeats) {
    return res.status(400).json({ message: "ที่นั่งเต็มแล้ว" });
  }

  const newRegistrant = new Registrant({ firstName, lastName, phone });
  await newRegistrant.save();
  res.status(201).json(newRegistrant);
});

router.get("/registrants", async (req, res) => {
  const search = req.query.search || "";
  const regex = new RegExp(search, "i");

  const registrants = await Registrant.find({
    $or: [
      { firstName: regex },
      { lastName: regex },
      { phone: regex }
    ]
  }).sort({ registeredAt: -1 });

  res.json(registrants);
});

router.post("/admin/set-seats", async (req, res) => {
  const { totalSeats } = req.body;
  const setting = await Setting.findByIdAndUpdate(
    "seats",
    { totalSeats },
    { upsert: true, new: true }
  );
  res.json(setting);
});

module.exports = router;
