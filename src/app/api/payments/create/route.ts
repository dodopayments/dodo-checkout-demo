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

    // Check if we have subscription items (only one allowed)
    if (subscriptionItems.length > 0) {
      // For subscription items, we only process the first one
      const subscriptionId = subscriptionItems[0];
      
      const response = await dodopayments.payments.create({
        billing: {
          city: formData.city,
          country: formData.country as CountryCode ,
          state: formData.state,
          street: formData.addressLine,
          zipcode: (formData.zipCode),
        },
        customer: {
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
        },
        payment_link: true,
        product_cart: [{
          product_id: subscriptionId,
          quantity: 1,
        }],
        return_url: process.env.NEXT_PUBLIC_RETURN_URL,
      })

      return NextResponse.json({ paymentLink: response.payment_link });
    } else if (oneTimeItems.length > 0) {
      // For one-time items, process all of them
      const response = await dodopayments.payments.create({
        billing: {
          city: formData.city,
          country: formData.country as CountryCode ,
          state: formData.state,
          street: formData.addressLine,
          zipcode: (formData.zipCode),
        },
        customer: {
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
        },
        payment_link: true,
        product_cart: oneTimeItems.map((id) => ({
          product_id: id,
          quantity: 1,
        })),
        return_url: process.env.NEXT_PUBLIC_RETURN_URL,
      })

      return NextResponse.json({ paymentLink: response.payment_link });
    } else {
      return NextResponse.json(
        { error: "No items in cart" },
        { status: 400 }
      );
    }
    
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