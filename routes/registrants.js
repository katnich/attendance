const express = require("express");
const router = express.Router();
const Setting = require("../models/Setting");
const Registrant = require("../models/Registrant");

// ดูรายชื่อ
router.get("/search", async (req, res) => {
  try {
    const search = req.query.search || "";
    const regex = new RegExp(search, "i");
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const sortField = req.query.sortField || "registeredAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    let filter = { firstName: regex };

    const totalCount = await Registrant.countDocuments(filter);

    const registrants = await Registrant.find(filter)
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(["firstName", "registeredAt"]);

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

    //เช็คเบอร์โทรว่าซ้ำไหม
    const existingRegistrant = await Registrant.findOne({ phone });
    if (existingRegistrant) {
      return res
        .status(400)
        .json({ message: "Phone number already registered" });
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
