import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IoArrowBackOutline, IoArrowForwardOutline } from "react-icons/io5";

function Categories({ categories }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const pathname = usePathname();
  const carouselRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const shouldScroll = window.scrollY > 10;
      setIsScrolled((prev) => (prev !== shouldScroll ? shouldScroll : prev));
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const scrollLeftHandler = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRightHandler = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div
      className={`flex items-center justify-center gap-x-4 transition-all duration-300 mb-8 py-2 px-3 ${
        isScrolled
          ? "bg-transparent z-10 shadow-md backdrop-blur-lg fixed top-19 left-0 right-0 border-b border-platinum/45"
          : "mt-5 border-none"
      }`}
    >
      <button
        className="cursor-pointer bg-platinum/20 p-1.5 rounded-lg border border-platinum/50 hover:border-platinum/75 hover:bg-night/40 transition-colors duration-300"
        onClick={scrollRightHandler}
      >
        <IoArrowForwardOutline className="w-5 h-5" />
      </button>
      <div
        className={` bg-platinum/50 rounded-lg overflow-x-scroll select-none scroll-smooth gap-3 transition-all duration-400 ${
          isScrolled ? "h-22 w-[75%]" : "h-30 w-[80%]"
        }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        ref={carouselRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <ul className="list-none flex gap-x-4 h-full">
          {categories.map((category) => {
            const categoryHref = `/menu/${category.slug}`;
            const isActive = pathname === categoryHref;
            const activeClassName =
              "bg-night/85 hover:bg-night shadow-saffron/50 border-saffron text-saffron/85";
            const defaultClassName =
              "text-night border-night bg-silver hover:bg-neutral-300";
            return (
              <li
                key={category.id}
                className="flex items-center justify-center w-full h-full pr-2 last:pl-2 text-sm"
              >
                <Link
                  href={categoryHref}
                  className={`flex flex-col items-center justify-center shrink-0 text-center   rounded-md  transition-all duration-300 shadow-md shadow-night border ${
                    isScrolled ? "h-20 w-15 gap-y-2" : "h-25 w-18 gap-y-3"
                  } ${isActive ? activeClassName : defaultClassName}`}
                >
                  <span>
                    <Image
                      src={category?.image}
                      alt={category?.name}
                      width={200}
                      height={200}
                      loading="lazy"
                      quality={[75, 85]}
                      className={`object-center mx-auto object-cover rounded-md ${
                        isScrolled ? "h-9 w-9" : "w-12 h-12"
                      }`}
                    />
                  </span>
                  <span
                    className={`whitespace-nowrap overflow-hidden text-ellipsis max-w-[65px] ${
                      isScrolled ? "text-xs px-2" : "text-sm px-1"
                    }`}
                  >
                    {category.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <button
        className="cursor-pointer bg-platinum/20 p-1.5 rounded-lg border border-platinum/50 hover:border-platinum/75 hover:bg-night/40 transition-colors duration-300"
        onClick={scrollLeftHandler}
      >
        <IoArrowBackOutline className="w-5 h-5" />
      </button>
    </div>
  );
}

export default Categories;
