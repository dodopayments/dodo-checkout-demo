export type OneTimeProduct = {
    product_id: string;
    quantity: number;
  };
  
  export type SubscriptionDetails = {
    activated_at: string;
    subscription_id: string;
    payment_frequency_interval: 'Day' | 'Week' | 'Month' | 'Year';
    product_id: string;
  };
  
  export type WebhookPayload = {
    type: string;
    data: {
      status?: 'pending' | 'active' | 'on_hold' | 'paused' | 'cancelled' | 'failed' | 'expired';
      payload_type: string;
      customer: {
        email: string;
      };
      product_id?: string;
      subscription_id?: string;
      product_cart?: OneTimeProduct[];
      payment_frequency_interval?: 'Day' | 'Week' | 'Month' | 'Year';
    };
  };
  
  
export interface UpdateSubscriptionResult {
  success: boolean;
  error?: {
    message: string;
    status: number;
  };
}