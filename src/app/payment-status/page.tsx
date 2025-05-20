"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PaymentStatusConfig {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const PAYMENT_STATUS_CONFIG: Record<string, PaymentStatusConfig> = {
  succeeded: {
    icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
    title: "Payment Successful",
    description: "Your payment has been processed successfully. Thank you for your purchase!",
    color: "text-green-500",
  },
  failed: {
    icon: <XCircle className="w-12 h-12 text-red-500" />,
    title: "Payment Failed",
    description: "We couldn't process your payment. Please try again or contact support if the issue persists.",
    color: "text-red-500",
  },
  processing: {
    icon: <Clock className="w-12 h-12 text-yellow-500" />,
    title: "Payment Processing",
    description: "Your payment is being processed. This may take a few moments.",
    color: "text-yellow-500",
  },
};

export default function PaymentStatusPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "processing";
  const config = PAYMENT_STATUS_CONFIG[status] || PAYMENT_STATUS_CONFIG.processing;

  return (
    <main className="w-full h-full p-10 pb-0">
      <div className="bg-white rounded-[20px] flex flex-col p-10">
        <header className="flex items-center justify-between">
          <h1 className="font-display text-4xl">Payment Status</h1>
        </header>

        <div className="flex flex-col items-center justify-center min-h-[55vh] text-center">
          <div className="mb-6">{config.icon}</div>
          <h2 className={`text-2xl font-bold mb-4 ${config.color}`}>
            {config.title}
          </h2>
          <p className="text-slate-600 mb-8 max-w-md">
            {config.description}
          </p>
          
          <div className="flex gap-4">
            <Button asChild variant="default">
              <Link href="/">Return to Home</Link>
            </Button>
            {status === "failed" && (
              <Button asChild variant="outline">
                <Link href="/#overlay-checkout">Try Again</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 