import { createTheme, FloatingLabel, ThemeProvider } from "flowbite-react";

const customTheme = createTheme({
  floatingLabel: {
    label: {
      default: {
        outlined: {
          sm: "right-1 left-auto bg-silver cursor-text text-night/60 peer-focus:text-night/80",
        },
      },
    },
    input: {
      default: {
        outlined: {
          sm: "rounded-md border-night/50 text-xs text-night/80 focus:border-black focus:shadow-md focus:shadow-night/30 hover:border-night transition-all duration-400 ease-in-out",
        },
      },
    },
  },
});

function TextField({ label, type = "text", register, errors, name }) {
  return (
    <ThemeProvider theme={customTheme}>
      <div className="w-full">
        <FloatingLabel
          variant="outlined"
          label={label}
          sizing="sm"
          type={type}
          {...register(name)}
        />
        {errors.name && (
          <p className="text-red-500 text-xs">{errors.name.message}</p>
        )}
      </div>
    </ThemeProvider>
  );
}

export default TextField;
