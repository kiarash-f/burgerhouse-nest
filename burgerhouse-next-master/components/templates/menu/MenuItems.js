import MenuItem from "@/components/modules/menu/MenuItem";
import React from "react";

function MenuItems() {
  const MenuFoods = [
    {
      id: 1,
      src: "/image/chicken.webp",
      name: "مرغ سوخاری",
      price: 50000,
      ingredients: "مرغ، پیاز، گوجه فرنگی، سیر، رب زنجبیل، روغن نباتی",
    },
    {
      id: 2,
      src: "/image/chicken.webp",
      name: "مرغ سوخاری",
      price: 50000,
      ingredients: "مرغ، پیاز، گوجه فرنگی، سیر، رب زنجبیل، روغن نباتی",
    },
    {
      id: 3,
      src: "/image/chicken.webp",
      name: "مرغ سوخاری",
      price: 50000,
      ingredients: "مرغ، پیاز، گوجه فرنگی، سیر، رب زنجبیل، روغن نباتی",
    },
    {
      id: 4,
      src: "/image/chicken.webp",
      name: "مرغ سوخاری",
      price: 50000,
      ingredients: "مرغ، پیاز، گوجه فرنگی، سیر، رب زنجبیل، روغن نباتی",
    },
    {
      id: 5,
      src: "/image/chicken.webp",
      name: "مرغ سوخاری",
      price: 50000,
      ingredients: "مرغ، پیاز، گوجه فرنگی، سیر، رب زنجبیل، روغن نباتی",
    },
    {
      id: 6,
      src: "/image/chicken.webp",
      name: "مرغ سوخاری",
      price: 50000,
      ingredients: "مرغ، پیاز، گوجه فرنگی، سیر، رب زنجبیل، روغن نباتی",
    },
    {
      id: 7,
      src: "/image/chicken.webp",
      name: "مرغ سوخاری",
      price: 50000,
      ingredients: "مرغ، پیاز، گوجه فرنگی، سیر، رب زنجبیل، روغن نباتی",
    },
    {
      id: 8,
      src: "/image/chicken.webp",
      name: "مرغ سوخاری",
      price: 50000,
      ingredients: "مرغ، پیاز، گوجه فرنگی، سیر، رب زنجبیل، روغن نباتی",
    },
  ];
  return (
    <div className="grid min-[1200px]:grid-cols-6 min-[992px]:max-[1200px]:grid-cols-5 min-[768px]:max-[992px]:grid-cols-4 min-[592px]:max-[768px]:grid-cols-3 grid-cols-2 md:px-8 px-5 gap-x-3 gap-y-20 mt-20 ">
      {MenuFoods.map((foodInfo) => (
        <MenuItem key={foodInfo.id} foodInfo={foodInfo} />
      ))}
    </div>
  );
}

export default MenuItems;
