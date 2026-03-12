"use client";

import { useState, useContext } from "react";

import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  PopoverGroup,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  const isLoggedIn = !!user;

  return (
    <header className="bg-white">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      >
        {/* LEFT SIDE: LOGO + MENU */}
        <div className="flex items-center gap-x-12">
          {/* LOGO */}
          <Link to="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Your Company</span>
            <img alt="" src={logo} className="h-8 w-auto" />
          </Link>

          {/* MENU */}
          <PopoverGroup className="hidden lg:flex lg:gap-x-10">
            <Link to="/" className="text-sm font-semibold text-gray-900">
              Home
            </Link>
            <Link to="/test" className="text-sm font-semibold text-gray-900">
              Tests
            </Link>
            <Link to="/dashboard" className="text-sm font-semibold text-gray-900">
              Dashboard
            </Link>
            <a href="/result" className="text-sm font-semibold text-gray-900">
              Results
            </a>
          </PopoverGroup>
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>

        {/* RIGHT SIDE (Desktop) */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-6">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-gray-700">
                Hi, <strong>{user?.name}</strong>
              </span>

              <button
                onClick={logout}
                className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 text-sm font-semibold text-gray-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a8.25 8.25 0 0 1 15 0"
                  />
                </svg>
                Sign In
              </Link>

              <a
                href="/signup"
                className="primary-btn rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 transition"
              >
                Get Started
              </a>
            </>
          )}
        </div>
      </nav>

      {/* MOBILE MENU */}
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img alt="" src={logo} className="h-8 w-auto" />
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>

          {/* MOBILE MENU LINKS */}
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50">
                    Home
                  </DisclosureButton>
                </Disclosure>

                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Tests
                </a>

                <a
                  href="/dashboard"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Dashboard
                </a>

                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Results
                </a>
              </div>

              <div className="py-6">
                {isLoggedIn ? (
                  <button
                    onClick={logout}
                    className="-mx-3 block rounded-full px-3 py-2.5 text-base font-semibold 
                               bg-orange-500 text-white text-center hover:bg-orange-600 transition"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Log in
                  </Link>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
