import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SubscriptionsPageSkeleton() {
  return (
    <main className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            {[...Array(2)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-7 w-32" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-8 w-24" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))}
        </div>
      </div>
    </main>
  );
}