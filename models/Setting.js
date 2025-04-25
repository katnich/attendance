const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  _id: String, // ใช้ค่า "seats"
  totalSeats: Number
});

module.exports = mongoose.model("Setting", settingSchema);
