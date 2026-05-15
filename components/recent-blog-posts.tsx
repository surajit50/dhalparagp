import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const posts = [
  {
    title: "Community Development Initiatives",
    excerpt:
      "Learn about our recent efforts to improve local infrastructure and services.",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    title: "Upcoming Panchayat Elections",
    excerpt:
      "Important information about the upcoming local elections and how to participate.",
    image: "/placeholder.svg?height=200&width=400",
  },
];

export default function RecentBlogPosts() {
  return (
    <section className="my-12">
      <h2 className="text-3xl font-bold mb-6 text-orange-800">
        Recent Blog Posts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post, index) => (
          <Card
            key={index}
            className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2 text-orange-700">
                {post.title}
              </h3>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
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
