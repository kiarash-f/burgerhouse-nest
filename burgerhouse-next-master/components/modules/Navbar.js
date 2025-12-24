import Image from "next/image";
import Link from "next/link";
import NavLink from "../templates/NavLink";
import { HiOutlinePower, HiOutlineShoppingBag } from "react-icons/hi2";
import { useEffect, useState } from "react";
import Modal from "../templates/Modal";
import { IoFastFoodOutline, IoMenuOutline } from "react-icons/io5";
import MobileMenu from "../templates/MobileMenu";
import SearchBar from "./SearchBar";
import { BsSearch } from "react-icons/bs";
import ShoppingCart from "../templates/ShoppingCart";
import { usePathname } from "next/navigation";
import AuthContainer from "../features/auth/AuthContainer";
import { useCurrentUser } from "../context/GetUserContext";
import Logout from "../features/auth/logout/Logout";
import toast from "react-hot-toast";
import { Loader } from "./Loading";
import {
  createTheme,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  ThemeProvider,
} from "flowbite-react";
import { PiUser } from "react-icons/pi";
import { FiUsers } from "react-icons/fi";
import { BiCategoryAlt } from "react-icons/bi";
import { TfiBarChartAlt } from "react-icons/tfi";
import { GrMoney } from "react-icons/gr";
import useCart from "../hooks/useCart";

const customTheme = createTheme({
  dropdown: {
    arrowIcon: "",
    content: "w-60",
    floating: {
      style: {
        auto: "border border-platinum/50 bg-silver dark:bg-silver dark:text-night text-night dark:border-platinum/50 dark:bg-silver dark:text-night",
      },
      header:
        "flex items-center gap-x-2 px-0 w-[90%] mx-auto py-2 text-xs text-night/80 dark:text-night/80",
      divider: "bg-night/20 dark:bg-night/20",
      item: {
        icon: "ml-2 w-5 h-5",
        base: "flex w-[90%] mx-auto my-3 rounded-md cursor-pointer items-center justify-start px-0 py-3 text-sm text-inherit hover:bg-platinum/70 focus:bg-platinum/70 focus:outline-none dark:text-inherit dark:hover:bg-platinum/70 dark:hover:text-night dark:focus:bg-platinum/70 dark:focus:text-night transition-all duration-400 ease-in-out",
      },
    },
  },
  button: {
    color: {
      default:
        "cursor-pointer bg-transparent dark:bg-transparent hover:bg-saffron/30 dark:hover:bg-saffron/30 transition-colors duration-300 focus:ring-0 dark:text-inherit px-1 lg:px-3 border border-platinum/50 rounded-md hover:border-platinum/30",
    },
  },
});

const adminDashboard = [
  { id: 1, title: "پیشخوان", icon: TfiBarChartAlt, href: "/admin/dashboard" },
  {
    id: 2,
    title: "دسته بندی ها",
    icon: BiCategoryAlt,
    href: "/admin/categories",
  },
  { id: 3, title: "آیتم ها", icon: IoFastFoodOutline, href: "/admin/items" },
  { id: 4, title: "کاربران", icon: FiUsers, href: "/admin/users" },
  {
    id: 5,
    title: "جزئیات حساب",
    icon: GrMoney,
    href: "/admin/payments",
  },
];

const userDashboard = [
  { id: 1, title: "پنل کاربری", href: "/user/dashboard", icon: TfiBarChartAlt },
  {
    id: 2,
    title: "سفارش های من",
    href: "/user/orders",
    icon: IoFastFoodOutline,
  },
  {
    id: 3,
    title: "پرداخت های من",
    href: "/user/payments",
    icon: GrMoney,
  },
];

const headerList = [
  { id: 1, name: "صفحه اصلی", href: "/" },
  { id: 2, name: "منو", href: "/menu", sectionMatch: "/menu" },
  { id: 3, name: "درباره ما", href: "/about" },
  { id: 4, name: "ارتباط با ما", href: "/contact" },
];

