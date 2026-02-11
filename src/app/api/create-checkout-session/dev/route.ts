import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const mode: "test" | "live" = body.mode;
    let isLocal = false;
    if (body.local !== undefined) {
      isLocal = body.local;
    }

    // Get theme from query parameter, default to "light" if not provided or invalid
    const themeParam = request.nextUrl.searchParams.get("theme");
    const theme = themeParam === "dark" ? "dark" : "light";

    let bearerToken;
    if (mode === "test") {
      bearerToken = process.env.DODO_PAYMENTS_DEV_TEST_API_KEY;
    } else {
      bearerToken = process.env.DODO_PAYMENTS_DEV_LIVE_API_KEY;
    }
    if (!bearerToken) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Build payload according to Create Checkout Session
    const payload: Record<string, unknown> = {
      product_cart: body.product_cart,
      return_url: body.return_url || `${appUrl}/pricing`,
      redirect_url: body.redirect_url,
      ...(body.confirm !== undefined && { confirm: body.confirm }),
      ...(body.customer !== undefined && { customer: body.customer }),
      ...(body.billing_address !== undefined && { billing_address: body.billing_address }),
      ...(body.minimal_address !== undefined && { minimal_address: body.minimal_address }),
      customization: { force_language: "en", theme },
      feature_flags: {
        redirect_immediately: true,
      },
    };

    const response = await fetch(
      `https://${mode}.dodopayments.tech/checkouts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${bearerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to create checkout session",
          details: json,
          status: response.status,
          message:
            json?.message ||
            json?.error ||
            "Unknown error from payment provider",
        },
        { status: response.status }
      );
    }
    console.log("json", json);

    return NextResponse.json({
      success: true,
      checkout_url: isLocal ? `http://localhost:3000/session/${json.session_id}` : json.checkout_url,
      session_id: json.session_id,
      mode,
    });
  } catch (error) {
    console.error("Checkout session creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
