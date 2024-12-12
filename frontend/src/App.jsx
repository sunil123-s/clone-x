import Sidebar from "./components/common/Sidebar"
import HomePage from "./page/Home/HomePage"
import SignUpPage from "./page/auth/signup/SignUpPage"
import ProfilePage from "./page/profile/ProfilePage"
import LoginPage from "./page/auth/login/LoginPage"
import RightPanel from "./components/common/RightPanel"
import NotificationPage from "./page/notification/NotificationPage"
import { Navigate } from "react-router-dom"
import  { Toaster } from "react-hot-toast"
import axios from "axios"
import { Route,Routes } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import LoadingSpinner from "./components/common/LoadingSpinner"
import FollowersAndFollowingInfo from "./page/followinfo/FollowersAndFollowingInfo"
import { ChatState } from "./context/ChatProvider"

function App() {
  const {currentUser} = ChatState() || {}

  console.log("curerntuser:",currentUser)

  const {data:authUser,isLoading} = useQuery({
    queryKey:['authUser'],
    queryFn: async() => {
      try {
        const res = await axios.get('http://localhost:8000/api/auth/me', {
           headers:{
            Authorization : `Bearer ${currentUser.token}`
           }
        }); 
        console.log(authUser)
        return res.data;
      } catch (error) {
        console.log(error)
      }
    },
    onSuccess: (data) => {
      console.log(data)
    },
    onError:  (error ) => {
      console.log(error)
    }
  })

  if ( isLoading) {
    return (
      <div className=" h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
     <div className="flex max-w-6xl mx-auto">
    { currentUser && <Sidebar/>}
    <Routes>
      <Route path="/" element={currentUser ? <HomePage/> : <Navigate to="/login"/>}/>
      <Route path="/login" element={!currentUser ?<LoginPage/> : <Navigate to="/"/> }/>
      <Route path="/signup" element={!currentUser ?<SignUpPage/> : <Navigate to="/"/> }/>
      <Route path="/notifications" element={currentUser ? <NotificationPage/> : <Navigate to="/login"/>}/>
      <Route path="/profile/:username" element={currentUser ? <ProfilePage/> : <Navigate to="/login"/>}/>
      <Route path="/userinfo/:username" element={currentUser ? <FollowersAndFollowingInfo/> : <Navigate to="/login"/>}/>
    </Routes>
     { currentUser && <RightPanel/>}
     <Toaster/>
   </div>
    </>
  )
}

export default App

