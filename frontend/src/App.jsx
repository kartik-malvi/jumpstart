import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

// PAGES
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Test from "./pages/Test";
import Pretest from "./pages/Pretest";
import SectionBreak from "./pages/SectionBreak";

// LAYOUT
import MainLayout from "./layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import BlankLayout from "./layout/BlankLayout";
import BookCounselling from "./pages/BookCounselling";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />, // Header + Footer + Outlet
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/test", element: <Test /> },
      { path: "/pretest", element: <Pretest /> },
      { path: "/bookcounselling", element: <BookCounselling /> },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },

  {
    element: <BlankLayout />,
    children: [{ path: "/sectionbreak", element: <SectionBreak /> }],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
