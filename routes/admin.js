const express = require("express");
const router = express.Router();
const Registrant = require("../models/Registrant");
const Setting = require("../models/Setting");
const authMiddleware = require("../middlewares/auth");

// ดูข้อมูลเต็ม
router.get("/search/registrants", authMiddleware, async (req, res) => {
  try {
    const search = req.query.search || "";
    const regex = new RegExp(search, "i");
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sortField = req.query.sortField || "registeredAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    let filter = {
      $or: [{ firstName: regex }, { lastName: regex }, { phoneNumber: regex }],
    };

    const totalCount = await Registrant.countDocuments(filter);

    const registrants = await Registrant.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    const setting = await Setting.findOne();

    res.json({
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      perPage: limit,
      totalSeats: setting.totalSeats,
      reservedSeats: setting.reservedSeats,
      remainingSeats: setting.totalSeats - setting.reservedSeats,
      data: registrants,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// กำหนดจำนวนที่นั่ง
router.put("/update/seats", authMiddleware, async (req, res) => {
  const { totalSeats } = req.body;
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting({ totalSeats, reservedSeats: 0 });
    } else {
      if (totalSeats < setting.reservedSeats)
        return res.status(400).json({
          message: "You cannot set the value lower than the reserved seats.",
        });
      setting.totalSeats = totalSeats;
    }
    await setting.save();
    res.json({ message: "Seats updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
