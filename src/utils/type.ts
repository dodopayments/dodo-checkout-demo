export type PaymentDetails = {
    CreateSubscriptionRequest?: {
      billing: {
        city: string;
        country: string;
        state: string;
        street: string;
        zipcode: number;
      };
      customer: {
        email: string;
        name: string;
      };
      payment_link: boolean;
      product_id: string;
      quantity: number;
      return_url: string | null;
    };
    CreateOneTimePaymentRequest?: {
      billing: {
        city: string;
        country: string;
        state: string;
        street: string;
        zipcode: number;
      };
      customer: {
        email: string;
        name: string;
      };
      payment_link: boolean;
      product_cart: {
        product_id: string;
        quantity: number;
      }[];
      return_url: string | null;
    };
  };