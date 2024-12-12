  import { FaRegComment } from "react-icons/fa";
  import { BiRepost } from "react-icons/bi";
  import { FaRegHeart } from "react-icons/fa";
  import { FaRegBookmark } from "react-icons/fa6";
  import { FaTrash } from "react-icons/fa";
  import { useState } from "react";
  import { Link } from "react-router-dom";
  import { useMutation, useQueryClient } from "@tanstack/react-query";
  import axios from "axios";
  import toast from "react-hot-toast";
  import LoadingSpinner from "./LoadingSpinner";
  import { formatPostDate } from "../../utils/date";
  import { ChatState } from "../../context/ChatProvider";

  const Post = ({ post }) => {
    const [isLiked, setIsLiked] = useState(post.likes === 1 || false);
    const queryClient = useQueryClient();
    const [comment, setComment] = useState("");

      const likesCount = post?.likes || 0

    const { currentUser } = ChatState();

    const postOwner = post;

    const isMyPost = currentUser.id === postOwner.authorId;

    const formattedDate = formatPostDate(postOwner.createdAt);

    const { mutate: deletePost, isPending } = useMutation({
      mutationFn: async () => {
        const res = await axios.delete(
          `http://localhost:8000/api/post/${postOwner.id}`, 
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          }
        );
        console.log(res.data);
        return res.data;
      },
      onSuccess: () => {
        toast.success("delted");
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      },
      onError: (error) => {
        const errorMessage = error.response?.data || "Error deleting post";
        toast.error(errorMessage);
        console.error("Delete error:", error);
      },
    });

    const handleDeletePost = (e) => {
      e.preventDefault();
      deletePost();
    };

    const {
      mutate: commentPost,
      isPending: isComment,
      error,
    } = useMutation({
      mutationFn: async (commentText) => {
        const res = await axios.post(
          `http://localhost:8000/api/post/comment/${postOwner.id}`,
          {
            content: commentText,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentUser.token}`,
            },
          }
        );
        return res.data;
      },
      onSuccess: () => {
        toast.success("commented on post");
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      },
      onError: (error) => {
        console.log("Error details:", error.response?.data.message);
        toast.error(
          error.response?.data?.message ||
            "Failed to post comment. Please try again."
        );
      },
    });

    const handlePostComment = (e) => {
      e.preventDefault();
      commentPost(comment);
      setComment("");
    };

    const { mutate: likePost, isPending: isLiking } = useMutation({
      mutationFn: async () => {
        const res = await axios.post(
          `http://localhost:8000/api/post/like/${postOwner.id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          }
        );
        console.log("likepost:", res.data);
        return res.data;
      },

      onMutate: async () => {
        await queryClient.cancelQueries(["posts"]);
        const previousPosts = queryClient.getQueryData(["posts"]);

        queryClient.setQueryData(["posts"], (old) => {
          if (!old) return [];
          return old.map((p) => {
            if (p.id === post.id) {
              const newLikesCount = p.isLiked ? p.likes - 1 : p.likes + 1;
              return {
                ...p,
                isLiked: !p.isLiked,
                likes: newLikesCount,
              };
            }
            return p;
          });
        });
        setIsLiked(!isLiked);
        return { previousPosts };
      },
      onSuccess: (data) => {
       queryClient.invalidateQueries(["posts"]);
        toast.success(data.isLiked ? "liked!" : "unliked!");
      },
      onError: (error, _, context) => {
        if (context?.previousPosts) {
          queryClient.setQueryData(["posts"], context.previousPosts);
        }

        console.error("Error liking post:", error);
        toast.error("Error liking post");
      },
    });

    const handleLikePost = (e) => {
      e.preventDefault();
      if (isLiking) return;
      likePost();
    };

    return (
      <>
        <div className="flex gap-2 items-start p-4 border-b border-gray-700">
          <div className="avatar">
            <Link
              to={`/profile/${postOwner?.author?.userName}`}
              className="w-8 h-8 rounded-full overflow-hidden"
            >
              <img
                className="w-full h-full object-cover"
                src={
                  postOwner?.author?.profileImg
                    ? `http://localhost:8000/uploads/${postOwner?.author?.profileImg}`
                    : "/avatar-placeholder.png"
                }
              />
            </Link>
          </div>
          <div className="flex flex-col flex-1">
            <div className="flex gap-2 items-center">
              <Link
                to={`/profile/${postOwner?.author?.userName}`}
                className="font-bold"
              >
                {postOwner?.author?.fullName}
              </Link>
              <span className="text-gray-700 flex gap-1 text-sm">
                <Link to={`/profile/${postOwner?.author?.userName}`}>
                  @{postOwner?.author?.userName}
                </Link>
                <span>·</span>
                <span>{formattedDate}</span>
              </span>
              {isMyPost && (
                <span className="flex justify-end flex-1">
                  {!isPending && (
                    <FaTrash
                      className="cursor-pointer hover:text-red-500"
                      onClick={handleDeletePost}
                    />
                  )}
                  {isPending && <LoadingSpinner />}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-3 overflow-hidden">
              <span>{postOwner.text}</span>
              {postOwner.image && (
                <img
                  src={`http://localhost:8000/uploads/${postOwner.image}`}
                  className="h-80 object-contain rounded-lg border border-gray-700"
                  alt=""
                />
              )}
            </div>
            <div className="flex justify-between mt-3">
              <div className="flex gap-4 items-center w-2/3 justify-between">
                <div
                  className="flex gap-1 items-center cursor-pointer group"
                  onClick={() =>
                    document
                      .getElementById("comments_modal" + post.id)
                      .showModal()
                  }
                >
                  <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
                  <span className="text-sm text-slate-500 group-hover:text-sky-400">
                    {postOwner?.comments?.length}
                  </span>
                </div>
                {/* We're using Modal Component from DaisyUI */}
                <dialog
                  id={`comments_modal${post.id}`}
                  className="modal border-none outline-none"
                >
                  <div className="modal-box rounded border border-gray-600">
                    <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                    <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                      {post?.comments?.length === 0 && (
                        <p className="text-sm text-slate-500">
                          No comments yet 🤔 Be the first one 😉
                        </p>
                      )}
                      {post?.comments?.map((comment) => (
                        <div
                          key={comment.id}
                          className="flex gap-2 items-start"
                        >
                          <div className="avatar">
                            <div className="w-8 rounded-full">
                              <img
                                src={
                                  comment?.user?.profileImg
                                    ? `http://localhost:8000/uploads/${comment?.user?.profileImg}`
                                    : "/avatar-placeholder.png"
                                }
                              />
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="font-bold">
                                {comment?.user?.fullName}
                              </span>
                              <span className="text-gray-700 text-sm">
                                @{comment?.user?.userName}
                              </span>
                            </div>
                            <div className="text-sm">{comment?.content}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form
                      className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                      onSubmit={handlePostComment}
                    >
                      <textarea
                        className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800"
                        placeholder="Add a comment..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                      />
                      <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                        {isComment ? (
                          <span className="loading loading-spinner loading-md"></span>
                        ) : (
                          "Post"
                        )}
                      </button>
                    </form>
                  </div>
                  <form method="dialog" className="modal-backdrop">
                    <button className="outline-none">close</button>
                  </form>
                </dialog>
                <div className="flex gap-1 items-center group cursor-pointer">
                  <BiRepost className="w-6 h-6  text-slate-500 group-hover:text-green-500" />
                  <span className="text-sm text-slate-500 group-hover:text-green-500">
                    0
                  </span>
                </div>
                <div
                  className="flex gap-1 items-center group cursor-pointer"
                  onClick={handleLikePost}
                >
                  {isLiking ? (
                    <LoadingSpinner size="sm" />
                  ) : isLiked ? (
                    <FaRegHeart className="w-4 h-4 text-pink-500" />
                  ) : (
                    <FaRegHeart className="w-4 h-4 text-slate-500 group-hover:text-pink-500" />
                  )}
                  <span
                    className={`text-sm  group-hover:text-pink-500 ${
                      isLiked ? "text-pink-500" : "text-slate-500"
                    }`}
                  >
                    {likesCount}
                  </span>
                </div>
              </div>
              <div className="flex w-1/3 justify-end gap-2 items-center">
                <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };
  export default Post;
