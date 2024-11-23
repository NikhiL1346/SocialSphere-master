import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";
import { POSTS } from "../../utils/db/dummy";
import { FaArrowLeft } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { formatMemberSinceDate } from "../../utils/date";
import useFollow from "../../hooks/useFollow";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";

const ProfilePage = () => {
  const [coverImg, setCoverImg] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [feedType, setFeedType] = useState("posts");
  const [showOverlay, setShowOverlay] = useState(false); // State to manage overlay visibility
  const [overlayType, setOverlayType] = useState(null); // State to track whether it's followers or following
  const [followersList, setFollowersList] = useState([]); // State to store followers data
  const [followingList, setFollowingList] = useState([]); // State to store following data

  const coverImgRef = useRef(null);
  const profileImgRef = useRef(null);
  const { username } = useParams();

  const { follow, isPending } = useFollow();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  const {
    data: user,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  const { isUpdatingProfile, updateProfile } = useUpdateUserProfile();

  const isMyProfile = authUser._id === user?._id;
  const memberSinceDate = formatMemberSinceDate(user?.createdAt);
  const amIFollowing = authUser?.following.includes(user?._id);

  const handleImgChange = (e, state) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        state === "coverImg" && setCoverImg(reader.result);
        state === "profileImg" && setProfileImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    refetch();
  }, [username, refetch]);

  // Fetch followers or following from the backend API
  const fetchConnectionList = async (type) => {
    const response = await fetch(`/api/connection/${type}/${username}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch connection data");
    }
    const res = await response.json();
    return res;
  };

  // Function to handle opening the overlay
  const openOverlay = async (type) => {
    setOverlayType(type);
    setShowOverlay(true); // Show the overlay
    try {
      const connectionData = await fetchConnectionList(type);
      if (type === "followers") {
        setFollowersList(connectionData || []); // Ensure empty array if no data
      } else if (type === "following") {
        setFollowingList(connectionData || []); // Ensure empty array if no data
      }
    } catch (error) {
      console.error("Error fetching connection data:", error);
    }
  };

  // Function to close the overlay
  const closeOverlay = () => {
    setShowOverlay(false);
    setOverlayType(null);
  };

  // Effect to close overlay when username changes
  useEffect(() => {
    setShowOverlay(false); // Close overlay when navigating to a new profile
    setOverlayType(null);   // Reset overlay type
		setFollowersList([]);   // Clear followers list
  	setFollowingList([]);   // Clear following list
  }, [username]);

  return (
    <>
      <div className="flex-[4_4_0]  border-r border-gray-700 min-h-screen ">
        {/* HEADER */}
        {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
        {!isLoading && !isRefetching && !user && (
          <p className="text-center text-lg mt-4">User not found</p>
        )}
        <div className="flex flex-col">
          {!isLoading && !isRefetching && user && (
            <>
              <div className="flex gap-10 px-4 py-2 items-center">
                <Link to="/">
                  <FaArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex flex-col">
                  <p className="font-bold text-lg">{user?.fullName}</p>
                </div>
              </div>
              {/* COVER IMG */}
              <div className="relative group/cover">
                <img
                  src={coverImg || user?.coverImg || "/cover.png"}
                  className="h-52 w-full object-cover"
                  alt="cover image"
                />
                {isMyProfile && (
                  <div
                    className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200"
                    onClick={() => coverImgRef.current.click()}
                  >
                    <MdEdit className="w-5 h-5 text-white" />
                  </div>
                )}

                <input
                  type="file"
                  hidden
                  accept="image/*"
                  ref={coverImgRef}
                  onChange={(e) => handleImgChange(e, "coverImg")}
                />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  ref={profileImgRef}
                  onChange={(e) => handleImgChange(e, "profileImg")}
                />
                {/* USER AVATAR */}
                <div className="avatar absolute -bottom-16 left-4">
                  <div className="w-32 rounded-full relative group/avatar">
                    <img
                      src={profileImg || user?.profileImg || "/avatar-placeholder.png"}
                      alt="user"
                    />
                    <div className="absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer">
                      {isMyProfile && (
                        <MdEdit
                          className="w-4 h-4 text-white"
                          onClick={() => profileImgRef.current.click()}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end px-4 mt-5">
                {isMyProfile && <EditProfileModal authUser={authUser} />}
                {!isMyProfile && (
                  <button
                    className="btn btn-outline rounded-full btn-sm"
                    onClick={() => follow(user?._id)}
                  >
                    {isPending && "Loading..."}
                    {!isPending && amIFollowing && "Unfollow"}
                    {!isPending && !amIFollowing && "Follow"}
                  </button>
                )}
		     {(coverImg || profileImg) && (
			<button
				className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
				onClick={async () => {
				await updateProfile({ coverImg, profileImg });
				setProfileImg(null);
				setCoverImg(null);
				 }}
				>
				{isUpdatingProfile ? "Updating..." : "Update"}
			   </button>
			)}
              </div>

              <div className="flex flex-col gap-4 mt-14 px-4">
                <div className="flex flex-col">
                  <span className="font-bold text-lg">{user?.fullName}</span>
                  <span className="text-sm text-slate-500">@{user?.username}</span>
                  <span className="text-sm my-1">{user?.bio}</span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {user?.link && (
                    <div className="flex gap-1 items-center ">
                      <FaLink className="w-3 h-3 text-slate-500" />
                      <a
                        href={user?.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        {user?.link}
                      </a>
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <IoCalendarOutline className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-500">{memberSinceDate}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div
                    className="flex gap-1 items-center cursor-pointer"
                    onClick={() => openOverlay("followers")}
                  >
                    <span className="font-semibold">{user?.followers?.length || 0}</span>
                    <span className="text-sm text-slate-500">Followers</span>
                  </div>
                  <div
                    className="flex gap-1 items-center cursor-pointer"
                    onClick={() => openOverlay("following")}
                  >
                    <span className="font-semibold">{user?.following?.length || 0}</span>
                    <span className="text-sm text-slate-500">Following</span>
                  </div>
                </div>

                {/* POSTS */}
                <div className="flex gap-6">
                  <button
                    onClick={() => setFeedType("posts")}
                    className={`${
                      feedType === "posts" ? "font-bold border-b-2 border-primary" : ""
                    }`}
                  >
                    Posts
                  </button>
                  <button
                    onClick={() => setFeedType("likes")}
                    className={`${
                      feedType === "likes" ? "font-bold border-b-2 border-primary" : ""
                    }`}
                  >
                    Likes
                  </button>
                </div>

                {feedType && (
                  <div className="mt-10">
                    <Posts feedType={feedType} username={username} userId={user?._id} />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* OVERLAY FOR FOLLOWERS AND FOLLOWING */}
      {showOverlay && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50" >
          <div className="bg-[#0C192A] p-5 rounded-lg min-h-[200px] max-h-[80vh] overflow-auto w-96">
            <h2 className="text-xl font-bold mb-4">
              {overlayType === "followers" ? "Followers" : "Following"}
            </h2>
            <ul className="space-y-2">
              {(overlayType === "followers" ? followersList : followingList).map(
                (user, index) => (
                  <Link
                    to={`/profile/${user.username}`}
                    className="flex items-center justify-between gap-4"
                    key={user._id}
                    onClick={closeOverlay}
                  >
                    <div className="flex gap-2 items-center">
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <img
                            src={user.profileImg || "/avatar-placeholder.png"}
                            alt="user"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold tracking-tight truncate w-28">
                          {user.fullName}
                        </span>
                        <span className="text-sm text-slate-500">@{user.username}</span>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </ul>
            <button
              onClick={closeOverlay}
              className="mt-4 bg-primary text-white px-4 py-2 rounded-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
