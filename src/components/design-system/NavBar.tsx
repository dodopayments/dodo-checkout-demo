import { User } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Cart } from "./Cart";

const NavBar = () => {
  return (
    <div className="px-10">
      <nav className="bg-white w-full mt-10 rounded-[20px] p-6 flex items-center justify-between">
        <Link href="/">
          <header className="flex items-center gap-2">
            <Image
              src="/icons/GlobeStand.svg"
              alt="Demo Product Logo"
              width={32}
              height={32}
            />
            <h1 className="text-[#232321] font-display  text-3xl">
              Atlas Ebook Co
            </h1>
          </header>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/my-account">
            <User size={24} weight="fill" />
          </Link>
          <Cart />
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
