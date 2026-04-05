import React from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import "./index.css";

// PAGES
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Test from "./pages/Test";
import Pretest from "./pages/Pretest";
import PretestSections from "./pages/PretestSections";
import SectionBreak from "./pages/SectionBreak";
import Admindashboard from "./pages/admin/Admindashboard";
import BookCounselling from "./pages/BookCounselling";
import Payment from "./pages/Payment";
import PaymentConfirmation from "./pages/PaymentConfirmation";
import Careerdetail from "./pages/Careerdetail";
import Result from "./pages/Result";
import StudentReport from "./pages/StudentReport";
import Livetest from "./pages/Livetest";
import TestCompleted from "./pages/TestCompleted";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import TestPaused from "./pages/TestPaused";

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
import ReviewSubmission from "./pages/admin/ReviewSubmission";

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
      {
        path: "/pretest",
        element: (
          <ProtectedRoute>
            <Pretest />
          </ProtectedRoute>
        ),
      },
      {
        path: "/Pretest",
        element: (
          <ProtectedRoute>
            <Pretest />
          </ProtectedRoute>
        ),
      },
      {
        path: "/pretest/sections",
        element: (
          <ProtectedRoute>
            <PretestSections />
          </ProtectedRoute>
        ),
      },
      {
        path: "/Pretest/sections",
        element: (
          <ProtectedRoute>
            <PretestSections />
          </ProtectedRoute>
        ),
      },
      { path: "/bookcounselling", element: <BookCounselling /> },
      {
        path: "/payment",
        element: (
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        ),
      },
      {
        path: "/payment-confirmation",
        element: (
          <ProtectedRoute>
            <PaymentConfirmation />
          </ProtectedRoute>
        ),
      },
      {
        path: "/careerdetail",
        element: (
          <ProtectedRoute>
            <Careerdetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "/result",
        element: (
          <ProtectedRoute>
            <Result />
          </ProtectedRoute>
        ),
      },
      {
        path: "/result/:reportId",
        element: (
          <ProtectedRoute>
            <StudentReport />
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
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile/edit",
        element: (
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // 🛠️ ADMIN ROUTES (NO HEADER / FOOTER)
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRole="admin" unauthorizedTo="/dashboard">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <Admindashboard />,
      },
      {
        path: "testsubmissions",
        element: <TestSubmissions />,
      },
      {
        path: "testsubmissions/:userId",
        element: <ReviewSubmission />,
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
      { path: "/test-paused", element: <ProtectedRoute><TestPaused /></ProtectedRoute> },
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
