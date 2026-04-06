import { InternalLayout } from "@/components/layouts/InternalLayout";
import { Card, CardContent } from "@/components/ui/card";

export default function InternalSettings() {
  return (
    <InternalLayout>
      <div className="p-6">
        <h1 className="font-display font-bold text-2xl mb-2">Settings</h1>
        <p className="text-sm text-muted-foreground mb-6">Portal configuration and preferences</p>
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <p className="text-lg font-display font-semibold mb-2">Coming Soon</p>
            <p className="text-sm">System settings and configuration options are under development.</p>
          </CardContent>
        </Card>
      </div>
    </InternalLayout>
  );
}
