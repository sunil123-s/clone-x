import express from 'express'
import { protectedRoute } from '../middleware/auth.js'
import prisma from '../prisma/index.js'
import path from "path"
import fs from 'fs'
import upload from '../middleware/multer.js'
import { fileURLToPath } from "url";

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

router.post('/create',protectedRoute,upload.single("img"),async(req,res ) => {
    try {
        const userId = req.user.id 
        const {text} = req.body
        
        const image = req.file ? `${req.file.filename}`: null
        console.log("file ingo: ", req.file)

        const user = await prisma.user.findUnique({where:{id: userId}})
        if(!user ){
            res.status(404).json({message:'user not found'})
        }
        

        const post = await prisma.post.create({
            data:{
                text,
                image,
                authorId: userId
            },
            include:{
                comments :true
            }
        }) 
        res.status(200).json({message:'post created', post})
    } catch (error) {
        console.log(error)
        res.status(401).json({message:'failed to create post'})
         
    }
})

router.delete("/:id",protectedRoute,async(req,res) => {
    try {
        const postId = req.params.id
        const userId = req.user.id
        if(!postId ){
            return res.status(400).json("post not found")
        }
        
        const post = await prisma.post.findUnique({
            where: { id: postId },
        });

        if(post.authorId !== userId){
            return res.status(400).json("You are not authorized to delete this post")

        }


        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        
        if(post.image) {
            const imagePath = path.join(__dirname, "../public/uploads/",post.image);
            fs.unlink(imagePath, (err) => {
                if(err){
                    console.error("Error deleting image from local storage:", err);
                }else{
                    console.log("Image deleted from local storage");
                }
            })
        }

        await prisma.post.delete({where:{id:postId}})
        res.status(200).json('post deleted')
    } catch (error) {
        console.log(error)
        res.status(205).json("got error in deleting post")
    }
        
})

router.post('/comment/:id', protectedRoute, async(req,res) => {
    try {
        const  {content}  = req.body
        const postId = req.params.id
        const userId = req.user.id

        const post = await prisma.post.findUnique({where:{id:postId}})
        if(!post){
            return res.status(202).json("post not found")
        }
        
        if(!content){
            return res.status(400).json({ message: "Comment text cannot be empty" });
        }

        const commentpost = await prisma.comment.create({
            data:{
                content,
                postId,
                userId
            },
                include:{
                   user:{
                    select:{
                        userName:true,
                        fullName:true,
                        profileImg:true
                    }
                   }
                }
            
        })

        const notification = await prisma.notification.create({
            data: {
              type: 'COMMENT',
              receiverId: post.authorId,
              senderId: userId,
              postId: postId,
              commentId: commentpost.id,
            }
          });

        console.log(notification)

        res.status(201).json({ message: "Comment created", commentpost });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "An error occurred while creating the comment" });
    }
})

//  router.post("/like/:id", protectedRoute, async (req, res) => {
//        const postId = req.params.id
//        const userId = req.user.id

//        try {

//            const post = await prisma.post.findUnique({where:{id:postId}})

//            if(!post){
//                return res.status(404).json("post not found")
//            }

//            const existingLike = await prisma.like.findUnique({
//                where:{
//                    userId_postId:{
//                       postId,
//                       userId
//                    }
//                }
//            })

//            if(existingLike){
//                await prisma.like.delete({
//                    where:{
//                        userId_postId:{
//                            userId,
//                            postId
//                        }
//                    }
//                });
//                await prisma.post.update({
//                  where: {
//                    id: postId,
//                  },
//                  data: {
//                    likes: {
//                      decrement: 1,
//                    },
//                  },
//                });
//                return res.status(200).json({ message: 'Post unliked' });
//            }else{

//            const updatelike =  await prisma.like.create({
//                   data:{
//                    userId,
//                    postId
//                   }
//                });

//                await prisma.post.update({
//                    where:{
//                        id:postId
//                    },
//                    data:{
//                        likes:{  increment: 1}
//                    }
//                })

//                const notification = await prisma.notification.create({
//                    data: {
//                      type: 'LIKE',
//                      receiverId: post.authorId,
//                      senderId: userId,
//                      postId: postId
//                    }
//                  });

//                console.log(notification)
//                return res.status(200).json({message:"post liked", likedeatils: updatelike});
//            }
//        } catch (error) {
//            console.log(error)
//              return res.status(500).json({ message: 'Error liking/unliking post' });
//        }
//  }); 

