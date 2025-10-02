"use client";
import CustomerForm from "@/components/checkout/CustomerForm";
import ProductPart from "@/components/checkout/ProductPart";
import useCartStore from "@/lib/store/cart";
import React, { useEffect } from "react";

const Page = () => {
  const { oneTimeItems, subscriptionItems, initializeCart } = useCartStore();

  useEffect(() => {
    const storedOneTimeItems = localStorage.getItem("oneTimeItems");
    const storedSubscriptionItems = localStorage.getItem("subscriptionItems");
    initializeCart(
      storedOneTimeItems ? JSON.parse(storedOneTimeItems) : [],
      storedSubscriptionItems ? JSON.parse(storedSubscriptionItems) : []
    );
  }, [initializeCart]);

  const hasItems = oneTimeItems.length > 0 || subscriptionItems.length > 0;

  if (!hasItems) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium mb-4">Your cart is empty</h2>
          <p className="text-neutral-500">
            Add some items to proceed with checkout
          </p>
        </div>
      </div>
    );
  }

  // Show the normal checkout flow for all items
  return (
    <div className="w-full px-3 lg:px-10 mt-10">
      <div className="flex flex-col lg:flex-row bg-white rounded-xl ">
        <ProductPart />
        <CustomerForm />
      </div>
    </div>
  );
};

export default Page;