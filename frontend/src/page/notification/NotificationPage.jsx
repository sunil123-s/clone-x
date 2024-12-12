import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import { IoSettingsOutline } from "react-icons/io5";
import { FaRegComment,FaTrash } from "react-icons/fa";
import { SlUserFollowing } from "react-icons/sl";
import { FaHeart } from "react-icons/fa6";
import {useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { ChatState } from "../../context/ChatProvider";

const NotificationPage = () => {
  const {currentUser} = ChatState()
  
  const queryClient = useQueryClient()
  const {data:notifications, isLoading, error} = useQuery({
    queryKey:['Notification'],
    queryFn: async() => {
      const res = await axios.get(
        "http://localhost:8000/api/notification/notifications",
        {
          headers:{
            Authorization: `Bearer ${currentUser.token}`,
          }
        }
      ); 
      return res.data
    },
    onError:() => {
      console.log("error :", error)
    }
  })

  const {mutate:deletall,isLoading:waiting} = useMutation({
    mutationFn:async() => {
      const res = await axios.delete("http://localhost:8000/api/notification/deleteallnotify",{
        headers:{
          Authorization : `Bearer ${currentUser.token}`
        }
      })
      return res.data
    },
    onSuccess:() => {
      toast.success("deleted all notification")
      queryClient.invalidateQueries({queryKey:['Notification']})
    },
    onError:() => {
      console.log("error:", error.message)
    }
  })

	const deleteNotifications = () => {
    deletall();
	};
  
  const {mutate:singledelete} = useMutation({
    mutationFn: async(id) => {
      const res = await axios.delete(`http://localhost:8000/api/notification/deletenotify/${id}`,{
        headers:{
          Authorization : `Bearer ${currentUser.token}`
        }
      })
      return res.data
    },
    onSuccess:() =>{
      toast.success('deleted')
      queryClient.invalidateQueries({queryKey:['Notification']})
    },
    onError:() => {
      console.log('error:', error.message)
    }
  })

  const deleteSinglenotification = (id) => {
    singledelete(id);
  }

	return (
		<>
			<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
				<div className='flex justify-between items-center p-4 border-b border-gray-700'>
					<p className='font-bold'>Notifications</p>
					<div className='dropdown '>
						<div tabIndex={0} role='button' className='m-1'>
							<IoSettingsOutline className='w-4' />
						</div>
						<ul
							tabIndex={0}
							className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
						>
							<li>
								<a onClick={deleteNotifications}>Delete all notifications</a>
							</li>
						</ul>
					</div>
				</div>
				{isLoading && (
					<div className='flex justify-center h-full items-center'>
						<LoadingSpinner size='lg' />
					</div>
				)}
				{notifications?.length === 0 && <div className='text-center p-4 font-bold'>No notifications 🤔</div>}
				{notifications?.map((notification) => (
					<div className='border-b border-gray-700' key={notification.id}>
						<div className='flex gap-2 p-4 justify-between'>
              <div className="flex gap-2">
							{notification.type === "FOLLOW" && <FaRegComment className='w-7 h-7 text-primary' />}
							{notification.type === "LIKE" && <FaHeart className='w-7 h-7 text-red-500' />}
							{notification.type === "COMMENT" && <FaRegComment className='w-7 h-7 text-blue-500' />}
							<Link to={`/profile/${notification.sender.userName}`}>
								<div className='avatar'>
									<div className='w-8 rounded-full'>
									<img src={notification?.sender?.profileImg ? `http://localhost:8000/uploads/${notification?.sender?.profileImg}` : "/avatar-placeholder.png"} />
									</div>
								</div>
								<div className='flex gap-1'>
									<span className='font-bold'>@{notification.sender.userName}</span>{" "}
									{notification.type === "FOLLOW" ? "followed you":
                   notification.type === "LIKE" ? 'like your post':
                   notification.type === "COMMENT" ? "comment on your post":''}
								</div>
							</Link>
								</div>
              <span onClick={() => deleteSinglenotification(notification.id)} className="hover:text-red-500"><FaTrash/></span>
						</div>
					</div>
				))}
			</div>
		</>
	);
};
export default NotificationPage;



