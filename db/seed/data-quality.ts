import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../backend/.env' });

const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'scct',
    password: process.env.DB_PASSWORD || 'scct_password',
    database: process.env.DB_NAME || 'scct_db',
});

async function runDataQualityChecks() {
    await client.connect();
    console.log('Connected to DB. Starting Data Quality Checks...');

    const checks = [
        // Completeness
        {
            name: 'Orders: null customer_id',
            type: 'COMPLETENESS',
            table: 'fact_orders',
            threshold: 1, // < 1%
            query: `SELECT 
                      (COUNT(*) FILTER (WHERE customer_id IS NULL) * 100.0) / NULLIF(COUNT(*), 0) as pct,
                      COUNT(*) FILTER (WHERE customer_id IS NULL) as fail_count
                    FROM analytics.fact_orders`
        },
        {
            name: 'Orders: null product_id',
            type: 'COMPLETENESS',
            table: 'fact_orders',
            threshold: 1,
            query: `SELECT 
                      (COUNT(*) FILTER (WHERE product_id IS NULL) * 100.0) / NULLIF(COUNT(*), 0) as pct,
                      COUNT(*) FILTER (WHERE product_id IS NULL) as fail_count
                    FROM analytics.fact_orders`
        },
        {
            name: 'Shipments: null carrier_id',
            type: 'COMPLETENESS',
            table: 'fact_shipments',
            threshold: 1,
            query: `SELECT 
                      (COUNT(*) FILTER (WHERE carrier_id IS NULL) * 100.0) / NULLIF(COUNT(*), 0) as pct,
                      COUNT(*) FILTER (WHERE carrier_id IS NULL) as fail_count
                    FROM analytics.fact_shipments`
        },
        {
            name: 'Inventory: negative on_hand',
            type: 'COMPLETENESS',
            table: 'fact_inventory_snapshot',
            threshold: 0,
            query: `SELECT 
                      COUNT(*) FILTER (WHERE on_hand_qty < 0) as pct, 
                      COUNT(*) FILTER (WHERE on_hand_qty < 0) as fail_count 
                    FROM analytics.fact_inventory_snapshot`
        },
        {
            name: 'Production: schedule_adherence > 1',
            type: 'COMPLETENESS',
            table: 'fact_production',
            threshold: 0.5,
            query: `SELECT 
                      (COUNT(*) FILTER (WHERE actual_qty > scheduled_qty) * 100.0) / NULLIF(COUNT(*), 0) as pct,
                      COUNT(*) FILTER (WHERE actual_qty > scheduled_qty) as fail_count
                    FROM analytics.fact_production`
        },
        {
            name: 'Forecast: null actual_qty past',
            type: 'COMPLETENESS',
            table: 'fact_forecast',
            threshold: 10,
            query: `SELECT 
                      (COUNT(*) FILTER (WHERE actual_qty IS NULL) * 100.0) / NULLIF(COUNT(*), 0) as pct,
                      COUNT(*) FILTER (WHERE actual_qty IS NULL) as fail_count
                    FROM analytics.fact_forecast WHERE period_start < NOW() - INTERVAL '30 days'`
        },
        // Reconciliation
        {
            name: 'Orders shipped_qty <= ordered_qty',
            type: 'RECONCILIATION',
            table: 'fact_orders',
            threshold: 0,
            query: `SELECT COUNT(*) as pct, COUNT(*) as fail_count FROM analytics.fact_orders WHERE shipped_qty > ordered_qty`
        },
        {
            name: 'PO received_qty <= ordered_qty',
            type: 'RECONCILIATION',
            table: 'fact_purchase_orders',
            threshold: 0,
            query: `SELECT COUNT(*) as pct, COUNT(*) as fail_count FROM analytics.fact_purchase_orders WHERE received_qty > ordered_qty`
        }
    ];

    for (const check of checks) {
        try {
            const res = await client.query(check.query);
            const rawPct = parseFloat(res.rows[0].pct || '0');
            const failCount = parseInt(res.rows[0].fail_count || '0');

            let status = 'PASS';
            if (rawPct > check.threshold) status = 'WARN';
            if (rawPct > check.threshold * 2) status = 'FAIL'; // arbitrary logic

            const metricValue = Number(rawPct.toFixed(4));

            const insertQuery = `
                INSERT INTO app.data_quality_log 
                (check_name, check_type, target_table, status, metric_value, threshold, details)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
            await client.query(insertQuery, [
                check.name,
                check.type,
                check.table,
                status,
                metricValue,
                check.threshold,
                JSON.stringify({ fail_count: failCount })
            ]);

            console.log(`[${status}] ${check.name}: ${metricValue} (Threshold: ${check.threshold})`);
        } catch (err) {
            console.error(`Error running check ${check.name}:`, err);
        }
    }

    console.log('Data Quality Checks logic completed.');
    await client.end();
}

runDataQualityChecks().catch(console.error);
