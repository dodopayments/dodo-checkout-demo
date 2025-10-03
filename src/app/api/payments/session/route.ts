import { dodopayments } from "@/lib/dodopayments";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, redirectUrl } = body;

    const response = await dodopayments.checkoutSessions.create({
      product_cart: [
        {
          product_id: productId,
          quantity: 1,
        },
      ],
      return_url: redirectUrl,
    });

    return NextResponse.json({ checkout_url: response.checkout_url });
  } catch (err) {
    console.error("Checkout session creation failed", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
