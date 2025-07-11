import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

const AuthPage = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [openReset, setOpenReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  const navigate = useNavigate();

  // Auto redirect user if already logged in
  React.useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email || !password || (!isLogin && (!username || !phone))) {
      setErrorMsg(
        isLogin
          ? "Please enter both email and password."
          : "Please enter email, password, username, and phone number."
      );
      return;
    }
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) setErrorMsg(error.message);
    } else {
      const { error } = await signUp(email, password);
      if (error) setErrorMsg(error.message);
      else {
        // Get the user id from Supabase after signup
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const profile: TablesInsert<'user_profiles'> = {
            user_id: user.id,
            email,
            username,
          };
          // Optionally add phone if you want to store it in user_profiles (if schema allows)
          // @ts-ignore
          if (phone) profile.phone = phone;
          await supabase.from('user_profiles').insert(profile);
        }
        setErrorMsg("Signup successful, check your email to confirm your account.");
      }
    }
  };

  // Forgot Password: Supabase implementation
  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      if (!resetEmail) {
        toast({
          title: "Email required",
          description: "Please enter your email address."
        });
        setResetLoading(false);
        return;
      }
      // Dynamically import supabase to avoid circular imports
      const { supabase } = await import("@/integrations/supabase/client");
      // Construct the redirect URL to the app after successful reset
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`
      });
      if (error) {
        toast({
          title: "Error sending reset link",
          description: error.message
        });
      } else {
        toast({
          title: "Reset email sent",
          description: "Please check your email for a password reset link."
        });
        setOpenReset(false);
        setResetEmail("");
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "An error occurred."
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-fuchsia-800 to-pink-600">
      <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl border border-pink-200/20 p-8 max-w-md w-full">
        <h2 className="text-3xl font-extrabold text-pink-300 mb-2 text-center">
          {isLogin ? "Sign In" : "Sign Up"}
        </h2>
        <p className="text-pink-100 text-center mb-6">
          Access Employee CRM – {isLogin ? "Please login to your account" : "Create a new account"}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            {!isLogin && (
              <>
                <Input
                  placeholder="Username"
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="mb-2"
                  disabled={loading}
                />
                <Input
                  placeholder="Phone Number"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="mb-2"
                  disabled={loading}
                />
              </>
            )}
            <Input
              placeholder="Email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mb-2"
              disabled={loading}
            />
            <Input
              placeholder="Password"
              type="password"
              name="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="mb-2"
              disabled={loading}
            />
            {isLogin && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-pink-200 hover:underline mt-1"
                  onClick={() => setOpenReset(true)}
                  tabIndex={-1}
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>
          {errorMsg && (
            <div className="text-center text-sm text-red-400">{errorMsg}</div>
          )}
          <Button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-700 text-white font-bold"
            disabled={loading}
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          {isLogin ? (
            <>
              New here?{" "}
              <button
                className="text-pink-100 underline hover:text-pink-200"
                onClick={() => {
                  setIsLogin(false); setErrorMsg("");
                }}
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="text-pink-100 underline hover:text-pink-200"
                onClick={() => {
                  setIsLogin(true); setErrorMsg("");
                }}
              >
                Sign in here
              </button>
            </>
          )}
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={openReset} onOpenChange={setOpenReset}>
        <DialogContent className="bg-fuchsia-900/95 text-white border-pink-300/20">
          <DialogHeader>
            <DialogTitle className="text-pink-200">Forgot password?</DialogTitle>
            <DialogDescription className="text-pink-100">
              Enter your email address to receive a password reset link.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetRequest} className="space-y-4">
            <Input
              type="email"
              placeholder="Your email"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              autoFocus
              disabled={resetLoading}
            />
            {/* Improved footer button alignment */}
            <DialogFooter className="flex-row space-y-0 space-x-2">
              <Button
                type="submit"
                className="w-full bg-pink-500 hover:bg-pink-700 text-white font-bold"
                disabled={resetLoading}
              >
                {resetLoading ? "Sending..." : "Send Reset Link"}
              </Button>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-pink-400 text-pink-200 hover:bg-pink-950 hover:text-white"
                >
                  Cancel
                </Button>
              </DialogClose>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthPage;
