import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

function generateToken (userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
};

function verifyToken (token) {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const tk = {
  generateToken,
  verifyToken
};


export default tk;