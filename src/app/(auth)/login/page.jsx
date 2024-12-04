import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { signIn } from "@/auth";

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
              await signIn("google", { redirectTo: "/my-account" });
            }}
          >
            <Button
              variant="outline"
              className="w-full hover:bg-neutral-50 transition-colors"
              type="submit"
            >
              <div className="flex items-center justify-center">
                <Image
                  src="/icons/GoogleIcon.svg"
                  alt="Google Logo"
                  width={20}
                  height={20}
                  className="mr-2"
                />
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
