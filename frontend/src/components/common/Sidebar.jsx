import X2Svg from "../svgs/X2";

import { MdHomeFilled } from "react-icons/md";
import { IoNotifications, IoSearchSharp } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useState } from "react";

const Sidebar = () => {
	const queryClient = useQueryClient();
	const { mutate: logout } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch("/api/auth/logout", {
					method: "POST",
				});
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
		onError: () => {
			toast.error("Logout failed");
		},
	});
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const [showOverlay, setOverlay] = useState(false);
  	const [searchQuery, setSearchQuery] = useState("");
  	const [searchResults, setSearchResults] = useState([]);
  	const [isLoading, setIsLoading] = useState(false);

	// Function to handle the search API call
	const fetchSearchResults = async (query) => {
		if (!query.trim()) {
		  setSearchResults([]);
		  return;
		}
	
		try {
		  setIsLoading(true);
		  const res = await fetch(`/api/search/${query}`);
		  const data = await res.json();
	
		  if (!res.ok) {
			throw new Error(data.error || "Failed to fetch search results");
		  }
	
		  setSearchResults(data || []); 
				setIsLoading(false); 
		} catch (error) {
		  console.error("Error fetching search results:", error);
				setIsLoading(false);
		}
	  };
	
	  // Debounced search handler
	  const handleSearchChange = (e) => {
		const query = e.target.value;
		setSearchQuery(query);
	
		// Delay the API call to prevent excessive requests
		const debounceTimeout = setTimeout(() => fetchSearchResults(query), 1000);
		return () => clearTimeout(debounceTimeout);
	  };

	return (
		<div className='md:flex-[2_2_0] w-18 max-w-52'>
			
			<div className='sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full'>
				
			<Link to='/' className='flex justify-center md:justify-start m-6'>
					<X2Svg className='px-3 py-4 w-1 h-1 rounded-full fill-white hover:bg-stone-900 ' />
				</Link>
				
				<ul className='flex flex-col gap-3 mt-4'>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/'
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<MdHomeFilled className='w-8 h-8' />
							<span className='text-lg hidden md:block'>Home</span>
						</Link>
					</li>
					<li className='flex justify-center md:justify-start'>
						<Link
							to='/notifications'
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<IoNotifications className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Notifications</span>
						</Link>
					</li>

					<li className='flex justify-center md:justify-start'>
						<Link
							to={`/profile/${authUser?.username}`}
							className='flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer'
						>
							<FaUser className='w-6 h-6' />
							<span className='text-lg hidden md:block'>Profile</span>
						</Link>
					</li>

					<li className="flex justify-center md:justify-start">
            <div
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
              onClick={() => setOverlay(true)}
            >
              <IoSearchSharp className="w-6 h-8" />
              <span className="text-lg hidden md:block">Search</span>
            </div>
          </li>
				</ul>
				{authUser && (
					<Link
						to={`/profile/${authUser.username}`}
						className='mt-auto mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-[#181818] py-2 px-4 rounded-full'
					>
						<div className='avatar hidden md:inline-flex'>
							<div className='w-8 rounded-full'>
								<img src={authUser?.profileImg || "/avatar-placeholder.png"} />
							</div>
						</div>
						<div className='flex justify-between flex-1'>
							<div className='hidden md:block'>
								<p className='text-white font-bold text-sm w-20 truncate'>{authUser?.fullName}</p>
								<p className='text-slate-500 text-sm'>@{authUser?.username}</p>
							</div>
							<BiLogOut
								className='w-5 h-5 cursor-pointer'
								onClick={(e) => {
									e.preventDefault();
									logout();
								}}
							/>
						</div>
					</Link>
				)}
			</div>

			{/* Search Overlay */}
			{showOverlay && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
					onClick={()=>setOverlay(false)}
				>
          <div className="bg-[#0C192A] p-5 rounded-lg h-4/5 w-2/5 flex flex-col"
						onClick={(e) => e.stopPropagation()}
					>
            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full py-2 px-4 text-sm rounded-md border-none focus:outline-none"
              placeholder="Search..."
            />

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto mt-3">
              {isLoading ? (
                <p className="text-sm text-gray-400">Loading...</p>
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <Link
                    to={`/profile/${user.username}`}
                    className="flex items-center justify-between gap-4"
                    key={user._id}
                    onClick={()=>setOverlay(false)}
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
                ))
              ) : (
                <p className="text-sm text-gray-400">No results found</p>
              )}
            </div>
          </div>
        </div>
      )}
		</div>
	);
};
export default Sidebar;
