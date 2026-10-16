import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlurFade } from "../components/motion/blur-fade";
import { BusinessSettings } from "../components/settings/BusinessSettings";
import { CleanupSettings } from "../components/settings/CleanupSettings";
import { ClientTypesSettings } from "../components/settings/ClientTypesSettings";
import { OnboardingSettings } from "../components/settings/OnboardingSettings";
import { PageHeader } from "../components/ui";
import { ChangePasswordForm } from "../components/settings/ChangePassword";
import { useHubAuth } from "../auth/HubAuthProvider";
import { toast } from "sonner";

const TABS = [
  { value: "business", label: "Business & invoices" },
  { value: "types", label: "Client types" },
  { value: "onboarding", label: "Onboarding steps" },
  { value: "cleanup", label: "Clean-up" },
  { value: "account", label: "Account" },
] as const;

export default function SettingsPage() {
  const [params, setParams] = useSearchParams();
  const { session } = useHubAuth();
  const tab = TABS.some((t) => t.value === params.get("tab")) ? params.get("tab")! : "business";

  return (
    <>
      <BlurFade>
        <PageHeader title="Settings" subtitle="Your business details, how the hub is set up, and tidying your data." />
      </BlurFade>
      <Tabs value={tab} onValueChange={(v) => setParams(v === "business" ? {} : { tab: v }, { replace: true })}>
        <div className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList className="h-auto rounded-xl bg-secondary p-1">
            {TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="rounded-lg px-3.5 py-1.5 data-[state=active]:bg-card data-[state=active]:shadow-hub"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="business" className="mt-0 max-w-3xl">
          <BusinessSettings />
        </TabsContent>
        <TabsContent value="types" className="mt-0">
          <ClientTypesSettings />
        </TabsContent>
        <TabsContent value="onboarding" className="mt-0 max-w-3xl">
          <OnboardingSettings />
        </TabsContent>
        <TabsContent value="cleanup" className="mt-0 max-w-3xl">
          <CleanupSettings />
        </TabsContent>
        <TabsContent value="account" className="mt-0 max-w-md">
          <h2 className="hub-section-title">Your login</h2>
          <div className="hub-card space-y-4 p-5 sm:p-6">
            <p className="text-sm">
              Signed in as <span className="font-medium">{session?.user.email}</span>
            </p>
            <ChangePasswordForm submitLabel="Change password" onDone={() => toast.success("Password changed")} />
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
