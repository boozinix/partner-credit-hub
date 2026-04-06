import { InternalLayout } from "@/components/layouts/InternalLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function InternalUsers() {
  return (
    <InternalLayout>
      <div className="p-6">
        <h1 className="font-display font-bold text-2xl mb-2">User Management</h1>
        <p className="text-sm text-muted-foreground mb-6">Manage approvers and team members</p>
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <p className="text-lg font-display font-semibold mb-2">Coming Soon</p>
            <p className="text-sm">User management and role assignment is under development.</p>
          </CardContent>
        </Card>
      </div>
    </InternalLayout>
  );
}
