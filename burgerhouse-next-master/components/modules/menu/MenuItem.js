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
        className="flex flex-col rounded-lg bg-platinum/20 p-3 cursor-pointer group"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center justify-center">
          <Image
            src={foodInfo.src}
            alt="FoodInfo"
            width="130"
            height="130"
            quality={[100, 75]}
            className="min-[400px]:w-32 min-[400px]:h-32 w-25 h-25 rounded-full relative bottom-10  transition-all duration-300 shadow-[0_0_8px_black] group-hover:scale-[1.05]"
            loading="lazy"
          />
        </div>
        <p className="mt-auto">{foodInfo.name}</p>
        <div className="flex justify-between items-center mt-4 ">
          <p className="min-[400px]:text-lg text-base flex items-center gap-x-2">
            <span className="text-xl">{NumbersWithComma(foodInfo?.price)}</span>
            <span className="opacity-80 text-xs">تومان</span>
          </p>
          <FaShoppingBag id={foodInfo.id} />
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
