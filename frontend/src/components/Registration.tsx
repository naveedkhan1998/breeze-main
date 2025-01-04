import React, { ChangeEvent, FormEvent, useState } from "react";
import { useAppDispatch } from "../app/hooks";
import { useRegisterUserMutation } from "../services/userAuthService";
import { storeToken } from "../services/LocalStorageService";
import { setCredentials } from "../features/authSlice";
import { toast } from "react-toastify";
import { setToken } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { Alert } from "./ui/alert";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

import { AlertCircle, Lock, Mail, User, Loader } from "lucide-react";
import { Checkbox } from "./ui/checkbox";

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

  const handleChange = (e: ChangeEvent<HTMLInputElement> | boolean, id?: string) => {
    if (typeof e === "boolean" && id) {
      // Handle checkbox
      setFormData((prevData) => ({
        ...prevData,
        [id]: e,
      }));
    } else if (typeof e !== "boolean") {
      // Handle regular input
      const { id, value, type, checked } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [id]: type === "checkbox" ? checked : value,
      }));
    }
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
      {error && (
        <Alert variant="destructive" className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </Alert>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Full Name</Label>
        <div className="relative">
          <Input id="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
          <User className="absolute text-gray-400 right-3 top-2" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Input id="email" type="email" placeholder="name@company.com" value={formData.email} onChange={handleChange} required />
          <Mail className="absolute text-gray-400 right-3 top-2" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
          <Lock className="absolute text-gray-400 right-3 top-2" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password2">Confirm Password</Label>
        <div className="relative">
          <Input id="password2" type="password" placeholder="••••••••" value={formData.password2} onChange={handleChange} required />
          <Lock className="absolute text-gray-400 right-3 top-2" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="tc" checked={formData.tc} onCheckedChange={(checked: boolean) => handleChange(checked, "tc")} />
        <Label htmlFor="tc" className="flex">
          I agree with the&nbsp;
          <a href="#" className="text-cyan-600 hover:underline dark:text-cyan-500">
            terms and conditions
          </a>
        </Label>
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader className="w-5 h-5 mr-2 animate-spin" />}
        {isLoading ? "Registering..." : "Register new account"}
      </Button>
    </form>
  );
};

export default Registration;