function Navbar() {
  const pathname = usePathname();
  const { user, isLoading, isError, token, setToken, isTokenChecked } =
    useCurrentUser();
  const {
    cartItems,
    isLoading: cartItemsLoading,
    isError: cartItemsIsError,
  } = useCart();
  const { isPending, logout } = Logout(setToken);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isShoppingCartOpen, setIsShoppingCartOpen] = useState(false);
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);

  const cartCount = cartItems?.totals?.count;

  useEffect(() => {
    const handleScroll = () => {
      const shouldScroll = window.scrollY > 10;
      setIsScrolled((prev) => (prev !== shouldScroll ? shouldScroll : prev));
      /* if (pathname.startsWith("/menu")) {
        setIsScrolled(false);
      } else {
        setIsScrolled((prev) => (prev !== shouldScroll ? shouldScroll : prev));
      } */
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const logoutHandler = async () => {
    await logout();
  };

  const renderUserMenu = () => {
    if (!user) return null;

    if (user?.role === "USER") {
      return (
        <>
          {userDashboard?.map((dashboard) => (
            <DropdownItem
              key={dashboard.id}
              as={Link}
              href={dashboard.href}
              icon={dashboard.icon}
            >
              {dashboard.title}
            </DropdownItem>
          ))}
        </>
      );
    }

    return (
      <>
        {adminDashboard?.map((dashboard) => (
          <DropdownItem
            key={dashboard.id}
            as={Link}
            href={dashboard.href}
            icon={dashboard.icon}
          >
            {dashboard.title}
          </DropdownItem>
        ))}
      </>
    );
  };

  useEffect(() => {
    if (isError) {
      toast.error("اطلاعات کاربری یافت نشد");
    }
  }, [isError]);

  if (!isTokenChecked) return;

  return (
    <>
      <header
        className={`w-full bg-transparent text-white-smoke/80 transition-all duration-300 ${
          isScrolled
            ? "bg-transparent z-20 shadow-md backdrop-blur-lg fixed top-0 left-0 right-0 border-b border-platinum/45 p-2"
            : "absolute border-none p-4"
        }`}
      >
        {/*Navbar */}
        <nav className="flex items-center justify-between mx-auto max-w-screen-2xl">
          {/* Mobile Menu */}
          <div className="flex items-center md:hidden order-1 px-2">
            <button
              className="cursor-pointer"
              aria-label="منوی موبایل"
              aria-expanded={isDrawerOpen}
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            >
              <IoMenuOutline className="w-8 h-8" />
            </button>
          </div>

          {/* Logo & Header Items */}
          <div className="flex items-center gap-x-8 order-1 md:order-0 justify-center">
            <Link href="/">
              <Image
                src="/image/Logo.jpg"
                alt="Logo"
                width="60"
                height="60"
                quality={[100, 75]}
                className="rounded-full"
                loading="lazy"
              />
            </Link>

            <ul className="list-none md:flex items-center gap-x-10 hidden">
              {headerList.map((listMenu) => (
                <li key={listMenu.id} className="flex">
                  <NavLink
                    href={listMenu.href}
                    exact={listMenu.href === "/"}
                    sectionMatch={listMenu.sectionMatch}
                  >
                    {listMenu.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          {/* Sign up / Login & ShoppingCart Menu */}
          <div className="flex items-center gap-x-2 md:gap-x-4 order-2 md:order-0">
            <button
              className=" cursor-pointer"
              onClick={() => setIsSearchBarOpen(true)}
            >
              <BsSearch className="md:w-6 md:h-6 w-5 h-5" />
            </button>
            <button
              className="relative cursor-pointer"
              onClick={() => setIsShoppingCartOpen(!isShoppingCartOpen)}
            >
              {isLoading ? (
                <Loader />
              ) : (
                <>
                  <HiOutlineShoppingBag className="md:w-8 md:h-8 w-6 h-6" />

                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-saffron text-night text-[11px] w-5 h-5 flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </>
              )}
            </button>
            {!token ? (
              <button
                className="btn md:flex hidden"
                onClick={() => setIsModalOpen(!isModalOpen)}
              >
                ورود/عضویت
              </button>
            ) : isLoading ? (
              <Loader />
            ) : (
              <ThemeProvider theme={customTheme}>
                <Dropdown
                  label={<PiUser className="w-5 h-5" />}
                  placement="bottom-start"
                  size="sm"
                  dismissOnClick={true}
                >
                  <DropdownHeader>
                    <div className="flex items-center gap-x-1">
                      <span>{user?.name}</span>
                      <span>{user?.lastname}</span>
                    </div>
                  </DropdownHeader>
                  <DropdownDivider />
                  {renderUserMenu()}
                  <DropdownDivider />
                  <DropdownItem
                    icon={HiOutlinePower}
                    onClick={logoutHandler}
                    className="hover:bg-red-600! dark:hover:bg-red-800! my-1.5! hover:text-white-smoke!"
                  >
                    {isPending ? <Loader /> : "خروج"}
                  </DropdownItem>
                </Dropdown>
              </ThemeProvider>
            )}
          </div>
        </nav>
      </header>
      {/* Mobile Menu Sidebar */}
      <MobileMenu
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        setIsModalOpen={setIsModalOpen}
      />
      {/* Shopping Cart Sidebar */}
      <ShoppingCart
        isShoppingCartOpen={isShoppingCartOpen}
        setIsShoppingCartOpen={setIsShoppingCartOpen}
      />

      {/* SearchBar */}
      <SearchBar
        isSearchBarOpen={isSearchBarOpen}
        setIsSearchBarOpen={setIsSearchBarOpen}
      />

      {/* Sign up / Login Modal */}
      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)} title="ورود / عضویت">
          <AuthContainer onClose={() => setIsModalOpen(false)} />
        </Modal>
      )}
    </>
  );
}

export default Navbar;
