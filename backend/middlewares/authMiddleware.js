import tk from '../utils/jwtUtils.js';

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  try {
    const decoded = tk.verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token inválido.' });
  }
};

export default authMiddleware;