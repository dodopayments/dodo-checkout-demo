import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type OneTimeProduct = {
  product_id: string;
  quantity: number;
};

type UpdateDatabaseParams = {
  customer_email: string;
  type: "OneTime" | "Subscription";
  OneTimeProducts?: OneTimeProduct[];
  subscriptionProduct?: string;
  activated_at?: string;
  payment_frequency_interval?: "Day" | "Week" | "Month" | "Year";
};

export async function UpdateDatabase({
  customer_email,
  OneTimeProducts,
  type,
  activated_at,
  payment_frequency_interval,
  subscriptionProduct,
}: UpdateDatabaseParams) {
  try {
    const paymentDetails = {
      type,
      product_ids: OneTimeProducts
        ? OneTimeProducts.map((product) => product.product_id)
        : undefined,
      subscription_id: subscriptionProduct,
    };
    console.log("Payment details:", paymentDetails);
    const { data: existingRecord, error: fetchError } = await supabase
      .from("user_purchases")
      .select("*")
      .eq("email", customer_email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (existingRecord) {
      const updateData =
        paymentDetails.type === "Subscription"
          ? {
              subscription_ids: [
                ...new Set([
                  ...(existingRecord.subscription_ids || []),
                  {
                    activated_at,
                    payment_frequency_interval,
                    product_id: subscriptionProduct,
                  },
                ]),
              ],
              updated_at: new Date().toISOString(),
            }
          : {
              product_ids: [
                ...new Set([
                  ...(existingRecord.product_ids || []),
                  ...(paymentDetails.product_ids || []),
                ]),
              ],
              updated_at: new Date().toISOString(),
            };

      const { data, error } = await supabase
        .from("user_purchases")
        .update(updateData)
        .eq("email", customer_email)
        .select();

      if (error) throw error;
      return Response.json(
        {
          message:
            paymentDetails.type === "Subscription"
              ? "Subscription added"
              : "Product added",
          data,
        },
        { status: 200 }
      );
    } else {
      const newRecord = {
        email: customer_email,
        product_ids:
          paymentDetails.type === "Subscription"
            ? []
            : paymentDetails.product_ids
            ? [...paymentDetails.product_ids]
            : [],
        subscription_ids:
          paymentDetails.type === "Subscription"
            ? [
                {
                  activated_at,
                  payment_frequency_interval,
                  product_id: subscriptionProduct,
                },
              ]
            : [],
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("user_purchases")
        .insert([newRecord])
        .select();

      if (error) throw error;
      return Response.json(
        {
          message: "Purchase record created",
          data,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Payment processing failed:", error);
    return Response.json(
      {
        error: "Failed to process payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
