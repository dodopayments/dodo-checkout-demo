
import { auth } from '@/auth';
import { DatabaseService } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET() {
  const session = await auth();

  try {
    if (!session?.user?.email) {
      return Response.json(
        { error: 'Unauthorized - Email required' },
        { status: 401 }
      );
    }

    const { data, error } = await DatabaseService.getUserPurchases(session.user.email);

    if (error) {
      if (error.code === 'PGRST116') {
        return Response.json(
          {
            product_ids: [],
            subscription_ids: [],
            message: 'No purchases found',
          },
          { status: 200 }
        );
      }
      throw error;
    }

    return Response.json(
      {
        product_ids: data?.product_ids || [],
        subscription_ids: data?.subscription_ids || [],
        message: 'Purchases retrieved successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    logger.error('Failed to fetch purchases', error);
    return Response.json(
      {
        error: 'Failed to fetch purchases',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}