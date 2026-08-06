declare module "dodopayments-checkout" {
  interface CheckoutOptions {
    merchantName?: string;

    applePayButtonType?:
      | "plain"
      | "buy"
      | "set-up"
      | "donate"
      | "check-out"
      | "book"
      | "subscribe"
      | "reload"
      | "add-money"
      | "top-up"
      | "order"
      | "rent"
      | "support"
      | "contribute"
      | "tip";

    applePayRecurring?: {
      label: string;
      managementUrl: string;
      description?: string;
      billingAgreement?: string;
      intervalUnit?: "year" | "month" | "day" | "hour" | "minute";
      intervalCount?: number;
    };
  }
}

export {};
