import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';

import { NODE_ENV } from '../config/config.js';

import generateToken from '../utilis/tokenGeneration.js';
import path from 'node:path';

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
    console.log("Request Origin:", req.headers.origin);  // Check if it matches FRONTEND_URL
    console.log("Request Method:", req.method);
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
            path:'/',
            maxAge: 3 * 24 * 60 * 60 * 1000 
        });
        console.log("Login token set in cookie");
         res.status(200).json({
            success: true,
            user: user,
            message: "User logged in successfully"
        });
        console.log("Login response sent");


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
            path:'/',
        }).status(200).json({
            success: true,
            message: "User logged out successfully"
        });
    } catch (err) {
        next(err);
    }

}