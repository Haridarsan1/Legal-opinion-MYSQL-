class ClientPostgresShimQueryBuilder {
    private tableName: string;
    private operation: 'select' | 'insert' | 'update' | 'delete' = 'select';
    private selectFields: string[] = [];
    private whereClause: any = {};
    private orClause: any[] = [];
    private countMode: 'exact' | 'planned' | 'estimated' | null = null;
    private headOnly = false;
    private data: any = null;
    private isSingle = false;
    private orderClause: any[] = [];
    private limitCount: number | null = null;
    private offsetCount: number | null = null;

    constructor(tableName: string) {
        this.tableName = tableName;
    }

    select(fields: string = '*', options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }) {
        this.operation = 'select';
        if (fields !== '*') {
            this.selectFields = fields.split(',').map(f => f.trim());
        }
        if (options?.count) {
            this.countMode = options.count;
        }
        if (options?.head) {
            this.headOnly = options.head;
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

    not(column: string, operator: string, value: any) {
        if (operator === 'is' && value === null) {
            this.whereClause[column] = { not: null };
            return this;
        }

        if (operator === 'eq') {
            this.whereClause[column] = { not: value };
            return this;
        }

        this.whereClause[column] = { not: value };
        return this;
    }

    ilike(column: string, value: string) {
        const normalized = value.replace(/^%|%$/g, '');
        this.whereClause[column] = { contains: normalized };
        return this;
    }

    or(filter: string) {
        const clauses = filter
            .split(',')
            .map((segment) => segment.trim())
            .filter(Boolean)
            .map((segment) => this.parseFilterSegment(segment));

        this.orClause.push(...clauses.filter(Boolean));
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

    range(from: number, to: number) {
        this.offsetCount = from;
        this.limitCount = to - from + 1;
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
                    orClause: this.orClause,
                    countMode: this.countMode,
                    headOnly: this.headOnly,
                    data: this.data,
                    isSingle: this.isSingle,
                    orderClause: this.orderClause,
                    limitCount: this.limitCount,
                    offsetCount: this.offsetCount
                })
            });
            const result = await response.json();
            resolve(result);
        } catch (e) {
            if (reject) reject({ data: null, error: e });
            else resolve({ data: null, error: e });
        }
    }

    private parseFilterSegment(segment: string) {
        const [column, operator, ...rest] = segment.split('.');
        const rawValue = rest.join('.');

        if (!column || !operator) return null;

        if (operator === 'eq') {
            return { [column]: this.parseValue(rawValue) };
        }

        if (operator === 'ilike') {
            return { [column]: { contains: rawValue.replace(/^%|%$/g, '') } };
        }

        if (operator === 'cs') {
            const parsed = this.parseSet(rawValue);
            return { [column]: { array_contains: parsed } };
        }

        if (operator === 'in') {
            const parsed = this.parseList(rawValue);
            return { [column]: { in: parsed } };
        }

        if (operator === 'is' && rawValue === 'null') {
            return { [column]: null };
        }

        return null;
    }

    private parseValue(value: string) {
        if (value === 'null') return null;
        if (value === 'true') return true;
        if (value === 'false') return false;
        const numeric = Number(value);
        if (!Number.isNaN(numeric) && value.trim() !== '') return numeric;
        return value;
    }

    private parseSet(value: string) {
        if (value.startsWith('{') && value.endsWith('}')) {
            const inner = value.slice(1, -1);
            return inner.split(',').map((item) => item.trim()).filter(Boolean);
        }
        return [value];
    }

    private parseList(value: string) {
        if (value.startsWith('(') && value.endsWith(')')) {
            const inner = value.slice(1, -1);
            return inner.split(',').map((item) => this.parseValue(item.trim()));
        }
        return value.split(',').map((item) => this.parseValue(item.trim()));
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
