import React, { useState } from "react";
import { useLoginUserMutation } from "../services/userAuthService";
import { useAppDispatch } from "../app/hooks";
import { setCredentials } from "../features/authSlice";
import { storeToken } from "../services/LocalStorageService";
import { setToken } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail, Lock, AlertCircle, Loader, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await loginUser(formData).unwrap();
      const token: Token = res.token;
      setToken(token.access);
      storeToken({ value: { access: token.access } });
      dispatch(setCredentials({ access: token.access }));
      toast.success("Logged In Successfully");
      navigate("/");
    } catch {
      setError("Login failed. Please check your credentials.");
      toast.error("Login failed. Please check your credentials.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form className="flex flex-col w-full gap-6" onSubmit={handleSubmit}>
      {error && (
        <Alert variant="destructive">
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
          <Button type="button" variant="ghost" size="sm" className="absolute w-8 h-8 p-0 right-1 top-1" onClick={togglePasswordVisibility}>
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
          </Button>
        </div>
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader className="w-5 h-5 mr-2 animate-spin" />}
        {isLoading ? "Logging in..." : "Log in"}
      </Button>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input id="remember-me" name="remember-me" type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
          <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-600 dark:text-gray-400">
            Remember me
          </label>
        </div>
        <div className="text-sm">
          <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-500">
            Forgot your password?
          </a>
        </div>
      </div>
    </form>
  );
};

export default Login;
