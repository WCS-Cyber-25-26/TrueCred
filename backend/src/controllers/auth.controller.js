import authService from '../services/auth.service.js';
 

export const register = async (req, res) => {
  try {
    res.status(200).send("Registered successfully");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    res.status(200).send("Login successful");
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};