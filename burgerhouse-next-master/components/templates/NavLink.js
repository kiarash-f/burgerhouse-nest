import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { SidebarItem } from "flowbite-react";

export default function NavLink({
  href,
  exact,
  children,
  isMobile = false,
  onClose,
  sectionMatch,
}) {
  const pathname = usePathname();

  if (!pathname) {
    return null;
  }

  let isActive = exact ? pathname === href : pathname.startsWith(href);

  if (sectionMatch && pathname.startsWith(sectionMatch)) {
    isActive = true;
  }

  if (isMobile) {
    const activeClass =
      "bg-saffron/20 text-saffron hover:bg-saffron/30 transition-colors duration-300";
    const defaultClass =
      "text-white-smoke/80 hover:bg-platinum/20 transition-colors duration-300";

    return (
      <Link href={href} passHref>
        <SidebarItem
          as="div"
          className={`py-3 text-sm mb-2 last-of-type::mb-0 ${
            isActive ? activeClass : defaultClass
          }`}
          onClick={onClose}
        >
          <div className="flex items-center justify-between">{children}</div>
        </SidebarItem>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`relative px-2 py-1 transition-colors duration-400 ${
        isActive ? "text-saffron hover:text-saffron" : "hover:text-white-smoke"
      }`}
    >
      <span>{children}</span>

      {isActive && (
        <motion.span
          layoutId="underline-offset"
          className="absolute left-0 right-0 -bottom-1.5 h-0.5 bg-saffron rounded-full"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        />
      )}
    </Link>
  );
}
