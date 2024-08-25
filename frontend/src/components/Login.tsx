import React, { ChangeEvent, FormEvent, useState } from "react";
import { Button, TextInput, Label, Spinner } from "flowbite-react";
import { useLoginUserMutation } from "../services/userAuthService";
import { useAppDispatch } from "../app/hooks";
import { setCredentials } from "../features/authSlice";
import { storeToken } from "../services/LocalStorageService";
import { toast } from "react-toastify";
import { setToken } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { HiMail, HiLockClosed } from "react-icons/hi";

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await loginUser(formData).unwrap();
      const token: Token = res.token;
      setToken(token.access);
      storeToken({ value: { access: token.access } });
      dispatch(setCredentials({ access: token.access }));
      toast.success("Logged In Successfully");
      navigate("/");
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    }
  };

  return (
    <form className="flex flex-col w-full gap-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="email" value="Email" className="block mb-2" />
        <TextInput id="email" type="email" icon={HiMail} placeholder="name@company.com" value={formData.email} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="password" value="Password" className="block mb-2" />
        <TextInput id="password" type="password" icon={HiLockClosed} placeholder="••••••••" value={formData.password} onChange={handleChange} required />
      </div>
      <Button type="submit" className="mt-4" disabled={isLoading}>
        {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
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
