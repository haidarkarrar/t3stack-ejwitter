import { type NextPage } from "next";
import Head from "next/head";
import { SignInButton, useUser } from "@clerk/nextjs";
import { type RouterOutputs, api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { Loading } from "~/components/loading";

dayjs.extend(relativeTime);

const CreatePostWizard = () => {
  const { user } = useUser()

  if (!user) return null
  console.log(user.id)

  return (
    <div className="flex gap-3 w-full">
      <Image
        src={user.profileImageUrl}
        alt="Profile Image"
        className="h-12 w-12 rounded-full"
        width={48}
        height={48}
      />
      <input placeholder="Type some emojis!" className="bg-transparent grow outline-none" />
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
            <span>
              {`@${author.username}`}
            </span>
          </div>
          <div>
            <span>·</span>
          </div>
          <div className="font-thin">
            <span>{dayjs(post.createdAt).fromNow()}</span>
          </div>
        </div>
        <div>{post.content}</div>
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
          data?.map((post) => (
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
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center h-screen">
        <div className="h-full w-full md:max-w-2xl border-x border-slate-400">
          <div className="border-slate-400 border-b p-4 flex">
            <div className="w-full">
              {!isSignedIn ? <SignInButton /> : <CreatePostWizard />}
            </div>
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
};

export default Home;
