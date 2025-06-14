const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Rejestracja użytkownika
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Użytkownik z tym emailem już istnieje' });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: role || 'student'
    });

    // Nie zwracamy hasła
    const userData = user.toJSON();
    delete userData.password;

    res.status(201).json(userData);
  } catch (error) {
    console.error('[register]', error);
    res.status(500).json({ error: 'Błąd serwera', details: error.message });
  }
};

// Logowanie użytkownika
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('[login]', error);
    res.status(500).json({ error: 'Błąd serwera', details: error.message });
  }
};

// Pobranie profilu użytkownika
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony' });
    }

    res.json(user);
  } catch (error) {
    console.error('[getProfile]', error);
    res.status(500).json({ error: 'Błąd serwera', details: error.message });
  }
};

// Aktualizacja profilu użytkownika
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony' });
    }

    await user.update({ firstName, lastName });

    const userData = user.toJSON();
    delete userData.password;

    res.json(userData);
  } catch (error) {
    console.error('[updateProfile]', error);
    res.status(500).json({ error: 'Błąd serwera', details: error.message });
  }
};

// GET wszyscy użytkownicy, admin only
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    console.error('[getAllUsers]', error);
    res.status(500).json({ error: 'Błąd serwera', details: error.message });
  }
}; 