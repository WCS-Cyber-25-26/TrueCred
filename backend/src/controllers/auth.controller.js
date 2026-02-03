import authService from '../services/auth.service.js';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const token = await authService.login({ email, password });

    res.cookie('access_token', token, {
      httpOnly: false,   // only for testing in Swagger
      secure: false,     // localhost testing
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.json({ message: 'Login successful', token: token })

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
