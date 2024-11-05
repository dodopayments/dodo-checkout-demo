import Image from "next/image";
import { Button } from "../ui/button";

interface ItemProps {
  imageSrc: string;
  altText: string;
  title: string;
  discount?: string;
  price: string;
}

const Item: React.FC<ItemProps> = ({
  imageSrc,
  altText,
  title,
  price,
  discount,
}) => {
  return (
    <div className="w-fit h-fit gap-1 flex flex-col">
      <div className="relative w-[28vw] h-96">
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

      <Button>Add to Cart</Button>
    </div>
  );
};
const ITEMS_LIST = [
  {
    imageSrc: "/books/lost-in-time.webp",
    altText: "Item 1",
    title: "Item 1 Title",
    price: "$10.00",
  },
  {
    imageSrc: "/books/memoirs-of-a-wanderer.webp",
    altText: "Item 2",
    title: "Item 2 Title",
    price: "$20.00",
  },
  {
    imageSrc: "/books/himalyan-escape.webp",
    altText: "Item 3",
    title: "Item 3 Title",
    discount: "$20.00",
    price: "$30.00",
  },
  {
    imageSrc: "/books/echoes-of-past.webp",
    altText: "Item 4",
    title: "Item 4 Title",
    price: "$40.00",
  },
  {
    imageSrc: "/books/darkend-path.webp",
    altText: "Item 4",
    title: "Item 4 Title",
    price: "$40.00",
  },
  {
    imageSrc: "/books/whisper-of-wind.webp",
    altText: "Item 4",
    title: "Item 4 Title",
    price: "$40.00",
  },
];
const Catalog = () => {
  return (
    <div className="flex flex-col mb-16">
      <div className="text-center mb-4  text-[#232321] text-[70px] font-semibold uppercase">
        Don’t miss out{" "}
        <span className="text-[#870A0A] font-display text-[70px] capitalize">
          New Launches
        </span>
      </div>
      <div className="w-full flex gap-12 justify-between flex-wrap">
        {ITEMS_LIST.map((item, index) => (
          <Item key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

export default Catalog;
