"use client";
import useCartStore from "@/lib/store/cart";
import Image from "next/image";
import { Button } from "../ui/button";
import { ITEMS_LIST } from "../../constants/Items";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "../ui/toast";

const NewLaunched = () => {
  const items = ITEMS_LIST;
  const id = items[0].id;
  const { addToCart, oneTimeItems, subscriptionItems, setCartOpen } = useCartStore();
  const isInCart = oneTimeItems.includes(id) || subscriptionItems.includes(id);

  const handleAddItem = () => {
    addToCart(id);
    toast({
      title: "Item Added",
      description: "You can view your cart to complete the purchase.",
      action: (
        <ToastAction onClick={() => setCartOpen(true)} altText="Go to cart">
          Go to cart
        </ToastAction>
      ),
    });
  };

  return (
    <div className="w-full h-fit flex flex-col my-5 lg:my-12 rounded-3xl lg:rounded-[64px] bg-black relative overflow-hidden">
      <div className="absolute text-sm lg:text-2xl top-10 lg:top-52 -left-[52px] lg:-left-[72px] rounded-b-xl z-30 bg-[#232321] w-fit h-fit -rotate-90 font-semibold p-3 py-4 text-white transform">
        Newly launched
      </div>
      <div className="relative">
        <Image
          alt="Lost in Time Book"
          height={700}
          width={1320}
          src="/books/lost-in-time.webp"
          className="object-cover rounded-[64px] w-full h-full brightness-90"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-90" />

        {/* Content */}
        <div className="absolute bottom-2 left-3 lg:bottom-16 lg:left-16 text-white">
          <h1 className="font-display text-3xl lg:text-7xl mb-1 lg:mb-4">
            Lost in Time
          </h1>
          <p className="text-base mb-2 lg:mb-7 opacity-90">
            A time-travel adventure across different centuries.
          </p>

          <Button
            onClick={handleAddItem}
            disabled={isInCart}
            className={`py-2  bg-[#8B0000] hover:bg-[#A00000] ${
              isInCart ? "bg-red-400" : ""
            }`}
          >
            {isInCart ? "Added to Cart" : "Add to Cart"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewLaunched;