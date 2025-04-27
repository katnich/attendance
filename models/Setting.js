const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    totalSeats: { type: Number, required: true },
    reservedSeats: { type: Number, required: true }
});

module.exports = mongoose.model('Setting', settingSchema);
