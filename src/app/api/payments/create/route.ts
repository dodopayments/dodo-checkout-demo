
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
  cartItems: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const { formData, cartItems } = paymentRequestSchema.parse(body);

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
      product_cart: cartItems.map((id) => ({
        product_id: id,
        quantity: 1,
      })),
      return_url: process.env.NEXT_PUBLIC_RETURN_URL,
    })

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
