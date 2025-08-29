import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronRight, FileText } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'

export default function SamplesSection() {
  return (
    <section>
      <div className="py-32">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-balance text-3xl font-semibold md:text-4xl">
              See How Evaluations Are Performed
            </h2>
            <p className="text-muted-foreground mt-6">
              Download sample evaluated answer sheets to understand the feedback, 
              annotations, and scoring you’ll receive for your UPSC Mains answers.
            </p>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SampleCard
              title="Essay Paper – Sample Evaluation"
              description="See detailed comments, structure feedback, and scoring style for an essay paper."
              link="/samples/essay-paper.pdf"
            >
              <FileText />
            </SampleCard>

            <SampleCard
              title="GS Paper – Sample Evaluation"
              description="Get a glimpse of model answers, margin notes, and performance tips."
              link="/samples/gs-paper.pdf"
            >
              <FileText />
            </SampleCard>

            <SampleCard
              title="Optional Paper – Sample Evaluation"
              description="Understand evaluation for optional subjects with subject-specific feedback."
              link="/samples/optional-paper.pdf"
            >
              <FileText />
            </SampleCard>
          </div>
        </div>
      </div>
    </section>
  )
}

const SampleCard = ({
  title,
  description,
  children,
  link = '#',
}: {
  title: string
  description: string
  children: React.ReactNode
  link?: string
}) => {
  return (
    <Card className="p-6">
      <div className="relative">
        <div className="*:size-10 text-primary">{children}</div>

        <div className="space-y-2 py-6">
          <h3 className="text-base font-medium">{title}</h3>
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {description}
          </p>
        </div>

        <div className="flex gap-3 border-t border-dashed pt-6">
          <Button
            asChild
            variant="secondary"
            size="sm"
            className="gap-1 pr-2 shadow-none"
          >
            <Link href={link} target="_blank">
              View PDF
              <ChevronRight className="ml-0 !size-3.5 opacity-50" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
