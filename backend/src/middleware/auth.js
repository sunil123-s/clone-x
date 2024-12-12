import prisma from "../prisma/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"

dotenv.config()

const jwt_token = process.env.JWT_TOKEN;

if(!jwt_token){
    console.log('jwt is not there')
}

export const protectedRoute = async (req,res,next) => {
  try {

    const getToken = req.headers.authorization;
    if (!getToken || !getToken.startsWith("Bearer")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = getToken.split(" ")[1]
   
    const decoded = jwt.verify(token, jwt_token);

    if(!decoded){
        return res.status(401).json({error:'Unauthorized : invaild token'})
    }

    const user = await prisma.user.findUnique({where:{id:decoded.userId},select:{password:false, id:true, userName:true}})

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      req.user = user;
      next()
  } catch (error) {
    console.error('Error in protectedRoute:', error); 
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}