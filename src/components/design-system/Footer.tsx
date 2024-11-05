import Link from "next/link";

const Footer = () => {
  return (
    <footer className=" py-10 px-10 w-full ">
      <div className="bg-[#232321] w-full flex items-center justify-between p-6 rounded-[18px] text-white">
        <Link href="/">
        <span className="font-display text-2xl">Atlas Ebook Co</span>
        </Link>
        <span className="font-light text-base ">© 2024 Dodo Payments, Inc. All rights reserved</span>
      </div>
    </footer>
  );
};

export default Footer;
