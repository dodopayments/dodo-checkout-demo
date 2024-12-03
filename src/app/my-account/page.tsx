// app/account/page.tsx
"use client";
import { Suspense, useState, useCallback, useEffect } from "react";
import SignoutButton from "@/components/design-system/SignoutButton";
import { ITEMS_LIST, SUBSCRIPTION_PLANS } from "@/constants/Items";
import { Loader } from "lucide-react";
import { OneTimePurchase } from "@/components/my-account/purchases";
import { Subscriptions } from "@/components/my-account/subscriptions";
import useCartStore from "@/lib/store/cart";

// Types
interface SubscriptionProduct {
  activated_at: string;
  payment_frequency_interval: string;
  subscription_id: string;
  product_id: string;
}

// Components
const LoadingSpinner = () => (
  <div
    className="flex w-full min-h-[55vh] h-full justify-center items-center"
    role="status"
  >
    <Loader className="animate-spin" aria-label="Loading..." />
  </div>
);

export default function AccountPage() {
  // State
  const [oneTimeProducts, setOneTimeProducts] = useState<string[]>([]);
  const [subscriptionProducts, setSubscriptionProducts] = useState<
    SubscriptionProduct[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { initializeCart } = useCartStore();

  useEffect(() => {
    const storedItems = localStorage.getItem("cartItems");
    if (storedItems) {
      initializeCart(JSON.parse(storedItems));
    }
  }, [initializeCart]);

  // Fetch Data
  const fetchSubscriptions = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch("/api/get-database");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { product_ids, subscription_ids } = await response.json();

      setOneTimeProducts(product_ids ?? []);
      setSubscriptionProducts(
        subscription_ids?.map((id: string) => JSON.parse(id)) ?? []
      );
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
      setError("Failed to load account data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  // Error UI
  if (error) {
    return (
      <main className="w-full h-full p-10 pb-0">
        <div className="bg-white rounded-[20px] flex flex-col p-10">
          <header className="flex items-center justify-between">
            <h1 className="font-display text-4xl">My Account</h1>
            <SignoutButton />
          </header>
          <div className="flex items-center justify-center min-h-[55vh]">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full h-full p-4 lg:p-10 pb-0">
      <div className="bg-white rounded-[20px] flex flex-col p-5 lg:p-10">
        <header className="flex items-center justify-between">
          <h1 className="font-display text-3xl lg:text-4xl">My Account</h1>
          <SignoutButton />
        </header>

        <Suspense fallback={<LoadingSpinner />}>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <OneTimePurchase products={oneTimeProducts} items={ITEMS_LIST} />
              <Subscriptions
                products={subscriptionProducts}
                plans={SUBSCRIPTION_PLANS}
              />
            </>
          )}
        </Suspense>
      </div>
    </main>
  );
}
