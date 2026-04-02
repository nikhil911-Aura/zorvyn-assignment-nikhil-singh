import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the repository
vi.mock("../../src/modules/user/user.repository.js", () => ({
  userRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    countByRole: vi.fn(),
  },
}));

// Mock bcryptjs
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
  },
}));

import { userService } from "../../src/modules/user/user.service.js";
import { userRepository } from "../../src/modules/user/user.repository.js";

describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUserById", () => {
    it("returns user when found", async () => {
      const mockUser = { id: "1", name: "Test", email: "test@test.com" };
      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById("1");
      expect(result).toEqual(mockUser);
    });

    it("throws 404 when user not found", async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById("999")).rejects.toEqual({
        status: 404,
        message: "User not found",
      });
    });
  });

  describe("createUser", () => {
    it("creates user with hashed password", async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({
        id: "1",
        name: "New User",
        email: "new@test.com",
        role: "VIEWER",
      });

      const result = await userService.createUser({
        name: "New User",
        email: "new@test.com",
        password: "password123",
      });

      expect(result.email).toBe("new@test.com");
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: "hashed-password" })
      );
    });

    it("throws 400 if email already exists", async () => {
      userRepository.findByEmail.mockResolvedValue({ id: "existing" });

      await expect(
        userService.createUser({
          name: "User",
          email: "taken@test.com",
          password: "pass123",
        })
      ).rejects.toEqual({ status: 400, message: "Email already in use" });
    });
  });

  describe("deleteUser", () => {
    it("soft deletes user by setting isActive false", async () => {
      userRepository.findById.mockResolvedValue({
        id: "2",
        role: "VIEWER",
        isActive: true,
      });
      userRepository.update.mockResolvedValue({});

      const result = await userService.deleteUser("2", "1");
      expect(result.message).toBe("User deactivated successfully");
      expect(userRepository.update).toHaveBeenCalledWith("2", {
        isActive: false,
      });
    });

    it("prevents self-deletion", async () => {
      userRepository.findById.mockResolvedValue({ id: "1", role: "ADMIN" });

      await expect(userService.deleteUser("1", "1")).rejects.toEqual({
        status: 400,
        message: "Cannot delete your own account",
      });
    });

    it("prevents deleting the last admin", async () => {
      userRepository.findById.mockResolvedValue({
        id: "2",
        role: "ADMIN",
        isActive: true,
      });
      userRepository.countByRole.mockResolvedValue(1);

      await expect(userService.deleteUser("2", "1")).rejects.toEqual({
        status: 400,
        message: "Cannot delete the last admin user",
      });
    });

    it("allows deleting admin when others exist", async () => {
      userRepository.findById.mockResolvedValue({
        id: "2",
        role: "ADMIN",
        isActive: true,
      });
      userRepository.countByRole.mockResolvedValue(3);
      userRepository.update.mockResolvedValue({});

      const result = await userService.deleteUser("2", "1");
      expect(result.message).toBe("User deactivated successfully");
    });
  });

  describe("updateUser", () => {
    it("prevents demoting the last admin", async () => {
      userRepository.findById.mockResolvedValue({
        id: "1",
        role: "ADMIN",
        email: "admin@test.com",
      });
      userRepository.countByRole.mockResolvedValue(1);

      await expect(
        userService.updateUser("1", { role: "VIEWER" })
      ).rejects.toEqual({
        status: 400,
        message: "Cannot demote or deactivate the last admin",
      });
    });

    it("prevents deactivating the last admin", async () => {
      userRepository.findById.mockResolvedValue({
        id: "1",
        role: "ADMIN",
        email: "admin@test.com",
      });
      userRepository.countByRole.mockResolvedValue(1);

      await expect(
        userService.updateUser("1", { isActive: false })
      ).rejects.toEqual({
        status: 400,
        message: "Cannot demote or deactivate the last admin",
      });
    });
  });
});
