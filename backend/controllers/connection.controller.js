import User from "../models/user.model.js";

export const getFollowers = async (req, res) => {
  try {
    const { username } = req.params;
    
    // Fetch the user by their ID and populate the 'followers' field
    const user = await User.findOne({username}).populate('followers', '_id username fullName profileImg bio');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send the followers' information in the response
    console.log(user.followers);
    res.status(200).json(user.followers);
  } catch (error) {
    console.error("Error in getFollowers:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const { username } = req.params;
    


    // Fetch the user by their ID and populate the 'followers' field
    const user = await User.findOne({username}).populate('following', '_id username fullName profileImg bio');

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send the followers' information in the response
    res.status(200).json(user.following);
  } catch (error) {
    console.error("Error in getFollowing:", error.message);
    res.status(500).json({ error: error.message });
  }

};