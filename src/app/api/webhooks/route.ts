import { Webhook } from "standardwebhooks";
import { headers } from "next/headers";
import { UpdateDatabase } from "@/lib/api/update-database";

export async function POST(request: Request) {
  const wh = new Webhook(process.env.NEXT_PUBLIC_DODO_WEBHOOK_KEY!);
  const headersList = headers();

  try {
    console.log("Received webhook request");

    const rawBody = await request.text();
    console.log("Raw body:", rawBody);

    const headers = {
      "webhook-id": headersList.get("webhook-id") || "",
      "webhook-signature": headersList.get("webhook-signature") || "",
      "webhook-timestamp": headersList.get("webhook-timestamp") || "",
    };
    console.log("Headers:", headers);

    await wh.verify(rawBody, headers);
    console.log("Webhook verified successfully");

    const payload = JSON.parse(rawBody);
    console.log("Parsed payload:", payload);

    {
      console.log("Payment succeeded, forwarding to payment processing route");

      if (
        payload.data.payload_type === "Subscription" &&
        payload.type === "subscription.active"
      ) {
        UpdateDatabase({
          customer_email: payload.data.customer.email,
          type: "Subscription",
          subscriptionProduct: payload.data.product_id,
          activated_at: new Date().toISOString(),
          payment_frequency_interval: payload.data.payment_frequency_interval,
        });
      } else if (
        payload.data.payload_type === "Payment" &&
        payload.type === "payment.succeeded"
      ) {
        UpdateDatabase({
          customer_email: payload.data.customer.email,
          type: "OneTime",
          OneTimeProducts: payload.data.product_cart,
        });
      } else {
        return Response.json(
          { message: "Webhook received and processed successfully" },
          { status: 200 }
        );
      }
    }

    return Response.json(
      { message: "Webhook received and processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook processing failed:", error);
    return Response.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
