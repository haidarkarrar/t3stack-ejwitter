import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { prisma } from "~/server/db";
import superjson from "superjson";
import { appRouter } from "~/server/api/root";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { Layout } from "~/components/layout";
import Image from "next/image";


const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
    const { data } = api.profile.getUserByUsername.useQuery({
        username
    })

    if (!data) return <div>Something went wrong...</div>

    return (
        <>
            <Head>
                <title>{data.username}</title>
            </Head>
            <Layout>
                <div className="border-b border-slate-400 bg-slate-600 h-40 relative w-full">
                    <Image
                        src={data.profileImageUrl}
                        alt={`profile picture`}
                        className="h-28 w-28 rounded-full absolute bottom-0 -mb-14 left-4"
                        width={96}
                        height={96}
                    />
                </div>
                <div className="h-14" />
                <div className="text-2xl font-bold p-4 w-full">
                    {`@${data.username ?? ""}`}
                </div>
                <div className="border-b border-slate-400 w-full"></div>
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

    const slug = context.params?.slug

    if (typeof slug !== "string") throw new Error("no slug")

    //remove @ from the slug
    const username = slug.replace("@", "")

    await ssg.profile.getUserByUsername.prefetch({ username: username })

    return {
        props: {
            trpcState: ssg.dehydrate(),
            username
        }
    }
}

export const getStaticPaths = () => {
    return {
        paths: [],
        fallback: "blocking"
    }
}

export default ProfilePage;
