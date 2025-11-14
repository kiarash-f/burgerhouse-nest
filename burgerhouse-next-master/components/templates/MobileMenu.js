import {
  createTheme,
  Drawer,
  DrawerHeader,
  DrawerItems,
  Sidebar,
  SidebarItemGroup,
  SidebarItems,
  ThemeProvider,
} from "flowbite-react";
import { useEffect } from "react";
import NavLink from "./NavLink";
import useOutsideClick from "../hooks/useOutsideClick";
import {
  IoHomeOutline,
  IoRestaurantOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { HiOutlineUsers } from "react-icons/hi";

const customTheme = createTheme({
  drawer: {
    root: {
      base: "bg-neutral-900 transition-all duration-600",
      backdrop: "bg-neutral-900/50",
      position: {
        right: {
          on: "min-[300px]:max-sm:w-72 sm:max-md:w-76 md:w-80 border-l border-platinum/40",
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
  sidebar: {
    root: {
      collapsed: {
        off: "w-full",
      },
      inner:
        "h-full overflow-y-auto overflow-x-hidden rounded-lg bg-platinum/10 px-3 py-4 mt-6 w-full",
    },
  },
});
function MobileMenu({ isDrawerOpen, setIsDrawerOpen, setIsModalOpen }) {
  const headerList = [
    {
      id: 1,
      name: "صفحه اصلی",
      href: "/",
      icon: <IoHomeOutline className="w-5 h-5" />,
    },
    {
      id: 2,
      name: "منو",
      href: "/menu/breakfast",
      icon: <IoRestaurantOutline className="w-5 h-5" />,
      sectionMatch: "/menu",
    },
    {
      id: 3,
      name: "درباره ما",
      href: "/about",
      icon: <HiOutlineUsers className="w-5 h-5" />,
    },
    {
      id: 4,
      name: "ارتباط با ما",
      href: "/contact",
      icon: <IoTimeOutline className="w-5 h-5" />,
    },
  ];
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsDrawerOpen]);

  const sidebarRef = useOutsideClick(() => {
    if (isDrawerOpen && window.innerWidth < 1024) {
      setIsDrawerOpen(false);
    }
  });
  return (
    <ThemeProvider theme={customTheme}>
      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        position="right"
        ref={sidebarRef}
      >
        <DrawerHeader title="خانه برگر" />
        {/* {!token ? (
          <button
            className="w-full cursor-pointer text-xs py-4 rounded-lg bg-almond-cookie dark:bg-dark-cerulean mt-2 hover:bg-golden-sand dark:hover:bg-purple-plumeria transition-colors duration-300"
            onClick={() => setIsModalOpen(true)}
          >
            ورود یا ثبت نام
          </button>
        ) : (
          <Link
            onClick={() => setIsDrawerOpen(false)}
            to={user?.role === "student" ? "/student" : "/admin"}
            className="w-full cursor-pointer text-xs py-4 rounded-lg bg-almond-cookie dark:bg-dark-cerulean mt-2 hover:bg-golden-sand dark:hover:bg-purple-plumeria transition-colors duration-300 flex items-center justify-center"
          >
            {isLoading ? (
              <Loader />
            ) : user?.role === "student" ? (
              "پنل کاربری"
            ) : (
              "پیشخوان"
            )}
          </Link>
        )} */}
        <button
          className="w-full cursor-pointer text-sm py-4 rounded-md btn mt-2 text-white-smoke/80 transition-colors duration-300"
          onClick={() => setIsModalOpen(true)}
        >
          ورود / عضویت
        </button>

        <DrawerItems>
          <Sidebar aria-label="منوی کناری">
            <SidebarItems>
              <SidebarItemGroup>
                {/* <li className="text-sm rounded-lg transition-colors duration-300 py-1">
                  <CustomNavlink onClose={() => setIsDrawerOpen(false)} to="/">
                    <IoHomeOutline className="w-5 h-5 dark:text-gray-400 text-gray-700" />
                    <span>صفحه اصلی</span>
                  </CustomNavlink>
                </li>
                <li className="text-sm rounded-lg transition-colors duration-300 py-1">
                  <CustomNavlink onClose={() => setIsDrawerOpen(false)} to="/courses">
                    <PiGraduationCapLight className="w-5 h-5 dark:text-gray-400 text-gray-700" />
                    <span>همه دوره‌ها</span>
                  </CustomNavlink>
                </li>
                <li className="text-sm rounded-lg transition-colors duration-300 py-1">
                  <CustomNavlink
                    onClose={() => setIsDrawerOpen(false)}
                    to="/student-works"
                  >
                    <GiAbstract024 className="w-5 h-5 dark:text-gray-400 text-gray-700" />
                    <span>آثار هنرجویان</span>
                  </CustomNavlink>
                </li>
                <li className="text-sm rounded-lg transition-colors duration-300 py-1">
                  <CustomNavlink onClose={() => setIsDrawerOpen(false)} to="/news">
                    <BsPen className="w-5 h-5 dark:text-gray-400 text-gray-700" />
                    <span>اخبار و رویدادها</span>
                  </CustomNavlink>
                </li>
                <li className="text-sm rounded-lg transition-colors duration-300 py-1">
                  <CustomNavlink onClose={() => setIsDrawerOpen(false)} to="/about">
                    <HiOutlineUsers className="w-5 h-5 dark:text-gray-400 text-gray-700" />
                    <span>درباره ما</span>
                  </CustomNavlink>
                </li>
                <li className="text-sm rounded-lg transition-colors duration-300 py-1">
                  <CustomNavlink onClose={() => setIsDrawerOpen(false)} to="/contact">
                    <PiInfo className="w-5 h-5 dark:text-gray-400 text-gray-700" />
                    <span>ارتباط با ما</span>
                  </CustomNavlink>
                </li>
                <li className="text-sm rounded-lg transition-colors duration-300 py-1">
                  <CustomNavlink
                    onClose={() => setIsDrawerOpen(false)}
                    to="/terms-of-services"
                  >
                    <GoLaw className="w-5 h-5 dark:text-gray-400 text-gray-700" />
                    <span>قوانین و مقررات</span>
                  </CustomNavlink>
                </li> */}
                {headerList.map((listMenu) => (
                  <NavLink
                    key={listMenu.id}
                    href={listMenu.href}
                    exact={listMenu.href === "/"}
                    sectionMatch={listMenu.sectionMatch}
                    isMobile={true}
                    onClose={() => setIsDrawerOpen(false)}
                  >
                    <span>{listMenu.name}</span>
                    <span>{listMenu.icon}</span>
                  </NavLink>
                ))}
              </SidebarItemGroup>
            </SidebarItems>
          </Sidebar>
        </DrawerItems>
      </Drawer>
    </ThemeProvider>
  );
}

export default MobileMenu;
