import { SUBSCRIPTION_PLANS } from "@/constants/Items";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";



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
  const content = (
    <div className="flex flex-col px-3 lg:px-0 items-start justify-start gap-3">
      <h2 className="font-display text-3xl lg:text-5xl font-semibold">
        Subscribe to our {title}
      </h2>
      {features.map((feature, index) => (
        <Feature key={index} text={feature} />
      ))}
      <Link
        href={`/checkout/subscription/${id}`}
        className="mt-8 w-fit rounded-lg bg-[#8B0000] px-8 py-3 font-medium text-white transition-colors hover:bg-[#A00000]"
      >
        SUBSCRIBE For ${price.toFixed(2)}
      </Link>
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
