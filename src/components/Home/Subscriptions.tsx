"use client";
import { SUBSCRIPTION_PLANS } from "@/constants/Items";
import { toast } from "@/hooks/use-toast";
import useCartStore from "@/lib/store/cart";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { Button } from "../ui/button";
import { ToastAction } from "../ui/toast";

const Feature = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2">
    <CheckCircle className="text-white mr-2" size={24} weight="fill" />
    <span>{text}</span>
  </div>
);

const SubscriptionCard = ({
  title,
  id,
  price,
  features,
  image,
  imagePosition,
}: {
  title: string;
  id: string;
  price: number;
  features: string[];
  image: { src: string; width: string };
  imagePosition: string;
}) => {
  const { subscriptionItems, addToCart, setCartOpen } = useCartStore();

  const isInCart = subscriptionItems.includes(id);

  const handleSelectSubscription = () => {
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

  const content = (
    <div className="flex flex-col px-3 lg:px-0 items-start justify-start gap-3">
      <h2 className="font-display text-3xl lg:text-5xl font-semibold">
        Subscribe to our {title}
      </h2>
      {features.map((feature, index) => (
        <Feature key={index} text={feature} />
      ))}
      <Button
        onClick={handleSelectSubscription}
        disabled={isInCart}
        className={`mt-8 w-fit rounded-lg px-8 py-3 font-medium text-white transition-colors ${
          isInCart 
            ? "bg-neutral-800 hover:bg-neutral-700" 
            : "bg-[#8B0000] hover:bg-[#A00000]"
        }`}
      >
        {isInCart ? "Subscription Selected" : `SUBSCRIBE For $${price.toFixed(2)}`}
      </Button>
    </div>
  );

  const imageElement = (
    <Image
      src={image.src}
      alt={`${title} Subscription`}
      width={600}
      height={600}
      className={`h-auto ${image.width}`}
    />
  );

  return (
    <>
      <div className="lg:flex hidden flex-row w-full items-center justify-center gap-12">
        {imagePosition === "left" ? (
          <>
            {imageElement}
            {content}
          </>
        ) : (
          <>
            {content}
            {imageElement}
          </>
        )}
      </div>
      <div className="flex lg:hidden flex-col lg:flex-row w-full items-center justify-center gap-12">
        <>
          {imageElement}
          {content}
        </>
      </div>
    </>
  );
};

const Subscriptions = () => {
  return (
    <section className="flex flex-col gap-16 bg-[#232321] py-20 text-white">
      {SUBSCRIPTION_PLANS.map((plan, index) => (
        <SubscriptionCard key={index} {...plan} />
      ))}
    </section>
  );
};

export default Subscriptions;