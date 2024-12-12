
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ChatState } from '../context/ChatProvider'

const useUpdate = (formData) => {
	const { currentUser } = ChatState();

    const queryClient = useQueryClient()
    const {mutate:EditProfile,error,isPending:EditLoading} = useMutation({
		mutationFn: async() => {
			const res = await axios.post(
        "http://localhost:8000/api/user/update",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
            // console.log("userdata:",res.data)
			return res.data
		},
		onSuccess:() => {
			toast.success("updated profile")
            Promise.all([
                queryClient.invalidateQueries({queryKey:['authUser']}),
                queryClient.invalidateQueries({queryKey:['userProfile']})
            ])
		},
		onError: (error) => {
			console.log("error:", error);
		}

	})
    return {EditProfile,EditLoading}
}


export default useUpdate
