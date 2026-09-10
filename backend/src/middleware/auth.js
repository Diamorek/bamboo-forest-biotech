import jwt from 'jsonwebtoken';

// JWT 토큰 검증 미들웨어
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // "Bearer token" 형식

    if (!token) {
      return res.status(401).json({ error: 'Token is required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export default verifyToken;
