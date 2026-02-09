import { prisma } from "../lib/prisma.js";
import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../config/config.js';

export const getPosts = async (req, res, next) => {
    try {

        let  userId = "";

        const token = req.cookies.loginToken;  

        console.log("Received token in /home route:", token);  // Debug log to check if token is received

        // token is 'undefined' if there is no loginToken cookie and that reqest is send from frontend without authentication
        if (token != undefined) {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;
    
            userId = req.user.id;
        }

        const posts = await prisma.post.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                author: {
                    select: {
                        firstName: true,
                        lastName: true,
                        profilePicture: true,
                        email: true
                    }
                },
                likes: {
                    // get likes array if logged in user has liked the post which will allow us to set isLiked flag
                    where: {
                        // here userId: req.user.id won't work as req.user will be undefined for unauthenticated requests
                        userId: userId
                    }
                },
                comments: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include:{
                        // get user details of comment author
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                profilePicture: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        // set isLiked flag based on whether likes array has any entry for logged in user or not which will help frontend to easily identify if the post is liked by logged in user
        const postWithLikedFlag = posts.map((post) => {
            return {
                ...post,
                isLiked: post.likes.length > 0
            }
        })

        return res.status(200).json(postWithLikedFlag);

    } catch (err) {
        next(err);
    }
}