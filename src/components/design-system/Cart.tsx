"use client";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ITEMS_LIST, SUBSCRIPTION_PLANS } from "@/constants/Items";
import useCartStore from "@/lib/store/cart";
import { Basket, Trash } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

interface CartItemProps {
  id: string;
  title: string;
  price: string;
  discount?: string;
  imageSrc: string;
  isSubscription?: boolean;
  interval?: string;
}

const CartItem = ({ id, title, price, discount, imageSrc, isSubscription = false, interval }: CartItemProps) => {
  const removeFromCart = useCartStore((state) => state.removeFromCart);

  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="w-24 h-24 rounded-lg overflow-hidden bg-neutral-800">
        <Image
          width={96}
          height={96}
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <button
            className="text-neutral-400 hover:text-white"
            onClick={() => removeFromCart(id, isSubscription)}
          >
            <Trash size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1">
          {discount ? (
            <>
              <span className="text-neutral-400 line-through">{price}</span>
              <span className="text-white font-semibold">{discount}</span>
            </>
          ) : (
            <span className="text-white font-semibold">{price}</span>
          )}
        </div>
        <div className="mt-2">
          <span className="text-white">QTY: 1</span>
          {isSubscription && interval && (
            <span className="text-neutral-400 text-sm block">Billing: {interval}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export function Cart() {
  const oneTimeItems = useCartStore((state) => state.oneTimeItems);
  const subscriptionItems = useCartStore((state) => state.subscriptionItems);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const setCartOpen = useCartStore((state) => state.setCartOpen);

  const oneTimeItemsDetails = oneTimeItems
    .map((id) => ITEMS_LIST.find((item) => item.id === id))
    .filter((item): item is (typeof ITEMS_LIST)[0] => item !== undefined);

  const subscriptionItemsDetails = subscriptionItems
    .map((id) => SUBSCRIPTION_PLANS.find((item) => item.id === id))
    .filter((item): item is (typeof SUBSCRIPTION_PLANS)[0] => item !== undefined);

  // Calculate total for one-time items
  const oneTimeTotal = oneTimeItemsDetails.reduce((sum: number, item: (typeof ITEMS_LIST)[0]) => {
    const price = item.discount
      ? parseFloat(item.discount.replace("$", ""))
      : parseFloat(item.price.replace("$", ""));
    return sum + price;
  }, 0);

  // Calculate total for subscription items
  const subscriptionTotal = subscriptionItemsDetails.reduce((sum: number, item: (typeof SUBSCRIPTION_PLANS)[0]) => {
    return sum + item.price;
  }, 0);

  const total = oneTimeTotal + subscriptionTotal;
  const totalItems = oneTimeItems.length + subscriptionItems.length;

  return (
    <Sheet 
    open={isCartOpen} 
    onOpenChange={setCartOpen}
  >
    <SheetTrigger className="relative" onClick={() => setCartOpen(true)}>
        <Basket size={24} weight="fill" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-[#8B0000] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="bg-neutral-900 overflow-auto border-neutral-800">
        <SheetHeader className="border-b border-neutral-800 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-white text-xl">
              Your Cart ({totalItems} items)
            </SheetTitle>
          </div>
        </SheetHeader>
        <div className="flex flex-col flex-1 overflow-auto py-6">
          {totalItems === 0 ? (
            <div className="text-neutral-400 text-center py-8">
              Your cart is empty
            </div>
          ) : (
            <>
              {oneTimeItemsDetails.map((item) => (
                <CartItem 
                  key={item.id} 
                  {...item} 
                  isSubscription={false}
                />
              ))}
              {subscriptionItemsDetails.map((item) => (
                <CartItem 
                  key={item.id} 
                  id={item.id}
                  title={item.title}
                  price={`$${item.price.toFixed(2)}`}
                  imageSrc={item.image.src}
                  isSubscription={true}
                  interval={item.interval}
                />
              ))}
            </>
          )}
        </div>
        {totalItems > 0 && (
          <div className="mt-auto border-t border-neutral-800 pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white">Total:</span>
              <span className="text-white font-semibold">
                ${total.toFixed(2)}
              </span>
            </div>
            {subscriptionItemsDetails.length > 0 && (
              <div className="mb-4 p-3 bg-blue-900 rounded text-blue-200 text-sm">
                Includes subscription charges
              </div>
            )}
            <SheetClose asChild>
              <Button
                asChild
                className="bg-[#8B0000] hover:bg-[#A00000] transition-colors text-white px-8 py-3 rounded-lg font-medium w-full my-2"
              >
                <Link href={"/checkout"}>Complete Purchase</Link>
              </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default Cart;