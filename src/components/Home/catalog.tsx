"use client";
import { useEffect } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import useCartStore from "@/lib/store/cart";
import { ITEMS_LIST } from "@/constants/Items";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "../ui/toast";

interface ItemProps {
  id: string;
  imageSrc: string;
  altText: string;
  title: string;
  discount?: string;
  price: string;
}

const Item: React.FC<ItemProps> = ({
  id,
  imageSrc,
  altText,
  title,
  price,
  discount,
}) => {
  const { cartItems, addToCart, initializeCart, setCartOpen } = useCartStore();

  useEffect(() => {
    const storedItems = localStorage.getItem("cartItems");
    if (storedItems) {
      initializeCart(JSON.parse(storedItems));
    }
  }, [initializeCart]);

  const isInCart = cartItems.includes(id);

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
      {discount ? (
        <div className="flex items-center gap-2">
          <div className="text-[#232321] pl-1 opacity-50 font-semibold line-through">
            {price}
          </div>
          <div className="text-[#870A0A] pl-1 font-semibold ">{discount}</div>
        </div>
      ) : (
        <div className="text-[#232321] pl-1 font-semibold">{price}</div>
      )}
      <Button
        onClick={handleAddItem}
        disabled={isInCart}
        className={`py-2 ${isInCart ? "bg-neutral-800" : ""}`}
      >
        {isInCart ? "Added to Cart" : "Add to Cart"}
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
          <Item key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
};

export default Catalog;
