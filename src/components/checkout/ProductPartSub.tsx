"use client";

import React from "react";
import Image from "next/image";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  imageSrc: string;
  description?: string;
  trialDays?: number;
  interval: string;
  intervalCount: number;
}

interface PriceSummaryItemProps {
  label: string;
  value: string;
}

const RecurringPrice = ({ 
  price, 
  interval, 
  intervalCount, 
  trialDays 
}: { 
  price: number;
  interval: string;
  intervalCount: number;
  trialDays?: number;
}) => (
  <div className="flex flex-col text-nowrap items-start lg:items-end gap-1 w-fit">
    <div className="flex items-start lg:items-center flex-col lg:flex-row justify-end lg:gap-2">
      <span className="font-medium font-body text-text-primary text-base">
        ${price.toFixed(2)}
        {" "}
        {interval.toLowerCase()}
        {intervalCount > 1 ? ` (${intervalCount} ${interval.toLowerCase()}s)` : ''}
      </span>
    </div>
    {trialDays && trialDays > 0 ? (
      <span className="text-text-secondary text-sm">
        (Starting from {" "}
        {new Date(
          Date.now() + trialDays * 24 * 60 * 60 * 1000
        ).toLocaleDateString()}
        )
      </span>
    ) : (
      <span className="text-text-secondary text-sm">
        Starts immediately
      </span>
    )}
  </div>
);

const ProductCard = ({
  title,
  price,
  imageSrc,
  description,
  interval,
  intervalCount,
  trialDays
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
            <p className="text-neutral-500 hidden lg:block text-sm font-normal text-wrap">
              {description ||
                "A captivating book that takes you on an unforgettable journey."}
            </p>
          </div>
          <RecurringPrice 
            price={price}
            interval={interval}
            intervalCount={intervalCount}
            trialDays={trialDays}
          />
        </div>
      </div>
      <p className="text-neutral-500 lg:hidden text-sm font-normal text-wrap">
        {description ||
          "A captivating book that takes you on an unforgettable journey."}
      </p>
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

export const SUBSCRIPTION_PLANS = [
  {
    id: "e42062ba-1a95-466d-a189-aa0903eaac3d",
    title: "Monthly plan",
    price: 15.0,
    image: {
      src: "/books/stack/Monthly.webp",
      width: "w-[35vw]",
    },
    features: [
      "Get 2 books every month",
      "Early access to new releases",
      "Weekly newsletter",
      "Monthly webinar invite",
    ],
    imagePosition: "right",
    interval: "monthly",
    intervalCount: 1,
    trialDays: 0, 
  },
  {
    id: "3b15417f-ea96-4104-a44f-c0dad1581d9d",
    title: "Yearly plan",
    price: 100.0,
    image: {
      src: "/books/stack/Yearly.webp",
      width: "w-[45vw]",
    },
    features: [
      "Get 20 books every Year",
      "Early access to new releases",
      "Weekly newsletter",
      "Monthly webinar invite",
      "Dinner with author",
    ],
    imagePosition: "left",
    interval: "yearly",
    intervalCount: 1,
    trialDays: 0, // Added trial period
  },
];

const ProductPartSub = ({ id }: { id: string }) => {
  const selectedPlan = SUBSCRIPTION_PLANS.find((item) => item.id === id);

  if (!selectedPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-medium mb-4">Plan not found</h2>
          <p className="text-neutral-500">
            Please select a valid subscription plan
          </p>
        </div>
      </div>
    );
  }

  const subtotal = selectedPlan.price;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <section className="lg:h-screen lg:w-1/2 flex flex-col lg:overflow-hidden">
      <div className="flex-grow p-4 lg:p-8 overflow-auto">
        <div className="">
          <div className="flex flex-col gap-8 mb-8">
            <ProductCard
              id={selectedPlan.id}
              title={selectedPlan.title}
              price={selectedPlan.price}
              imageSrc={selectedPlan.image.src}
              interval={selectedPlan.interval}
              intervalCount={selectedPlan.intervalCount}
              trialDays={selectedPlan.trialDays}
            />
          </div>

          <div className="flex flex-col border-t py-4 font-normal text-sm text-neutral-500 pb-4 gap-4">
            <PriceSummaryItem
              label="Subtotal"
              value={`$${subtotal.toFixed(2)}`}
            />
            <PriceSummaryItem
              label="Tax"
              value={`TBD`}
            />
            {selectedPlan.trialDays && selectedPlan.trialDays > 0 ? (
              <PriceSummaryItem
              label="Free trial period"
              value={`${selectedPlan.trialDays} days`}
              />
            ) : (
              <PriceSummaryItem
              label="Start date"
              value="Starts immediately"
              />
            )}
          </div>

          <div className="flex border-t py-4 text-base font-medium items-center justify-between">
            <span>Total</span>
            <div className="flex flex-col items-end">
              <span>${total.toFixed(2)}</span>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductPartSub;