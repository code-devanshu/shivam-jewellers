"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header: React.FC = () => {
  const pathname = usePathname();
  const commonSpanClass =
    "block absolute h-0.5 w-full bg-yellow-600 transition-all duration-700 ease-in-out";
  const [open, setOpen] = useState(false);
  const menuOptions = [
    {
      id: 1,
      title: `Products`,
      url: "/products",
    },
  ];
  const handleHamburgerClick = () => {
    setOpen(!open);
  };
  return (
    <header
      className={`px-2 sm:px-16 2xl:px-40 z-50 py-2 sm:py-3 border-b bg-gradient-to-t from-black to-gray-900  w-full fixed lg:block top-0 lg:top-none ${
        open ? " left-0 right-0 bottom-auto shadow-md" : ""
      }`}
    >
      <nav className="flex justify-between 2xl:max-w-6xl mx-auto">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex justify-center items-center"
        >
          <h1 className="italic font-bold text-2xl text-yellow-600">
            Shivam Jewellers
          </h1>
        </Link>
        <div className="flex items-center">
          <div
            className={`${
              open
                ? "left-[0%] bg-black shadow-md border-t border-yellow-600  ps-1"
                : "left-[-100%]"
            } navLinks duration-500 absolute lg:static lg:w-auto
                            w-full lg:h-auto h-[92vh] flex lg:items-center gap-[1.5vw] top-full`}
          >
            <ul className="flex lg:flex-row flex-col lg:items-center gap-0 lg:gap-8">
              {menuOptions.map((data) => {
                return (
                  <Link key={data.id} href={data.url}>
                    <li
                      onClick={() => setOpen(false)}
                      className={`hover:text-white hover:underline hover:underline-offset-4 hover:decoration-yellow-600${
                        open ? "ps-2 sm:ps-6" : ""
                      } ${
                        pathname === `${data.url}`
                          ? "text-white underline underline-offset-4 decoration-yellow-600"
                          : ""
                      }
                      first-letter:uppercase my-1 w-[98vw] lg:w-auto text-sm font-medium text-gray-500 leading-6
                      py-2 rounded-md cursor-pointer`}
                    >
                      {data.title}
                    </li>
                  </Link>
                );
              })}
              <Link
                href="/login"
                className="ps-1 sm:ps-4 mt-2 md:mt-0 "
                onClick={() => setOpen(false)}
              >
                <Button className="border-2 border-yellow-600 bg-black text-white hover:bg-yellow-700">
                  Login
                </Button>
              </Link>
              <Link
                href="/signup"
                className="ps-1"
                onClick={() => setOpen(false)}
              >
                <Button
                  variant="primary"
                  className="mt-5 lg:mt-0 bg-yellow-600 text-black"
                >
                  Create Account
                </Button>
              </Link>
            </ul>
          </div>

          <div
            className="w-10 h-10  rounded-full cursor-pointer lg:hidden p-2 ms-[3vw]"
            onClick={handleHamburgerClick}
          >
            <div className="relative transition-all duration-700 ease-in-out">
              <div
                className={`${commonSpanClass} ${
                  open ? "rotate-[135deg] top-[10px]" : "rotate-0 top-1"
                }`}
              ></div>
              <div
                className={`${commonSpanClass} ${
                  open ? "hidden" : "rotate-0 top-3"
                }`}
              ></div>
              <div
                className={`${commonSpanClass} ${
                  open ? "-rotate-[135deg] top-[10px]" : "rotate-0 top-5"
                }`}
              ></div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
