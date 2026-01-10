import authService from '../services/auth.service.js';


export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    const emailNormalized = email.toLowerCase().trim();
    const user = await authService.register(emailNormalized, password);

    res.status(201).json({
      message: 'Registered successfully',
      userId: user.id,
    });
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