import { useState } from "react";
import { MdOutlineExplore, MdPeople } from "react-icons/md"; // Modern icons
import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";

const HomePage = () => {
	const [feedType, setFeedType] = useState("forYou");

	return (
		<>
			<div className='flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen bg-black'>
				{/* Header */}
				<div className='flex w-full border-b border-gray-700 bg-black shadow-md'>
					<div
						className={`flex items-center justify-center flex-1 p-4 cursor-pointer transition duration-300 relative rounded-md ${
							feedType === "forYou" ? "bg-gray-900 text-white" : "hover:bg-black text-gray-300"
						}`}
						onClick={() => setFeedType("forYou")}
					>
						<MdOutlineExplore className='mr-2 w-5 h-5' />
						<span className='font-semibold text-lg'>For You</span>
						{feedType === "forYou" && (
							<div className='absolute bottom-0 w-10 h-1 rounded-full bg-blue-500 transition-all duration-300'></div>
						)}
					</div>
					<div
						className={`flex items-center justify-center flex-1 p-4 cursor-pointer transition duration-300 relative rounded-md ${
							feedType === "following" ? "bg-gray-900 text-white" : "hover:bg-black text-gray-300"
						}`}
						onClick={() => setFeedType("following")}
					>
						<MdPeople className='mr-2 w-5 h-5' />
						<span className='font-semibold text-lg'>Following</span>
						{feedType === "following" && (
							<div className='absolute bottom-0 w-10 h-1 rounded-full bg-blue-500 transition-all duration-300'></div>
						)}
					</div>
				</div>

				{/* CREATE POST INPUT */}
				<div className='p-4 bg-black rounded-lg shadow-md mb-4'>
					<CreatePost />
				</div>

				{/* POSTS */}
				<div className='space-y-4 px-4'>
					<Posts feedType={feedType} />
				</div>
			</div>
		</>
	);
};

export default HomePage;
