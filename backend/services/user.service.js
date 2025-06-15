const userModel = require("../models/user.model");

class UserService {
  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await userModel.findById(userId).select("-password");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email) {
    const user = await userModel
      .findOne({ email: email })
      .select("_id name avatar");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Search users by name or email
   */
  async searchUsers(search = "") {
    const users = await userModel
      .find({
        $or: [{ name: { $regex: search, $options: "i" } }, { email: search }],
      })
      .select("_id name avatar email");

    if (!users || users.length === 0) {
      throw new Error("No users found");
    }

    return users;
  }

  // Get user by ID for authentication purposes (includes password)
  async getUserForAuth(userId) {
    return await userModel.findById(userId);
  }

  // Update user profile
  async updateUserProfile(userId, updateData) {
    const user = await userModel.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Update only allowed fields
    const allowedFields = ["name", "avatar"];
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    });

    await user.save();
    return user;
  }

  // Check if user exists by email
  async userExistsByEmail(email) {
    const user = await userModel.findOne({ email });
    return !!user;
  }

  // Get multiple users by IDs
  async getUsersByIds(userIds) {
    return await userModel
      .find({ _id: { $in: userIds } })
      .select("_id name avatar email");
  }
}

module.exports = new UserService();
