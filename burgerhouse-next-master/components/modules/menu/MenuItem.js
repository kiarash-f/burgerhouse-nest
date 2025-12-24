import Modal from "@/components/templates/Modal";
import NumbersWithComma from "@/components/utils/NumbersWithComma";
import Image from "next/image";
import { useState } from "react";
import { FaShoppingBag } from "react-icons/fa";
import Detail from "./Detail";

function MenuItem({ foodInfo }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        className="flex flex-col rounded-lg bg-platinum/20 cursor-pointer group "
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center justify-center p-3">
          <Image
            src={foodInfo.image}
            alt="FoodInfo"
            width={160}
            height={160}
            quality={85}
            className="w-32 h-32 min-[400px]:w-40 min-[400px]:h-40 rounded-full 
             relative bottom-10 transition-all duration-300 
             shadow-[0_0_8px_black] group-hover:scale-[1.05]"
            loading="lazy"
          />
        </div>
        <div className="bg-night/80 rounded-md p-1 grow">
          <div className="p-2 flex flex-col gap-y-3.5">
            <p className="font-bold text-sm sm:text-lg line-clamp-2 py-1">
              {foodInfo.name}
            </p>
            <p className="text-xs py-1 opacity-80 line-clamp-1">
              {foodInfo.desc}
            </p>
          </div>
          <div className="flex justify-between items-center mt-4 p-2">
            <p className="min-[400px]:text-lg text-base flex items-center gap-x-2">
              <span className="text-lg sm:text-xl">
                {NumbersWithComma(foodInfo?.price)}
              </span>
              <span className="opacity-80 text-xs">تومان</span>
            </p>
            <FaShoppingBag id={foodInfo.id} />
          </div>
        </div>
      </div>
      {/* Detail oF fOOD Modal */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)} size={true}>
          <Detail foodInfo={foodInfo} />
        </Modal>
      )}
    </>
  );
}

export default MenuItem;
