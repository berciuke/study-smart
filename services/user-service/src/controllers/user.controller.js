const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');

// Rejestracja użytkownika
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Użytkownik z tym emailem już istnieje' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'student'
      }
    });

    // Nie zwracamy hasła
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('[register]', error);
    
    // Handle Prisma specific errors
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Użytkownik z tym emailem już istnieje' });
    }
    
    res.status(500).json({ error: 'Błąd serwera', details: error.message });
  }
};

// Logowanie użytkownika
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
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
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony' });
    }

    // Zwracamy bez hasła
    const { password, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error('[getProfile]', error);
    res.status(500).json({ error: 'Błąd serwera', details: error.message });
  }
};

// Aktualizacja profilu użytkownika
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { firstName, lastName }
    });

    const { password, ...userData } = updatedUser;
    res.json(userData);
  } catch (error) {
    console.error('[updateProfile]', error);
    
    // Handle Prisma record not found
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Użytkownik nie został znaleziony' });
    }
    
    res.status(500).json({ error: 'Błąd serwera', details: error.message });
  }
};

// GET wszyscy użytkownicy, admin only
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('[getAllUsers]', error);
    res.status(500).json({ error: 'Błąd serwera', details: error.message });
  }
}; 