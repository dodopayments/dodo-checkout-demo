import { User } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { auth } from "@/auth";
import Cart from "./Cart";

const NavBar = async () => {
  const session = await auth();
  return (
    <div className="px-3 lg:px-10">
      <nav className="bg-white w-full mt-5 lg:mt-10 rounded-[20px] p-3 lg:p-6 flex items-center justify-between">
        <Link href="/">
          <header className="flex items-center gap-2">
            <Image
              src="/icons/GlobeStand.svg"
              alt="Demo Product Logo"
              width={32}
              height={32}
            />
            <h1 className="text-[#232321] font-display text-2xl lg:text-3xl">
              Atlas Ebook Co
            </h1>
          </header>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/my-account" className="flex items-center gap-1">
            <User size={24} weight="fill" />
            <span className="font-medium text-base">
              {session?.user?.name && session?.user?.name.split(" ")[0]}
            </span>
          </Link>
          <Cart />
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
