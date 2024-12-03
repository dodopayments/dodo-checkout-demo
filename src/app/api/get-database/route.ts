// app/api/get-purchases/route.ts
import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const session = await auth();
  try {
    // Verify internal request

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = session?.user?.email;
    if (!email) {
      return Response.json(
        {
          error: "Email parameter is required",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("user_purchases")
      .select("product_ids, subscription_ids")
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No records found
        return Response.json(
          {
            product_ids: [],
            subscription_ids: [],
            message: "No purchases found for this email",
          },
          { status: 200 }
        );
      }
      throw error;
    }
    return Response.json(
      {
        product_ids: data.product_ids || [],
        subscription_ids: data.subscription_ids || [],
        message: "Purchases retrieved successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to fetch purchases:", error);
    return Response.json(
      {
        error: "Failed to fetch purchases",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
