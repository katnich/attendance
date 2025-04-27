const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: { type: String, default: 'admin' },
	token: String
});

module.exports = mongoose.model('User', userSchema);
