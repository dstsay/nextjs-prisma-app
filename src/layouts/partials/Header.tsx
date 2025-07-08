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
        
        {/* Left side - Navigation menu */}
        <ul
          id="nav-menu"
          className="navbar-nav order-3 hidden pb-6 lg:order-1 lg:flex lg:w-auto lg:pb-0 lg:justify-start"
        >
          {main.map((menu) => (
            <React.Fragment key={menu.url}>
              {menu.hasMegamenu !== undefined && menu.name ? (
                <li
                  className={`nav-item nav-dropdown group ${activeDropdown === menu.name ? "active" : ""}`}
                >
                  <span
                    className={`nav-link inline-flex items-center ${
                      menu.children
                        ?.map((subchild) =>
                          subchild.children?.some(
                            (child) =>
                              pathname === child.url ||
                              pathname === `${child.url}/`
                          )
                        )
                        .includes(true)
                        ? "active"
                        : ""
                    }`}
                    onClick={() => toggleDropdown(menu.name || "")}
                  >
                    {menu.name}
                    <span className="arrow-icon">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </span>
                  </span>
                  <div
                    className={`mega-menu-wrapper max-lg:hidden max-lg:group-[.active]:flex max-lg:group-[.active]:flex-col lg:invisible lg:absolute lg:left-0 lg:flex ${menu.hasMegamenu ? "lg:items-center" : "lg:flex-col"} lg:opacity-0 lg:transition-all lg:duration-300 lg:group-hover:visible lg:group-hover:opacity-100 ${!menu.hasMegamenu ? " lg:p-4 lg:rounded-xl lg:border lg:border-border" : ""}`}
                  >
                    {menu.image && menu.hasMegamenu && (
                      <div className="flex-shrink-0 mr-4">
                        <ImageFallback
                          src={menu.image}
                          fallback="/images/image-placeholder.png"
                          alt={"Preview"}
                          className="aspect-square shadow max-lg:hidden"
                          width={240}
                          height={240}
                        />
                      </div>
                    )}
                    {menu.children?.map((subchild, index) => (
                      <div
                        key={index}
                        className={`flex flex-col gap-5 ${!menu.hasMegamenu ? "w-full" : ""}`}
                      >
                        <ul
                          className={`nav-dropdown-list ${
                            menu.hasMegamenu
                              ? "gap-x-8 sm:columns-2 md:columns-3 lg:grid lg:grid-cols-[repeat(3,_1fr)]"
                              : "flex w-full h-full flex-col gap-2 lg:max-h-[400px] overflow-y-auto pr-2"
                          }`}
                        >
                          {subchild.children?.map((child) => (
                            <li className="nav-dropdown-item" key={child.url}>
                              <Link
                                href={child.url || "#"}
                                aria-label={child.name || "preview"}
                                className={`nav-dropdown-link block ${
                                  !menu.hasMegamenu
                                    ? "py-2 px-3 hover:bg-secondary/5 rounded-lg whitespace-nowrap"
                                    : ""
                                } ${
                                  pathname === `${child.url}/` ||
                                  pathname === child.url
                                    ? "active"
                                    : ""
                                }`}
                              >
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </li>
              ) : menu.hasChildren && menu.name ? (
                <li
                  className={`nav-item nav-dropdown group relative ${activeDropdown === menu.name ? "active" : ""}`}
                >
                  <span
                    className={`nav-link inline-flex items-center ${
                      menu.children
                        ?.map(({ url }) => url)
                        .includes(pathname ?? "") ||
                      menu.children
                        ?.map(({ url }) => `${url}/`)
                        .includes(pathname ?? "")
                        ? "active"
                        : ""
                    }`}
                    onClick={() => toggleDropdown(menu.name || "")}
                  >
                    {menu.name}
                    <span className="arrow-icon">
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </span>
                  </span>
                  <ul
                    className={`nav-dropdown-list flex flex-col gap-1 rounded-xl border border-border bg-primary p-3 max-lg:mb-3 max-lg:hidden max-lg:w-[300px] max-lg:group-[.active]:flex max-lg:group-[.active]:flex-col lg:invisible lg:absolute lg:left-0 lg:flex lg:opacity-0 lg:transition-all lg:duration-300 lg:group-hover:visible lg:group-hover:opacity-100`}
                  >
                    {menu.children?.map((child, i) => (
                      <li key={i} className={`nav-dropdown-item`}>
                        <Link
                          href={child.url || "#"}
                          aria-label={child.name}
                          className={`nav-dropdown-link rounded-xl !px-4 !py-1.5 hover:bg-secondary/5 ${
                            ((pathname === `${child.url}/` ||
                              pathname === child.url) &&
                              "active") ||
                            ""
                          }`}
                        >
                          {child.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                menu.name && (
                  <li className="nav-item">
                    <Link
                      href={menu.url || "#"}
                      className={`nav-link block ${
                        (pathname === `${menu.url}/` ||
                          pathname === menu.url) &&
                        "active"
                      }`}
                    >
                      {menu.name}
                    </Link>
                  </li>
                )
              )}
            </React.Fragment>
          ))}
          {navigation_button.enable && (
            <li className="mt-4 inline-block lg:hidden">
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