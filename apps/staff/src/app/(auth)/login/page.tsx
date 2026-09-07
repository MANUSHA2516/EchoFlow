import { Suspense } from 'react';
import { LoginScreen } from '@/components/auth-screens';

export default function LoginPage() {
  return <Suspense><LoginScreen /></Suspense>;
}
