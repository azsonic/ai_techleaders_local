import Link from "next/link";

import { buttonVariants } from "@devmentor/ui/components/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@devmentor/ui/components/card";
import { cn } from "@devmentor/ui/lib/utils";

export default function AdminDashboard() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>The DevMentor back office is ready for its first feature.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Backend pages are built from shadcn/ui components in <code>@devmentor/ui</code>.
      </CardContent>
      <CardFooter className="gap-2">
        <Link href="/" className={cn(buttonVariants())}>
          View site
        </Link>
        <a href="/api/health" className={cn(buttonVariants({ variant: "outline" }))}>
          Health check
        </a>
      </CardFooter>
    </Card>
  );
}
