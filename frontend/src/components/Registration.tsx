import React, { useState } from "react";
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
import { AlertCircle, Lock, Mail, User, Loader, Eye, EyeOff } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: type === "checkbox" ? checked : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await registerUser(formData).unwrap();
      const token: Token = res.token;
      setToken(token.access);
      storeToken({ value: { access: token.access } });
      dispatch(setCredentials({ access: token.access }));
      toast.success("Registration successful");
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <div className="relative">
          <Input id="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleChange} required className={cn("pl-10", error && "border-red-500 focus-visible:ring-red-500")} />
          <User className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
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
            className={cn("pl-10", error && "border-red-500 focus-visible:ring-red-500")}
          />
          <Mail className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
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
            className={cn("pl-10 pr-10", error && "border-red-500 focus-visible:ring-red-500")}
          />
          <Lock className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
          <Button type="button" variant="ghost" size="sm" className="absolute w-8 h-8 p-0 right-1 top-1" onClick={() => togglePasswordVisibility("password")}>
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
          </Button>
        </div>
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
            className={cn("pl-10 pr-10", error && "border-red-500 focus-visible:ring-red-500")}
          />
          <Lock className="absolute w-5 h-5 text-gray-400 left-3 top-3" />
          <Button type="button" variant="ghost" size="sm" className="absolute w-8 h-8 p-0 right-1 top-1" onClick={() => togglePasswordVisibility("password2")}>
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="sr-only">{showConfirmPassword ? "Hide confirm password" : "Show confirm password"}</span>
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="tc" checked={formData.tc} onCheckedChange={(checked: boolean) => setFormData((prev) => ({ ...prev, tc: checked }))} />
        <Label htmlFor="tc" className="text-sm text-gray-600 dark:text-gray-400">
          I agree with the{" "}
          <a href="#" className="text-blue-600 hover:underline dark:text-blue-500">
            terms and conditions
          </a>
        </Label>
      </div>
      <Button type="submit" disabled={isLoading || !formData.tc} className="w-full">
        {isLoading && <Loader className="w-5 h-5 mr-2 animate-spin" />}
        {isLoading ? "Registering..." : "Register new account"}
      </Button>
    </form>
  );
};

export default Registration;
