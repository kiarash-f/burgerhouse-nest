import {
  createTheme,
  Drawer,
  DrawerHeader,
  DrawerItems,
  ThemeProvider,
} from "flowbite-react";
import useOutsideClick from "../hooks/useOutsideClick";
import { HiOutlineShoppingBag } from "react-icons/hi2";

const customTheme = createTheme({
  drawer: {
    root: {
      base: "bg-neutral-900 transition-all duration-600",
      backdrop: "bg-neutral-900/50",
      position: {
        left: {
          on: "min-[300px]:max-sm:w-72 sm:max-md:w-76 md:w-80 border-r border-r-platinum/40",
        },
      },
    },
    header: {
      inner: {
        closeButton:
          "text-white-smoke/50 hover:bg-white-smoke/40 cursor-pointer transition-colors duration-300",
        titleText: "text-sm font-medium text-white-smoke/50",
        titleIcon: "h-5 w-5",
      },
    },
  },
});
function ShoppingCart({ isShoppingCartOpen, setIsShoppingCartOpen }) {
  const shoppingMenuRef = useOutsideClick(() => {
    if (isShoppingCartOpen) setIsShoppingCartOpen(false);
  });

  return (
    <ThemeProvider theme={customTheme}>
      <Drawer
        open={isShoppingCartOpen}
        onClose={() => setIsShoppingCartOpen(false)}
        position="left"
        ref={shoppingMenuRef}
      >
        <DrawerHeader title="سبد خرید" titleIcon={HiOutlineShoppingBag} />

        <DrawerItems>
          <p className="text-center text-sm">سبد خرید شما خالیست :(</p>
        </DrawerItems>
      </Drawer>
    </ThemeProvider>
  );
}

export default ShoppingCart;
