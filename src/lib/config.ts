export const config = {
    supabase: {
      url: process.env.SUPABASE_URL!,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    },
    webhook: {
      key: process.env.NEXT_PUBLIC_DODO_WEBHOOK_KEY!,
    },
  } as const;