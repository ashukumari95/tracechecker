import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import CryptoJS from 'crypto-js';

export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  const { username, encryptedPassword } = req.body;

  // 1. Basic Validation
  if (!username || !encryptedPassword) {
    res.status(400).json({ success: false, message: "Handshake failed: Missing credentials" });
    return;
  }

  try {
    // 2. Decrypt the password from Frontend Payload
    const secretKey = process.env.PAYLOAD_SECRET || 'trace_secret_payload_key';
    
    let originalPassword = '';
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedPassword, secretKey);
      originalPassword = bytes.toString(CryptoJS.enc.Utf8);
      
      // Check if decryption resulted in an empty string (Wrong Key or malformed)
      if (!originalPassword) throw new Error("Decryption resulted in empty string");
    } catch (decryptError) {
      console.error("Payload Decryption Failed:", decryptError);
      res.status(400).json({ success: false, message: "Secure link corrupted: Invalid payload" });
      return;
    }

    // 3. Admin lookup (Only role: admin)
    const admin = await User.findOne({ username: username.trim(), role: 'admin' });
    if (!admin) {
      // Security Tip: Generic message use karo taaki hackers ko pata na chale user exist karta hai ya nahi
      res.status(401).json({ success: false, message: "Access Denied: Connection unauthorized" });
      return;
    }

    // 4. Password Verification (Bcrypt Hashing)
    const isMatch = await bcrypt.compare(originalPassword, admin.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Access Denied: Invalid encryption key" });
      return;
    }

    // 5. Generate Secure JWT
    const jwtSecret = process.env.JWT_SECRET || 'trace_secret_key';
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // 6. Success Response
    res.status(200).json({
      success: true,
      message: "Neural Link Established",
      token,
      admin: { 
        username: admin.username,
        role: admin.role 
      }
    });

  } catch (error) {
    console.error(`[AUTH_CRITICAL_ERROR]:`, error);
    res.status(500).json({ success: false, message: "Internal Neural Shield Error" });
  }
};