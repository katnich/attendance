const mongoose = require("mongoose");

const registrantSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phone: String,
  registeredAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Registrant", registrantSchema);
