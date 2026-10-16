import { FinancePanel } from "../components/finance/FinancePanel";
import { BlurFade } from "../components/motion/blur-fade";
import { PageHeader } from "../components/ui";

export default function FinancePage() {
  return (
    <>
      <BlurFade>
        <PageHeader title="Finance" subtitle="Invoices, payments, expenses and profit, all in KES." />
      </BlurFade>
      <FinancePanel />
    </>
  );
}
