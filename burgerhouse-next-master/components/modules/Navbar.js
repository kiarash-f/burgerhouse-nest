import Image from "next/image";
import Link from "next/link";
import NavLink from "../templates/NavLink";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { useEffect, useState } from "react";
import Modal from "../templates/Modal";
import { IoMenuOutline } from "react-icons/io5";
import MobileMenu from "../templates/MobileMenu";
import SearchBar from "./SearchBar";
import { BsSearch } from "react-icons/bs";
import ShoppingCart from "../templates/ShoppingCart";
import { usePathname } from "next/navigation";
import AuthContainer from "../features/auth/AuthContainer";

function Navbar() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isShoppingCartOpen, setIsShoppingCartOpen] = useState(false);
  const [isSearchBarOpen, setIsSearchBarOpen] = useState(false);
  const headerList = [
    { id: 1, name: "صفحه اصلی", href: "/" },
    { id: 2, name: "منو", href: "/menu/breakfast", sectionMatch: "/menu" },
    { id: 3, name: "درباره ما", href: "/about" },
    { id: 4, name: "ارتباط با ما", href: "/contact" },
  ];

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
              className="cursor-pointer"
              onClick={() => setIsShoppingCartOpen(!isShoppingCartOpen)}
            >
              <HiOutlineShoppingBag className="md:w-8 md:h-8 w-6 h-6" />
            </button>
            <button
              className="btn md:flex hidden"
              onClick={() => setIsModalOpen(!isModalOpen)}
            >
              ورود/عضویت
            </button>
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
