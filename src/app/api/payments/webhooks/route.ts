import { Webhook } from "standardwebhooks";
import { headers } from "next/headers";
import { logger } from "@/lib/logger";
import { WebhookPayload } from "@/types/api-types";
import {
  handleOneTimePayment,
  handleSubscription,
  updateSubscriptionInDatabase,
} from "@/lib/api-functions";

const webhook = new Webhook(process.env.NEXT_PUBLIC_DODO_WEBHOOK_KEY!);

export async function POST(request: Request) {
  const headersList = await headers();

  try {
    const rawBody = await request.text();
    logger.info("Received webhook request", { rawBody });

    const webhookHeaders = {
      "webhook-id": headersList.get("webhook-id") || "",
      "webhook-signature": headersList.get("webhook-signature") || "",
      "webhook-timestamp": headersList.get("webhook-timestamp") || "",
    };

    await webhook.verify(rawBody, webhookHeaders);
    logger.info("Webhook verified successfully");

    const payload = JSON.parse(rawBody) as WebhookPayload;

    if (!payload.data?.customer?.email) {
      throw new Error("Missing customer email in payload");
    }

    const email = payload.data.customer.email;

    if (payload.data.payload_type === "Subscription") {
      switch (payload.data.status) {
        
        case "active":
          await handleSubscription(email, payload);
          break;

        default:
          await updateSubscriptionInDatabase(
            email,
            payload.data.subscription_id!
          );
          break;
      }
    } else if (
      payload.data.payload_type === "Payment" &&
      payload.type === "payment.succeeded" &&
      !payload.data.subscription_id
    ) {
      await handleOneTimePayment(email, payload);
    }

    return Response.json(
      { message: "Webhook processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Webhook processing failed", error);
    return Response.json(
      {
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}
