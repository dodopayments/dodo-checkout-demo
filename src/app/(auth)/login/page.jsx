import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { signIn } from "@/auth";

const GoogleIcon = () => (
  <svg
    className="w-5 h-5 mr-2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const LoginPage = () => {
  return (
    <div className="flex-1 flex items-center h-[70vh] lg:h-full justify-center gap-8 p-4 md:p-8">
      <div className="hidden md:block w-1/2 max-w-2xl">
        <Image
          src="/books/stack/Yearly.webp"
          alt="Yearly Subscription"
          width={1920}
          height={1080}
          className="w-full h-auto object-cover rounded-lg "
        />
      </div>

      <Card className="w-full max-w-sm border-0 shadow-lg">
        <CardHeader className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-display">
            Sign In/Sign up to your account
          </h1>
          <p className="text-sm text-muted-foreground hidden">
            Sign in or create an account to continue
          </p>
        </CardHeader>

        <CardContent>
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <Button
              variant="outline"
              className="w-full hover:bg-neutral-50 transition-colors"
              type="submit"
            >
              <div className="flex items-center justify-center">
                <GoogleIcon />
                Continue with Google
              </div>
            </Button>
          </form>
        </CardContent>

        <CardFooter className="text-center hidden">
          <p className="text-sm text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
