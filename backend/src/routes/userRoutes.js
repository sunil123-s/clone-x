import express from "express";
import { protectedRoute } from "../middleware/auth.js";
import prisma from "../prisma/index.js"
const router = express.Router()
import bcrypt from 'bcryptjs'
import fs from 'fs'
import upload from "../middleware/multer.js";
import path from "path"
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


router.get("/profile/:username",protectedRoute,async(req,res ) => {
    try {
        const {username} = req.params;

        const user = await prisma.user.findUnique({
            where:{
              userName: username
            },
            select:{
                  id:true,
            userName: true,
            fullName: true,
            email: true,
            coverImg: true,
            profileImg: true,
            bio: true,
            link:true,
            following :true,
            followers :true,
            comments :true,
            createdAt:true,
            posts :{
              orderBy:{
                createdAt:'desc'
              },
              select:{
                id:true,
                text: true,
                image: true,
                createdAt: true 
              }
            },
        },
        })
       
        if(!user){
            res.status(400).json({message:"user not found"})
        }
         res.status(200).json(user)

    } catch (error) {
        console.error('Error in /profile route:', error);
        res.status(400).json({message:"user not found try after some time"})
    }  
})

router.get("/suggested",protectedRoute,async(req,res ) => {
      try {
        const userId = req.user.id;

        const suggestedUser = await prisma.user.findMany({
          where: {
            id: {
              not: userId,  // Exclude the current user
            },
            followers: {
              none: {
                userId: userId,  // Exclude users that the current user is already following
              },
            },
          },
          select: {
            id: true,
            userName: true,
            fullName: true,
            profileImg: true,
          },
          take: 10,
        })
 
       res.status(200).json(suggestedUser)
      } catch (error) {
        console.error('Error in /suggested route:', error.message);
        res.status(500).json({ message: "An error occurred, please try again later" });
      }
})  

router.post("/follow/:id",protectedRoute,async(req,res ) => {
      try {
        const userId = req.user.id;  //logged in user sunil id
        const followedId = req.params.id; // user trying to follow another user id john id

        if(followedId === userId){
            return res.status(400).json({ message: "You cannot unfollow yourself." });
        }

        const followedUser = await prisma.user.findUnique({
            where: { id: followedId },
          });
      
          if (!followedUser) {
            return res.status(404).json({ message: "User not found." });
          } 
        
        const existingFollow= await prisma.follower.findUnique({
            where:{
                userId_followerId:{
                    userId, // sunil id
                    followerId: followedId,    // john id
                }
            }
        })

        if(existingFollow) {
            await prisma.follower.delete({
                where:{
                    id : existingFollow.id
                }
            })
            return res.status(200).json({ message: "Successfully unfollowed the user." });
        }else{
            await prisma.follower.create({
                data:{
                    userId ,       // sunil id
                    followerId: followedId, //jogn id
                },
            })
            
            const notification = await prisma.notification.create({
              data: {
                type: 'FOLLOW',
                receiverId: followedId,
                senderId: userId,
              }
            });
            console.log(notification)
            return res.status(200).json({ message: "Successfully followed the user." });
        }


      } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to unfollow the user." });
      }
})

router.post("/update",upload.fields([{name:"profileImg"},{name:"coverImg"}]),protectedRoute,async(req,res ) => {
         try {
             const {userName, fullName,email, bio, link, currentpassword,newpassword,} = req.body;
             const userId = req.user.id

             const user = await prisma.user.findUnique({ where:{id:userId}})

             if(!user){
                res.status(400).json({message:"user not found"})
             } 
               
             if (currentpassword || newpassword) {
                if (!currentpassword || !newpassword) {
                  return res.status(400).json({ message: "Please provide both current and new passwords" });
                }
          
                const isMatch = await bcrypt.compare(currentpassword, user.password);
                if (!isMatch) {
                  return res.status(401).json({ message: "Current password is incorrect" });
                }
          
                if (newpassword.length < 8) {
                  return res.status(400).json({ message: "New password must be at least 8 characters" });
                }
          
                const hashedPassword = await bcrypt.hash(newpassword, 10);
                await prisma.user.update({
                  where: { id: userId },
                  data: { password: hashedPassword },
                });
              }

              let newProfileImage = user.profileImg;
               if(req.files && req.files.profileImg && req.files.profileImg.length > 0){
                 if(user.profileImg){
                  fs.unlink(path.join(__dirname, "../public/uploads/",user.profileImg),(err) => {
                    if(err){
                      if (err) console.error("Error deleting old profile image:", err);
                    }
                  }) 
                 } 
                 newProfileImage = req.files.profileImg[0].filename
                }

               let newCoverImage = user.coverImg;
               if(req.files && req.files.coverImg && req.files.coverImg.length > 0){
                if(user.coverImg ){
                  fs.unlink(path.join(__dirname, "../public/uploads/", user.coverImg),(err) => {
                    if(err){
                      console.error("Error deleting old profile image:", err);
                    }
                  })
                }
                newCoverImage = req.files.coverImg[0].filename
              }


             const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                  userName: userName || user.userName,
                  fullName: fullName || user.fullName,
                  email: email || user.email,
                  bio: bio || user.bio,
                  link: link || user.link,
                  profileImg: newProfileImage,
                  coverImg: newCoverImage
                },
              });
          
            res.status(200).json(updatedUser)
         } catch (error) {
            console.log(error)
            res.status(500).json({ message: "An error occurred, please try again later" });
         }
})

router.get("/followers/:username",async(req,res) => {
  try {
    const username = req.params.username;
    console.log(username)
    const userfollowers = await prisma.user.findUnique({
      where:{
        userName: username
      },
      include:{
        followers:{
          select:{
            userId:true
          }
        },
        following:{
          select:{
            followerId:true,
          }
        },
      }      
    })

  
    if (!userfollowers) {
      return res.status(404).json({ error: 'User not found' });
    }

    const folowerUserId = userfollowers.followers.map(f => f.userId)
    const folowerfollowerId = userfollowers.following.map(f => f.followerId)

    const followersInfo = await prisma.user.findMany({
      where:{
        id:{
          in:folowerUserId
        }
      },
      select:{
        id:true,
        userName:true,
        fullName:true,
        profileImg:true
      }
    })

    const followingInfo = await prisma.user.findMany({
      where:{
        id:{
          in:folowerfollowerId
        }
      },
      select:{
        id:true,
        userName:true,
        fullName:true,
        profileImg:true
      }
    })

    res.json({
      user: {
        followerdetails: followersInfo,
        followingdetails: followingInfo,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching followers' });
    console.error("Error fetching followers:", error); // Log the error for debugging
    res.status(500).json({ error: 'Error fetching followers' });
  }
})


export default router