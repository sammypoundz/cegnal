import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "../lib/auth.jsx";
import { Landing, HowItWorks, Plans, Faq, Legal } from "../pages/public";
import { default as IndexOnboarding } from "../components/Onboarding";
import {
  Login,
  Register,
  ForgotPassword,
  VerifyEmail,
  Onboarding,
} from "../pages/auth";
import {
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
  ZoneTransactionsPage,
  ZoneProfilePage,
  ZoneSettingsPage,
  AnalystDashboard,
} from "../pages/zone";

export default function App() {
  const [role, setRole] = useState("member");
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes role={role} setRole={setRole} />
      </BrowserRouter>
    </AuthProvider>
  );
}

/* Redirects signed-out users to /login; shows nothing while the
   session is being restored from the stored token.
   Unverified users must complete email verification first. */
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />;
  return children;
}

/* Keeps signed-in users out of login/register. Unverified users go to
   /verify-email instead of the app, so signup lands on the OTP page. */
function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user)
    return <Navigate to={user.emailVerified ? "/app" : "/verify-email"} replace />;
  return children;
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
        <Route
          path="/login"
          element={<PublicOnly><Login /></PublicOnly>}
        />
        <Route
          path="/register"
          element={<PublicOnly><Register /></PublicOnly>}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<Navigate to="/forgot-password" replace />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Member app — Zone is the main app interface */}
        <Route path="/app" element={<RequireAuth><ZoneApp /></RequireAuth>} />
        <Route path="/app/signals" element={<RequireAuth><SignalFeed /></RequireAuth>} />
        <Route path="/app/signals/:id" element={<RequireAuth><SignalDetail /></RequireAuth>} />
        <Route path="/app/history" element={<RequireAuth><SignalHistory /></RequireAuth>} />
        <Route path="/app/saved" element={<RequireAuth><Saved /></RequireAuth>} />
        <Route path="/app/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="/app/subscription" element={<RequireAuth><Subscription /></RequireAuth>} />
        <Route path="/app/profile" element={<RequireAuth><Profile /></RequireAuth>} />

        {/* Analyst / Admin */}
        <Route path="/work" element={<RequireAuth><WorkOverview role={role} /></RequireAuth>} />
        <Route path="/work/signals" element={<RequireAuth><SignalManagement /></RequireAuth>} />
        <Route path="/work/signals/new" element={<RequireAuth><SignalForm /></RequireAuth>} />
        <Route path="/work/queue" element={<RequireAuth><ReviewQueue /></RequireAuth>} />
        <Route path="/work/users" element={<RequireAuth><UserManagement /></RequireAuth>} />
        <Route path="/work/plans" element={<RequireAuth><PlansAdmin /></RequireAuth>} />
        <Route path="/work/audit" element={<RequireAuth><AuditLog /></RequireAuth>} />

        {/* Forex Signal Zone (mobile UI) */}
        <Route path="/zone" element={<RequireAuth><ZoneApp /></RequireAuth>} />
        <Route path="/zone/analyst" element={<RequireAuth><AnalystDashboard /></RequireAuth>} />
        <Route path="/zone/traders" element={<RequireAuth><ZoneTradersPage /></RequireAuth>} />
        <Route path="/zone/trader/:traderId" element={<RequireAuth><ZoneTraderProfile /></RequireAuth>} />
        <Route path="/zone/room/:traderId" element={<RequireAuth><ZoneRoom /></RequireAuth>} />
        <Route path="/zone/notifications" element={<RequireAuth><ZoneNotificationsPage /></RequireAuth>} />
        <Route path="/zone/checkout" element={<RequireAuth><ZoneCheckoutPage /></RequireAuth>} />
        <Route path="/zone/subscriptions" element={<RequireAuth><ZoneSubscriptionsPage /></RequireAuth>} />
        <Route path="/zone/transactions" element={<RequireAuth><ZoneTransactionsPage /></RequireAuth>} />
        <Route path="/zone/profile" element={<RequireAuth><ZoneProfilePage /></RequireAuth>} />
        <Route path="/zone/settings" element={<RequireAuth><ZoneSettingsPage /></RequireAuth>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function LegalRoute() {
  const { kind } = useParams();
  return <Legal kind={kind} />;
}
