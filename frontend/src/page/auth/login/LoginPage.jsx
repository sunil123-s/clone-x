		import { useState } from "react";
		import { Link } from "react-router-dom";
		import axios from "axios";
		import XSvg from "../../../components/svgs/X";
		import { useNavigate } from "react-router-dom";
		import { MdOutlineMail } from "react-icons/md";
		import { MdPassword } from "react-icons/md";
		import { useMutation, useQueryClient } from "@tanstack/react-query";
		import toast from "react-hot-toast";


		const LoginPage = () => {
			const queryClient = useQueryClient()
			const navigate = useNavigate()
			const [formData, setFormData] = useState({
				identifier: "",
				password: "",
			});


			const {mutate,isLoading,isError,error} = useMutation({
			mutationFn: async(formData) => {
				const res = await axios.post("http://localhost:8000/api/auth/login",formData,{
					headers:{
						"Content-Type": "application/json",
					},
				})
				return res.data;
			},
			retry:false,
			onSuccess: (data) => {
			toast.success('logged in successfuly')
			localStorage.setItem("Userdata",JSON.stringify(data.userInfo))
			navigate('/')
			},
			onError: (error) => {
				console.log(error)
				toast.error("Invaild Credentials")
			}
			})

			const handleSubmit = (e) => {
				e.preventDefault();
				mutate(formData);
			};

			const handleInputChange = (e) => {
				setFormData({ ...formData, [e.target.name]: e.target.value });
			};


			return (
				<div className='max-w-screen-xl mx-auto flex h-screen'>
					<div className='flex-1 hidden lg:flex items-center  justify-center'>
						<XSvg className='lg:w-2/3 fill-white' />
					</div>
					<div className='flex-1 flex flex-col justify-center items-center'>
						<form className='flex gap-4 flex-col' onSubmit={handleSubmit}>
							<XSvg className='w-24 lg:hidden fill-white' />
							<h1 className='text-4xl font-extrabold text-white'>{"Let's"} go.</h1>
							<label className='input input-bordered rounded flex items-center gap-2'>
								<MdOutlineMail />
								<input
									type='text'
									className='grow'
									placeholder='username or email'
									name='identifier'
									onChange={handleInputChange}
									value={formData.identifier}
								/>
							</label>

							<label className='input input-bordered rounded flex items-center gap-2'>
								<MdPassword />
								<input
									type='password'
									className='grow'
									placeholder='Password'
									name='password'
									onChange={handleInputChange}
									value={formData.password}
								/>
							</label>
							<button className='btn rounded-full btn-primary text-white'>{isLoading ? "loading..." : "login"}</button>
							{isError && <p className='text-red-500'>{error?.response?.data?.error || "Invaild Credentials"}</p>}
						</form>
						<div className='flex flex-col gap-2 mt-4 '>
							<p className='text-white text-sm'>{"Don't"} have an account?  <Link to="/signup" className="text-cyan-500">Sign Up</Link></p>
						</div>
					</div>
				</div>
			);
		};
		export default LoginPage;