export type ApplePayCheckoutKind =
  | "subscription"
  | "credit-based"
  | "prepaid-credits"
  | "special-download";

export type ApplePayBillingFrequency = "monthly" | "annually";

interface ApplePayRecurringOptions {
  label: string;
  managementUrl: string;
  billingAgreement?: string;
  intervalUnit?: "year" | "month" | "day" | "hour" | "minute";
  intervalCount?: number;
}

export interface ApplePayCheckoutOptions {
  merchantName: string;
  applePayButtonType: "buy" | "subscribe";
  applePayRecurring?: ApplePayRecurringOptions;
}

const MERCHANT_NAME = "Atlas Studio";

const RECURRING_LABELS: Record<
  Extract<ApplePayCheckoutKind, "subscription" | "credit-based">,
  string
> = {
  subscription: "Unlimited Pro",
  "credit-based": "25 AI credits",
};

function getManagementUrl() {
  if (typeof window !== "undefined" && window.location.origin) {
    return `${window.location.origin}/dashboard`;
  }
  return "https://atlas.dodopayments.com/dashboard";
}

function getInterval(
  billingFrequency: ApplePayBillingFrequency = "monthly"
): Pick<ApplePayRecurringOptions, "intervalUnit" | "intervalCount"> {
  if (billingFrequency === "annually") {
    return { intervalUnit: "year", intervalCount: 1 };
  }
  return { intervalUnit: "month", intervalCount: 1 };
}

/**
 * Apple Pay branding options for Dodo Checkout.
 * Set these when opening checkout — they cannot be changed later.
 */
export function getApplePayCheckoutOptions(
  kind: ApplePayCheckoutKind = "prepaid-credits",
  billingFrequency: ApplePayBillingFrequency = "monthly"
): ApplePayCheckoutOptions {
  const isRecurring = kind === "subscription" || kind === "credit-based";

  if (!isRecurring) {
    return {
      merchantName: MERCHANT_NAME,
      applePayButtonType: "buy",
    };
  }

  const label = RECURRING_LABELS[kind];
  const { intervalUnit, intervalCount } = getInterval(billingFrequency);

  return {
    merchantName: MERCHANT_NAME,
    applePayButtonType: "subscribe",
    applePayRecurring: {
      label,
      managementUrl: getManagementUrl(),
      billingAgreement:
        "By subscribing, you authorize Atlas Studio to charge you according to the terms until you cancel.",
      intervalUnit,
      intervalCount,
    },
  };
}

export function parseApplePayCheckoutKind(
  value: string | null | undefined
): ApplePayCheckoutKind {
  switch (value) {
    case "subscription":
    case "credit-based":
    case "prepaid-credits":
    case "special-download":
      return value;
    default:
      return "prepaid-credits";
  }
}

export function parseApplePayBillingFrequency(
  value: string | null | undefined
): ApplePayBillingFrequency {
  return value === "annually" ? "annually" : "monthly";
}
