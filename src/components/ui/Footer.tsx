// Footer.js
import React from "react";

const Footer = () => {
  return (
    <footer className="flex w-full px-3  flex-col items-center gap-2 py-4">
      <div className="flex w-full items-center justify-center lg:justify-between ">
        <img alt="dodopayments logo" src="/dodo_logo.svg" />

        <div className="lg:flex hidden items-center gap-2 text-text-primary font-normal text-[13px]">
          <a
            href="https://dodopayments.com/terms-of-use"
            className="hover:no-underline underline"
          >
            Terms & Conditions
          </a>
          <a
            href="https://dodopayments.com/privacy"
            className="hover:no-underline underline"
          >
            Privacy Policy
          </a>
        </div>
      </div>
      <p className="text-text-secondary w-full font-normal text-center lg:text-start text-[13px] leading-5">
        This order process is conducted by our online reseller & Merchant of
        Record, <strong>Dodo Payments</strong>, who also handles order-related
        inquiries and returns.
      </p>
      <div className="flex lg:hidden items-center gap-2 text-text-primary font-normal text-[13px]">
        <a
          href="https://dodopayments.com/terms-of-use"
          className="hover:no-underline underline"
        >
          Terms & Conditions
        </a>
        <a
          href="https://dodopayments.com/privacy-policy"
          className="hover:no-underline underline"
        >
          Privacy Policy
        </a>
      </div>
    </footer>
  );
};

export default Footer;
