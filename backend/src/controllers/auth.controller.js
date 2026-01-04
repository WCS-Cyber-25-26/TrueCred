const authService = require('../services/auth.service');

exports.register = async (req, res) => {
  try {
    res.status(200).send("Registered successfully");
  } catch (err) {
    es.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    res.status(200).send("Login successful");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};