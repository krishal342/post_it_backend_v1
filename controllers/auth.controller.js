import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';

import { NODE_ENV } from '../config/config.js';

import generateToken from '../utilis/tokenGeneration.js';

export const signup = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email.toLowerCase()
            }
        })

        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: "User already exist." 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await prisma.user.create({
            data: {
                firstName,
                lastName,
                email: email.toLowerCase(),
                password: hashedPassword
            }
        });

        return res.status(201).json({
            success: true,
            message: "User created successfully",
        });


    } catch (err) {
        next(err);
    }
}

export const login = async (req, res, next) => {

    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const verifyPassword = await bcrypt.compare(password, user.password);

        if (!verifyPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken(user);

        res.cookie('loginToken', token, {
            httpOnly: true,
            secure: true,
            sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 3 * 24 * 60 * 60 * 1000 
        });
        console.log("Login token set in cookie");
        return res.status(200).json({
            success: true,
            user: user,
            message: "User logged in successfully"
        });


    } catch (err) {
        next(err);
    }
}

export const logout = async (req, res, next) => {
    try {
        return res.clearCookie("loginToken",{
            httpOnly: true,
            secure: true,
            sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
        }).status(200).json({
            success: true,
            message: "User logged out successfully"
        });
    } catch (err) {
        next(err);
    }

}