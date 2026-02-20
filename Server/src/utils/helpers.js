import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId, email) {
  return jwt.sign({ id: userId, email: email }, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

