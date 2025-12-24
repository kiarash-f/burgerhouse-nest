import useCart from "@/components/hooks/useCart";
import NumbersWithComma from "@/components/utils/NumbersWithComma";
import Image from "next/image";
import React, { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import { Loader } from "../Loading";
import toast from "react-hot-toast";
import { useCurrentUser } from "@/components/context/GetUserContext";
import Cookies from "js-cookie";
import useDineInCart from "@/components/hooks/useDineInCart";

function Detail({ foodInfo }) {
  const { token } = useCurrentUser();
  const sessionId = Cookies.get("dine_sessionId") || "";
  const tableId = Cookies.get("dine_tableId") || "";

  const { addToCartItem, addToCartPending } = useCart(token);
  const { addToDineInCartItem, addToDineInCartPending } =
    useDineInCart(sessionId);
  const [number, setNumber] = useState(1);

  const addToCartHandler = async () => {
    if (sessionId) {
      const newItem = {
        sessionId: sessionId,
        itemId: foodInfo?.id,
        quantity: number,
        note: "",
        tableId: Number(tableId),
      };

      await addToDineInCartItem(newItem, {
        onSuccess: () => {
          toast.success(`آیتم ${foodInfo?.name} به سبد خرید اضافه شد`);
        },
      });
      console.log("newItem => ", newItem);
    } else {
      if (!token) return toast.error("لطفا ابتدا وارد حساب شوید.");

      const newItem = {
        itemId: foodInfo?.id,
        quantity: number,
        note: "",
      };

      await addToCartItem(newItem, {
        onSuccess: () => {
          toast.success(`آیتم ${foodInfo?.name} به سبد خرید اضافه شد`);
        },
      });
    }
  };

  return (
    <div className="grid grid-cols-12 gap-3 ">
      <div className="sm:col-span-6 col-span-12 ">
        <Image
          src={foodInfo.image}
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
        <div className="leading-7">
          <p className="text-xs">مواد تشکیل دهنده :</p>
          <p className="text-[10px]">{foodInfo.desc}</p>
        </div>
        <div>
          <p className="min-[400px]:text-lg text-base flex items-center gap-x-2">
            <span className="text-lg sm:text-xl">
              {NumbersWithComma(foodInfo?.price)}
            </span>
            <span className="opacity-80 text-xs">تومان</span>
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
          <button
            className="btn text-[11px] md:text-xs"
            onClick={addToCartHandler}
          >
            {addToCartPending || addToDineInCartPending ? (
              <Loader />
            ) : (
              "افزودن به سبد خرید"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Detail;
