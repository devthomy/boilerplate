import { t } from "@/server/api/trpc";
import { z } from "zod";
import { userService } from "./service/user.service";
import { createUserSchema, createOrGetUserSchema } from "./user.type";

export const userRouter = t.router({
  getById: t.procedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      return await userService.getUserById(input.userId);
    }),
    
  create: t.procedure
    .input(createUserSchema)
    .mutation(async ({ input }) => {
      return await userService.createUser(input);
    }),
    
    
  createOrGet: t.procedure
    .input(createOrGetUserSchema)
    .mutation(async ({ input }) => {
      return await userService.createOrGetUser(input.userId, input.email);
    })
});