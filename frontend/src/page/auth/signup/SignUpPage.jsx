import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import XSvg from "../../../components/svgs/X";

import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword, MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    email: "",
    userName: "",
    fullName: "",
    password: "",
  });

  const { mutate, isError, isLoading, error } = useMutation({
    mutationFn: async (formData) => {
      const res = await axios.post(
        "http://localhost:8000/api/auth/signup",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Signed up successfully");
      localStorage.setItem('Userdata', JSON.stringify(data.userInfo))
      navigate("/");
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.error || "An error occurred.";
      console.log(error)
      toast.error(errorMessage);
      console.log(errorMessage);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(formData);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    console.log("formdata:",formData)
  };

  return (
    <div className="max-w-screen-xl mx-auto flex h-screen px-10">
      <div className="flex-1 hidden lg:flex items-center justify-center">
        <XSvg className="lg:w-2/3 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col"
          onSubmit={handleSubmit}
        >
          <XSvg className="w-24 lg:hidden fill-white" />
          <h1 className="text-4xl font-extrabold text-white">Join today.</h1>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="email"
              className="grow"
              placeholder="Email"
              name="email"
              onChange={handleInputChange}
              value={formData.email}
            />
          </label>
          <div className="flex gap-4 flex-wrap">
            <label className="input input-bordered rounded flex items-center gap-2 flex-1">
              <FaUser />
              <input
                type="text"
                className="grow"
                placeholder="userName"
                name="userName"
                onChange={handleInputChange}
                value={formData.userName}
              />
            </label>
            <label className="input input-bordered rounded flex items-center gap-2 flex-1">
              <MdDriveFileRenameOutline />
              <input
                type="text"
                className="grow"
                placeholder="Full Name"
                name="fullName"
                onChange={handleInputChange}
                value={formData.fullName}
              />
            </label>
          </div>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type="password"
              className="grow"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />
          </label>
          <button className="btn rounded-full btn-primary text-white">
            {isLoading ? "Loading..." : "Sign Up"}
          </button>
          {isError && (
            <p className="text-red-500">{error?.response?.data?.error}</p>
          )}
        </form>
        <div className="flex lg:w-2/3 justify-center gap-2 mt-4">
          <p className="text-white text-sm ">Already have an account?  <Link to="/login" className="text-cyan-500">login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
