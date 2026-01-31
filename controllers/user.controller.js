import { prisma } from '../lib/prisma.js';
import { uploadToCloudinary } from '../utilis/cloudinary.js';
import bcrypt from 'bcrypt';


export const getProfile = async (req, res, next) => {
    try {
        const userId =  req.params.userId;

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
        
        const result = req.file ? await uploadToCloudinary(req.file.path, 'profile_pictures') : null;

        const upLoadedUrl = result ? result.secure_url : null;

        const updatedData = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            ...(upLoadedUrl && { profilePicture: upLoadedUrl })
        }

        const user = await prisma.user.update({
            where: { id: id },
            data: updatedData
        })

        return res.status(200).json(user);

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