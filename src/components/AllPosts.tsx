import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import { trpc } from "../utils/trpc";
import { DeletePostBtn } from "./DeletePostBtn";
import { FavoriteBtn } from "./FavoriteBtn";

dayjs.extend(relativeTime);

export const AllPosts = () => {
  const { data: posts, isLoading } = trpc.posts.getAll.useQuery();

  if (isLoading) return <div>Fetching Posts...</div>;

  return (
    <div className="mt-4 flex w-full flex-col-reverse break-words">
      {posts?.map((post, index) => {
        return (
          <div
            key={index}
            id={post.id}
            className="border-b border-zinc-800 p-4 last:border-t md:border-x"
          >
            <div className="flex justify-between">
              <div className="flex items-center">
                {post.user?.image && (
                  <Image
                    src={post.user?.image}
                    alt={`${post.user.username}'s profile picture`}
                    width={50}
                    height={50}
                    className="mr-2 rounded-full"
                  />
                )}
                <span>
                  <Link className="text-emerald-400" href="#">
                    @{post.user.username}
                  </Link>{" "}
                  &bull; {dayjs(post.createdAt).fromNow()}{" "}
                </span>
              </div>
              <DeletePostBtn postId={post.id} postUserId={post.user.id} />
            </div>
            <p className="py-4">{post.content}</p>
            <div className="items flex">
              <FavoriteBtn postId={post.id} postFavorites={post.favorites} />{" "}
            </div>
          </div>
        );
      })}
    </div>
  );
};
