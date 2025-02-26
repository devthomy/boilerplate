import { z } from "zod";
import { Plan } from "@prisma/client";

export const createUserSchema = z.object({
  userId: z.string(),
  plan: z.nativeEnum(Plan).default("free"),
  customerId: z.string().optional()
});

export const createOrGetUserSchema = z.object({
  userId: z.string(),
  email: z.string(),
  plan: z.nativeEnum(Plan).default("free"),
  customerId: z.string().optional()
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateOrGetUserInput = z.infer<typeof createOrGetUserSchema>;
