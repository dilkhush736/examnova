import { EmptyStateCard } from "../../components/ui/EmptyStateCard.jsx";
import { SectionHeader } from "../../components/ui/SectionHeader.jsx";

export function PaymentHistoryPage() {
  return (
    <section className="stack-section">
      <SectionHeader
        eyebrow="Payments"
        title="Payment history"
        description="Your payment receipts and transaction records will be listed here."
      />
      <EmptyStateCard
        title="No payment history yet"
        description="Payment events will appear here after private PDF purchases and marketplace transactions go live."
      />
    </section>
  );
}
