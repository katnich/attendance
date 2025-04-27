const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log("🚀 ~ router.post ~ req.body:", req.body)
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        if (password !== user.password) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
		user.token = token;
		await user.save();

        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/logout', async (req, res) => {
	const token = req.headers['authorization'].replace('Bearer ', '');
	const user = await User.findOne({ token });
	if (!user) return res.status(401).json({ message: 'Access Denied' });
	user.token = null;
	await user.save();

	// ส่งการตอบกลับไปว่า logout สำเร็จ
	res.status(200).json({
	  message: "Logout successful"
	});
  });

module.exports = router;
