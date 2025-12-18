import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { Role } from "@prisma/client";

export async function createUser(
  email: string,
  password: string,
  role: Role = Role.Viewer
) {
  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      passwordHash,
      role,
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  return bcrypt.compare(password, passwordHash);
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

