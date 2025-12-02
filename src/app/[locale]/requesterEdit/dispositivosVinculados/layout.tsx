'use client';

import { AuthProvider } from '../../../lib/hooks/usoAutentificacion';

export default function HU7Layout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
