import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "react-international-phone";
import { CountrySelect } from "../ui/CountrySelect";

import "react-international-phone/style.css";
import useCartStore from "@/store/cart";

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

const CustomerPaymentForm = ({
  subscription = false,
  id,
}: {
  subscription?: boolean;
  id?: string;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const cartItems = useCartStore((state) => state.cartItems);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
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

  const createPaymentLink = async (formData: typeof formSchema._type) => {
    if (subscription) {
      try {
        const response = await fetch(
          "https://test.dev.dodopayments.com/subscriptions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer /TBByHMM+2QU/vl7.Y03k/59FeWzZx6iYIucQfGspv4sNxIml+J9Rs0kkTOHs0bUQ",
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
              product_id: id,
              quantity: 1,
              return_url: window.location.origin + "/payment-complete",
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Payment link creation failed");
        }

        const data = await response.json();
        console.log(data);
        window.location.href = data.payment_link;
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
        console.error("Payment error:", err);
      }
    } else {
      try {
        const response = await fetch(
          "https://test.dev.dodopayments.com/payments",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Bearer /TBByHMM+2QU/vl7.Y03k/59FeWzZx6iYIucQfGspv4sNxIml+J9Rs0kkTOHs0bUQ",
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
              return_url: window.location.origin + "/payment-complete",
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Payment link creation failed");
        }

        const data = await response.json();
        console.log(data);
        window.location.href = data.payment_link;
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
        console.error("Payment error:", err);
      }
    }
  };

  const onSubmit = async (data: typeof formSchema._type) => {
    setIsLoading(true);
    setError("");

    if (cartItems.length === 0 && !subscription) {
      setError("Your cart is empty");
      setIsLoading(false);
      return;
    }

    await createPaymentLink(data);
    setIsLoading(false);
  };

  return (
    <div className="lg:w-1/2 w-full p-5 mx-auto">
      <h2 className="text-2xl font-medium mb-6">Checkout Information</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Form {...useForm()}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    First Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="eg: John" />
                  </FormControl>
                  {errors.firstName && (
                    <FormMessage>{errors.firstName.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Last Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="eg: Doe" />
                  </FormControl>
                  {errors.lastName && (
                    <FormMessage>{errors.lastName.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />
          </div>

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="eg: johndoe@example.com"
                  />
                </FormControl>
                {errors.email && (
                  <FormMessage>{errors.email.message}</FormMessage>
                )}
              </FormItem>
            )}
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

            <Controller
              name="addressLine"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Street Address <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="eg: 364 Kent St" />
                  </FormControl>
                  {errors.addressLine && (
                    <FormMessage>{errors.addressLine.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      City <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="eg: Sydney" />
                    </FormControl>
                    {errors.city && (
                      <FormMessage>{errors.city.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      State <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="eg: NSW" />
                    </FormControl>
                    {errors.state && (
                      <FormMessage>{errors.state.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <Controller
                name="zipCode"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Zipcode <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="eg: 2035" />
                    </FormControl>
                    {errors.zipCode && (
                      <FormMessage>{errors.zipCode.message}</FormMessage>
                    )}
                  </FormItem>
                )}
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
                      onChange={(phone) => field.onChange(phone)}
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
