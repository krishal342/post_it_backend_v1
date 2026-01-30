import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from '../config/config.js';

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (filePath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: 'auto',
            folder: folder
        });

        // clean up local file after upload
        fs.unlinkSync(filePath);

        return result;
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        throw err;
    }

}