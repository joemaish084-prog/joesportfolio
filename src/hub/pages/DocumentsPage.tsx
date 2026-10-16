import { DocumentsPanel } from "../components/documents/DocumentsPanel";
import { BlurFade } from "../components/motion/blur-fade";
import { PageHeader } from "../components/ui";

export default function DocumentsPage() {
  return (
    <>
      <BlurFade>
        <PageHeader
          title="Documents"
          subtitle="Contracts, proposals and quotations. Stored privately, opened with short-lived links."
        />
      </BlurFade>
      <BlurFade delay={0.05}>
        <DocumentsPanel />
      </BlurFade>
    </>
  );
}
