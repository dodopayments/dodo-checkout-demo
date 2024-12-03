import { WebhookPayload } from "@/types/api-types";
import { DatabaseService } from "./db";

export async function handleSubscription(email: string, payload: WebhookPayload) {
    const { data: existingRecord, error: fetchError } =
      await DatabaseService.getUserPurchases(email);
  
    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }
  
    const subscriptionDetail = {
      activated_at: new Date().toISOString(),
      payment_frequency_interval: payload.data.payment_frequency_interval!,
      product_id: payload.data.product_id!,
      subscription_id: payload.data.subscription_id!,
    };
  
    if (existingRecord) {
      const updatedSubscriptions = [
        ...(existingRecord.subscription_ids || []),
        subscriptionDetail,
      ];
  
      await DatabaseService.updatePurchaseRecord(email, {
        subscription_ids: updatedSubscriptions,
      });
    } else {
      await DatabaseService.createPurchaseRecord(email, {
        product_ids: [],
        subscription_ids: [subscriptionDetail],
      });
    }
  }
  
  export async function handleOneTimePayment(email: string, payload: WebhookPayload) {
    const { data: existingRecord, error: fetchError } =
      await DatabaseService.getUserPurchases(email);
  
    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }
  
    const productIds = payload.data.product_cart!.map(
      (product) => product.product_id
    );
  
    if (existingRecord) {
      const updatedProducts = [
        ...(existingRecord.product_ids || []),
        ...productIds,
      ];
  
      await DatabaseService.updatePurchaseRecord(email, {
        product_ids: [...new Set(updatedProducts)],
      });
    } else {
      await DatabaseService.createPurchaseRecord(email, {
        product_ids: productIds,
        subscription_ids: [],
      });
    }
  }
  