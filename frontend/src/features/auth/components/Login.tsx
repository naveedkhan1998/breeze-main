import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppDispatch } from 'src/app/hooks';
import { useLoginUserMutation } from '@/api/userAuthService';
import { setToken } from '@/api/auth';
import { storeToken } from '@/api/localStorageService';
import { setCredentials } from '../authSlice';
import { Loader2 } from 'lucide-react';

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
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({ ...prevData, [id]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError('Please fill in both fields.');
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

      toast.success('Welcome back!');
      navigate('/');
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'data' in error && typeof error.data === 'object' && error.data !== null && 'detail' in error.data) {
        setError(error.data.detail as string);
        toast.error(error.data.detail as string);
      } else {
        setError('Invalid credentials. Please try again.');
        toast.error('Login failed. Please check your credentials.');
      }
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@company.com"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-me"
            checked={rememberMe}
            onCheckedChange={checked => setRememberMe(checked as boolean)}
            disabled={isLoading}
          />
          <Label htmlFor="remember-me" className="text-sm font-normal">
            Remember me
          </Label>
        </div>
        <Button
          variant="link"
          className="h-auto p-0 text-sm"
          onClick={() => navigate('/forgot-password')}
          type="button"
        >
          Forgot password?
        </Button>
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Log in
      </Button>
    </form>
  );
};

export default Login;
