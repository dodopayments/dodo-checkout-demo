import { createClient } from "@supabase/supabase-js";
import { SubscriptionDetails } from "@/types/api-types";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class DatabaseService {
  static async getUserPurchases(email: string) {
    const { data, error } = await supabase
      .from("user_purchases")
      .select("product_ids, subscription_ids")
      .eq("email", email)
      .single();

    return { data, error };
  }

  static async updatePurchaseRecord(
    email: string,
    updates: {
      product_ids?: string[];
      subscription_ids?: SubscriptionDetails[];
    }
  ) {
    const { data, error } = await supabase
      .from("user_purchases")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email)
      .select();

    return { data, error };
  }

  static async createPurchaseRecord(
    email: string,
    record: {
      product_ids: string[];
      subscription_ids: SubscriptionDetails[];
    }
  ) {
    const { data, error } = await supabase
      .from("user_purchases")
      .insert([
        {
          email,
          ...record,
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    return { data, error };
  }
}
