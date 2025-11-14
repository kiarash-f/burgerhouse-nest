import Categories from "@/components/templates/menu/Categories";
import { LuEggFried, LuSalad } from "react-icons/lu";
import { PiCoffeeLight, PiHamburgerLight, PiPizzaLight } from "react-icons/pi";
import { GiChickenLeg, GiFrenchFries, GiSandwich } from "react-icons/gi";
import MenuItems from "@/components/templates/menu/MenuItems";
import { FaPlateWheat } from "react-icons/fa6";

function MenuCategoryItems() {
  const categories = [
    {
      id: 1,
      title: "صبحانه",
      slug: "breakfast",
      icon: <LuEggFried className="w-12 h-12" />,
    },
    {
      id: 2,
      title: "قهوه",
      slug: "coffee",
      icon: <PiCoffeeLight className="w-12 h-12" />,
    },
    {
      id: 3,
      title: "پیتزا",
      slug: "pizza",
      icon: <PiPizzaLight className="w-12 h-12" />,
    },
    {
      id: 4,
      title: "سوخاری",
      slug: "fried-chicken",
      icon: <GiChickenLeg className="w-12 h-12" />,
    },
    {
      id: 5,
      title: "برگر",
      slug: "burger",
      icon: <PiHamburgerLight className="w-12 h-12" />,
    },
    {
      id: 6,
      title: "ساندویچ",
      slug: "sandwich",
      icon: <GiSandwich className="w-12 h-12" />,
    },
    {
      id: 7,
      title: "سالاد",
      slug: "salad",
      icon: <LuSalad className="w-12 h-12" />,
    },
    {
      id: 8,
      title: "پیش غذا",
      slug: "appetizer",
      icon: <GiFrenchFries className="w-12 h-12" />,
    },
    {
      id: 9,
      title: "بشقاب ها",
      slug: "plates",
      icon: <FaPlateWheat className="w-12 h-12" />,
    },
    {
      id: 10,
      title: "بشقاب ها",
      slug: "plain",
      icon: <FaPlateWheat className="w-12 h-12" />,
    },
    {
      id: 11,
      title: "بشقاب ها",
      slug: "plain",
      icon: <FaPlateWheat className="w-12 h-12" />,
    },
    {
      id: 12,
      title: "بشقاب ها",
      slug: "plain",
      icon: <FaPlateWheat className="w-12 h-12" />,
    },
    {
      id: 13,
      title: "بشقاب ها",
      slug: "plain",
      icon: <FaPlateWheat className="w-12 h-12" />,
    },
    {
      id: 14,
      title: "بشقاب ها",
      slug: "plain",
      icon: <FaPlateWheat className="w-12 h-12" />,
    },
    {
      id: 15,
      title: "بشقاب ها",
      slug: "plain",
      icon: <FaPlateWheat className="w-12 h-12" />,
    },
    /* {
      id: 10,
      title: "بشقاب",
      slug: "plain",
      icon: <GiSandwich className="w-12 h-12" />,
    }, */
  ];

  return (
    <div
      className="bg-cover bg-center bg-[#505050e6] bg-blend-multiply pt-20 min-h-screen py-6"
      style={{
        backgroundImage: "url(/image/deliciousMeal.jpg)",
      }}
    >
      <Categories categories={categories} />
      <MenuItems />
    </div>
  );
}

export default MenuCategoryItems;
