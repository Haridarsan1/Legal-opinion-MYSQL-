class ClientPostgresShimQueryBuilder {
    private tableName: string;
    private operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
    private selectFields: string[] = [];
    private whereClause: any = {};
    private data: any = null;
    private isSingle = false;
    private orderClause: any[] = [];
    private limitCount: number | null = null;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    select(fields: string = '*') {
        this.operation = 'select';
        if (fields !== '*') {
            this.selectFields = fields.split(',').map(f => f.trim());
        }
        return this;
    }

    insert(data: any | any[]) {
        this.operation = 'insert';
        this.data = data;
        return this;
    }

    update(data: any) {
        this.operation = 'update';
        this.data = data;
        return this;
    }

    delete() {
        this.operation = 'delete';
        return this;
    }

    eq(column: string, value: any) {
        this.whereClause[column] = value;
        return this;
    }

    neq(column: string, value: any) {
        this.whereClause[column] = { not: value };
        return this;
    }

    in(column: string, values: any[]) {
        this.whereClause[column] = { in: values };
        return this;
    }

    contains(column: string, value: any) {
        this.whereClause[column] = { array_contains: value };
        return this;
    }

    order(column: string, options?: { ascending?: boolean }) {
        const direction = options?.ascending === false ? 'desc' : 'asc';
        this.orderClause.push({ [column]: direction });
        return this;
    }

    limit(count: number) {
        this.limitCount = count;
        return this;
    }

    single() {
        this.isSingle = true;
        return this;
    }

    maybeSingle() {
        this.isSingle = true;
        return this;
    }

    async then(resolve: any, reject: any) {
        try {
            const response = await fetch('/api/supabase-proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tableName: this.tableName,
                    operation: this.operation,
                    selectFields: this.selectFields,
                    whereClause: this.whereClause,
                    data: this.data,
                    isSingle: this.isSingle,
                    orderClause: this.orderClause,
                    limitCount: this.limitCount
                })
            });
            const result = await response.json();
            resolve(result);
        } catch (e) {
            if (reject) reject({ data: null, error: e });
            else resolve({ data: null, error: e });
        }
    }
}

export const createBrowserClient = (): any => {
    return {
        auth: {
            async getUser() {
                const res = await fetch('/api/auth/session');
                const session = await res.json();
                return { data: { user: session?.user || null }, error: null };
            },
            async getSession() {
                const res = await fetch('/api/auth/session');
                const session = await res.json();
                return { data: { session }, error: null };
            }
        },
        from(tableName: string) {
            return new ClientPostgresShimQueryBuilder(tableName);
        },
        storage: {
            from(bucket: string) {
                return {
                    upload: async (path: string, file: any) => ({ data: { path }, error: null }),
                    getPublicUrl: (path: string) => ({ data: { publicUrl: '/placeholder.pdf' } }),
                    download: async (path: string) => ({ data: new Blob(), error: null })
                }
            }
        }
    };
};

export default createBrowserClient;
