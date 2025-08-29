import FooterSection from "@/components/footer";
import { Navbar } from "@/components/header";
import { getPost, getAllPosts } from "@/lib/markdown";


export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;  // 👈 await it
  const { contentHtml, metadata } = await getPost(slug);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-4xl font-bold mb-4">{metadata.title}</h1>
        <p className="text-sm text-gray-500 mb-8">
          {metadata.date} · {metadata.readTime} · by {metadata.author}
        </p>
        <article
          className="prose prose-lg prose-gray dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </main>
      <FooterSection />
    </>
  );
}
