"use client";

import { ITEMS_LIST, SUBSCRIPTION_PLANS } from "@/constants/Items";
import useCartStore from "@/lib/store/cart";
import Image from "next/image";
import React, { useMemo } from "react";

interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  discount?: string;
  imageSrc: string;
  description?: string;
  isSubscription?: boolean;
  interval?: string;
}

interface SubscriptionCardProps {
  id: string;
  title: string;
  price: number;
  imageSrc: string;
  features: string[];
  interval: string;
}

interface PriceSummaryItemProps {
  label: string;
  value: string;
}

const ProductCard = ({
  title,
  price,
  discount,
  imageSrc,
  description,
  isSubscription = false,
  interval,
}: ProductCardProps) => {
  return (
    <div className="flex flex-col gap-3 items-start">
      <div className="flex gap-4 lg:gap-6 w-full items-start">
        <div className="aspect-square rounded-lg w-[120px] h-[120px] relative overflow-hidden">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div className="flex lg:flex-row flex-col items-start justify-between w-full">
          <div className="flex flex-col w-full gap-2">
            <h2 className="font-display text-xl font-medium">{title}</h2>
            <span className="font-medium text-sm">Quantity: 1</span>
            {isSubscription && interval && (
              <span className="text-sm text-neutral-500">Billing: {interval}</span>
            )}
            <p className="text-neutral-500 hidden lg:block text-sm font-normal text-wrap">
              {description ||
                "A captivating book that takes you on an unforgettable journey."}
            </p>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-1">
            {discount ? (
              <>
                <span className="line-through text-neutral-500">{price}</span>
                <span>{discount}</span>
              </>
            ) : (
              <span className="font-medium text-base">{price}</span>
            )}
          </div>
        </div>
      </div>
      <p className="text-neutral-500 lg:hidden text-sm font-normal text-wrap">
        {description ||
          "A captivating book that takes you on an unforgettable journey."}
      </p>
    </div>
  );
};

const SubscriptionCard = ({
  title,
  price,
  imageSrc,
  features,
  interval,
}: SubscriptionCardProps) => {
  return (
    <div className="flex flex-col gap-3 items-start">
      <div className="flex gap-4 lg:gap-6 w-full items-start">
        <div className="aspect-square rounded-lg w-[120px] h-[120px] relative overflow-hidden">
          <Image
            src={imageSrc}
            alt={`${title} Subscription`}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div className="flex lg:flex-row flex-col items-start justify-between w-full">
          <div className="flex flex-col w-full gap-2">
            <h2 className="font-display text-xl font-medium">{title}</h2>
            <span className="font-medium text-sm">Quantity: 1</span>
            <span className="text-sm text-neutral-500">Billing: {interval}</span>
            <div className="text-sm text-neutral-500 hidden lg:block">
              <div className="font-medium mb-1">Subscription Details:</div>
              <ul className="list-disc pl-5">
                {features.slice(0, 3).map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-1">
            <span className="font-medium text-base">${price.toFixed(2)}/{interval}</span>
          </div>
        </div>
      </div>
      <div className="text-sm text-neutral-500 lg:hidden">
        <div className="font-medium mb-1">Subscription Details:</div>
        <ul className="list-disc pl-5">
          {features.slice(0, 2).map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const PriceSummaryItem: React.FC<PriceSummaryItemProps> = ({
  label,
  value,
}) => (
  <div className="flex items-center justify-between">
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

const ProductPart = () => {
  const oneTimeItems = useCartStore((state) => state.oneTimeItems);
  const subscriptionItems = useCartStore((state) => state.subscriptionItems);

  const oneTimeItemsDetails = oneTimeItems
    .map((id) => ITEMS_LIST.find((item) => item.id === id))
    .filter((item): item is (typeof ITEMS_LIST)[0] => item !== undefined);

  const subscriptionItemsDetails = subscriptionItems
    .map((id) => SUBSCRIPTION_PLANS.find((item) => item.id === id))
    .filter((item): item is (typeof SUBSCRIPTION_PLANS)[0] => item !== undefined);

  const orderSummary = useMemo(() => {
    // Calculate subtotal for one-time items
    const oneTimeSubtotal = oneTimeItemsDetails.reduce((sum: number, item: (typeof ITEMS_LIST)[0]) => {
      const price = item.discount
        ? parseFloat(item.discount.replace("$", ""))
        : parseFloat(item.price.replace("$", ""));
      return sum + price;
    }, 0);

    // Calculate subtotal for subscription items
    const subscriptionSubtotal = subscriptionItemsDetails.reduce((sum: number, item: (typeof SUBSCRIPTION_PLANS)[0]) => {
      return sum + item.price;
    }, 0);

    const subtotal = oneTimeSubtotal + subscriptionSubtotal;
    const tax = subtotal * 0.1;
    const total = subtotal;

    return { subtotal, tax, total };
  }, [oneTimeItemsDetails, subscriptionItemsDetails]);

  return (
    <section className="lg:h-screen lg:w-1/2 flex flex-col lg:overflow-hidden">
      <div className="flex-grow p-4 lg:p-8 overflow-auto">
        <div className="">
          <div className="flex flex-col gap-8 mb-8">
            {oneTimeItemsDetails.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                discount={item.discount}
                imageSrc={item.imageSrc}
                isSubscription={false}
              />
            ))}
            
            {subscriptionItemsDetails.map((item) => (
              <SubscriptionCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                imageSrc={item.image.src}
                features={item.features}
                interval={item.interval}
              />
            ))}
          </div>

          <div className="flex flex-col border-t py-4 font-normal text-sm text-neutral-500 pb-4 gap-4">
            <PriceSummaryItem
              label="Subtotal"
              value={`$${orderSummary.subtotal.toFixed(2)}`}
            />
            <PriceSummaryItem
              label="Tax "
              value={`TBD`}
            />
          </div>

          <div className="flex border-t py-4 text-base font-medium items-center justify-between">
            <span>Total</span>
            <span>${orderSummary.total.toFixed(2)}</span>
          </div>
          
          {subscriptionItemsDetails.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">Subscription Information</h3>
              <p className="text-sm text-blue-700">
                You will be charged ${subscriptionItemsDetails[0].price.toFixed(2)} every {subscriptionItemsDetails[0].interval}.
                This is a recurring charge that will continue until you cancel your subscription.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductPart;