import { UpdateSubscriptionResult, WebhookPayload } from "@/types/api-types";
import { SubscriptionDetails } from "@/types/api-types";
import { DatabaseService } from "./db";

export async function handleSubscription(
  email: string,
  payload: WebhookPayload
) {
  const { data: existingRecord, error: fetchError } =
    await DatabaseService.getUserPurchases(email);

  if (fetchError && fetchError.code !== "PGRST116") {
    throw fetchError;
  }

  let subscriptionDetail;
  if ("payment_frequency_interval" in payload.data) {
    subscriptionDetail = {
      activated_at: new Date().toISOString(),
      payment_frequency_interval: payload.data.payment_frequency_interval,
      product_id: payload.data.product_id!,
      subscription_id: payload.data.subscription_id!,
    };
  } else {
    throw new Error("Invalid payload data for subscription");
  }

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

export async function handleOneTimePayment(
  email: string,
  payload: WebhookPayload
) {
  const { data: existingRecord, error: fetchError } =
    await DatabaseService.getUserPurchases(email);

  if (fetchError && fetchError.code !== "PGRST116") {
    throw fetchError;
  }

  let productIds: string[] = [];
  if ("product_cart" in payload.data && payload.data.product_cart) {
    productIds = payload.data.product_cart.map((product) => product.product_id);
  } else {
    throw new Error("Invalid payload data for one-time payment");
  }

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

export async function updateSubscriptionInDatabase(
  email: string,
  subscriptionId: string
): Promise<UpdateSubscriptionResult> {
  try {
    // Fetch current purchases
    const { data: userPurchases, error: fetchError } =
      await DatabaseService.getUserPurchases(email);

    if (fetchError) {
      return {
        success: false,
        error: {
          message: "Failed to fetch user purchases",
          status: 500,
        },
      };
    }

    if (!userPurchases) {
      return {
        success: false,
        error: {
          message: "No purchase records found for user",
          status: 404,
        },
      };
    }

    const parsedPurchases =
      userPurchases?.subscription_ids.map((id: string) => JSON.parse(id)) ?? [];

    // Filter out the cancelled subscription
    const updatedSubscriptions = (
      parsedPurchases as SubscriptionDetails[]
    ).filter((sub) => sub.subscription_id !== subscriptionId);

    // Update the database
    const { error: updateError } = await DatabaseService.updatePurchaseRecord(
      email,
      {
        subscription_ids: updatedSubscriptions,
      }
    );

    if (updateError) {
      return {
        success: false,
        error: {
          message: "Failed to update purchase record",
          status: 500,
        },
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating subscription in database:", error);
    return {
      success: false,
      error: {
        message: "Internal server error",
        status: 500,
      },
    };
  }
}
