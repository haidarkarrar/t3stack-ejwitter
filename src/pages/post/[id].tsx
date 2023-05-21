import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { appRouter } from "~/server/api/root";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { Layout } from "~/components/layout";
import { PostView } from "~/components/postview";


const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.posts.getSinglePostById.useQuery({
    postId: id
  })

  if (!data) return <div>Something went wrong...</div>

  return (
    <>
      <Head>
        <title>{data.post.content}</title>
      </Head>
      <Layout>
        <PostView {...data} />
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, authId: null },
    transformer: superjson,
  });

  const id = context.params?.id

  if (typeof id !== "string") throw new Error("no id")


  await ssg.posts.getSinglePostById.prefetch({ postId: id })

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id
    }
  }
}

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking"
  }
}

export default SinglePostPage;
