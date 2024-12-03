import { memo, useState } from "react";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { SubscriptionPlan, SubscriptionProduct } from "@/types/account-types";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";


const Feature = memo(({ text }: { text: string }) => (
  <div className="flex items-center text-sm lg:text-base text-left p-2 text-white gap-2">
    <CheckCircle className="text-white mr-2" size={24} weight="fill" />
    <span>{text}</span>
  </div>
));
Feature.displayName = "Feature";

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
  data: SubscriptionProduct;
  onCancelled?: () => void;
}

const SubscriptionCard = memo(({ plan, data, onCancelled }: SubscriptionCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  if (!data || !plan) {
    return null;
  }

  const purchaseDate = new Date(data.activated_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });

  const handleCancellation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscriptionId: data.subscription_id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel subscription');
      }

      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been successfully cancelled.",
      });

      onCancelled?.();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel subscription",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="subscription-card">
      <div className="flex lg:flex-row flex-col items-center my-3 gap-8">
        <Image
          src={plan.image?.src || ""}
          alt={`${plan.title} subscription`}
          width={350}
          height={280}
          priority={true}
        />
        <div className="bg-[#232321] p-3 rounded-xl grid grid-cols-2 items-start grid-rows-2">
          {plan.features?.map((feature, index) => (
            <Feature key={`${feature}-${index}`} text={feature} />
          ))}
        </div>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[#232321] font-semibold text-[18px]">
          {plan.title}
        </span>
        <div className="flex lg:flex-row flex-col items-start lg:items-center text-neutral-600 gap-2">
          <span>Purchased on {purchaseDate}</span>
          <span className="h-3 w-[1px] border-l hidden lg:block border-neutral-800" />
          <span>
            Billing frequency is one{" "}
            {data.payment_frequency_interval?.toLowerCase()}
          </span>
        </div>
      </div>
      <div className="flex items-center mt-2 gap-2">
        <Button
          variant="destructive"
          onClick={handleCancellation}
          disabled={isLoading}
        >
          {isLoading ? "Cancelling..." : "Cancel"}
        </Button>
      </div>
    </div>
  );
});
SubscriptionCard.displayName = "SubscriptionCard";

interface SubscriptionsProps {
  products: SubscriptionProduct[];
  plans: SubscriptionPlan[];
}

export const Subscriptions = memo(({ products, plans }: SubscriptionsProps) => {
  const [activePurchases, setActivePurchases] = useState(
    plans.filter((plan) => products.some((product) => product.product_id === plan.id))
  );

  const handleCancellation = () => {
    window.location.reload();
    // Refresh the list of active subscriptions
    setActivePurchases(
      plans.filter((plan) => products.some((product) => product.product_id === plan.id))
    );
  };

  return (
    <section
      aria-labelledby="subscriptions-heading"
      className="flex my-5 flex-col items-start"
    >
      <h2
        id="subscriptions-heading"
        className="text-[#232321] font-medium text-[20px]"
      >
        Active Subscriptions
      </h2>
      {!activePurchases.length ? (
        <div className="bg-[#232321] mt-3 w-full max-w-sm py-6 px-8 rounded-xl text-white">
          No Active Subscriptions
        </div>
      ) : (
        <div className="flex gap-10 flex-wrap">
          {activePurchases.map((purchase, index) => (
            <SubscriptionCard
              key={purchase.id}
              plan={purchase}
              data={products[index]}
              onCancelled={handleCancellation}
            />
          ))}
        </div>
      )}
    </section>
  );
});
Subscriptions.displayName = "Subscriptions";