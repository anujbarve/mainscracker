import fs from "fs"
import path from "path"
import matter from "gray-matter"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { Navbar } from "@/components/header"
import FooterSection from "@/components/footer"

type Post = {
  slug: string
  title: string
  description: string
}

export default function BlogPage() {
  const posts: Post[] = getPosts()

  return (

    <>
    <Navbar></Navbar>
      <section className="py-16 md:py-32">
        <div className="mx-auto max-w-5xl space-y-12 px-6">
          <h1 className="text-5xl font-bold">Blog</h1>
          <p className="text-lg text-muted-foreground">
            Insights, strategies, and resources to guide your UPSC preparation.
          </p>

          <div className="grid gap-12">
            {posts.map((post) => (
              <div
                key={post.slug}
                className="grid gap-6 md:grid-cols-2 md:gap-12 items-center"
              >
                <h2 className="text-3xl font-semibold">{post.title}</h2>
                <div className="space-y-4">
                  <p>{post.description}</p>

                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="gap-1 pr-1.5"
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <span>Read More</span>
                      <ChevronRight className="size-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <FooterSection></FooterSection>
    </>
  )
}

function getPosts(): Post[] {
  const postsDir = path.join(process.cwd(), "src/content/posts")
  const files = fs.readdirSync(postsDir)

  return files.map((file) => {
    const slug = file.replace(/\.md$/, "")
    const filePath = path.join(postsDir, file)
    const fileContent = fs.readFileSync(filePath, "utf-8")
    const { data } = matter(fileContent)

    return {
      slug,
      title: data.title || "Untitled",
      description: data.description || "",
    }
  })
}
