import NumbersWithComma from "@/components/utils/NumbersWithComma";
import Image from "next/image";
import React, { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";

function Detail({ foodInfo }) {
  const [number, setNumber] = useState(1);
  return (
    <div className="grid grid-cols-12 gap-3 ">
      <div className="sm:col-span-6 col-span-12 ">
        <Image
          src={foodInfo.src}
          alt="FoodInfo"
          width="300"
          height="300"
          quality={100}
          className="sm:w-full sm:h-full max-[500px]:w-60 max-[500px]:h-52 object-cover rounded-lg"
          loading="lazy"
        />
      </div>
      <div className="sm:col-span-6 col-span-12 flex flex-col justify-between max-sm:gap-y-5">
        <p>{foodInfo.name}</p>
        <div className="space-y-0.5">
          <p className="text-xs">مواد تشکیل دهنده :</p>
          <p className="text-[10px]">{foodInfo.ingredients}</p>
        </div>
        <div>
          <p>
            <span className="">{NumbersWithComma(foodInfo.price)}</span>
            <span className="">تومان</span>
          </p>
        </div>
        <div className="flex justify-between items-center  ">
          <div className="flex items-center gap-2 border rounded-md py-0.5 px-2.5">
            <FaMinus
              className="cursor-pointer w-3 h-3"
              onClick={() => setNumber(number > 1 ? number - 1 : number)}
            />
            <span className=" w-5 text-center ">{number}</span>
            <FaPlus
              className="cursor-pointer w-3 h-3"
              onClick={() => setNumber(number + 1)}
            />
          </div>
          <button className="btn text-[11px] md:text-xs">
            افزودن به سبد خرید
          </button>
        </div>
      </div>
    </div>
  );
}

export default Detail;
