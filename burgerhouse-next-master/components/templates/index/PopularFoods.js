import React from "react";
import FavoriteFood from "../../modules/FavoriteFood";

function PopularFoods() {
  const popularFood = [
    { id: 1, src: "/image/chicken.webp", name: "مرغ سوخاری" },
    { id: 2, src: "/image/chicken.webp", name: "مرغ سوخاری" },
    { id: 3, src: "/image/chicken.webp", name: "مرغ سوخاری" },
    { id: 4, src: "/image/chicken.webp", name: "مرغ سوخاری" },
  ];
  return (
    <div className="grid grid-cols-12  gap-y-10 justify-around  bg-[#ffffff1a] backdrop-blur-[2px] rounded-t-[50px] px-2 py-6 mt-20">
      {popularFood.map((food) => (
        <FavoriteFood key={food.id} food={food} />
      ))}
    </div>
  );
}

export default PopularFoods;
