import { NextRequest, NextResponse } from "next/server";
import { API_KEY } from "@/constants/apis";
import { SubscriptionDetails } from "@/types/api-types";
import { DatabaseService } from "@/lib/db";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  try {
    // Parse and validate request body
    const body = await req.json();
    const email = session?.user?.email;
    const subscriptionId = body.subscriptionId;
    
    // Step 1: Cancel subscription via API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DODO_TEST_API}/subscriptions/${subscriptionId}`,
      {
        method: "PATCH",
        headers: {  
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          status: "cancelled",
        }),
      }
    );
    console.log("response", response);
    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to cancel subscription",
          details: await response.text(),
        },
        { status: response.status }
      );
    }

    // Step 2: Update database records
    const { data: userPurchases, error: fetchError } =
      await DatabaseService.getUserPurchases(email!);

    if (fetchError) {
      return NextResponse.json(
        {
          error: "Failed to fetch user purchases",
          details: fetchError.message,
        },
        { status: 500 }
      );
    }

    if (!userPurchases) {
      return NextResponse.json(
        { error: "No purchase records found for user" },
        { status: 404 }
      );
    }

    const parsedPurchases = userPurchases?.subscription_ids.map((id: string) => JSON.parse(id)) ?? []
    // Filter out the cancelled subscription
    const updatedSubscriptions = (
      parsedPurchases as SubscriptionDetails[]
    ).filter((sub) => sub.subscription_id !== subscriptionId);

    console.log("updatedSubscriptions", updatedSubscriptions);
    // Update the database with the new subscription list
    const { error: updateError } = await DatabaseService.updatePurchaseRecord(
      email!,
      {
        subscription_ids: updatedSubscriptions,
      }
    );

    if (updateError) {
      return NextResponse.json(
        {
          error: "Failed to update purchase record",
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subscription cancelled and database updated successfully",
    });
  } catch (error) {
    console.error("Error during subscription cancellation:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
