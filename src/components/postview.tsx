import { type RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAll"][number]
export const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <Link href={`/post/${post.id}`}>
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
            <div className="font-thin">
              <span>{dayjs(post.createdAt).fromNow()}</span>
            </div>
          </div>
          <div className="text-2xl">{post.content}</div>
        </div>
      </div>
    </Link>
  )
}