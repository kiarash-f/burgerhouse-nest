import React from "react";
import Image from "next/image";

function FavoriteFood({ food }) {
  return (
    <div className="flex items-center justify-center md:col-span-3 col-span-6 gap-x-2 cursor-pointer transition-transform duration-300 hover:scale-[1.05]">
      <Image
        src={food.src}
        alt="FavFoods"
        width="100"
        height="100"
        quality={[75, 85]}
        className="rounded-full w-[90px] h-[90px] md:max-lg:w-20 md:max-lg:h-20 min-[500px]:max-sm:w-20 min-[500px]:max-sm:h-20  max-[500px]:w-16 max-[500px]:h-16"
        loading="lazy"
      />
      <p className="min-[430px]:max-lg:text-[13px] max-[430px]:text-[11px]">
        {food.name}
      </p>
    </div>
  );
}

export default FavoriteFood;
