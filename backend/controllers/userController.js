import asyncHandler from '../middlewares/asyncHandler.js';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import createToken from '../utils/createToken.js';

const createUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400);
        throw new Error('Please fill all fields');
    }

    const userExists = await User.findOne({ email });
    if (userExists) res.status(400).send('User already exists');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ username, email, password: hashedPassword });

    try {
        await newUser.save();
        createToken(res, newUser._id);

        res.status(201).json(newUser);
    } catch (error) {
        res.status(400);
        throw new Error('Invalid user data', error);
    }

    console.log(req.body);
});

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error('Please fill all fields');
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if (isPasswordValid) {
            createToken(res, existingUser._id);

            res.status(200).json(existingUser);
            return;
        } else {
            res.status(400);
            throw new Error('Invalid credentials');
        }
    }

    const user = await User.findOne({ email });
    if (!user) {
        res.status(400);
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid credentials');
    }

    createToken(res, user._id);

    res.status(200).json(user);
};

const logoutCurrentUser = asyncHandler(async (req, res) => {
    res.cookie('token', '', {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV !== 'development',
    });

    res.status(200).send('User logged out');
});

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

export { createUser, loginUser, logoutCurrentUser, getAllUsers };