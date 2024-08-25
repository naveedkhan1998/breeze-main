import React, { ChangeEvent, FormEvent, useState } from "react";
import { Button, Checkbox, Label, TextInput, Spinner } from "flowbite-react";
import { useAppDispatch } from "../app/hooks";
import { useRegisterUserMutation } from "../services/userAuthService";
import { storeToken } from "../services/LocalStorageService";
import { setCredentials } from "../features/authSlice";
import { toast } from "react-toastify";
import { setToken } from "../services/auth";
import { useNavigate } from "react-router-dom";
import { HiUser, HiMail, HiLockClosed } from "react-icons/hi";

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.password2) {
      toast.error("Passwords do not match");
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
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full gap-4">
      <div>
        <Label htmlFor="name" value="Full Name" className="block mb-2" />
        <TextInput id="name" type="text" icon={HiUser} placeholder="John Doe" value={formData.name} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="email" value="Email" className="block mb-2" />
        <TextInput id="email" type="email" icon={HiMail} placeholder="name@company.com" value={formData.email} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="password" value="Password" className="block mb-2" />
        <TextInput id="password" type="password" icon={HiLockClosed} placeholder="••••••••" value={formData.password} onChange={handleChange} required />
      </div>
      <div>
        <Label htmlFor="password2" value="Confirm Password" className="block mb-2" />
        <TextInput id="password2" type="password" icon={HiLockClosed} placeholder="••••••••" value={formData.password2} onChange={handleChange} required />
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="tc" checked={formData.tc} onChange={handleChange} required />
        <Label htmlFor="tc" className="flex">
          I agree with the&nbsp;
          <a href="#" className="text-cyan-600 hover:underline dark:text-cyan-500">
            terms and conditions
          </a>
        </Label>
      </div>
      <Button type="submit" className="mt-4" disabled={isLoading}>
        {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
        {isLoading ? "Registering..." : "Register new account"}
      </Button>
    </form>
  );
};

export default Registration;