router.post("/like/:id", protectedRoute, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the user already liked the post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    let isLiked;
    let likesCount;

    if (existingLike) {
      // If the post is already liked, unlike it
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      // Decrement the like count
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          likes: {
            decrement: 1,
          },
        },
      });

      isLiked = false;
      likesCount = updatedPost.likes;
    } else {
      // If the post is not liked, like it
      const newLike = await prisma.like.create({
        data: {
          userId,
          postId,
        },
      });

      // Increment the like count
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          likes: {
            increment: 1,
          },
        },
      });

      // Create a notification for the post author
      if (post.authorId !== userId) {
        await prisma.notification.create({
          data: {
            type: "LIKE",
            receiverId: post.authorId,
            senderId: userId,
            postId: postId,
          },
        });
      }

      isLiked = true;
      likesCount = updatedPost.likes;
    }

    // Return the updated state
    return res.status(200).json({
      message: isLiked ? "Post liked" : "Post unliked",
      isLiked,
      likesCount,
    });
  } catch (error) {
    console.error("Error liking/unliking post:", error);
    return res.status(500).json({ message: "Error liking/unliking post" });
  }
});



router.get('/allpost',protectedRoute , async(req,res) => {  
        const userId = req.user?.id;
        if(!userId){
            return res.status(404).json({message:"Unauthorized"})
        }
            try {
                const allposts  = await prisma.post.findMany({
                   include:{
                       comments:{
                          include:{
                           user:{
                              select:{
                                  userName:true,
                                  fullName:true,
                                  profileImg:true,
                              } 
                           }
                          }
                       },
                       author:{
                           select:{
                               userName:true,
                               fullName:true,
                               profileImg:true,
                           }
                       }
                   },
                   orderBy:{
                       createdAt: 'desc',
                     },
                })

                res.status(200).json({ message: "user post ", allposts });
           } catch (error) {
               console.log(error)
           }
    
}) 

router.get("/postliked/:id",protectedRoute,async(req,res) => {

    const userId = req.user.id;
    try {
        const allposts = await prisma.like.findMany({
            where:{
                userId
            },
            include:{
                post:{
                    include:{
                        author: {
                            select: {
                                userName: true,
                                fullName: true,
                                profileImg: true
                            }
                        },
                        comments: true
                    }
                },
            }
        })
        res.status(200).json({allposts:allposts})
    } catch (error) {
        console.log(error)
        res.status(400).json('errror getting like post')
        
    }
})

router.get("/followingpost",protectedRoute, async(req,res) => {
    const userId = req.user.id;
    try {
        
  
    const user = await prisma.user.findUnique({where:{id:userId}})
    if(!user){ return res.json("user not found")}

    const followedUser = await prisma.follower.findMany({
        where:{
            userId
        },
        select:{
            followerId:true
        }
    })

    const followerIdextract = followedUser.map(follow => follow.followerId)

    const allposts = await prisma.post.findMany({
        where:{
           authorId:{
            in:followerIdextract
           }
        },
        include:{
            comments:{
               include:{
                user:{
                   select:{
                       userName:true,
                       fullName:true,
                       profileImg:true,
                   } 
                }
               }
            },
            author:{
                select:{
                    userName:true,
                    fullName:true,
                    profileImg:true,
                }
            }
        },
          orderBy:{
            createdAt:'desc',
          }
    })
      res.status(200).json({message:'post',allposts})
    } catch (error) {
        console.log(error)
    res.status(200).json({message:'post not found error',})
        
}
})

router.get('/userpost/:username', protectedRoute, async(req,res) => {
    
    try {
        const {username} = req.params

        const user = await  prisma.user.findUnique({where:{userName:username}})
        if(!user){
            return res.status(404).json("user not found")
        }
        
        const allposts = await prisma.post.findMany({
            where:{
                authorId : user.id,
            },
            include:{
                comments:{
                    include:{
                        user:{
                            select:{
                                userName:true,
                                fullName:true,
                                profileImg:true,
                            }
                        }
                    }
                },
                author:{
                    select:{
                        userName:true,
                        fullName:true,
                        profileImg:true,    
                    }
                },
            },
            orderBy:{
                createdAt:'desc'
            }
        })

        
        return res.status(200).json(allposts);
    } catch (error) {
        console.log(error)
        return res.status(200).json('got some error')
    }
})

export default router