// src/middleware/auth.ts
import jwt from 'jsonwebtoken';

export const protectAdmin = (req: any, res: any, next: any) => {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'trace_secret_key');
    if (decoded.role !== 'admin') throw new Error();
    
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid or you are not an Admin" });
  }
};