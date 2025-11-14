import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { PiTelegramLogo } from "react-icons/pi";

function Footer() {
  const pageList = [
    { id: 1, name: "صفحه اصلی", href: "/" },
    { id: 2, name: "منو", href: "/menu" },
    { id: 3, name: "درباره ما", href: "/about" },
    { id: 4, name: "ارتباط با ما", href: "/contact" },
  ];
  const socialMedia = [
    {
      id: 1,
      icon: <FaInstagram className="sm:w-5 sm:h-5 w-4 h-4" />,
      href: "/",
    },
    {
      id: 2,
      icon: <PiTelegramLogo className="sm:w-5 sm:h-5 w-4 h-4" />,
      href: "/",
    },
    {
      id: 3,
      icon: <FaWhatsapp className="sm:w-5 sm:h-5 w-4 h-4" />,
      href: "/",
    },
  ];
  const MenuItems = [
    "صبحانه",
    "پیتزا",
    "برگر",
    "ساندویچ",
    "استیک",
    "مرغ",
    "تاکو",
    "سوشی",
    "سوپ",
    "سالاد",
    "کیک",
  ];
  return (
    <>
      <div className="bg-neutral-900 grid grid-cols-12 gap-y-8 px-4 py-6 text-[14px] transition-colors duration-500">
        <div className="col-span-12 md:col-span-3 max-md:flex max-md:justify-center">
          <Image
            src="/image/Logo.jpg"
            alt="Logo"
            width="80"
            height="80"
            className="rounded-full max-[500px]:w-[70px]"
            loading="lazy"
          />
        </div>

        <div className="col-span-4 md:col-span-3 space-y-3 ">
          <p className="text-saffron  max-sm:text-[12px]">صفحات</p>
          <div className="flex flex-col items-start gap-y-3 sm:text-[12px] text-[10px]">
            {pageList.map((page) => (
              <Link
                key={page.id}
                href={page.href}
                className="hover:text-white-smoke transition-colors duration-300"
              >
                {page.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="col-span-5 md:col-span-4  space-y-3">
          <p className="text-saffron max-sm:text-[12px]">منو</p>
          <div className="grid grid-cols-12 ">
            <div className="col-span-6 flex flex-col items-start gap-y-3 sm:text-[12px] text-[10px]">
              {MenuItems.slice(0, 6).map((item, index) => (
                <Link
                  key={index}
                  href="/"
                  className="hover:text-white-smoke transition-colors duration-300"
                >
                  {item}
                </Link>
              ))}
            </div>
            <div className="col-span-6 flex flex-col items-start gap-y-3 sm:text-[12px] text-[10px]">
              {MenuItems.slice(6, 12).map((item, index) => (
                <Link
                  key={index}
                  href="/"
                  className="hover:text-white-smoke transition-colors duration-300"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-3 md:col-span-2 items-center flex flex-col space-y-3">
          <p className="text-saffron  max-sm:text-[12px]">ارتباط با ما</p>
          <div className="flex flex-col gap-y-4">
            {socialMedia.map((social) => (
              <Link
                key={social.id}
                href={social.href}
                className="hover:text-white-smoke transition-colors duration-300"
              >
                {social.icon}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-neutral-950 p-4 sm:text-[11px] min-[500px]:max-sm:text-[10px] text-[8px] flex justify-center items-center gap-x-1 border-t border-platinum/45">
        <span className="font-sans text-base">©</span>
        <span>تمامی حقوق این سایت متعلق به خانه برگر می باشد .</span>
      </div>
    </>
  );
}

export default Footer;
