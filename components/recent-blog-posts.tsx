import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getRecentBlogPosts } from "@/action/blog-actions";
import Image from "next/image";

export default async function RecentBlogPosts() {
  const result = await getRecentBlogPosts(2);
  const posts = result.success || [];

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="my-12">
      <h2 className="text-3xl font-bold mb-6 text-orange-800">
        Recent Blog Posts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            {post.imageUrl && (
              <div className="relative w-full h-48">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            )}
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-orange-700">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
              )}
              <Button
                variant="link"
                className="p-0 text-orange-600 hover:text-orange-800"
              >
                Read More
                <span className="sr-only">about {post.title}</span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
