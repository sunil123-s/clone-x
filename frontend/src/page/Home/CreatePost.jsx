import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import axios from "axios";
import { ChatState } from "../../context/ChatProvider";

const CreatePost = () => {
	const [text, setText] = useState("");
	const [img, setImg] = useState(null);
    
	const {currentUser} = ChatState()
	const {data:authUser} = useQuery({queryKey:["authUser"]})
	const queryClient = useQueryClient()
    
	const {mutate,isPending,isError,error} = useMutation({
     mutationFn: async() => {
		const formdata = new FormData();
		formdata.append("img", img)
		formdata.append("text", text)

		console.log("Image being sent:", img);
		console.log("Text being sent:", text);
		
		const res = await axios.post(
      "http://localhost:8000/api/post/create",
      formdata,
      {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      }
    );
		return res.data
	 },
	 onSuccess: () => {
		setImg(null),
		setText( " ")
		toast.success("post creted")
		queryClient.invalidateQueries({queryKey:['posts']})
	 },
	 onError: () => {
		console.log(error)
		toast.error('got error')
	 }
	})

	const handleSubmit = (e) => {
		e.preventDefault();
		mutate()
	};

	const handleImginput = (e) => {
       const input = document.createElement('input')
	   input.type = "file",
	   input.accept = "image/*";
	   input.onchange = (e) => {
		 const file = (e.target).files?.[0]
		 if(file){
			setImg(file)
		 }
	   };
	   input.click();
	}

	// console.log(authUser?.alldeatils?.profileImg)

	return (
		<div className='flex p-4 items-start gap-4 border-b border-gray-700'>
			<div className='avatar'>
				<div className='w-8 rounded-full'>
				<img src={authUser?.alldeatils?.profileImg ? `http://localhost:8000/uploads/${authUser?.alldeatils?.profileImg}` : "/avatar-placeholder.png"} />
				</div>
			</div>
			<form className='flex flex-col gap-2 w-full' onSubmit={handleSubmit}>
				<textarea
					className='textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800'
					placeholder='What is happening?!'
					value={text}
					required
					onChange={(e) => setText(e.target.value)}
				/>
				{img && (
					<div className='relative w-72 mx-auto'>
						<IoCloseSharp
							className='absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer'
			  				onClick={() => setImg(null)}
						/>
						<img src={URL.createObjectURL(img)} className='w-full mx-auto h-72 object-contain rounded' />
					</div>
				)}

				<div className='flex justify-between border-t py-2 border-t-gray-700'>
					<div className='flex gap-1 items-center'>
						<CiImageOn
							className='fill-primary w-6 h-6 cursor-pointer'
							onClick={handleImginput}
						/>
						<BsEmojiSmileFill className='fill-primary w-5 h-5 cursor-pointer' />
					</div>
					<button className='btn btn-primary rounded-full btn-sm text-white px-4'>
						{isPending ? "Posting..." : "Post"}
					</button>
				</div>
				{isError && <div className='text-red-500'>Something went wrong</div>}
			</form>
		</div>
	);
};
export default CreatePost;