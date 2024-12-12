import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import useFollow from "../../utils/useFollow";
import LoadingSpinner from "./LoadingSpinner";
import { ChatState } from "../../context/ChatProvider";

const RightPanel = () => {
     
	const {follow,isPending} = useFollow();
	const {currentUser} = ChatState()

	const {data,isLoading,isError,error} = useQuery({
    queryKey:['suggestedUser'],
	queryFn: async () => {
		const res = await axios.get("http://localhost:8000/api/user/suggested",{
			headers:{
				Authorization : `Bearer ${currentUser.token}`
			}
		})
		// console.log("suggesed:", res.data)
		return res.data
	},
	onError: () => {
		console.log(error)
		toast.error('someting went wrong')
	}
	})    
	return (
		<div className='hidden lg:block my-4 mx-2'>
			<div className='bg-[#16181C] p-4 rounded-md sticky top-2'>
				<p className='font-bold'>Who to follow</p>
				<div className='flex flex-col gap-4'>
					{/* item */}
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}
					{!isLoading &&
						data?.map((user) => (
							<Link
								to={`/profile/${user.userName}`}
								className='flex items-center justify-between gap-4'
								key={user.id}
							>
								<div className='flex gap-2 items-center'>
									<div className='avatar'>
										<div className='w-8 rounded-full'>
											<img src={user?.profileImg ? `http://localhost:8000/uploads/${user.profileImg}` : "/avatar-placeholder.png"} />
										</div>
									</div>
									<div className='flex flex-col'>
										<span className='font-semibold tracking-tight truncate w-28'>
											{user.fullName}
										</span>
										<span className='text-sm text-slate-500'>@{user.userName}</span>
									</div>
								</div>
								<div>
									<button
										className='btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm'
										onClick={(e) => {
											e.preventDefault()
                                            follow(user.id);
										}}
									>
										{isPending ? <LoadingSpinner size="sm"/> : "Follow"}
									</button>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;

