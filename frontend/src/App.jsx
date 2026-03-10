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
import ChooseSection from "./pages/ChooseSection";
import SectionBreak from "./pages/SectionBreak";
import Admindashboard from "./pages/admin/Admindashboard";
import BookCounselling from "./pages/BookCounselling";
import Payment from "./pages/Payment";
import Careerdetail from "./pages/Careerdetail";
import Result from "./pages/Result";
import Livetest from "./pages/Livetest";
import TestCompleted from "./pages/TestCompleted";

// LAYOUTS
import MainLayout from "./layout/MainLayout";
import BlankLayout from "./layout/BlankLayout";
import AdminLayout from "./layout/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import TestSubmissions from "./pages/admin/TestSubmissions";
import PublishedResult from "./pages/admin/PublishedResult";
import UserManagement from "./pages/admin/UserManagement";
import Payments from "./pages/admin/Payments";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";

const router = createBrowserRouter([
  // 🌍 PUBLIC + USER PAGES (WITH HEADER & FOOTER)
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "/test", element: <Test /> },
      { path: "/pretest", element: <Pretest /> },
      { path: "/Pretest", element: <Pretest /> },
      {
        path: "/choose-section",
        element: (
          <ProtectedRoute>
            <ChooseSection />
          </ProtectedRoute>
        ),
      },
      { path: "/bookcounselling", element: <BookCounselling /> },
      { path: "/payment", element: <Payment /> },
      { path: "/careerdetail", element: <Careerdetail /> },
      {
        path: "/result",
        element: (
          <ProtectedRoute>
            <Result />
          </ProtectedRoute>
        ),
      },
      {
        path: "/test-completed",
        element: (
          <ProtectedRoute>
            <TestCompleted />
          </ProtectedRoute>
        ),
      },
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

  // 🛠️ ADMIN ROUTES (NO HEADER / FOOTER)
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "dashboard",
        element: <Admindashboard />,
      },
      {
        path: "testsubmissions",
        element: <TestSubmissions />,
      },
      {
        path: "publishedresults",
        element: <PublishedResult />,
      },
       {
        path: "usermanagement",
        element: <UserManagement />,
      },
      {
        path: "payments",
        element: <Payments />,
      },
      {
        path: "analytics",
        element: <Analytics />,
      },
       {
        path: "settings",
        element: <Settings />,
      },
    ],
  },

  // 🧱 BLANK PAGES (no header/footer)
  {
    element: <BlankLayout />,
    children: [
      { path: "/sectionbreak", element: <ProtectedRoute><SectionBreak /></ProtectedRoute> },
      { path: "/SectionBreak", element: <ProtectedRoute><SectionBreak /></ProtectedRoute> },
      {
        path: "/livetest/:sectionId",
        element: (
          <ProtectedRoute>
            <Livetest />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
