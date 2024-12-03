import { API_KEY, PUBLIC_API } from "@/constants/apis";

export interface BillingDetails {
  city: string;
  country: string;
  state: string;
  street: string;
  zipcode: number;
}

export interface CustomerDetails {
  email: string;
  name: string;
  phone_number?: string;
}

export interface PaymentLinkRequest {
  billing: BillingDetails;
  customer: CustomerDetails;
  payment_link: boolean;
  product_cart: Array<{
    product_id: string;
    quantity: number;
  }>;
  return_url: string;
}

export class PaymentServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PaymentServiceError';
  }
}

export const createPaymentLink = async (request: PaymentLinkRequest): Promise<{ payment_link: string }> => {
  const response = await fetch(`${PUBLIC_API}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new PaymentServiceError("Payment link creation failed");
  }

  return response.json();
};