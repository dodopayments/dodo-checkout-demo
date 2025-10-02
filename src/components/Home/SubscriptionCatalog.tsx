"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import useCartStore from "@/lib/store/cart";
import { SUBSCRIPTION_PLANS } from "@/constants/Items";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "../ui/toast";

interface SubscriptionItemProps {
  id: string;
  title: string;
  price: number;
  image: { src: string; width: string };
  features: string[];
  interval: string;
}

const SubscriptionItem: React.FC<SubscriptionItemProps> = ({
  id,
  title,
  price,
  image,
  features,
  interval,
}) => {
  const { subscriptionItems, addToCart, initializeCart, setCartOpen } = useCartStore();

  useEffect(() => {
    const storedSubscriptionItems = localStorage.getItem("subscriptionItems");
    initializeCart(
      [],
      storedSubscriptionItems ? JSON.parse(storedSubscriptionItems) : []
    );
  }, [initializeCart]);

  const isInCart = subscriptionItems.includes(id);

  const handleAddItem = () => {
    addToCart(id, true); // true indicates this is a subscription
    toast({
      title: "Subscription Selected",
      description: "You can view your cart to complete the subscription.",
      action: (
        <ToastAction onClick={() => setCartOpen(true)} altText="Go to cart">
          Go to cart
        </ToastAction>
      ),
    });
  };

  return (
    <div className="w-fit h-fit gap-1 flex flex-col">
      <div className="relative w-[95vw] sm:w-[40vw] lg:w-[21vw] h-80">
        <Image
          src={image.src}
          alt={`${title} Subscription`}
          fill
          style={{ objectFit: "cover" }}
          className="border-4 rounded-[24px] border-white"
        />
      </div>
      <div className="text-xl font-semibold pl-1 text-[#232321]">{title}</div>
      <div className="text-[#232321] pl-1 font-semibold">${price.toFixed(2)}/{interval}</div>
      <ul className="text-sm text-gray-600 pl-1">
        {features.map((feature, index) => (
          <li key={index}>• {feature}</li>
        ))}
      </ul>
      <Button
        onClick={handleAddItem}
        disabled={isInCart}
        className={`py-2 ${isInCart ? "bg-neutral-800" : ""}`}
      >
        {isInCart ? "Subscription Selected" : "Select Subscription"}
      </Button>
    </div>
  );
};

const SubscriptionCatalog = () => {
  return (
    <div className="flex flex-col items-center justify-center mb-16">
      <div className="text-center mb-4 lg:mt-4 lg:mb-12 text-[#232321] text-3xl lg:text-[55px] font-semibold uppercase">
        <span className="text-[#870A0A] font-display  capitalize">
          Subscription Plans
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-12">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <SubscriptionItem key={plan.id} {...plan} />
        ))}
      </div>
    </div>
  );
};

export default SubscriptionCatalog;