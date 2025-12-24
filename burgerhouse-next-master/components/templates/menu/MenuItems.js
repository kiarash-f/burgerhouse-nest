import MenuItem from "@/components/modules/menu/MenuItem";
import React from "react";

function MenuItems({ items }) {
  return (
    <div className="grid md:grid-cols-4 min-[592px]:max-[768px]:grid-cols-3 grid-cols-2 lg:px-20 sm:px-5 px-3  gap-x-3 gap-y-20 mt-20 ">
      {items.map((foodInfo) => (
        <MenuItem key={foodInfo.id} foodInfo={foodInfo} />
      ))}
    </div>
  );
}

export default MenuItems;
