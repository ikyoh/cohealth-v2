"use client";
import { useGetIRI } from "@/hooks/useQuery";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const UserProvider = ({ children }: { children: React.ReactNode }) => {

  const { data: user, isLoading, isError } = useGetIRI("/current_user");
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.replace('/signin');
      return;
    }

    if (user?.onboardingCompleted === false) {
      router.replace('/onboarding');
    }
  }, [isError, isLoading, router, user]);


  if (isLoading || !user || user.onboardingCompleted === false) return (
    <div className="bg-muted flex min-h-svh items-center justify-center p-6 md:p-10">
      <Image
        src="/icon-cohealth.svg"
        alt="CoHealth Logo"
        width={50}
        height={50}
        className="animate-pulse"
      />
    </div>
  )

  return (children)

};

export default UserProvider;
