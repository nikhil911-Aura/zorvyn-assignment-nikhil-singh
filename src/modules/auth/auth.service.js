import bcrypt from "bcryptjs";
import { userRepository } from "../user/user.repository.js";
import { signToken } from "../../lib/jwt.js";

export const authService = {
  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw { status: 401, message: "Invalid credentials" };

    if (!user.isActive)
      throw { status: 403, message: "Account is deactivated" };

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw { status: 401, message: "Invalid credentials" };

    const token = signToken({ userId: user.id, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },
};
