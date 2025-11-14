import React, { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";

export default function Slider() {
  const images = ["/image/chicken.jpg", "/image/pizza.jpg", "/image/food1.jpg"];
  const [activeImage, setActiveImage] = useState(images[0]);
  const swiperRef = useRef(null);
  const progressCircle = useRef(null);
  const progressContent = useRef(null);

  const onAutoplayTimeLeft = (s, time, progress = 5) => {
    progressCircle.current?.style.setProperty("--progress", 1 - progress);
    if (progressContent.current)
      progressContent.current.textContent = `${Math.ceil(time / 1000)}`;
  };

  return (
    <div className="relative w-full flex items-center justify-center h-[250px] sm:h-[350px] md:h-[450px] overflow-hidden">
      {/* Background with blur + brightness + fade transition */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-cover bg-center -z-10 transition-[background-image] duration-700 ease-in-out blur-[5px] brightness-50"
        style={{ backgroundImage: `url(${activeImage})` }}
      />

      {/* Swiper container — responsive width */}
      <div className="w-[90%] sm:w-[80%] md:w-[70%] mx-auto h-[90%]">
        <Swiper
          className="h-full"
          dir="rtl"
          spaceBetween={30}
          slidesPerView="auto"
          centeredSlides
          loop
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
            renderBullet: (_, className) =>
              `<span class="${className} bg-saffron! w-8! h-1! rounded-none!"></span>`,
          }}
          modules={[Autoplay, Pagination]}
          onAutoplayTimeLeft={onAutoplayTimeLeft}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={(swiper) => setActiveImage(images[swiper.realIndex])}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index} className="h-full">
              <div className="flex justify-center items-center h-full">
                <Image
                  src={image}
                  quality={[75, 85]}
                  alt={`Slide ${index + 1}`}
                  width={800}
                  height={500}
                  className="w-full h-full object-cover object-center border border-platinum/40"
                />
              </div>
            </SwiperSlide>
          ))}

          {/* Progress indicator */}
          <div className="autoplay-progress" slot="container-end">
            <svg viewBox="0 0 48 48" ref={progressCircle}>
              <circle cx="24" cy="24" r="20"></circle>
            </svg>
            <span ref={progressContent}></span>
          </div>
        </Swiper>
      </div>
    </div>
  );
}
