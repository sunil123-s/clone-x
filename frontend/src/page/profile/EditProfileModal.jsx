
	import { useState,useEffect } from "react";
	import { BiCoinStack } from "react-icons/bi";
	import useUpdate from "../../utils/useUpdate";

	const EditProfileModal = ({userdata}) => {
		const [formData, setFormData] = useState({
			fullName: "",
			userName: "",
			email: "",
			bio: "",
			link: "",
			newpassword: "",
			currentpassword: "",
		});

	const {EditLoading,EditProfile} = useUpdate(formData)

		const handleInputChange = (e) => {
			setFormData({ ...formData, [e.target.name]: e.target.value });
		};

		useEffect(() => {
         if(userdata){
			setFormData((prevData) => ({
			  ...prevData,
			  fullName: userdata.fullName || "",
			  userName: userdata.userName || "",
			  email: userdata.email || "",
			  bio: userdata.bio || "",
			  link: userdata.link || "",
			  newpassword:'',
			  currentpassword: "",
			}))
		 }
		}, [userdata])
		


		return (
			<>
				<button
					className='btn btn-outline rounded-full btn-sm'
					onClick={() => document.getElementById("edit_profile_modal").showModal()}
				>
					Edit profile
				</button>
				<dialog id='edit_profile_modal' className='modal'>
					<div className='modal-box border rounded-md border-gray-700 shadow-md'>
						<h3 className='font-bold text-lg my-3'>Update Profile</h3>
						<form
							className='flex flex-col gap-4'
							onSubmit={(e) => {
								e.preventDefault();
								EditProfile(formData)
							}}
						>
							<div className='flex flex-wrap gap-2'>
								<input
									type='text'
									placeholder='Full Name'
									className='flex-1 input border border-gray-700 rounded p-2 input-md'
									value={formData.fullName}
									name='fullName'
									onChange={handleInputChange}
								/>
								<input
									type='text'
									placeholder='Username'
									className='flex-1 input border border-gray-700 rounded p-2 input-md'
									value={formData.userName}
									name='userName'
									onChange={handleInputChange}
								/>
							</div>
							<div className='flex flex-wrap gap-2'>
								<input
									type='email'
									placeholder='Email'
									className='flex-1 input border border-gray-700 rounded p-2 input-md'
									value={formData.email}
									name='email'
									onChange={handleInputChange}
								/>
								<textarea
									placeholder='Bio'
									className='flex-1 input border border-gray-700 rounded p-2 input-md'
									value={formData.bio}
									name='bio'
									onChange={handleInputChange}
								/>
							</div>
							<div className='flex flex-wrap gap-2'>
								<input
									type='password'
									placeholder='Current Password'
									className='flex-1 input border border-gray-700 rounded p-2 input-md'
									value={formData.currentpassword}
									name='currentpassword'
									onChange={handleInputChange}
								/>
								<input
									type='password'
									placeholder='New Password'
									className='flex-1 input border border-gray-700 rounded p-2 input-md'
									value={formData.newpassword}
									name='newpassword'
									onChange={handleInputChange}
								/>
							</div>
							<input
								type='text'
								placeholder='Link'
								className='flex-1 input border border-gray-700 rounded p-2 input-md'
								value={formData.link}
								name='link'
								onChange={handleInputChange}
							/>
							<button className='btn btn-primary rounded-full btn-sm text-white'>{EditLoading ? "loading..." : "update"}</button>
						</form>
					</div>
					<form method='dialog' className='modal-backdrop'>
						<button className='outline-none'>close</button>
					</form>
				</dialog>
			</>
		);
	};
	export default EditProfileModal;