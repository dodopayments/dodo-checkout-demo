"use client";
import { ITEMS_LIST, SUBSCRIPTION_PLANS } from "@/constants/Items";
import { toast } from "@/hooks/use-toast";
import useCartStore from "@/lib/store/cart";
import Image from "next/image";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { ToastAction } from "../ui/toast";

interface ItemProps {
  id: string;
  imageSrc: string;
  altText: string;
  title: string;
  discount?: string;
  price: string;
  isSubscription?: boolean;
  interval?: string;
  features?: string[];
}

const Item: React.FC<ItemProps> = ({
  id,
  imageSrc,
  altText,
  title,
  price,
  discount,
  isSubscription = false,
  interval,
  features,
}) => {
  const { oneTimeItems, subscriptionItems, addToCart, initializeCart, setCartOpen } = useCartStore();

  useEffect(() => {
    const storedOneTimeItems = localStorage.getItem("oneTimeItems");
    const storedSubscriptionItems = localStorage.getItem("subscriptionItems");
    initializeCart(
      storedOneTimeItems ? JSON.parse(storedOneTimeItems) : [],
      storedSubscriptionItems ? JSON.parse(storedSubscriptionItems) : []
    );
  }, [initializeCart]);

  const isInCart = isSubscription 
    ? subscriptionItems.includes(id)
    : oneTimeItems.includes(id);

  const handleAddItem = () => {
    addToCart(id, isSubscription);
    toast({
      title: isSubscription ? "Subscription Added" : "Item Added",
      description: isSubscription 
        ? "You can view your cart to subscribe."
        : "You can view your cart to complete the purchase.",
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
          src={imageSrc}
          alt={altText}
          fill
          style={{ objectFit: "cover" }}
          className="border-4 rounded-[24px] border-white"
        />
      </div>
      <div className="text-xl font-semibold pl-1 text-[#232321]">{title}</div>
      {isSubscription ? (
        <div className="text-[#232321] pl-1 font-semibold">{price}/{interval}</div>
      ) : discount ? (
        <div className="flex items-center gap-2">
          <div className="text-[#232321] pl-1 opacity-50 font-semibold line-through">
            {price}
          </div>
          <div className="text-[#870A0A] pl-1 font-semibold ">{discount}</div>
        </div>
      ) : (
        <div className="text-[#232321] pl-1 font-semibold">{price}</div>
      )}
      {isSubscription && features && (
        <ul className="text-sm text-gray-600 pl-1 hidden lg:block">
          {features.slice(0, 2).map((feature, index) => (
            <li key={index}>• {feature}</li>
          ))}
        </ul>
      )}
      <Button
        onClick={handleAddItem}
        disabled={isInCart}
        className={`py-2 ${isInCart ? "bg-neutral-800" : ""}`}
      >
        {isInCart 
          ? (isSubscription ? "Subscription Selected" : "Added to Cart") 
          : (isSubscription ? "Select Subscription" : "Add to Cart")}
      </Button>
    </div>
  );
};

const Catalog = () => {
  return (
    <div className="flex flex-col items-center justify-center mb-16">
      <div className="text-center mb-4 lg:mt-4 lg:mb-12 text-[#232321] text-3xl lg:text-[55px] font-semibold uppercase">
        Don&apos;t miss out{" "}
        <span className="text-[#870A0A] font-display  capitalize">
          New Launches
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {ITEMS_LIST.map((item) => (
          <Item key={item.id} {...item} isSubscription={false} />
        ))}
      </div>
      
      <div className="text-center my-12 text-[#232321] text-3xl lg:text-[55px] font-semibold uppercase">
        <span className="text-[#870A0A] font-display  capitalize">
          Subscription Plans
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-12">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Item 
            key={plan.id} 
            id={plan.id}
            imageSrc={plan.image.src}
            altText={`${plan.title} Subscription`}
            title={plan.title}
            price={`$${plan.price.toFixed(2)}`}
            isSubscription={true}
            interval={plan.interval}
            features={plan.features}
          />
        ))}
      </div>
    </div>
  );
};

export default Catalog;