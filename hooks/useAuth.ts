import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useAuth(requireAuth = true) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && status === "unauthenticated") {
      router.push("/auth/sign-in");
    }
  }, [status, requireAuth, router]);

  return {
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    user: session?.user,
    accessToken: session?.accessToken,
  };
}

export function useRequireAuth() {
  return useAuth(true);
}