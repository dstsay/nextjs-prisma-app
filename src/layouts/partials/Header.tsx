"use client";

import Button from "@/layouts/components/Button";
import Logo from "@/layouts/components/Logo";
import config from "@/config/config.json";
import menu from "@/config/menu.json";
import ImageFallback from "@/layouts/helpers/ImageFallback";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export interface ChildNavigationLink {
  name?: string;
  url?: string;
  image?: string;
  children?: ChildNavigationLink[];
}

export interface NavigationLink {
  name?: string;
  url?: string;
  enable?: boolean;
  hasMegamenu?: boolean;
  image?: string;
  hasChildren?: boolean;
  children?: ChildNavigationLink[];
}

const { main }: { [key: string]: NavigationLink[] } = menu;
const { navigation_button } = config;

export default function Header() {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(
    null
  );

  const toggleDropdown = (menuName: string) => {
    setActiveDropdown((prev) => (prev === menuName ? null : menuName));
  };

  return (
    <header className={`header fixed top-0 z-50 w-full`}>
      <nav className="navbar container relative z-10 lg:grid lg:grid-cols-3 lg:items-center">
        {/* Mobile navbar toggler */}
        <input id="nav-toggle" type="checkbox" className="hidden" />
        <label
          htmlFor="nav-toggle"
          className="order-3 flex cursor-pointer items-center text-text lg:hidden"
        >
          <svg
            id="show-button"
            className="block h-6 fill-current"
            viewBox="0 0 20 20"
          >
            <title>Menu Open</title>
            <path d="M0 3h20v2H0V3z m0 6h20v2H0V9z m0 6h20v2H0V0z"></path>
          </svg>
          <svg
            id="hide-button"
            className="hidden h-6 fill-current"
            viewBox="0 0 20 20"
          >
            <title>Menu Close</title>
            <polygon
              points="11 9 22 9 22 11 11 11 11 22 9 22 9 11 -2 11 -2 9 9 9 9 -2 11 -2"
              transform="rotate(45 10 10)"
            ></polygon>
          </svg>
        </label>
        
        {/* Left side - Our Makeup Artists button */}
        <div className="order-3 hidden lg:order-1 lg:flex lg:items-center lg:justify-start">
          <Button
            enable={true}
            link="/artists"
            label="Our Makeup Artists"
            showIcon={false}
          />
        </div>
        
        {/* Mobile menu */}
        <ul
          id="nav-menu"
          className="navbar-nav order-3 hidden pb-6 lg:hidden"
        >
          <li className="mt-4 inline-block">
            <Link
              className="btn btn-primary btn-sm"
              href="/artists"
            >
              Our Makeup Artists
            </Link>
          </li>
          {navigation_button.enable && (
            <li className="mt-4 inline-block">
              <Link
                className="btn btn-primary btn-sm"
                href={navigation_button.link}
              >
                {navigation_button.label}
              </Link>
            </li>
          )}
        </ul>

        {/* Center - Logo */}
        <div className="order-0 flex justify-center lg:order-2">
          <Logo />
        </div>

        {/* Right side - Button */}
        <div className="order-1 ml-auto flex items-center md:order-2 lg:ml-0 lg:justify-end">
          <div className="hidden lg:flex items-center">
            <Button
              enable={navigation_button.enable}
              link={navigation_button.link}
              label={navigation_button.label}
              showIcon={false}
            />
          </div>
        </div>
      </nav>
    </header>
  );
}