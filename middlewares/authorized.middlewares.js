import jwt from 'jsonwebtoken';

import { jwt_secret_key } from "../variables.js";



const authorized = async (req , res , next) => {

   try {
    
    const token = req.cookies.token;

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