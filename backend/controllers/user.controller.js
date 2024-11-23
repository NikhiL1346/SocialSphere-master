import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

// models
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

export const getUserProfile = async (req, res) => {
	const { username } = req.params;

	try {
		const user = await User.findOne({ username }).select("-password");
		if (!user) return res.status(404).json({ message: "User not found" });

		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getUserProfile: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const followUnfollowUser = async (req, res) => {
	try {
		const { id } = req.params;
		const userToModify = await User.findById(id);
		const currentUser = await User.findById(req.user._id);

		if (id === req.user._id.toString()) {
			return res.status(400).json({ error: "You can't follow/unfollow yourself" });
		}

		if (!userToModify || !currentUser) return res.status(400).json({ error: "User not found" });

		const isFollowing = currentUser.following.includes(id);

		if (isFollowing) {
			// Unfollow the user
			await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

			res.status(200).json({ message: "User unfollowed successfully" });
		} else {
			// Follow the user
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
			// Send notification to the user
			const newNotification = new Notification({
				type: "follow",
				from: req.user._id,
				to: userToModify._id,//usertomodify ki document id
			});

			await newNotification.save();

			res.status(200).json({ message: "User followed successfully" });
		}
	} catch (error) {
		console.log("Error in followUnfollowUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const getSuggestedUsers = async (req, res) => {
	try {
		const userId = req.user._id;

		// Fetch the current user's followers and following
		const user = await User.findById(userId).select("following followers");
		const myFollowing = user?.following.map((id) => id.toString()) || [];
		const myFollowers = user?.followers.map((id) => id.toString()) || [];

		// Combine followers and following of the current user
		const relevantUsers = [...new Set([...myFollowing, ...myFollowers])];

		// Fetch followers and following of these relevant users
		const connections = relevantUsers.length
			? await User.find({ _id: { $in: relevantUsers } }).select("following followers")
			: [];

		// Gather unique IDs from their followers and following
		let suggestedUserIds = new Set();
		connections.forEach((connection) => {
			connection.followers.forEach((followerId) => suggestedUserIds.add(followerId.toString()));
			connection.following.forEach((followingId) => suggestedUserIds.add(followingId.toString()));
		});

		// Exclude users already followed, yourself, and duplicates
		const filteredSuggestedUserIds = Array.from(suggestedUserIds).filter(
			(id) => !myFollowing.includes(id) && id !== userId.toString()
		);

		// Fetch detailed suggestions based on relationship-derived IDs
		let suggestedUsers = await User.find({ _id: { $in: filteredSuggestedUserIds } })
			.select("-password")
			.limit(10);

		//  If suggestions list is fewer than 10, fetch random users
		let userRandom = [];
		if (suggestedUsers.length < 10) {
			const suggestedUserIdsSet = new Set(suggestedUsers.map((user) => user._id.toString())); // Set of already suggested IDs
			const limit = 10 - suggestedUsers.length; // Remaining users to fetch
			userRandom = await User.aggregate([
				{
					$match: {
						_id: {
							$nin: [
								...myFollowing.map((id) => new mongoose.Types.ObjectId(id)),
								new mongoose.Types.ObjectId(userId),
								...Array.from(suggestedUserIdsSet).map((id) => new mongoose.Types.ObjectId(id)), // Exclude already suggested users
							],
						},
					},
				},
				{ $sample: { size: limit } },
				{
					$project: {
						_id: 1,
						username: 1,
						fullName: 1,
						profileImg: 1,
						bio: 1,
					},
				},
			]);
		}

		// Combine suggested and random users
		const finalUsers = [...suggestedUsers, ...userRandom];

		res.status(200).json(finalUsers);
	} catch (error) {
		console.error("Error in getSuggestedUsers:", error.message);
		res.status(500).json({ error: error.message });
	}
};

export const updateUser = async (req, res) => {
	const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
	let { profileImg, coverImg } = req.body;

	const userId = req.user._id;

	try {
		let user = await User.findById(userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({ error: "Please provide both current password and new password" });
		}

		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) return res.status(400).json({ error: "Current password is incorrect" });
			if (newPassword.length < 6) {
				return res.status(400).json({ error: "Password must be at least 6 characters long" });
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

		if (profileImg) {
			if (user.profileImg) {

				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profileImg);
			profileImg = uploadedResponse.secure_url;
		}

		if (coverImg) {
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(coverImg);
			coverImg = uploadedResponse.secure_url;
		}

		user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

		user = await user.save();

		// password should be null in response
		user.password = null;

		return res.status(200).json(user);
	} catch (error) {
		console.log("Error in updateUser: ", error.message);
		res.status(500).json({ error: error.message });
	}
};
