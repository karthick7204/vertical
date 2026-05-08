import { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, sendRefreshToken } from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'LEARNER',
    });

    if (user) {
      const accessToken = generateAccessToken(user._id.toString());
      const refreshToken = generateRefreshToken(user._id.toString());
      
      user.refreshToken = refreshToken;
      await user.save();

      sendRefreshToken(res, refreshToken);

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accessToken,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = generateAccessToken(user._id.toString());
      const refreshToken = generateRefreshToken(user._id.toString());

      user.refreshToken = refreshToken;
      await user.save();

      sendRefreshToken(res, refreshToken);

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accessToken,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh_token
// @access  Public
export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ accessToken: '' });
  }

  let payload: any = null;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
  } catch (err) {
    return res.status(401).json({ accessToken: '' });
  }

  const user = await User.findById(payload.userId);

  if (!user || user.refreshToken !== token) {
    return res.status(401).json({ accessToken: '' });
  }

  const accessToken = generateAccessToken(user._id.toString());
  const newRefreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = newRefreshToken;
  await user.save();

  sendRefreshToken(res, newRefreshToken);

  return res.json({ accessToken });
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(204).send();

  const user = await User.findOne({ refreshToken: token });
  if (user) {
    user.refreshToken = '';
    await user.save();
  }

  res.clearCookie('refreshToken', { path: '/api/auth/refresh_token' });
  return res.status(200).json({ message: 'Logged out' });
};
