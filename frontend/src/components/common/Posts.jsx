import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import { ChatState } from "../../context/ChatProvider";

const Posts = ({feedtype,username}) => {	 

  const {currentUser} = ChatState()
   
    const getPostEndPoint =() => {
        if(feedtype === 'forYou'){
            return "http://localhost:8000/api/post/allpost"
        }
        else if(feedtype === "following"){
            return "http://localhost:8000/api/post/followingpost"
            
        }else if(feedtype === "posts"){
            return `http://localhost:8000/api/post/userpost/${username}`
        }
        else{
            return "http://localhost:8000/api/post/allpost"
        }
    }	

	const urlToGetPost = getPostEndPoint()

    const { data: posts, isLoading, error,refetch,isRefetching } = useQuery({
        queryKey: ['posts',feedtype],
        queryFn: async () => {
          const res = await axios.get(urlToGetPost, {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          });
          console.log(res.data)
          return res.data?.allposts
        },  
        onSuccess: (data) => {
          // console.log("user data:", data);
        },
        onError: (err) => {
          console.error("Error fetching posts:", error);
        }
      });

	useEffect(() => {
        refetch()
    }, [feedtype,refetch,username]);

	return (
		<>
			 {(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{(!isLoading || !isRefetching) && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{(!isLoading || !isRefetching) && posts && (
				<div>
					{posts?.map((post) => (
						<Post key={post?.id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;