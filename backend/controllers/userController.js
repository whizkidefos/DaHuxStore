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

export { createUser };