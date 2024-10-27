"use client";

import useAuth from "./useAuth";

export const AuthProvider = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  useAuth();
  return <>{children}</>;
};
