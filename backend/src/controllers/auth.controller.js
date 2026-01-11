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
    const { email, password } = req.body;

    const result = await authService.login({ email, password });
    res.status(200).json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const result = await authService.logout(req.token);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};