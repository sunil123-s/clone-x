// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import React from "react";
// import { useParams } from "react-router-dom";
// import LoadingSpinner from "../../components/common/LoadingSpinner";
// import { Link } from "react-router-dom";
// import { ChatState } from "../../context/ChatProvider";

// const FollowersAndFollowingInfo = () => {
//   const { username } = useParams();
  
//   const {currentUser} = ChatState()

//   const {data: followInfo, isLoading, error,} = useQuery({
//     queryKey: ["followerAndFollowing", username],
//     queryFn: async () => {
//       const res = await axios.get(
//         `http://localhost:8000/api/user/followers/${username}`,
//         {},
//         {
//           headers: {
//             Authorization: `Bearer ${currentUser.token}`,
//           },
//         }
//       );
//       return res.data;
//     },
//     onError: () => {
//       console.log(error);
//     },
//   });

//   {
//     isLoading && (
//       <div className="flex justify-center h-full items-center">
//         <LoadingSpinner size="lg" />
//       </div>
//     );
//   }

//   const {followerdetails = [] ,followingdetails = [] } = followInfo?.user || {};

//   return (
//     <div className="flex w-[660px] border-l border-r border-gray-700 min-h-screen ">
//       <div className="w-6/12 border-r border-gray-700 p-4">
//         <p className="font-bold mb-6">Follwing</p>
//         {followingdetails.length === 0 ? "0 following" : (
//         followingdetails.map((follow) => (
//           <div className="hover:bg-slate-900 rounded-xl" key={follow.id}>
//             <div className="flex gap-2 p-4 justify-between">
//               <div className="flex gap-2">
//                 <Link to={`/profile/${follow?.userName}`}>
//                   <div className="flex items-center">
//                     <div className="w-8 h-8 rounded-full overflow-hidden mr-5">
//                       <img
//                        className="w-full h-full object-cover"
//                         src={
//                           follow?.profileImg
//                             ? `http://localhost:8000/uploads/${follow?.profileImg}`
//                             : "/avatar-placeholder.png"
//                         }
//                       />
//                     </div>
//                     <div>
//                         {follow?.fullName}
//                     </div>
//                   </div>
//                   <div className="flex gap-1 ml-12">
//                     <span className="font-bold">
//                       @{follow?.userName}
//                     </span>
//                   </div>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         )))}
//       </div>
//       <div className="w-6/12 border-r border-gray-700 p-4">
//         <p className="font-bold mb-6">Follower</p>
//         {followerdetails.length === 0 ? "0 follower" : (
//         followerdetails.map((follow) => (
//           <div  className="hover:bg-slate-900 rounded-xl" key={follow.id}>
//             <div className="flex gap-2 p-4 justify-between">
//               <div className="flex gap-2">
//                 <Link to={`/profile/${follow?.userName}`}>
//                   <div className="flex items-center">
//                   <div className="w-8 h-8 rounded-full overflow-hidden mr-5">
//                       <img
//                        className="w-full h-full object-cover"
//                         src={
//                           follow?.profileImg
//                             ? `http://localhost:8000/uploads/${follow?.profileImg}`
//                             : "/avatar-placeholder.png"
//                         }
//                       />
//                     </div>
//                     <div>
//                         {follow?.fullName}
//                     </div>
//                   </div>
//                   <div className="flex gap-1 ml-12">
//                     <span className="font-bold">
//                       @{follow?.userName}
//                     </span>
//                   </div>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         )) )}
//       </div>
//     </div>
//   );
// };

// export default FollowersAndFollowingInfo;


import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { useParams, Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { ChatState } from "../../context/ChatProvider";

const FollowersAndFollowingInfo = () => {
  const { username } = useParams();
  const { currentUser } = ChatState();

  const {
    data: followInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["followerAndFollowing", username],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:8000/api/user/followers/${username}`,
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
      return res.data;
    },
    onError: () => {
      console.log(error);
    },
  });

  const { followerdetails = [], followingdetails = [] } =
    followInfo?.user || {};

  if (isLoading) {
    return (
      <div className="flex justify-center h-full items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row w-full min-h-screen border-2 border-gray-800">
      {/* Following Section */}
      <div className="sm:w-1/2 w-full border-b sm:border-b-0 sm:border-r border-gray-700 p-4 overflow-auto">
        <p className="font-bold mb-6">Following</p>
        {followingdetails.length === 0 ? (
          <p>0 following</p>
        ) : (
          followingdetails.map((follow) => (
            <div className="hover:bg-slate-900 rounded-xl" key={follow.id}>
              <div className="flex gap-2 p-4 items-center">
                <Link
                  to={`/profile/${follow?.userName}`}
                  className="flex items-center"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img
                      className="w-full h-full object-cover"
                      src={
                        follow?.profileImg
                          ? `http://localhost:8000/uploads/${follow?.profileImg}`
                          : "/avatar-placeholder.png"
                      }
                      alt={follow?.fullName}
                    />
                  </div>
                  <div>
                    <p>{follow?.fullName}</p>
                    <p className="text-gray-400">@{follow?.userName}</p>
                  </div>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Followers Section */}
      <div className="sm:w-1/2 w-full p-4 overflow-auto">
        <p className="font-bold mb-6">Followers</p>
        {followerdetails.length === 0 ? (
          <p>0 followers</p>
        ) : (
          followerdetails.map((follow) => (
            <div className="hover:bg-slate-900 rounded-xl" key={follow.id}>
              <div className="flex gap-2 p-4 items-center">
                <Link
                  to={`/profile/${follow?.userName}`}
                  className="flex items-center"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                    <img
                      className="w-full h-full object-cover"
                      src={
                        follow?.profileImg
                          ? `http://localhost:8000/uploads/${follow?.profileImg}`
                          : "/avatar-placeholder.png"
                      }
                      alt={follow?.fullName}
                    />
                  </div>
                  <div>
                    <p>{follow?.fullName}</p>
                    <p className="text-gray-400">@{follow?.userName}</p>
                  </div>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FollowersAndFollowingInfo;
