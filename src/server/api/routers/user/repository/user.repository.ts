import prisma from "@/server/prisma";
import { Prisma } from "@prisma/client";
export const userRepository = {
  getById: async (userId: string) => {
    return await prisma.user.findUnique({
      where: { userId },
      include: { subscription: true },
    });
  },

  create: async (data: Prisma.UserCreateInput) => {
    return await prisma.user.create({
      data,
      include: { subscription: true },
    });
  },


  createOrGet: async (userId: string, email: string) => {
    if (!userId) {
      throw new Error("User ID is required");
    }

    let user = await prisma.user.findUnique({
      where: { userId },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          userId,
          email,
        },
        include: {
          subscription: true,
        },
      });
      console.log(`\x1b[32mUser created with userId: ${userId}\x1b[0m`);
    } else {
      console.log(`\x1b[36mUser found with userId: ${userId}\x1b[0m`);
    }

    return user;
},
};
