
import { SignOut } from "@phosphor-icons/react/dist/ssr";
import { signOut } from "next-auth/react";
import React from "react";

const SignoutButton = () => {
  return (
    <form
      action={async () => {
        await signOut();
      }}
    >
      <button
        type="submit"
        className="text-red-500 flex items-center gap-1 hover:text-red-400"
      >
        Sign out
        <SignOut />
      </button>
    </form>
  );
};

export default SignoutButton;
