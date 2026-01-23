import { UserModel } from "../models/user.model";

const changePasswordController = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const userId = req.userId;

  const user = await UserModel.findById(userId);
  // Logic to change the password

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  res.json({
    success: true,
    message: "Password changed successfully",
  });
};

export default changePasswordController;
