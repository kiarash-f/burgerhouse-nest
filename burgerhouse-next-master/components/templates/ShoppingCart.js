import {
  createTheme,
  Drawer,
  DrawerHeader,
  DrawerItems,
  ThemeProvider,
} from "flowbite-react";

import useOutsideClick from "../hooks/useOutsideClick";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import useCart from "../hooks/useCart";
import Image from "next/image";
import { FaMinus, FaPlus } from "react-icons/fa";
import NumbersWithComma from "../utils/NumbersWithComma";
import { PiTrash } from "react-icons/pi";
import { Loader } from "../modules/Loading";
import toast from "react-hot-toast";
import { GrMoney } from "react-icons/gr";
import { useCurrentUser } from "../context/GetUserContext";
import useDineInCart from "../hooks/useDineInCart";
import Cookies from "js-cookie";

const customTheme = createTheme({
  drawer: {
    root: {
      base: "bg-neutral-900 dark:bg-neutral-900 transition-all duration-600",
      backdrop: "bg-neutral-900/50 dark:bg-neutral-900/50",
      position: {
        left: {
          on: "min-[300px]:max-sm:w-72 sm:max-md:w-76 md:w-80 border-r border-r-platinum/40 dark:border-platinum/40",
        },
      },
    },
    header: {
      inner: {
        closeButton:
          "text-white-smoke/50 hover:bg-white-smoke/40 dark:text-white-smoke/50 dark:hover:bg-white-smoke/40 cursor-pointer transition-colors duration-300",
        titleText:
          "text-sm font-medium text-white-smoke/50 dark:text-white-smoke/50",
        titleIcon: "h-5 w-5",
      },
    },
  },
});

