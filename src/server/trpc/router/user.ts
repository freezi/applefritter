import { Prisma } from "@prisma/client";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const userRouter = router({
  getUser: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.user.findUnique({
          where: {
            username: input.username,
          },
          select: {
            id: true,
            username: true,
            image: true,
            following: true,
            followedBy: true,
            about: true,
          },
          // orderBy: {
          // createdAt: "desc",
          // },
        });
      } catch (error) {
        console.error(error);
      }
    }),
  changeName: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        username: z.string().min(2, {
          message: "Username must be between 2 and 32 characters long",
        }),
        about: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.user.update({
          where: {
            id: input.userId,
          },
          data: {
            username: input.username,
            about: input.about,
          },
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === "P2002") {
            throw new Error("Name already in use");
          }
        }
        console.error(error);
      }
    }),
  followUser: protectedProcedure
    .input(z.object({ followerId: z.string(), followingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.follows.create({
          data: {
            followerId: input.followerId,
            followingId: input.followingId,
          },
        });
      } catch (error) {
        console.error(error);
      }
    }),
  unfollowUser: protectedProcedure
    .input(z.object({ followerId: z.string(), followingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.prisma.follows.deleteMany({
          where: {
            followerId: { contains: input.followerId },
            followingId: { contains: input.followingId },
          },
        });
      } catch (error) {
        console.error(error);
      }
    }),
  updateAboutMe: protectedProcedure
    .input(z.object({ userName: z.string(), about: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.prisma.user.update({
          where: {
            username: input.userName,
          },
          data: {
            about: input.about,
          },
        });
      } catch (error) {
        console.error(error);
      }
    }),
});
