import Image from "next/image";

const NewLaunched = () => {
  return (
    <div className="w-full h-fit flex flex-col my-12 rounded-[64px] bg-black relative overflow-hidden">
      <div className="absolute text-2xl top-52 -left-[72px] rounded-b-xl z-30 bg-[#232321] w-fit h-fit -rotate-90 font-semibold p-3 py-4 text-white transform">
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
        <div className="absolute bottom-16 left-16 text-white">
          <h1 className="font-display text-7xl mb-4">Lost in Time</h1>
          <p className="text-xl mb-7 opacity-90">
            A time-travel adventure across different centuries.
          </p>
          <button className="bg-[#8B0000] hover:bg-[#A00000] transition-colors text-white px-8 py-3 rounded-lg font-medium">
            ADD TO CART
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewLaunched;