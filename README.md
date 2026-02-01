# Backend project using node.js
- express
- postgreSQL DataBase
- cloudinary // for image storing
- jsonwebtoken
- bcrypt


# Depedencies

- "@prisma/adapter-pg": "^7.2.0",
- "@prisma/client": "^7.2.0",
- "bcrypt": "^6.0.0",
- "cloudinary": "^2.8.0",
- "cookie-parser": "^1.4.7",
- "cors": "^2.8.5",
- "dotenv": "^17.2.3",
- "express": "^5.2.1",
- "jsonwebtoken": "^9.0.3",
- "multer": "^2.0.2",
- "pg": "^8.16.3"

# .env variables

- PORT
- JWT_SECRET
- NODE_ENV
- FRONTEND_URL
- DATABASE_URL
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

# Routes
// auth routes  
- /auth/signup -> POST request take( firstname, lastname, email, password)
- /auth/login -> POST request take(email, password)
- /auth/logout -> GET request

// home route  
- /home/ -> GET request to get posts

// post routes  
- /posts/create -> POST request to create post
- /posts/:userId -> GET request to get all post by userId
- /posts/:postId -> DELETE request to delete post
- /posts/like/:postId -> PUT request to like a post
- /posts/liked/me -> GET request to get all post liked by logged in user
- /posts/comment/:postId -> POST request to crete a comment
- /posts/commented/me -> GET request to get all post commented by logged in user
- /posts/comment/:commentId -> DELETE request to delete a comment

//user routes  
- /users/:userId -> GET request to get profile by userId
- /users/updateProfile -> PUT request to update profile
- /users/deleteProfile -> DELETE request to delete profile
