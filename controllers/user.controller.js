import { prisma } from '../lib/prisma.js';
import cloudinary from '../utilis/cloudinary.js';
import bcrypt from 'bcrypt';


export const getProfile = async (req, res, next) => {
    try {
        const userId = req.params.userId === "me" ? req.user.id : req.params.userId;

        // console.log(userId);

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                profilePicture: true
            }
        })


        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }
        return res.status(200).json(user);
    } catch (err) {
        next(err);
    }

}

export const updateProfile = async (req, res, next) => {
    try {
        const id = req.user.id;
        const { firstName, lastName, email } = req.body;

        const result = await new Promise((resolve, reject) => {
            if (req.file) {
                cloudinary.uploader.upload_stream(
                    { folder: 'profile_pictures' },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                ).end(req.file.buffer);
            } else {
                resolve(null);
            }
        });

        const upLoadedUrl = result ? result.secure_url : null;

        const updatedData = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            ...(upLoadedUrl && { profilePicture: upLoadedUrl })
        }

        await prisma.user.update({
            where: { id: id },
            data: updatedData
        })

        return res.status(200).json({ success: true, message: "Profile updated successfully" });

    } catch (err) {
        next(err);
    }

}

export const deleteProfile = async (req, res, next) => {
    try {
        const id = req.user.id;
        const { password } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: id },
            select: { password: true }
        });

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: "Incorrect password" });
        }

        await prisma.user.delete({
            where: { id: id }
        });
        return res.status(200).json({ success: true, message: "User profile deleted successfully" });

    } catch (err) {
        next(err);
    }
}