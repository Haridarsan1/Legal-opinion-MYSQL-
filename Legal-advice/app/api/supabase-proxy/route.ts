import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
    try {
        const body = await req.json();
        const { tableName, operation, selectFields, whereClause, data, isSingle, orderClause, limitCount } = body;

                const query = (await __getSupabaseClient()).from(tableName);

        // The query object is our server-side PostgresShimQueryBuilder
        const builder = query as any;
        builder.operation = operation;
        builder.selectFields = selectFields || [];
        builder.whereClause = whereClause || {};
        builder.data = data;
        builder.isSingle = isSingle || false;
        builder.orderClause = orderClause || [];
        builder.limitCount = limitCount || null;

        const result = await builder.execute();
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Proxy Error:', error);
        return NextResponse.json({ data: null, error: error.message || 'Server proxy error' }, { status: 500 });
    }
}


// Auto-injected to fix missing supabase client declarations
const __getSupabaseClient = async () => {
  if (typeof window === 'undefined') {
    const m = await import('@/lib/supabase/server');
    return await m.createClient();
  } else {
    const m = await import('@/lib/supabase/client');
    return m.createClient();
  }
};
