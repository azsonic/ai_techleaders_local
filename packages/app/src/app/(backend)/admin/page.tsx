import Link from "next/link";

import { buttonVariants } from "@devmentor/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@devmentor/ui/components/ui/card";
import { cn } from "@devmentor/ui/lib/utils";

import { HealthStatusPanel } from "./health-status-panel";

export default function AdminDashboard() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>The DevMentor back office is ready for its first feature.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
        <p>
          Backend pages are built from shadcn/ui components in <code>@devmentor/ui</code>.
        </p>
        <HealthStatusPanel />
      </CardContent>
      <CardFooter className="gap-2">
        <Link href="/" className={cn(buttonVariants())}>
          View site
        </Link>
      </CardFooter>
    </Card>
  );
}
