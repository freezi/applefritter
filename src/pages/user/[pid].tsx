import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import EditAboutMe from "../../components/EditAboutMe";
import { FollowBtn } from "../../components/FollowBtn";
import { PostComponent } from "../../components/PostComponent";
import Layout from "../../layouts/Layout";
import { trpc } from "../../utils/trpc";

const User = () => {
  const router = useRouter();
  const { pid } = router.query;
  const { data: session } = useSession();

  const { data: posts, isLoading } = trpc.posts.getAllByUser.useQuery({
    username: "" + pid,
  });

  const { data: userInfo } = trpc.user.getUser.useQuery({
    username: "" + pid,
  });

  if (isLoading)
    return (
      <div className="flex h-screen flex-col items-center justify-center pt-4">
        Loading...
      </div>
    );

  return (
    <Layout>
      {userInfo && (
        <div className="flex flex-col items-center border-b-2 border-zinc-800 p-4 md:border-x-2">
          <div className="items-around flex w-full justify-between">
            <div className="flex items-center space-x-3 px-4">
              {userInfo?.image && (
                <Image
                  src={userInfo.image}
                  alt={`${userInfo.username}'s profile picture`}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              )}
              <h1 className="text-2xl font-semibold">{userInfo?.username}</h1>
            </div>

            <div className="flex flex-col items-center justify-center px-4">
              <FollowBtn
                followingId={userInfo.id}
                followersArray={userInfo.followedBy}
              />
            </div>
          </div>
          <div className="flex items-center justify-center">
            {userInfo.about && <div>{userInfo.about}</div>}
            {session?.user?.username === pid && (
              <div className="pl-4">
                <EditAboutMe userName={"" + pid} />
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex w-full flex-col-reverse break-words">
        {posts?.map((post, index) => {
          return <PostComponent key={index} post={post} />;
        })}
      </div>
    </Layout>
  );
};

export default User;
