
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";

const SUBSCRIPTION_PLANS = [
  {
    title: "Monthly plan",
    price: 15.00,
    image: {
      src: "/books/stack/Monthly.webp",
      width: "w-[35vw]"
    },
    features: [
      "Get 2 books every month",
      "Early access to new releases",
      "Weekly newsletter",
      "Monthly webinar invite"
    ],
    imagePosition: "right"
  },
  {
    title: "Yearly plan",
    price: 100.00,
    image: {
      src: "/books/stack/Yearly.webp",
      width: "w-[45vw]"
    },
    features: [
      "Get 20 books every Year",
      "Early access to new releases",
      "Weekly newsletter",
      "Monthly webinar invite",
      "Dinner with author"
    ],
    imagePosition: "left"
  }
];

const Feature = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2">
   <CheckCircle className="text-white mr-2" size={24} weight="fill" />
    <span>{text}</span>
  </div>
);

const SubscriptionCard = ({
  title,
  price,
  features,
  image,
  imagePosition
}: {
  title: string;
  price: number;
  features: string[];
  image: { src: string; width: string };
  imagePosition: string;
}) => {
  const content = (
    <div className="flex flex-col items-start justify-center gap-3">
      <h2 className="font-display text-5xl font-semibold">
        Subscribe to our {title}
      </h2>
      {features.map((feature, index) => (
        <Feature key={index} text={feature} />
      ))}
      <button className="mt-8 w-fit rounded-lg bg-[#8B0000] px-8 py-3 font-medium text-white transition-colors hover:bg-[#A00000]">
        SUBSCRIBE For ${price.toFixed(2)}
      </button>
    </div>
  );

  const imageElement = (
    <Image
      src={image.src}
      alt={`${title} Subscription`}
      width={1920}
      height={1080}
      className={`h-auto ${image.width}`}
    />
  );

  return (
    <div className="flex w-full items-center justify-center gap-12">
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