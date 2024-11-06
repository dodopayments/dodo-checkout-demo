"use client";
import CustomerForm from "@/components/checkout/FormPart";
import ProductPart from "@/components/checkout/ProductPart";
import useCartStore from "@/store/cart";
import React, { useEffect } from "react";

const Page = () => {
  const { cartItems, initializeCart } = useCartStore();

  useEffect(() => {
    const storedItems = localStorage.getItem("cartItems");
    if (storedItems) {
      initializeCart(JSON.parse(storedItems));
    }
  }, [initializeCart]);

  if (cartItems.length === 0) {
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
