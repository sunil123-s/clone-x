import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { ChatState } from "../context/ChatProvider";

const useFollow = () => {
    const {currentUser} = ChatState()
    const queryClient = useQueryClient()
    const {mutate:follow,isPending} = useMutation({
       mutationFn: async (userId) => {
        // console.log("userid :",userId)
        const res = await axios.post(`http://localhost:8000/api/user/follow/${userId}`, {},{
            headers:{
                Authorization : `Bearer ${currentUser.token}`
            }
        })
        return res.data
       },
       onSuccess: () => {
        toast.success("follow user")
        Promise.all([
            queryClient.invalidateQueries({queryKey:["suggestedUser"]}),
            queryClient.invalidateQueries({queryKey: ['authUser']})
        ])
       },
       onError:(error) =>{
        console.log("error:", error)    
       }
    });
    return {follow,isPending}

}


export default useFollow