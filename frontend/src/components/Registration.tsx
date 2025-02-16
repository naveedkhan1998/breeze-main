import React, { useState, useEffect } from "react";
import { useAppDispatch } from "../app/hooks";
import { useRegisterUserMutation } from "../services/userAuthService";
import { storeToken } from "../services/LocalStorageService";
import { setCredentials } from "../features/authSlice";
import { toast } from "react-toastify";
import { setToken } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "./ui/alert";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Card } from "./ui/card";
import { AlertCircle, Lock, Mail, User, Loader, Eye, EyeOff, CheckCircle2, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormData {
  name: string;
  email: string;
  password: string;
  password2: string;
  tc: boolean;
}

interface Token {
  access: string;
  refresh: string;
}

interface ValidationState {
  name: boolean | null;
  email: boolean | null;
  password: boolean | null;
  passwordMatch: boolean | null;
}

const Registration: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterUserMutation();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    password2: "",
    tc: false,
  });

  const [validation, setValidation] = useState<ValidationState>({
    name: null,
    email: null,
    password: null,
    passwordMatch: null,
  });

  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation functions
  const validateName = (name: string) => {
    return name.length >= 2 && /^[a-zA-Z]+(?: [a-zA-Z]+)*$/.test(name);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, message: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const messages = ["Weak", "Fair", "Good", "Strong"];
    return {
      strength,
      message: messages[strength - 1] || "",
      color: strength <= 1 ? "red" : strength === 2 ? "yellow" : strength === 3 ? "blue" : "green",
    };
  };

  // Real-time validation
  useEffect(() => {
    if (formData.name) {
      setValidation((prev) => ({ ...prev, name: validateName(formData.name) }));
    }
    if (formData.email) {
      setValidation((prev) => ({ ...prev, email: validateEmail(formData.email) }));
    }
    if (formData.password) {
      setValidation((prev) => ({ ...prev, password: validatePassword(formData.password) }));
    }
    if (formData.password && formData.password2) {
      setValidation((prev) => ({ ...prev, passwordMatch: formData.password === formData.password2 }));
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all fields
    if (!validateName(formData.name)) {
      setError("Please enter a valid full name");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!validatePassword(formData.password)) {
      setError("Password does not meet security requirements");
      return;
    }

    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.tc) {
      setError("Please accept the terms and conditions");
      return;
    }

    try {
      const res = await registerUser(formData).unwrap();
      const token: Token = res.token;
      setToken(token.access);
      storeToken({ value: { access: token.access } });
      dispatch(setCredentials({ access: token.access }));
      toast.success("Welcome! Your account has been created successfully");
      navigate("/");
    } catch {
      setError("Registration failed. Please try again.");
      toast.error("Registration failed. Please try again.");
    }
  };

  const togglePasswordVisibility = (field: "password" | "password2") => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <Card className="w-full p-6 space-y-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {error && (
          <Alert variant="destructive" className="animate-shake">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              required
              className={cn(
                "pl-10 pr-10 transition-all duration-200",
                error && validation.name === false && "border-red-500 focus-visible:ring-red-500",
                validation.name && "border-green-500 focus-visible:ring-green-500"
              )}
            />
            <User className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            {formData.name && (
              <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                {validation.name ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
              </div>
            )}
          </div>
        </div>

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
                error && validation.email === false && "border-red-500 focus-visible:ring-red-500",
                validation.email && "border-green-500 focus-visible:ring-green-500"
              )}
            />
            <Mail className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            {formData.email && (
              <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                {validation.email ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
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
                error && validation.password === false && "border-red-500 focus-visible:ring-red-500",
                validation.password && "border-green-500 focus-visible:ring-green-500"
              )}
            />
            <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <Button type="button" variant="ghost" size="sm" className="absolute transform -translate-y-1/2 right-1 top-1/2" onClick={() => togglePasswordVisibility("password")}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          {formData.password && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className={cn("h-1 flex-1 rounded-full transition-all duration-300", index < passwordStrength.strength ? `bg-${passwordStrength.color}-500` : "bg-gray-200")} />
                ))}
                <span className="text-xs text-gray-500">{passwordStrength.message}</span>
              </div>
              <div className="space-y-1 text-xs text-gray-500">
                <div className={cn("flex items-center gap-2", formData.password.length >= 8 ? "text-green-500" : "text-gray-500")}>
                  <CheckCircle2 className="w-3 h-3" />
                  Minimum 8 characters
                </div>
                <div className={cn("flex items-center gap-2", /[A-Z]/.test(formData.password) ? "text-green-500" : "text-gray-500")}>
                  <CheckCircle2 className="w-3 h-3" />
                  One uppercase letter
                </div>
                <div className={cn("flex items-center gap-2", /[0-9]/.test(formData.password) ? "text-green-500" : "text-gray-500")}>
                  <CheckCircle2 className="w-3 h-3" />
                  One number
                </div>
                <div className={cn("flex items-center gap-2", /[^A-Za-z0-9]/.test(formData.password) ? "text-green-500" : "text-gray-500")}>
                  <CheckCircle2 className="w-3 h-3" />
                  One special character
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password2">Confirm Password</Label>
          <div className="relative">
            <Input
              id="password2"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password2}
              onChange={handleChange}
              required
              className={cn(
                "pl-10 pr-10 transition-all duration-200",
                formData.password2 && !validation.passwordMatch && "border-red-500 focus-visible:ring-red-500",
                validation.passwordMatch && "border-green-500 focus-visible:ring-green-500"
              )}
            />
            <Lock className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <Button type="button" variant="ghost" size="sm" className="absolute transform -translate-y-1/2 right-1 top-1/2" onClick={() => togglePasswordVisibility("password2")}>
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          {formData.password2 && !validation.passwordMatch && <p className="text-xs text-red-500">Passwords do not match</p>}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="tc" checked={formData.tc} onCheckedChange={(checked: boolean) => setFormData((prev) => ({ ...prev, tc: checked }))} />
          <Label htmlFor="tc" className="text-sm text-gray-600 dark:text-gray-400">
            I agree with the{" "}
            <Button variant="link" className="h-auto p-0 text-blue-600 dark:text-blue-500" onClick={() => navigate("/terms")}>
              terms and conditions
            </Button>
          </Label>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !formData.tc || !validation.name || !validation.email || !validation.password || !validation.passwordMatch}
          className={cn("w-full transition-all duration-300", isLoading && "opacity-80")}
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Creating your account...
            </>
          ) : (
            "Create account"
          )}
        </Button>

        {/* Registration progress indicators */}
        <div className="grid grid-cols-4 gap-2 pt-4">
          <div className={cn("h-1 rounded-full transition-all duration-300", validation.name ? "bg-green-500" : "bg-gray-200")} />
          <div className={cn("h-1 rounded-full transition-all duration-300", validation.email ? "bg-green-500" : "bg-gray-200")} />
          <div className={cn("h-1 rounded-full transition-all duration-300", validation.password ? "bg-green-500" : "bg-gray-200")} />
          <div className={cn("h-1 rounded-full transition-all duration-300", validation.passwordMatch ? "bg-green-500" : "bg-gray-200")} />
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Info className="w-4 h-4" />
          <p>All fields must be valid to create account</p>
        </div>
      </form>
    </Card>
  );
};

export default Registration;
