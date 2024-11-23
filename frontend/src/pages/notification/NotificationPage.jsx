import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { IoSettingsOutline } from "react-icons/io5";
import { FaUser, FaHeart, FaComment } from "react-icons/fa";

const NotificationPage = () => {
	const queryClient = useQueryClient();
	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/notifications");
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	const { mutate: deleteNotifications } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch("/api/notifications", {
					method: "DELETE",
				});
				const data = await res.json();
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			toast.success("Notifications deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen bg-black'>
			<div className='flex justify-between items-center p-4 border-b border-gray-700'>
				<p className='text-white font-bold text-lg'>Notifications</p>
				<div className='dropdown'>
					<div tabIndex={0} role='button' className='m-1 text-gray-300 hover:text-white transition duration-200'>
						<IoSettingsOutline className='w-6 h-6' />
					</div>
					<ul tabIndex={0} className='dropdown-content z-[1] menu p-2 shadow-lg bg-gray-800 rounded-lg w-52'>
						<li>
							<a onClick={deleteNotifications} className='text-red-500 hover:text-red-400'>
								Delete all notifications
							</a>
						</li>
					</ul>
				</div>
			</div>

			{isLoading && (
				<div className='flex justify-center h-full items-center'>
					<LoadingSpinner size='lg' />
				</div>
			)}

			{notifications?.length === 0 && (
				<div className='text-center p-4 font-bold text-gray-400'>No notifications!</div>
			)}

			{notifications?.map((notification) => (
				<div className='border-b border-gray-700 animate-fade-out' key={notification._id}>

					<div className='flex gap-2 p-4 transition-transform transform hover:scale-105'>
						{notification.type === "follow" && <FaUser className='w-7 h-7 text-primary' />}
						{notification.type === "like" && <FaHeart className='w-7 h-7 text-red-500' />}
						{notification.type === "comment" && <FaComment className='w-7 h-7 text-blue-500' />}
						<Link to={`/profile/${notification.from.username}`} className='flex items-center space-x-2'>
							<div className='avatar'>
								<div className='w-10 rounded-full'>
									<img src={notification.from.profileImg || "/avatar-placeholder.png"} alt={`${notification.from.username}'s avatar`} />
								</div>
							</div>
							<div className='flex flex-col'>
								<span className='font-bold text-white'>@{notification.from.username}</span>
								<span className='text-gray-400'>
									{notification.type === "follow"
										? "followed you."
										: notification.type === "like"
										? "liked your post."
										: notification.type === "comment"
										? "commented on your post."
										: null}
								</span>
							</div>
						</Link>
					</div>
				</div>
			))}
		</div>
	);
};

export default NotificationPage;
