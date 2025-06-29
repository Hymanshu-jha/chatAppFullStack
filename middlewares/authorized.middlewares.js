import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config(); // load .env variables

const jwt_secret_key = process.env.JWT_SECRET_KEY;



const authorized = async (req , res , next) => {

   try {
    
    const token =
  req.cookies.token ||                // Check for token in cookies
  (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : null);                          // Check for Bearer token in headers


    if(!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });

    const decoded = jwt.verify(token, jwt_secret_key);
    
    req.user = decoded;
    next();

   } catch (error) {
    console.log('error while authorizing ', error.message);
    next(error);
   }
  
};

export default authorized;