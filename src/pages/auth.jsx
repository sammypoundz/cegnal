import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Field,
  Input,
  inputCls,
  Spinner,
} from "../components/ui";
import { BrandMark } from "../components/shell";
import { MailIcon, CheckCircleIcon, ArrowLeftIcon } from "../components/icons";

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="app-max app-page px-4 pb-10 pt-10">
      <Link
        to="/"
        className="mb-8 flex items-center gap-2"
        aria-label="Cegnal home"
      >
        <BrandMark />
        <span className="text-[15px] font-extrabold text-ink">Cegnal</span>
      </Link>
      <h1 className="mb-1 text-2xl font-extrabold text-ink">{title}</h1>
      <p className="mb-6 text-[15px] text-muted">{subtitle}</p>
      {children}
    </div>
  );
}

export function Login() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const submit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(f.get("email")))
      errs.email = "Enter a valid email address.";
    if (f.get("password").length < 6)
      errs.password = "Password must be at least 6 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      nav("/app");
    }, 700);
  };
  return (
    <AuthShell
      title="Log in"
      subtitle="Welcome back. Enter your details to continue."
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email" error={errors.email}>
          <Input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email}
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <Input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••"
            error={errors.password}
          />
        </Field>
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-gold"
          >
            Forgot password?
          </Link>
        </div>
        <Button
          type="submit"
          variant="gold"
          className="w-full"
          loading={loading}
        >
          Log in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        New to Cegnal?{" "}
        <Link to="/register" className="font-semibold text-gold">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

export function Register() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const submit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const errs = {};
    if (!f.get("name")) errs.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(f.get("email")))
      errs.email = "Enter a valid email address.";
    if (f.get("password").length < 8)
      errs.password = "Use at least 8 characters.";
    if (f.get("password") !== f.get("confirm"))
      errs.confirm = "Passwords do not match.";
    if (!f.get("terms")) errs.terms = "Please accept the terms to continue.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      nav("/verify-email");
    }, 800);
  };
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start free — upgrade only if you want premium signals."
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Full name" error={errors.name}>
          <Input
            name="name"
            autoComplete="name"
            placeholder="Ade Balogun"
            error={errors.name}
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email}
          />
        </Field>
        <Field
          label="Password"
          hint="At least 8 characters."
          error={errors.password}
        >
          <Input
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.password}
          />
        </Field>
        <Field label="Confirm password" error={errors.confirm}>
          <Input
            name="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirm}
          />
        </Field>
        <label className="flex items-start gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            name="terms"
            className="mt-0.5 h-5 w-5 rounded border-line accent-[#C99A2E]"
          />
          <span>
            I agree to the{" "}
            <Link to="/legal/terms" className="font-semibold text-gold">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/legal/privacy" className="font-semibold text-gold">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.terms && (
          <p className="text-xs font-medium text-danger">{errors.terms}</p>
        )}
        <Button
          type="submit"
          variant="gold"
          className="w-full"
          loading={loading}
        >
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-gold">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}

export function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    setSent(true);
  };
  return (
    <AuthShell
      title="Forgot password"
      subtitle="We'll email you a secure link to reset your password."
    >
      {sent ? (
        <Card className="p-5 text-center">
          <div className="mb-2 flex justify-center text-gold">
            <MailIcon size={32} />
          </div>
          <h2 className="mb-1 font-bold">Check your email</h2>
          <p className="mb-4 text-sm text-muted">
            If an account exists for that address, a reset link is on its way.
            The link expires in 30 minutes.
          </p>
          <Link to="/reset-password">
            <Button variant="secondary" className="w-full">
              Open reset page (prototype)
            </Button>
          </Link>
        </Card>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email">
            <Input
              type="email"
              inputMode="email"
              placeholder="you@example.com"
              required
            />
          </Field>
          <Button type="submit" variant="gold" className="w-full">
            Send reset link
          </Button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-muted">
        <Link
          to="/login"
          className="flex items-center gap-1 font-semibold text-gold"
        >
          <ArrowLeftIcon size={14} /> Back to log in
        </Link>
      </p>
    </AuthShell>
  );
}

export function ResetPassword() {
  const nav = useNavigate();
  const [done, setDone] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    setDone(true);
  };
  return (
    <AuthShell
      title="Reset password"
      subtitle="Choose a new password for your account."
    >
      {done ? (
        <Card className="p-5 text-center">
          <div className="mb-2 flex justify-center text-success">
            <CheckCircleIcon size={32} />
          </div>
          <h2 className="mb-1 font-bold">Password updated</h2>
          <p className="mb-4 text-sm text-muted">
            You can now log in with your new password.
          </p>
          <Button
            variant="gold"
            className="w-full"
            onClick={() => nav("/login")}
          >
            Go to log in
          </Button>
        </Card>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="New password" hint="At least 8 characters.">
            <Input type="password" required minLength={8} />
          </Field>
          <Field label="Confirm new password">
            <Input type="password" required />
          </Field>
          <Button type="submit" variant="gold" className="w-full">
            Update password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export function VerifyEmail() {
  const nav = useNavigate();
  return (
    <AuthShell
      title="Verify your email"
      subtitle="We sent a 6-digit code to your inbox. Enter it below to activate your account."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          nav("/onboarding");
        }}
        className="space-y-5"
      >
        <div>
          <span className="mb-1.5 block text-sm font-medium">
            Verification code
          </span>
          <div className="flex gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <input
                key={i}
                inputMode="numeric"
                maxLength={1}
                aria-label={`Digit ${i + 1}`}
                className={`${inputCls} h-14 w-12 px-0 text-center text-xl font-bold`}
                onChange={(e) =>
                  e.target.nextSibling &&
                  e.target.value &&
                  e.target.nextSibling.focus()
                }
              />
            ))}
          </div>
        </div>
        <Button type="submit" variant="gold" className="w-full">
          Verify & continue
        </Button>
        <p className="text-center text-sm text-muted">
          Didn't get it?{" "}
          <button type="button" className="font-semibold text-gold">
            Resend code
          </button>
        </p>
      </form>
    </AuthShell>
  );
}

export function Onboarding() {
  const nav = useNavigate();
  const markets = ["Forex", "Commodities", "Indices", "Crypto"];
  const [picked, setPicked] = useState(["Forex"]);
  return (
    <AuthShell
      title="Personalise your feed"
      subtitle="Optional — choose the markets you want to see first. You can change this later."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {markets.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={picked.includes(m)}
            onClick={() =>
              setPicked(
                picked.includes(m)
                  ? picked.filter((x) => x !== m)
                  : [...picked, m],
              )
            }
            className={`min-h-[44px] rounded-full px-4 text-sm font-semibold ${picked.includes(m) ? "bg-ink text-gold" : "border border-line bg-surface text-muted"}`}
          >
            {m}
          </button>
        ))}
      </div>
      <Button variant="gold" className="w-full" onClick={() => nav("/app")}>
        Continue to Cegnal
      </Button>
      <button
        className="mt-3 w-full text-sm font-semibold text-muted"
        onClick={() => nav("/app")}
      >
        Skip for now
      </button>
    </AuthShell>
  );
}
