"use client"

import ArticleDetail from "@/components/help/article-detail";
import { useParams } from "next/navigation";

export default function Page() {

    const params = useParams();
    const slug = params?.slug as string;
  return (
    <>
      <ArticleDetail slug={slug} />
    </>
  );
}