/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormItem, FormLabel } from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { PhoneInput } from "react-international-phone";
import { CountrySelect } from "../ui/CountrySelector/CountrySelect";

import useCartStore from "@/lib/store/cart";
import { useToast } from "@/hooks/use-toast";
import { RETURN_URL } from "@/constants/apis";
import "react-international-phone/style.css";
import { createPaymentLink, PaymentServiceError } from "@/lib/create-payment";
import { TextInputField } from "../ui/FormTextInput";

// Common Text Input Component

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  addressLine: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  zipCode: z.string().min(5, "Zip code must be at least 5 characters"),
  phoneNumber: z.string().optional(),
  state: z.string().min(2, "State must be at least 2 characters"),
});

type FormData = z.infer<typeof formSchema>;

const CustomerPaymentForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const cartItems = useCartStore((state) => state.cartItems);
  const [phoneInputMeta, setPhoneInputMeta] = useState<{
    country: any;
    inputValue: string;
  } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: "US",
      firstName: "",
      lastName: "",
      email: "",
      addressLine: "",
      city: "",
      state: "",
      zipCode: "",
      phoneNumber: "",
    },
  });

  const { control, handleSubmit } = form;

  const validatePhoneNumber = (phoneNumber: string | undefined) => {
    if (!phoneNumber || !phoneInputMeta) return true;

    const phoneValue = phoneInputMeta.inputValue;
    const hasOnlyCountryCode =
      phoneValue.trim() === `+${phoneInputMeta.country.dialCode}`;

    if (hasOnlyCountryCode) return true;

    return phoneValue.length >= phoneInputMeta.country.format.length;
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError("");

      if (cartItems.length === 0) {
        throw new Error("Your cart is empty");
      }

      if (!validatePhoneNumber(data.phoneNumber)) {
        toast({
          title: "Error",
          description: "Please enter a complete phone number",
        });
        return;
      }

      const paymentData = {
        billing: {
          city: data.city,
          country: data.country,
          state: data.state,
          street: data.addressLine,
          zipcode: parseInt(data.zipCode),
        },
        customer: {
          email: data.email,
          name: `${data.firstName} ${data.lastName}`,
          phone_number: data.phoneNumber || undefined,
        },
        payment_link: true,
        product_cart: cartItems.map((id) => ({
          product_id: id,
          quantity: 1,
        })),
        return_url: RETURN_URL || "",
      };

      const response = await createPaymentLink(paymentData);
      window.location.href = response.payment_link;
    } catch (err) {
      const errorMessage =
        err instanceof PaymentServiceError
          ? err.message
          : err instanceof Error
          ? err.message
          : "An unknown error occurred";

      setError(errorMessage);
      console.error("Payment error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lg:w-1/2 w-full p-5 mx-auto">
      <h2 className="text-2xl font-medium mb-6">Checkout Information</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInputField
              name="firstName"
              control={control}
              label="First Name"
              placeholder="eg: John"
              required
            />

            <TextInputField
              name="lastName"
              control={control}
              label="Last Name"
              placeholder="eg: Doe"
              required
            />
          </div>

          <TextInputField
            name="email"
            control={control}
            label="Email"
            type="email"
            placeholder="eg: johndoe@example.com"
            required
          />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Billing Address</h3>

            <div>
              <CountrySelect
                control={control}
                name="country"
                label="Country"
                placeholder="Please select a country"
                required
                className="mb-4"
              />
            </div>

            <TextInputField
              name="addressLine"
              control={control}
              label="Street Address"
              placeholder="eg: 364 Kent St"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextInputField
                name="city"
                control={control}
                label="City"
                placeholder="eg: Sydney"
                required
              />

              <TextInputField
                name="state"
                control={control}
                label="State"
                placeholder="eg: NSW"
                required
              />

              <TextInputField
                name="zipCode"
                control={control}
                label="Zipcode"
                placeholder="eg: 2035"
                required
              />
            </div>

            <Controller
              name="phoneNumber"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (optional)</FormLabel>
                  <FormControl>
                    <PhoneInput
                      value={field.value}
                      onChange={(phone, meta) => {
                        field.onChange(phone);
                        setPhoneInputMeta(meta);
                      }}
                      defaultCountry="us"
                      countrySelectorStyleProps={{
                        buttonClassName:
                          "border border-input px-2 bg-background hover:bg-accent",
                      }}
                      inputProps={{
                        className:
                          "flex h-9 w-full rounded-r-md border border-input bg-background px-3 py-2 text-sm",
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Continue to Payment"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CustomerPaymentForm;
