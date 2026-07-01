'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { registerSchema, type RegisterInput } from '@/lib/validations';
import { registerUser } from '@/lib/auth-api';

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setServerError('');
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        name: data.name,
      });
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : '注册失败');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-white p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold">创建账号</h1>
          <p className="text-sm text-gray-500">加入 TaskFlow 开始协作</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">用户名</label>
            <Input placeholder="你的名字" {...register('name')} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">邮箱</label>
            <Input type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">密码</label>
            <Input type="password" placeholder="至少 6 位" {...register('password')} />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">确认密码</label>
            <Input type="password" placeholder="再次输入密码" {...register('confirmPassword')} />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {serverError && <p className="rounded-md bg-red-50 p-2 text-xs text-red-600">{serverError}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? '注册中...' : '注册'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          已有账号？{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            登录
          </Link>
        </p>
      </div>
    </main>
  );
}
