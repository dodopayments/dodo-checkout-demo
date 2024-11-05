"use client";
import { signout } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LogoutPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await signout();
      } catch (err) {
        setError("Failed to logout. Please try again.");
        console.error(err);
      }
    };

    handleLogout();
  }, []);

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => router.push("/")}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="animate-pulse">Signing out...</div>
    </div>
  );
};

export default LogoutPage;