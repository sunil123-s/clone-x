import express from "express"
import { protectedRoute } from "../middleware/auth.js"
import prisma from "../prisma/index.js"

const router = express.Router()


router.get('/notifications', protectedRoute, async (req, res) => {
    try {
      const userId = req.user.id;
  
      const notifications = await prisma.notification.findMany({
        where: {
          receiverId: userId
        },
        include: {
          sender: {
            select: {
              id: true,
              userName: true,
              profileImg: true
            }
          },
          post: {
            select: {
              id: true,
              text: true,
              image: true
            }
          },
          comment: {
            select: {
              id: true,
              content: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
  
      res.status(200).json(notifications);
    } catch (error) {
        console.log(error)
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

router.delete('/deleteallnotify', protectedRoute, async(req,res) => {
       const userId = req.user.id;
       try {
          await prisma.notification.deleteMany({
              where:{
                     receiverId:userId
              }      
          })
          res.status(200).json({ message: "All notifications deleted successfully." });
       } catch (error) {
              console.log(error)
              res.status(500).json({ error: "Failed to delete notifications." });
       }
})

router.delete("/deletenotify/:id",protectedRoute,async(req,res) =>{
        const notificationsId = req.params.id
        const userId = req.user.id
        try {

            const notification = await prisma.notification.findUnique({
                where: {
                  id: notificationsId, // Look for the notification by its unique ID
                }
              });

              if (!notification || notification.receiverId !== userId) {
                return res.status(403).json({ error: "You are not authorized to delete this notification." });
              }

               await prisma.notification.delete({
                where:{
                        id:notificationsId
                }
            })
            res.status(200).json({ message: "Notification deleted successfully." });
        } catch (error) {
            console.log(error)
                res.status(500).json({ error: "Failed to delete notification." });      
        }
    })

export default router 