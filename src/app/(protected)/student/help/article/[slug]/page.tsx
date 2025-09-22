import ArticleDetail from "@/components/help/article-detail";

type PageProps = {
  params: {
    slug: string;
  };
};

export default function Page({ params }: PageProps) {
  return (
    <>
      <ArticleDetail slug={params.slug} />
    </>
  );
}
