// app/api/payments/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const paymentRequestSchema = z.object({
  formData: z.object({
    city: z.string(),
    country: z.string(),
    state: z.string(),
    addressLine: z.string(),
    zipCode: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    phoneNumber: z.string().optional(),
  }),
  cartItems: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const { formData, cartItems } = paymentRequestSchema.parse(body);

    const response = await fetch(`${process.env.NEXT_PUBLIC_DODO_TEST_API}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_DODO_API_KEY}`,
      },
      body: JSON.stringify({
        billing: {
          city: formData.city,
          country: formData.country,
          state: formData.state,
          street: formData.addressLine,
          zipcode: parseInt(formData.zipCode),
        },
        customer: {
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          phone_number: formData.phoneNumber || undefined,
        },
        payment_link: true,
        product_cart: cartItems.map((id) => ({
          product_id: id,
          quantity: 1,
        })),
        return_url: process.env.NEXT_PUBLIC_RETURN_URL,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        { error: "Payment link creation failed", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ paymentLink: data.payment_link });
  } catch (err) {
    console.error("Payment error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
