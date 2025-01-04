import React, { ChangeEvent, FormEvent, useState } from "react";
import { useLoginUserMutation } from "../services/userAuthService";
import { useAppDispatch } from "../app/hooks";
import { setCredentials } from "../features/authSlice";
import { storeToken } from "../services/LocalStorageService";
import { toast } from "react-toastify";
import { setToken } from "../services/auth";
import { useNavigate } from "react-router-dom";

import { Mail, Lock, AlertCircle, Loader } from "lucide-react";
import { Alert } from "./ui/alert";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
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

  return (
    <form className="flex flex-col w-full gap-4" onSubmit={handleSubmit}>
      {error && (
        <Alert variant="destructive" className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </Alert>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Input id="email" type="email" placeholder="name@company.com" value={formData.email} onChange={handleChange} required className={error ? "border-red-500" : ""} />
          <Mail className="absolute text-gray-400 right-3 top-2" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className={error ? "border-red-500" : ""} />
          <Lock className="absolute text-gray-400 right-3 top-2" />
        </div>
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader className="w-5 h-5 mr-2 animate-spin" />}
        {isLoading ? "Logging in..." : "Log in"}
      </Button>
      <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
        Forgot your password?{" "}
        <a href="#" className="text-blue-600 hover:underline dark:text-blue-500">
          Reset it here
        </a>
      </p>
    </form>
  );
};

export default Login;
