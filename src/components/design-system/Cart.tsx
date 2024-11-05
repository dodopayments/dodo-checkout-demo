"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Basket, Trash } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

interface CartItemProps {
  title: string;
  price: string;
  originalPrice: string;
  quantity: number;
}

const CartItem = ({ title, price, originalPrice, quantity }: CartItemProps) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="w-24 h-24 rounded-lg overflow-hidden bg-neutral-800">
      <Image
        width={96}
        height={96}
        src="/books/lost-in-time.webp"
        alt={title}
        className="w-full h-full object-cover"
      />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <button className="text-neutral-400 hover:text-white">
          <Trash size={20} />
        </button>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-neutral-400 line-through">${originalPrice}</span>
        <span className="text-white font-semibold">${price}</span>
      </div>
      <div className="mt-2">
        <span className="text-white">QTY : {quantity}</span>
      </div>
    </div>
  </div>
);

export function Cart() {
  const cartItems = [
    {
      title: "Lost in Time",
      price: "11.99",
      originalPrice: "16.99",
      quantity: 1,
    },
    {
      title: "Lost in Time",
      price: "11.99",
      originalPrice: "16.99",
      quantity: 1,
    },
  ];

  return (
    <Sheet>
      <SheetTrigger>
        <Basket size={24} weight="fill" />
      </SheetTrigger>
      <SheetContent className="bg-neutral-900 border-neutral-800">
        <SheetHeader className="border-b border-neutral-800 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white text-xl">Your Cart</SheetTitle>
          </div>
        </SheetHeader>
        <div className="flex flex-col flex-1 overflow-auto py-6">
          {cartItems.map((item, index) => (
            <CartItem key={index} {...item} />
          ))}
        </div>
        <div className="mt-auto  w-full  pt-4">
        <button className="bg-[#8B0000] hover:bg-[#A00000] transition-colors text-white px-8 py-3 rounded-lg font-medium w-full">
           Complete Purchase
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default Cart;
