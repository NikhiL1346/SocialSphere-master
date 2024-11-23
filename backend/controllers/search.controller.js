import User from "../models/user.model.js";

export const getSearchResults = async (req , res) => {
  try {
      
      const {query} = req.params;
      const regex = new RegExp(query, 'i'); // Case-insensitive regex
      const users = await User.find({ username: { $regex: regex } })
      .select('_id username fullName profileImg bio'); // Select specific fields

      res.status(200).json(users);
  } catch (error) {
    console.error("Error in getSearchResults:", error.message);
    res.status(500).json({ error: error.message });
}
};