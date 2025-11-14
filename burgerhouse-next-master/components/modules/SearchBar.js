import { useEffect, useState } from "react";
import useOutsideClick from "../hooks/useOutsideClick";
import {
  Button,
  createTheme,
  Drawer,
  DrawerHeader,
  TextInput,
  ThemeProvider,
} from "flowbite-react";
import { BsSearch } from "react-icons/bs";
import { HiOutlineTrash } from "react-icons/hi";

const customTheme = createTheme({
  drawer: {
    root: {
      base: "fixed z-40 overflow-y-auto bg-gray-200 p-4 transition-all duration-600 rounded-b-md",
      backdrop: "bg-night/80",
      position: {
        top: {
          on: "md:w-[50%] mx-auto sm:w-[80%] w-full",
          off: "md:w-[50%] mx-auto sm:w-[80%] w-full",
        },
      },
    },
    header: {
      inner: {
        closeButton:
          "absolute end-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-700 hover:bg-gray-400 hover:text-gray-900 cursor-pointer transition-colors duration-300",
        titleIcon: "h-5 w-5",
        titleText: "mb-4 inline-flex items-center text-sm text-gray-700",
      },
    },
  },
  textInput: {
    field: {
      input: {
        base: "focus:ring-0",
        colors: {
          gray: "text-gray-900 border-night/20 bg-inherit hover:border-night/50 focus:border-night transition-all duration-300 ease-in-out  placeholder:text-night/30",
        },
      },
    },
  },
  button: {
    outlineColor: {
      dark: "bg-transparent hover:bg-transparent hover:text-night text-night/75 hover:border-none border-none focus:ring-0 cursor-pointer transition-colors duration-300",
    },
  },
});

function SearchBar({ isSearchBarOpen, setIsSearchBarOpen }) {
  const [searchValue, setSearchValue] = useState("");
  /*   useEffect(() => {
    if (isSearchBarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isSearchBarOpen]); */

  const sidebarRef = useOutsideClick(() => {
    if (isSearchBarOpen) {
      setIsSearchBarOpen(false);
    }
  });
  return (
    <ThemeProvider theme={customTheme}>
      <Drawer
        open={isSearchBarOpen}
        onClose={() => setIsSearchBarOpen(false)}
        position="top"
        className="z-50"
        ref={sidebarRef}
      >
        <DrawerHeader title="جستجو" titleIcon={BsSearch} />
        <div className="flex items-center gap-x-2">
          <TextInput
            type="text"
            placeholder="جستجو ..."
            icon={BsSearch}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            autoFocus={isSearchBarOpen}
            className="w-[90%]"
          />
          {searchValue && (
            <Button
              color="dark"
              outline
              size="sm"
              onClick={() => setIsSearchBarOpen(false)}
              aria-label="پاک کردن جستجو"
              title="پاک کردن جستجو"
            >
              <HiOutlineTrash className="w-5 h-5" />
            </Button>
          )}
        </div>
      </Drawer>
    </ThemeProvider>
  );
}

export default SearchBar;
