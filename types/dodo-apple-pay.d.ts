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

    /** Rows above the total, naming what the buyer is paying for on a one-time
     *  charge. A subscription names its product through `applePayRecurring`
     *  instead. Amounts must add up to the authorized total, or the whole list
     *  is dropped. */
    applePayLineItems?: Array<{
      label: string;
      /** Omit on a single row and the authorized total is used. Required from
       *  two rows up. */
      amount?: string;
    }>;

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