function ShoppingCart({ isShoppingCartOpen, setIsShoppingCartOpen }) {
  const { token } = useCurrentUser();
  const sessionId = Cookies.get("dine_sessionId") || "";
  const tableId = Cookies.get("dine_tableId") || "";

  const isDineIn = Boolean(sessionId);

  // Normal cart
  const {
    cartItems,
    isLoading,
    isError,
    deleteCartItem,
    deleteCartItemPending,
    deleteCartItems,
    deleteCartItemsPending,
    editCartItem,
    editCartItemPending,
  } = useCart(!isDineIn ? token : null);

  // Dine-in cart
  const {
    dineInCartItems,
    isLoading: dineInLoading,
    isError: dineInIsError,
    deleteDineInCartItem,
    deleteDineInCartItemPending,
    deleteDineInCartItems,
    deleteDineInCartItemsPending,
    editDineInCartItem,
    editDineInCartItemPending,
  } = useDineInCart(sessionId);

  console.log("dineInItems =>", dineInCartItems);
  console.log("cartItems =>", cartItems);

  // Dynamic cart selection
  const activeItems = isDineIn ? dineInCartItems?.items : cartItems?.items;
  const activeTotals = isDineIn ? dineInCartItems?.totals : cartItems?.totals;

  const activeLoading = isDineIn ? dineInLoading : isLoading;
  const activeError = isDineIn ? dineInIsError : isError;

  const deleteItem = isDineIn ? deleteDineInCartItem : deleteCartItem;
  const deleteItemsFn = isDineIn ? deleteDineInCartItems : deleteCartItems;

  const editItem = isDineIn ? editDineInCartItem : editCartItem;

  const deletePending = isDineIn
    ? deleteDineInCartItemPending
    : deleteCartItemPending;

  const deleteAllPending = isDineIn
    ? deleteDineInCartItemsPending
    : deleteCartItemsPending;

  const editPending = isDineIn
    ? editDineInCartItemPending
    : editCartItemPending;

  // Close on outside click
  const shoppingMenuRef = useOutsideClick(() => {
    if (isShoppingCartOpen) setIsShoppingCartOpen(false);
  });

  // HANDLERS
  const decreaseQtyHandler = async (item) => {
    if (item.quantity <= 1)
      return toast.error("مقدار نمی تواند کمتر از یک باشد.");

    const newItem = { quantity: item.quantity - 1, note: "" };

    if (isDineIn) {
      await editItem({
        itemId: item.id,
        sessionId,
        tableId: Number(tableId),
        newItem,
      });
    } else {
      await editItem({ itemId: item.id, newItem });
    }
  };

  const increaseQtyHandler = async (item) => {
    const newItem = { quantity: item.quantity + 1, note: "" };

    if (isDineIn) {
      await editItem({
        itemId: item.id,
        sessionId,
        tableId: Number(tableId),
        newItem,
      });
    } else {
      await editItem({ itemId: item.id, newItem });
    }
  };

  const deleteItemHandler = async (item) => {
    await deleteItem(item?.id, {
      onSuccess: () => toast.success(`${item?.item?.name} با موفقیت حذف شد`),
    });
  };

  const deleteItemsHandler = async () => {
    await deleteItemsFn({
      onSuccess: () => toast.success("سبد خرید با موفقیت خالی شد"),
    });
  };

  // ERROR
  if (activeError)
    return toast.error(
      "مشکلی در سبد خرید وجود دارد، لطفا اینترنت خود را چک کنید"
    );

  return (
    <ThemeProvider theme={customTheme}>
      <Drawer
        open={isShoppingCartOpen}
        onClose={() => setIsShoppingCartOpen(false)}
        position="left"
        ref={shoppingMenuRef}
      >
        <DrawerHeader
          title={isDineIn ? `میز شماره ${tableId}` : "سبد خرید"}
          titleIcon={HiOutlineShoppingBag}
        />

        {/* ITEMS LIST */}
        <DrawerItems>
          {!token && !isDineIn ? (
            <div className="items-center justify-center text-sm mt-4 flex gap-x-1">
              <p>سبد خرید شما خالیست</p>
              <span className="text-lg">😒</span>
            </div>
          ) : activeLoading ? (
            <Loader />
          ) : !activeItems || activeItems.length === 0 ? (
            <div className="items-center justify-center text-sm mt-4 flex gap-x-1">
              <p>سبد خرید شما خالیست</p>
              <span className="text-lg">😒</span>
            </div>
          ) : (
            <ul className="border border-silver/50 rounded-md">
              {activeItems.map((cartItem) => (
                <li
                  key={cartItem.id}
                  className="flex px-2 py-4.5 border-b border-silver/50 last:border-none text-xs justify-between bg-silver/10 text-white-smoke/85 hover:bg-silver/20 transition-colors duration-300"
                >
                  <div className="flex gap-x-3">
                    <Image
                      src={cartItem.item.image}
                      alt={cartItem.item.name}
                      width={200}
                      height={200}
                      className="w-15 h-16 rounded-md object-cover"
                    />

                    <div className="flex flex-col justify-between">
                      <p>{cartItem.item.name}</p>
                      <span className="text-sm flex items-center gap-x-1.5">
                        <span>
                          {editPending ? (
                            <Loader />
                          ) : (
                            NumbersWithComma(
                              cartItem.item.price * cartItem.quantity
                            )
                          )}
                        </span>
                        <span className="text-[10px] opacity-65">تومان</span>
                      </span>
                    </div>
                  </div>

                  {/* Quantity + Delete */}
                  <div className="flex flex-col justify-between items-end">
                    <div className="flex items-center gap-2 border rounded-md py-1 px-2.5 w-20 ">
                      <FaMinus
                        className="cursor-pointer w-3 h-3"
                        onClick={() => decreaseQtyHandler(cartItem)}
                      />
                      <span className="w-5 text-center">
                        {cartItem.quantity}
                      </span>
                      <FaPlus
                        className="cursor-pointer w-3 h-3"
                        onClick={() => increaseQtyHandler(cartItem)}
                      />
                    </div>

                    <button
                      className="flex items-center justify-between text-[11px] border py-1 px-1 rounded-md w-20 text-red-500 cursor-pointer border-white-smoke/75 hover:text-red-600 transition-colors duration-300"
                      onClick={() => deleteItemHandler(cartItem)}
                      disabled={deletePending}
                    >
                      <span>{deletePending ? <Loader /> : "حذف"}</span>
                      <PiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DrawerItems>

        {/* TOTAL + ACTIONS */}
        <div
          className={`flex flex-col gap-y-5 mt-5 ${
            !activeItems || activeItems.length === 0 ? "invisible" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs">قابل پرداخت :</p>
            <p className="flex items-center gap-x-1.5">
              <span>
                {activeLoading ? (
                  <Loader />
                ) : (
                  NumbersWithComma(activeTotals?.amount || 0)
                )}
              </span>
              <span className="opacity-65 text-[10px]">تومان</span>
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              className="flex items-center justify-between w-28 p-2 rounded-md btn"
              onClick={deleteItemsHandler}
              disabled={deleteAllPending}
            >
              <span>{deleteAllPending ? <Loader /> : "حذف"}</span>
              <PiTrash className="w-5 h-5" />
            </button>

            <button className="flex items-center justify-between w-28 p-2 rounded-md btn">
              <span>پرداخت</span>
              <GrMoney className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Drawer>
    </ThemeProvider>
  );
}

export default ShoppingCart;
