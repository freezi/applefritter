import * as Dialog from "@radix-ui/react-dialog";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { BiMessageRounded } from "react-icons/bi";
import { FiX } from "react-icons/fi";
import TextareaAutosize from "react-textarea-autosize";
import { trpc } from "../utils/trpc";

export const NewReply = ({
  postId,
  replyTo,
}: {
  postId: string;
  replyTo: string | null;
}) => {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const utils = trpc.useContext();

  const newReply = trpc.posts.createReply.useMutation({
    onMutate: () => {
      utils.posts.getAll.cancel();
      const optimisticUpdate = utils.posts.getAll.getData();

      if (optimisticUpdate) {
        utils.posts.getAll.setData(undefined, optimisticUpdate);
      }
    },
    onSettled: () => {
      utils.posts.getAll.invalidate();
    },
  });

  const handleKeyUp = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // TODO: Fix empty content (or \r from being accepted)
    if (event.key === "Enter" && content.length > 1) {
      if (session !== null) {
        newReply.mutate({
          author: session.user?.username as string,
          content,
          postId: postId,
        });
      }

      setContent("");
    }
  };

  const handleSubmit = () => {
    if (session !== null) {
      newReply.mutate({
        author: session.user?.username as string,
        content,
        postId: postId,
      });
    }

    setContent("");
  };

  return (
    <>
      <Dialog.Root>
        <Dialog.Trigger asChild>
          <button
            disabled={!session}
            className="align-top text-2xl duration-300 active:-translate-y-1 active:transition-transform disabled:active:translate-y-0"
          >
            <BiMessageRounded />
          </button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 max-h-[85vh] w-[90vw] max-w-md -translate-y-1/2 -translate-x-1/2 rounded-md border-2 border-zinc-800 bg-neutral-900 p-6">
            <Dialog.Title className="mb-4 font-semibold">
              {replyTo ? `Reply to ${replyTo}` : "New Reply"}
            </Dialog.Title>

            {/* <fieldset className="mb-4 flex gap-5"> */}
            <TextareaAutosize
              value={content}
              placeholder="New post..."
              minLength={2}
              maxLength={280}
              onChange={(event) => setContent(event.target.value)}
              // onKeyUp={handleKeyUp}
              className="w-full rounded-md border-2 border-zinc-800 bg-neutral-900 px-4 py-2 transition-all focus:border-current focus:outline-none"
            />
            {/* </fieldset> */}

            <div className="flex justify-end">
              <Dialog.Close asChild>
                <button
                  onClick={handleSubmit}
                  className="mt-2 flex cursor-pointer items-center justify-center rounded-md border-2 border-zinc-800 p-2 transition-colors hover:border-zinc-600 focus:outline-none active:border-zinc-600 active:bg-neutral-800 disabled:cursor-not-allowed disabled:hover:border-zinc-800 disabled:active:bg-transparent"
                >
                  Reply
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Close asChild>
              <button
                className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full"
                aria-label="Close"
              >
                <FiX />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      {/* <span className="ml-1">{postReplies.length}</span> */}
    </>
    // <div className="flex flex-col">
    //   <ReactTextareaAutosize
    //     value={content}
    //     placeholder="New post..."
    //     minLength={2}
    //     maxLength={280}
    //     onChange={(event) => setContent(event.target.value)}
    //     className="rounded-md border-2 border-zinc-800 bg-neutral-900 px-4 py-2 transition-all focus:outline-none"
    //   />
    //   <button
    //     onClick={handleSubmit}
    //     disabled={content.length < 1 || newReply.isLoading}
    //     className="mt-2 flex cursor-pointer items-center justify-center rounded-md border-2 border-zinc-800 p-2 transition-colors hover:border-zinc-600 focus:outline-none active:border-zinc-600 active:bg-neutral-800 disabled:cursor-not-allowed disabled:hover:border-zinc-800 disabled:active:bg-transparent"
    //   >
    //     {newPost.isLoading ? (
    //       <>
    //         <svg
    //           role="status"
    //           className="mr-2 h-5 w-5 animate-spin fill-emerald-400 text-neutral-600"
    //           viewBox="0 0 100 101"
    //           fill="none"
    //           xmlns="http://www.w3.org/2000/svg"
    //         >
    //           <path
    //             d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
    //             fill="currentColor"
    //           />
    //           <path
    //             d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
    //             fill="currentFill"
    //           />
    //         </svg>
    //         Submitting...
    //       </>
    //     ) : (
    //       "Submit"
    //     )}
    //   </button>
    // </div>
  );
};
