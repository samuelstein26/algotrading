import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

function generateTempPassword(length = 8) {
  return  randomBytes(length).toString('hex').slice(0, length)
}

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

const pw = {
  generateTempPassword,
  hashPassword, 
  comparePassword
}

export default pw;