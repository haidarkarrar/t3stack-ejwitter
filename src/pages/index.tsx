import { type NextPage } from "next";
import Head from "next/head";
import { SignInButton, useUser } from "@clerk/nextjs";
import { type RouterOutputs, api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { Loading, LoadingSpinner } from "~/components/loading";
import { toast } from "react-hot-toast";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from "next/link";
import { Layout } from "~/components/layout";

dayjs.extend(relativeTime);

type Inputs = {
  emoji_input: string
}

const CreatePostWizard = () => {
  const { user } = useUser()
  const ctx = api.useContext()


  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<Inputs>({
    resolver: zodResolver(
      z.object({
        emoji_input: z.string()
          .emoji("Only emojis are allowed")
          .min(1)
          .max(255),
      }))
  })

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (errors.emoji_input) {
      console.log(errors.emoji_input)
    }
    mutate({ content: data.emoji_input });
  };

  const watchedEmojiInput = watch('emoji_input', '');

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      void ctx.posts.getAll.invalidate()
      reset({ emoji_input: '' })
    },
    onError: (e) => {
      const message = e.data?.zodError?.fieldErrors.content;
      if (message && message[0]) {
        toast.error(message[0]);
      } else {
        toast.error("Something went wrong, please try again later!")
      }
    }
  });

  console.log(watchedEmojiInput)
  if (!user) return null

  return (
    <div className="flex gap-3 w-full">
      <Image
        src={user.profileImageUrl}
        alt="Profile Image"
        className="h-12 w-12 rounded-full"
        width={48}
        height={48}
      />
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex gap-3">
        <input
          {...register("emoji_input", { required: true })}
          placeholder="Type some emojis!"
          className="bg-transparent grow outline-none w-full"
          disabled={isPosting}
        />
        {(errors.emoji_input && watchedEmojiInput.length > 0) && <p>{errors.emoji_input.message}</p>}
        <div className="flex items-center gap-2">
          {
            (watchedEmojiInput.length > 0 && !isPosting) && (
              <div>
                <button type="submit" disabled={isPosting}>
                  Post
                </button>
              </div>
            )
          }
          <div>
            {isPosting && <LoadingSpinner />}
          </div>
        </div>
      </form>
    </div>
  )

}

type PostWithUser = RouterOutputs["posts"]["getAll"][number]
const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div key={post.id} className="border-y border-slate-400 w-full flex p-4 gap-2">
      <div className="w-1/12">
        <Image
          src={author.profileImageUrl}
          alt={`@${author.username}'s profile picture`}
          className="h-12 w-12 rounded-full"
          width={48}
          height={48}
        />
      </div>
      <div className="flex flex-col w-11/12">
        <div className="font-bold flex gap-2">
          <div>
            <Link href={`/@${author.username}`}>
              <span>
                {`@${author.username}`}
              </span>
            </Link>
          </div>
          <div>
            <span>·</span>
          </div>
          <Link href={`/post/${post.id}`}>
            <div className="font-thin">
              <span>{dayjs(post.createdAt).fromNow()}</span>
            </div>
          </Link>
        </div>
        <div className="text-2xl">{post.content}</div>
      </div>
    </div>
  )
}

const Feed = () => {
  const { data, isLoading } = api.posts.getAll.useQuery();

  if (isLoading) return <Loading />

  if (!data) return <div>Something went wrong...</div>

  return (
    <div className="w-full h-full flex justify-center">
      <div className="w-full flex flex-col">
        {
          data.map((post) => (
            <PostView {...post} key={post.post.id} />
          ))
        }
      </div>
    </div>
  )
}

const Home: NextPage = () => {
  const { isLoaded, isSignedIn } = useUser()

  api.posts.getAll.useQuery();

  if (!isLoaded) return <div />

  return (
    <>
      <Layout>
        <div className="flex border-b border-slate-400 p-4">
          {!isSignedIn ?
            <div className="flex justify-center">
              <SignInButton />
            </div>
            : <CreatePostWizard />}
        </div>
        <Feed />
      </Layout>
    </>
  );
};

export default Home;
