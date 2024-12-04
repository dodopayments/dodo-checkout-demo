import { auth } from "@/auth";
import { updateSubscriptionInDatabase } from "@/lib/api-functions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  try {
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
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_DODO_API_KEY}`,
        },
        body: JSON.stringify({
          status: "cancelled",
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to cancel subscription",
          details: await response.text(),
        },
        { status: response.status }
      );
    }

    // Step 2: Update database
    const result = await updateSubscriptionInDatabase(email!, subscriptionId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error?.message },
        { status: result.error?.status }
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
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}