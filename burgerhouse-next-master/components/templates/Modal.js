import { motion, AnimatePresence } from "motion/react";
import { HiOutlineX } from "react-icons/hi";
import Image from "next/image";
import useOutsideClick from "../hooks/useOutsideClick";

function Modal({ onClose, children, title, size = false }) {
  const ref = useOutsideClick(onClose);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-night/20"
      >
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 18,
          }}
          className={`rounded-lg bg-silver text-night/85 p-4 shadow-lg overflow-y-auto
              ${
                size
                  ? "sm:w-[calc(100vw-15%)] md:max-w-2xl max-h-[calc(100vh-15%)]"
                  : "w-[calc(100vw-25%)] md:max-w-lg max-h-[calc(100vh-25%)]"
              }`}
        >
          <div
            className={`flex items-center justify-between  pb-2  ${
              !size && "border-b border-night mb-6"
            } `}
          >
            {title ? (
              <div className="flex items-center gap-x-2">
                <div className="w-10">
                  <Image
                    src="/image/Logo.jpg"
                    alt="Logo"
                    width="40"
                    height="40"
                    className="rounded-full"
                    loading="lazy"
                  />
                </div>
                <h1 className="font-bold text-sm md:text-lg">{title}</h1>
              </div>
            ) : (
              <div />
            )}

            <button
              onClick={onClose}
              className="cursor-pointer bg-inherit transition-colors duration-300 hover:bg-gray-500 rounded-lg p-1"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Modal;
