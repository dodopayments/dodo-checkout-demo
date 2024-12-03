export interface SubscriptionPlan {
    id: string;
    title: string;
    price: number;
    image: {
      src: string;
      width: string;
    };
    features: string[];
    imagePosition: string;
  }
  
  export interface SubscriptionProduct {
    activated_at: string;
    payment_frequency_interval: string;
    subscription_id: string;
    product_id: string;
  }
  
  export interface Item {
    id: string;
    title: string;
    imageSrc: string;
  }