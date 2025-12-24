import { createTheme, FloatingLabel, ThemeProvider } from "flowbite-react";
import { HiEye, HiEyeOff } from "react-icons/hi";

const customTheme = createTheme({
  floatingLabel: {
    label: {
      default: {
        outlined: {
          sm: "right-1 left-auto bg-silver cursor-text text-night/60 peer-focus:text-night/80 dark:bg-silver dark:text-night/60 dark:peer-focus:text-night/80",
        },
      },
    },
    input: {
      default: {
        outlined: {
          sm: "bg-transparent dark:bg-transparent rounded-md border-night/50 dark:border-night/50 text-xs text-night/80 dark:text-night/80 focus:border-black focus:shadow-lg focus:shadow-night/30 hover:border-night dark:focus:border-black transition-all duration-400 ease-in-out",
        },
      },
    },
  },
});

function TextField({
  label,
  type = "text",
  register,
  errors,
  name,
  passwordShow,
  setPasswordShow,
}) {
  return (
    <ThemeProvider theme={customTheme}>
      <div className="relative w-full">
        <div className="relative w-full">
          <FloatingLabel
            variant="outlined"
            label={label}
            sizing="sm"
            type={type === "password" && passwordShow ? "text" : type}
            {...register(name)}
          />

          {/* 👁 Password Toggle Button */}
          {type === "password" && (
            <button
              type="button"
              onClick={() => setPasswordShow((prev) => !prev)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-night/60 hover:text-night/80 cursor-pointer transition-all duration-300"
            >
              {passwordShow ? (
                <HiEyeOff className="w-5 h-5" />
              ) : (
                <HiEye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Error Message */}
        {errors[name] && (
          <p className="text-red-800 text-xs mt-1">{errors[name].message}</p>
        )}
      </div>
    </ThemeProvider>
  );
}

export default TextField;
