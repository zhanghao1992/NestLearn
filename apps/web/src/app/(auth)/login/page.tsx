'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginSchema, type LoginInput } from '@/lib/validations';
import { loginUser } from '@/lib/auth-api';

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setServerError('');
    try {
      await loginUser(data);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : '登录失败');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-white p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">登录 TaskFlow</h1>
          <p className="text-sm text-gray-500">输入邮箱和密码继续</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">邮箱</label>
            <Input type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">密码</label>
            <Input type="password" placeholder="••••••" {...register('password')} />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {serverError && <p className="rounded-md bg-red-50 p-2 text-xs text-red-600">{serverError}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? '登录中...' : '登录'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          还没有账号？{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:underline">
            注册
          </Link>
        </p>
      </div>
    </main>
  );
}
