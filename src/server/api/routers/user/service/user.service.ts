import { userRepository } from "../repository/user.repository";
import { CreateUserInput } from "../user.type";
import { Prisma } from "@prisma/client";

export const userService = {
  async getUserById(userId: string) {
    return await userRepository.getById(userId);
  },
  
  async createUser(data: CreateUserInput) {
    return await userRepository.create(data as Prisma.UserCreateInput);
  },
  
  async createOrGetUser(userId: string, email: string) {
    return await userRepository.createOrGet(userId, email);
  }
};