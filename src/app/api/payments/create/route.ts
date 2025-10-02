import { dodopayments } from "@/lib/dodopayments";
import { CountryCode } from "dodopayments/resources/misc.mjs";
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
  }),
  oneTimeItems: z.array(z.string()),
  subscriptionItems: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const { formData, oneTimeItems, subscriptionItems } = paymentRequestSchema.parse(body);

    // Handle mixed carts: include both subscription and one-time items
    // If there are subscription items, include the first one along with all one-time items
    // If no subscription items, just process one-time items
    const productCart = [
      // Add the first subscription item if it exists
      ...(subscriptionItems.length > 0 ? [{ product_id: subscriptionItems[0], quantity: 1 }] : []),
      // Add all one-time items
      ...oneTimeItems.map((id) => ({ product_id: id, quantity: 1 })),
    ];

    // If no items in cart, return error
    if (productCart.length === 0) {
      return NextResponse.json(
        { error: "No items in cart" },
        { status: 400 }
      );
    }

    // Create payment with combined product cart
    const response = await dodopayments.payments.create({
      billing: {
        city: formData.city,
        country: formData.country as CountryCode,
        state: formData.state,
        street: formData.addressLine,
        zipcode: formData.zipCode,
      },
      customer: {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
      },
      payment_link: true,
      product_cart: productCart,
      return_url: process.env.NEXT_PUBLIC_RETURN_URL,
    });

    return NextResponse.json({ paymentLink: response.payment_link });
    
  } catch (err) {
    console.error("Payment link creation failed", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}