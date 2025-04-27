const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const token = req.headers["authorization"].replace("Bearer ", "");
  console.log("🚀 ~ token:", token);
  const user = await User.findOne({ token });

  console.log("🚀 ~ user:", user);
  if (!token || !user)
    return res.status(401).json({ message: "Access Denied" });
  if (token !== user.token)
    return res.status(401).json({ message: "Access Denied" });

  try {
    const verified = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid Token" });
  }
};
