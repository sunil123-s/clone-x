import express from "express";
import prisma from "../prisma/index.js"
import { loginSchema, SingUpSchema } from "../middleware/zodSchems.js";
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken";
import { protectedRoute } from "../middleware/auth.js";
import dotenv from "dotenv"

const router = express.Router();

dotenv.config()

const jwt_token = process.env.JWT_TOKEN;


if(!jwt_token){
    console.log('jwt is not there')
}

router.post("/signup",async (req , res ) => {
    try { 
        const userData = req.body;
        const parseResult= SingUpSchema.safeParse(userData);

        if(!parseResult.success){
            console.log("Validation failed:", parseResult.error.format())
            return res.status(400).json({error:parseResult.error.format()})
        }
       
        const { fullName, userName, email, password,bio,coverImag,profileImg,link } = parseResult.data;

        const existingUsername = await prisma.user.findUnique({where:{userName}})
        if(existingUsername){ return res.status(409).json({error:'uername already taken'})}

        const existingemail = await prisma.user.findUnique({where:{email}})
        if(existingemail){ return res.status(409).json({error:'email already taken'})}
        
        const hasshedPassword = await bcrypt.hash(password,10)
 
        const user = await prisma.user.create({
            data:{
                fullName,
                userName,   
                email,
                password:hasshedPassword,
                bio:bio || null,
                coverImg:coverImag || null,
                profileImg:profileImg || null,
                link:link || null
            }
        })


        const token = jwt.sign({userId:user.id},jwt_token,{expiresIn:'7d'})

       res.status(200).json({
         message: "user created",
         userInfo: {
           id:user.id,
           fullName: user.fullName,
           userName: user.userName,
           email: user.email,
           bio: user.bio,
           profileImg: user.profileImg,
           coverImag: user.coverImag,
           link: user.link,
           token: token,
         },
       });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user', details: error.message });
    }
})

router.post("/login",async(req , res ) => {
    try {
    
        const userdata = req.body;
        const praseSchema = loginSchema.safeParse(userdata)


        if(!praseSchema.success){
            return res.status(400).json({error:praseSchema.error.format()})
        };

        const {identifier,password} = praseSchema.data;

        const user= await prisma.user.findFirst({
            where:{
                OR:[
                    {email:identifier},{userName:identifier}
                ]
            }
        })

        if (!user) {
            return res.status(401).json({ error: 'Invalid Credentials' });
        }
        
        const isPasswordvalidate = await bcrypt.compare(password, user.password)
        
        if (!isPasswordvalidate) {
            return res.status(401).json({ error: 'Invalid Credentials' });
        }

        const token = jwt.sign({userId:user.id},jwt_token,{expiresIn:"7d"})
        
           res.status(200).json({
             message: "user logged-in",
             userInfo: {
               id: user.id,
               fullName: user.fullName,
               userName: user.userName,
               email: user.email,
               bio: user.bio,
               profileImg: user.profileImg,
               coverImag: user.coverImag,
               link: user.link,
               token: token,
             },
           });

    } catch (error) {
        res.status(500).json({ error: 'Failed to login user'});
    }
})

// router.post("/logout",async(req , res ) => {
//     try {
//         res.clearCookie('token')
//         res.status(200).json({message:"logged out successfully"})   
//     } catch (error) {
//         res.status(400).json({message:"pls try again later"})    
//     }
// })

router.get("/me",protectedRoute,async(req,res) => {

  try {
     const userId = req.user.id
     const user = await prisma.user.findUnique({
        where:{
            id:userId
        },
        include:{
            followers:true,
            following:true
        }
     }) 
     const {password, ...alldeatils} = user

    if(!user){
        return res.status(401).json({message:"login first"})
       }
     res.status(200).json({message:"welcome",alldeatils})
    } catch (error) {
        console.log(error)
      res.status(500).json({error:"someting went wrong"})
  }
})


export default router