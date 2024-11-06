"use client";

import React, {  useMemo } from "react";
import Image from "next/image";
import { ITEMS_LIST } from "@/constants/Items";
import useCartStore from "@/store/cart";

interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  discount?: string;
  imageSrc: string;
  description?: string;
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
  const { cartItems } = useCartStore();

  
  const cartItemsDetails = cartItems
    .map((id) => ITEMS_LIST.find((item) => item.id === id))
    .filter((item): item is (typeof ITEMS_LIST)[0] => item !== undefined);

  const orderSummary = useMemo(() => {
    const subtotal = cartItemsDetails.reduce((sum, item) => {
      const price = item.discount
        ? parseFloat(item.discount.replace("$", ""))
        : parseFloat(item.price.replace("$", ""));
      return sum + price;
    }, 0);

    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    return { subtotal, tax, total };
  }, [cartItemsDetails]);

 
  return (
    <section className="lg:h-screen lg:w-1/2 flex flex-col lg:overflow-hidden">
      <div className="flex-grow p-4 lg:p-8 overflow-auto">
        <div className="">
          <div className="flex flex-col gap-8 mb-8">
            {cartItemsDetails.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                discount={item.discount}
                imageSrc={item.imageSrc}
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
        </div>
      </div>
    </section>
  );
};

export default ProductPart;
