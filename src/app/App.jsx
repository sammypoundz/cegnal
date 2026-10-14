import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { Landing, HowItWorks, Plans, Faq, Legal } from "../pages/public";
import { default as IndexOnboarding } from "../components/Onboarding";
import {
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  VerifyEmail,
  Onboarding,
} from "../pages/auth";
import {
  Dashboard,
  SignalFeed,
  SignalDetail,
  SignalHistory,
  Saved,
  Notifications,
  Subscription,
  Profile,
} from "../pages/member";
import {
  WorkOverview,
  SignalForm,
  ReviewQueue,
  SignalManagement,
  UserManagement,
  PlansAdmin,
  AuditLog,
} from "../pages/work";
import {
  ZoneApp,
  ZoneTradersPage,
  ZoneTraderProfile,
  ZoneRoom,
  ZoneNotificationsPage,
  ZoneCheckoutPage,
  ZoneSubscriptionsPage,
  ZoneProfilePage,
  ZoneSettingsPage,
} from "../pages/zone";

export default function App() {
  const [role, setRole] = useState("member");
  return (
    <BrowserRouter>
      <AppRoutes role={role} setRole={setRole} />
    </BrowserRouter>
  );
}

function AppRoutes({ role }) {
  return (
    <>
      <Routes>
        <Route path="/" element={<IndexOnboarding />} />
        <Route path="/home" element={<Landing />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/legal/:kind" element={<LegalRoute />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Member app */}
        <Route path="/app" element={<Dashboard />} />
        <Route path="/app/signals" element={<SignalFeed />} />
        <Route path="/app/signals/:id" element={<SignalDetail />} />
        <Route path="/app/history" element={<SignalHistory />} />
        <Route path="/app/saved" element={<Saved />} />
        <Route path="/app/notifications" element={<Notifications />} />
        <Route path="/app/subscription" element={<Subscription />} />
        <Route path="/app/profile" element={<Profile />} />

        {/* Analyst / Admin */}
        <Route path="/work" element={<WorkOverview role={role} />} />
        <Route path="/work/signals" element={<SignalManagement />} />
        <Route path="/work/signals/new" element={<SignalForm />} />
        <Route path="/work/queue" element={<ReviewQueue />} />
        <Route path="/work/users" element={<UserManagement />} />
        <Route path="/work/plans" element={<PlansAdmin />} />
        <Route path="/work/audit" element={<AuditLog />} />

        {/* Forex Signal Zone (mobile UI) */}
        <Route path="/zone" element={<ZoneApp />} />
        <Route path="/zone/traders" element={<ZoneTradersPage />} />
        <Route path="/zone/trader/:traderId" element={<ZoneTraderProfile />} />
        <Route path="/zone/room/:traderId" element={<ZoneRoom />} />
        <Route path="/zone/notifications" element={<ZoneNotificationsPage />} />
        <Route path="/zone/checkout" element={<ZoneCheckoutPage />} />
        <Route path="/zone/subscriptions" element={<ZoneSubscriptionsPage />} />
        <Route path="/zone/profile" element={<ZoneProfilePage />} />
        <Route path="/zone/settings" element={<ZoneSettingsPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function LegalRoute() {
  const { kind } = useParams();
  return <Legal kind={kind} />;
}
