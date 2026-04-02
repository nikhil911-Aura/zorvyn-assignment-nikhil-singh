import bcrypt from "bcryptjs";
import { userRepository } from "./user.repository.js";

export const userService = {
  async listUsers(pagination) {
    return userRepository.findAll(pagination);
  },

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) throw { status: 404, message: "User not found" };
    return user;
  },

  async createUser(data) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) throw { status: 400, message: "Email already in use" };

    const hashedPassword = await bcrypt.hash(data.password, 12);
    return userRepository.create({ ...data, password: hashedPassword });
  },

  async updateUser(id, data) {
    const user = await userRepository.findById(id);
    if (!user) throw { status: 404, message: "User not found" };

    if (data.email && data.email !== user.email) {
      const existing = await userRepository.findByEmail(data.email);
      if (existing) throw { status: 400, message: "Email already in use" };
    }

    // Prevent demoting or deactivating the last admin
    if (user.role === "ADMIN") {
      const changingRole = data.role && data.role !== "ADMIN";
      const deactivating = data.isActive === false;
      if (changingRole || deactivating) {
        const adminCount = await userRepository.countByRole("ADMIN");
        if (adminCount <= 1) {
          throw {
            status: 400,
            message: "Cannot demote or deactivate the last admin",
          };
        }
      }
    }

    return userRepository.update(id, data);
  },

  async deleteUser(id, currentUserId) {
    const user = await userRepository.findById(id);
    if (!user) throw { status: 404, message: "User not found" };

    // Prevent self-deletion
    if (id === currentUserId) {
      throw { status: 400, message: "Cannot delete your own account" };
    }

    // Prevent deleting the last admin
    if (user.role === "ADMIN") {
      const adminCount = await userRepository.countByRole("ADMIN");
      if (adminCount <= 1) {
        throw { status: 400, message: "Cannot delete the last admin user" };
      }
    }

    // Soft delete — deactivate instead of removing from database
    await userRepository.update(id, { isActive: false });
    return { message: "User deactivated successfully" };
  },
};
