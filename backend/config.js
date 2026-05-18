import dotenv from "dotenv";

//ejecutamos la libreria dotenv
dotenv.config();

export const config = {
  JWT: {
    secret: process.env.JWT_Secret_key,
  },
  email:{
    user_email: process.env.USER_EMAIL,
    user_password: process.env.USER_PASSWORD
  },
  cloudinary:{
    cloudinary_name: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_api_key: process.env.CLODUINARY_API_KEY,
    clodinary_api_secret: process.env.CLODUINARY_API_SECRET
  }
};
