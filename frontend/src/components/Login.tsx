import React, { useState, useEffect } from "react";
import { useLoginUserMutation } from "../services/userAuthService";
import { useAppDispatch } from "../app/hooks";
import { setCredentials } from "../features/authSlice";
import { storeToken } from "../services/LocalStorageService";
import { setToken } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Mail,
  Lock,
  AlertCircle,
  Loader,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { cn } from "@/lib/utils";

interface FormData {
  email: string;
  password: string;
}

interface Token {
  access: string;
  refresh: string;
}

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loginUser, { isLoading }] = useLoginUserMutation();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validEmail, setValidEmail] = useState<boolean | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  // Email validation
  useEffect(() => {
    if (formData.email) {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
      setValidEmail(isValid);
    } else {
      setValidEmail(null);
    }
  }, [formData.email]);

  // Password strength indicator
  const getPasswordStrength = (
    password: string,
  ): { strength: number; message: string } => {
    if (!password) return { strength: 0, message: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const messages = ["Weak", "Fair", "Good", "Strong"];

    return { strength, message: messages[strength - 1] || "" };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Prevent brute force attempts
    if (attemptCount >= 5) {
      setError("Too many failed attempts. Please try again later.");
      toast.error("Account temporarily locked. Please try again later.");
      return;
    }

    try {
      const res = await loginUser(formData).unwrap();
      const token: Token = res.token;

      setToken(token.access);
      if (rememberMe) {
        storeToken({ value: { access: token.access } });
      }
      dispatch(setCredentials({ access: token.access }));

      toast.success("Welcome back!");
      navigate("/");
    } catch {
      setAttemptCount((prev) => prev + 1);
      setError("Invalid credentials. Please try again.");
      toast.error("Login failed. Please check your credentials.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <Card className="w-full p-6 space-y-6 transition-all duration-300">
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {error && (
          <Alert variant="destructive" className="animate-shake">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="name@company.com"
              value={formData.email}
              onChange={handleChange}
              required
              className={cn(
                "pl-10 pr-10 transition-all duration-200",
                error && "border-red-500 focus-visible:ring-red-500",
                validEmail === true &&
                  "border-green-500 focus-visible:ring-green-500",
              )}
            />
            <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            {formData.email && (
              <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                {validEmail ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className={cn(
                "pl-10 pr-10 transition-all duration-200",
                error && "border-red-500 focus-visible:ring-red-500",
              )}
            />
            <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute transform -translate-y-1/2 right-1 top-1/2"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span className="sr-only">
                {showPassword ? "Hide password" : "Show password"}
              </span>
            </Button>
          </div>
          {formData.password && (
            <div className="flex items-center mt-2 space-x-2">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-all duration-300",
                    index < passwordStrength.strength
                      ? index < 2
                        ? "bg-red-500"
                        : index < 3
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      : "bg-gray-200",
                  )}
                />
              ))}
              <span className="text-xs text-gray-500">
                {passwordStrength.message}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <Label
              htmlFor="remember-me"
              className="text-sm text-gray-600 dark:text-gray-400"
            >
              Remember me
            </Label>
          </div>
          <Button
            variant="ghost"
            className="p-0 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-500"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </Button>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !validEmail}
          className={cn(
            "w-full transition-all duration-300",
            isLoading && "opacity-80",
          )}
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </Card>
  );
};

export default Login;
