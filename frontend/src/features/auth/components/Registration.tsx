import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppDispatch } from 'src/app/hooks';
import { useRegisterUserMutation } from '@/api/userAuthService';
import { setToken } from '@/api/auth';
import { storeToken } from '@/api/localStorageService';
import { setCredentials } from '../authSlice';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = () => {
    let strength = 0;
    if (password.length < 1) return 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getStrength();

  return (
    <div className="flex items-center w-full gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1 rounded-full flex-1 transition-colors',
            i < strength
              ? strength === 1
                ? 'bg-red-500'
                : strength === 2
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              : 'bg-muted'
          )}
        />
      ))}
    </div>
  );
};

const Registration: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterUserMutation();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    password2: '',
    tc: false,
  });

  const [error, setError] = useState<string | null>(null);

  const passwordsMatch = formData.password === formData.password2;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.password2) {
      setError('Passwords do not match.');
      return;
    }
    if (!formData.tc) {
      setError('You must agree to the terms and conditions.');
      return;
    }

    try {
      const { name, email, password, password2, tc } = formData;
      const res = await registerUser({
        name,
        email,
        password,
        password2,
        tc,
      }).unwrap();
      const token: Token = res.token;
      setToken(token.access);
      storeToken({ value: { access: token.access } });
      dispatch(setCredentials({ access: token.access }));
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'data' in error && typeof error.data === 'object' && error.data !== null && 'detail' in error.data) {
        setError(error.data.detail as string);
        toast.error(error.data.detail as string);
      } else {
        setError('Registration failed. Please try again.');
        toast.error('Registration failed. An account with this email may already exist.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>
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
        <PasswordStrength password={formData.password} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password2">Confirm Password</Label>
        <Input
          id="password2"
          type="password"
          placeholder="••••••••"
          value={formData.password2}
          onChange={handleChange}
          required
          disabled={isLoading}
          className={cn(
            !passwordsMatch && formData.password2 ? 'border-destructive' : ''
          )}
        />
        {!passwordsMatch && formData.password2 ? (
          <p className="text-sm text-destructive">Passwords do not match.</p>
        ) : null}
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="tc"
          checked={formData.tc}
          onCheckedChange={(checked: boolean) =>
            setFormData(prev => ({ ...prev, tc: checked }))
          }
          disabled={isLoading}
        />
        <Label htmlFor="tc" className="text-sm font-normal">
          I agree to the{' '}
          <Button
            variant="link"
            className="h-auto p-0 text-sm"
            onClick={() => navigate('/terms')}
            type="button"
          >
            terms and conditions
          </Button>
        </Label>
      </div>
      <Button
        type="submit"
        disabled={
          isLoading || !passwordsMatch || !formData.tc || !formData.password
        }
        className="w-full"
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Create account
      </Button>
    </form>
  );
};

export default Registration;
