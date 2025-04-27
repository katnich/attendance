const express = require("express");
const router = express.Router();
const Registrant = require("../models/Registrant");
const Setting = require("../models/Setting");
const authMiddleware = require("../middlewares/auth");

// ดูข้อมูลเต็ม
router.get("search/registrants", authMiddleware, async (req, res) => {
  try {
    const search = req.query.search || "";
    const regex = new RegExp(search, "i");

    const registrants = await Registrant.find({
      $or: [{ firstName: regex }, { lastName: regex }, { phone: regex }],
    }).sort({ registeredAt: -1 });

    res.json(registrants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// กำหนดจำนวนที่นั่ง
router.put("update/seats", authMiddleware, async (req, res) => {
  const { totalSeats } = req.body;
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting({ totalSeats, reservedSeats: 0 });
    } else {
      setting.totalSeats = totalSeats;
    }
    await setting.save();
    res.json({ message: "Seats updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
