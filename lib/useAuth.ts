import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const useAuth = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const sessionToken = localStorage.getItem("sessionToken");

    if (!sessionToken) {
      if (!pathname.startsWith("/auth")) {
        router.replace("/auth");
      }
      return;
    }

    if (sessionToken && pathname.startsWith("/auth")) {
      router.replace("/");
    }
  }, [router, pathname]);
};

export default useAuth;
