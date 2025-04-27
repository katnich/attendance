const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

router.get('/', async (req, res) => {
    try {
        const setting = await Setting.findOne();
        if (!setting) {
            return res.status(400).json({ message: 'Settings not found' });
        }

        res.json({
            totalSeats: setting.totalSeats,
            reservedSeats: setting.reservedSeats,
            remainingSeats: setting.totalSeats - setting.reservedSeats
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
