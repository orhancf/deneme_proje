/**
 * Supply Chain Control Tower — Seed Data Generator
 * Generates realistic demo data for all dimension and fact tables.
 *
 * Usage: cd db/seed && npm install && npm run seed
 */

import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  user: process.env.DATABASE_USER || 'scct',
  password: process.env.DATABASE_PASSWORD || 'scct_dev_2024',
  database: process.env.DATABASE_NAME || 'scct_db',
});

// ── Helpers ──────────────────────────────────────────────

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dateRange(startStr: string, endStr: string): Date[] {
  const dates: Date[] = [];
  const cur = new Date(startStr);
  const end = new Date(endStr);
  while (cur <= end) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function fmt(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// ── Seed Config ──────────────────────────────────────────

const START_DATE = '2025-01-01';
const END_DATE = '2025-12-31';
const COMPANIES = [
  { org_id: 'COMP-01', org_name: 'Acme Global Corp', country: 'US', region: 'North America', city: 'Chicago' },
  { org_id: 'COMP-02', org_name: 'EuroTech Industries', country: 'DE', region: 'Europe', city: 'Munich' },
];
const PLANTS = [
  { org_id: 'PLT-01', org_name: 'Chicago Plant', parent: 'COMP-01', country: 'US', region: 'North America', city: 'Chicago' },
  { org_id: 'PLT-02', org_name: 'Dallas Plant', parent: 'COMP-01', country: 'US', region: 'North America', city: 'Dallas' },
  { org_id: 'PLT-03', org_name: 'Munich Plant', parent: 'COMP-02', country: 'DE', region: 'Europe', city: 'Munich' },
  { org_id: 'PLT-04', org_name: 'Warsaw Plant', parent: 'COMP-02', country: 'PL', region: 'Europe', city: 'Warsaw' },
];
const DCS = [
  { org_id: 'DC-01', org_name: 'East Coast DC', parent: 'COMP-01', country: 'US', region: 'North America', city: 'Atlanta' },
  { org_id: 'DC-02', org_name: 'West Coast DC', parent: 'COMP-01', country: 'US', region: 'North America', city: 'Los Angeles' },
  { org_id: 'DC-03', org_name: 'Central Europe DC', parent: 'COMP-02', country: 'DE', region: 'Europe', city: 'Frankfurt' },
  { org_id: 'DC-04', org_name: 'East Europe DC', parent: 'COMP-02', country: 'PL', region: 'Europe', city: 'Krakow' },
];

const PRODUCT_FAMILIES = ['Electronics', 'Mechanical', 'Chemical', 'Packaging', 'Raw Materials'];
const CATEGORIES = {
  Electronics: ['Sensors', 'Controllers', 'Displays'],
  Mechanical: ['Bearings', 'Gears', 'Fasteners'],
  Chemical: ['Adhesives', 'Coatings', 'Solvents'],
  Packaging: ['Boxes', 'Pallets', 'Wrapping'],
  'Raw Materials': ['Steel', 'Aluminum', 'Plastic'],
};

const CUSTOMER_SEGMENTS = ['Enterprise', 'Mid-Market', 'SMB'];
const CHANNELS = ['Direct', 'Distributor', 'E-Commerce'];
const CARRIER_MODES = ['ROAD', 'AIR', 'SEA', 'RAIL', 'MULTIMODAL'] as const;
const SUPPLIER_TIERS = ['Tier-1', 'Tier-2', 'Tier-3'];
const INCOTERMS = ['EXW', 'FOB', 'CIF', 'DDP', 'DAP'];

// ── Main Seed Logic ──────────────────────────────────────

async function seed() {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding Supply Chain Control Tower demo data...\n');

    // ──── dim_date ────
    console.log('📅 Seeding dim_date...');
    const allDates = dateRange(START_DATE, END_DATE);
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    for (const d of allDates) {
      const dow = d.getDay() === 0 ? 7 : d.getDay();
      const month = d.getMonth() + 1;
      const quarter = Math.ceil(month / 3);
      const weekOfYear = Math.ceil((((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86400000) + 1) / 7);
      const fiscalMonth = ((month + 2) % 12) + 1;
      const fiscalQuarter = Math.ceil(fiscalMonth / 3);
      const fiscalYear = month >= 10 ? d.getFullYear() + 1 : d.getFullYear();

      await client.query(
        `INSERT INTO analytics.dim_date VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT DO NOTHING`,
        [fmt(d), dow, dayNames[dow - 1], weekOfYear, month, monthNames[month - 1], quarter, d.getFullYear(),
         fiscalMonth, fiscalQuarter, fiscalYear, dow >= 6, false]
      );
    }
    console.log(`  ✅ ${allDates.length} days inserted`);

    // ──── dim_org ────
    console.log('🏢 Seeding dim_org...');
    for (const c of COMPANIES) {
      await client.query(
        `INSERT INTO analytics.dim_org (org_id, org_name, org_type, parent_org_id, country, region, city) VALUES ($1,$2,'COMPANY',NULL,$3,$4,$5) ON CONFLICT DO NOTHING`,
        [c.org_id, c.org_name, c.country, c.region, c.city]
      );
    }
    for (const p of PLANTS) {
      await client.query(
        `INSERT INTO analytics.dim_org (org_id, org_name, org_type, parent_org_id, country, region, city) VALUES ($1,$2,'PLANT',$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
        [p.org_id, p.org_name, p.parent, p.country, p.region, p.city]
      );
    }
    for (const dc of DCS) {
      await client.query(
        `INSERT INTO analytics.dim_org (org_id, org_name, org_type, parent_org_id, country, region, city) VALUES ($1,$2,'DC',$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
        [dc.org_id, dc.org_name, dc.parent, dc.country, dc.region, dc.city]
      );
    }
    // User org access for seed users
    const allOrgs = [...COMPANIES, ...PLANTS, ...DCS];
    for (const org of allOrgs) {
      for (const uid of ['a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003']) {
        await client.query(`INSERT INTO app.user_org_access (user_id, org_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [uid, org.org_id]);
      }
    }
    // Viewer gets only COMP-01 orgs
    for (const org of allOrgs.filter(o => o.org_id === 'COMP-01' || ('parent' in o && (o as any).parent === 'COMP-01'))) {
      await client.query(`INSERT INTO app.user_org_access (user_id, org_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, ['a0000000-0000-0000-0000-000000000004', org.org_id]);
    }
    console.log(`  ✅ ${allOrgs.length} orgs inserted`);

    // ──── dim_product ────
    console.log('📦 Seeding dim_product...');
    const products: { product_id: string; family: string; category: string; unit_cost: number; unit_price: number }[] = [];
    let prodIdx = 1;
    for (const family of PRODUCT_FAMILIES) {
      const cats = CATEGORIES[family as keyof typeof CATEGORIES];
      for (const cat of cats) {
        for (let s = 1; s <= 3; s++) {
          const pid = `SKU-${String(prodIdx).padStart(4, '0')}`;
          const uc = randFloat(5, 200);
          const up = uc * randFloat(1.3, 2.5);
          products.push({ product_id: pid, family, category: cat, unit_cost: uc, unit_price: up });
          await client.query(
            `INSERT INTO analytics.dim_product (product_id, product_name, product_family, category, subcategory, uom, unit_cost, unit_price, weight_kg)
             VALUES ($1,$2,$3,$4,$5,'EA',$6,$7,$8) ON CONFLICT DO NOTHING`,
            [pid, `${cat} ${family} v${s}`, family, cat, `Sub-${s}`, uc, up, randFloat(0.1, 50)]
          );
          prodIdx++;
        }
      }
    }
    console.log(`  ✅ ${products.length} products inserted`);

    // ──── dim_customer ────
    console.log('👥 Seeding dim_customer...');
    const customerNames = [
      'TechVision Inc', 'Global Dynamics', 'Apex Manufacturing', 'Quantum Solutions', 'Atlas Corp',
      'Meridian Industries', 'Horizon Enterprises', 'Pinnacle Systems', 'Vertex Group', 'Nexus Corp',
      'Sterling Industries', 'Vanguard Tech', 'Cascade Solutions', 'Titan Manufacturing', 'Prism Analytics',
      'Summit Enterprises', 'Core Systems Ltd', 'Fusion Dynamics', 'Orbit Industries', 'Phoenix Global'
    ];
    const customers: string[] = [];
    for (let i = 0; i < customerNames.length; i++) {
      const cid = `CUST-${String(i + 1).padStart(3, '0')}`;
      customers.push(cid);
      await client.query(
        `INSERT INTO analytics.dim_customer (customer_id, customer_name, segment, channel, country, region, city, credit_tier)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT DO NOTHING`,
        [cid, customerNames[i], pick(CUSTOMER_SEGMENTS), pick(CHANNELS),
         pick(['US', 'DE', 'UK', 'FR', 'TR', 'JP']), pick(['NA', 'EMEA', 'APAC']),
         pick(['New York', 'London', 'Berlin', 'Istanbul', 'Tokyo', 'Paris']),
         pick(['A', 'B', 'C'])]
      );
    }
    console.log(`  ✅ ${customers.length} customers inserted`);

    // ──── dim_supplier ────
    console.log('🏭 Seeding dim_supplier...');
    const supplierNames = [
      'Alpha Parts Co', 'BetaChem Supply', 'Gamma Electronics', 'Delta Metals', 'Epsilon Components',
      'Zeta Polymers', 'Eta Precision', 'Theta Fasteners', 'Iota Materials', 'Kappa Coatings'
    ];
    const suppliers: string[] = [];
    for (let i = 0; i < supplierNames.length; i++) {
      const sid = `SUP-${String(i + 1).padStart(3, '0')}`;
      suppliers.push(sid);
      await client.query(
        `INSERT INTO analytics.dim_supplier (supplier_id, supplier_name, country, region, lead_time_days, tier)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
        [sid, supplierNames[i], pick(['CN', 'DE', 'US', 'JP', 'KR', 'IN']),
         pick(['Asia', 'Europe', 'North America']), rand(7, 45), pick(SUPPLIER_TIERS)]
      );
    }
    console.log(`  ✅ ${suppliers.length} suppliers inserted`);

    // ──── dim_carrier ────
    console.log('🚚 Seeding dim_carrier...');
    const carrierNames = ['FastFreight', 'GlobalShip', 'AirCargo Express', 'RailConnect', 'OceanLine'];
    const carriers: string[] = [];
    for (let i = 0; i < carrierNames.length; i++) {
      const crid = `CAR-${String(i + 1).padStart(3, '0')}`;
      carriers.push(crid);
      await client.query(
        `INSERT INTO analytics.dim_carrier (carrier_id, carrier_name, mode, country)
         VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [crid, carrierNames[i], CARRIER_MODES[i % CARRIER_MODES.length], pick(['US', 'DE', 'NL', 'SG'])]
      );
    }
    console.log(`  ✅ ${carriers.length} carriers inserted`);

    // ──── dim_lane ────
    console.log('🛤️  Seeding dim_lane...');
    const orgIds = [...PLANTS.map(p => p.org_id), ...DCS.map(d => d.org_id)];
    const lanes: string[] = [];
    let laneIdx = 1;
    for (const origin of PLANTS.map(p => p.org_id)) {
      for (const dest of DCS.map(d => d.org_id)) {
        const lid = `LANE-${String(laneIdx).padStart(3, '0')}`;
        lanes.push(lid);
        await client.query(
          `INSERT INTO analytics.dim_lane (lane_id, origin_org_id, destination_org_id, origin_country, dest_country, incoterm, standard_transit_days)
           VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
          [lid, origin, dest,
           PLANTS.find(p => p.org_id === origin)?.country || 'US',
           DCS.find(d => d.org_id === dest)?.country || 'US',
           pick(INCOTERMS), rand(2, 21)]
        );
        laneIdx++;
      }
    }
    console.log(`  ✅ ${lanes.length} lanes inserted`);

    // ──── fact_orders ────
    console.log('📋 Seeding fact_orders (~50K lines)...');
    const orderDates = allDates.filter(d => d.getDay() !== 0 && d.getDay() !== 6); // weekdays only
    let orderCount = 0;
    const orderLineIds: string[] = [];
    for (const d of orderDates) {
      const ordersPerDay = rand(5, 15);
      for (let o = 0; o < ordersPerDay; o++) {
        const orderId = `ORD-${fmt(d).replace(/-/g, '')}-${String(o + 1).padStart(3, '0')}`;
        const linesPerOrder = rand(1, 4);
        for (let l = 0; l < linesPerOrder; l++) {
          const lineId = `${orderId}-L${l + 1}`;
          orderLineIds.push(lineId);
          const prod = pick(products);
          const qty = rand(10, 500);
          const requestedDate = addDays(d, rand(3, 30));
          const promisedDate = addDays(d, rand(3, 25));
          const isDelivered = Math.random() < 0.75;
          const shippedDate = isDelivered ? addDays(d, rand(2, 20)) : null;
          const deliveredDate = shippedDate ? addDays(shippedDate, rand(1, 10)) : null;
          const shippedQty = isDelivered ? (Math.random() < 0.85 ? qty : rand(Math.floor(qty * 0.5), qty)) : 0;
          const deliveredQty = deliveredDate ? shippedQty : 0;
          const onTime = deliveredDate ? deliveredDate <= requestedDate : null;
          const inFull = deliveredQty >= qty;
          const status = !isDelivered ? 'OPEN' : (deliveredQty >= qty ? 'DELIVERED' : (deliveredQty > 0 ? 'PARTIAL' : 'SHIPPED'));

          await client.query(
            `INSERT INTO analytics.fact_orders
             (order_line_id, order_id, order_date, requested_date, promised_date, shipped_date, delivered_date,
              org_id, customer_id, product_id, ordered_qty, shipped_qty, delivered_qty,
              unit_price, line_value, currency, order_status, is_on_time, is_in_full, is_otif) 
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'USD',$16,$17,$18,$19) ON CONFLICT DO NOTHING`,
            [lineId, orderId, fmt(d), fmt(requestedDate), fmt(promisedDate),
             shippedDate ? fmt(shippedDate) : null, deliveredDate ? fmt(deliveredDate) : null,
             pick(orgIds), pick(customers), prod.product_id,
             qty, shippedQty, deliveredQty, prod.unit_price, qty * prod.unit_price,
             status, onTime, inFull, onTime && inFull]
          );
          orderCount++;
        }
      }
    }
    console.log(`  ✅ ${orderCount} order lines inserted`);

    // ──── fact_shipments ────
    console.log('🚢 Seeding fact_shipments...');
    let shipCount = 0;
    const deliveredOrders = orderLineIds.slice(0, Math.floor(orderLineIds.length * 0.7));
    for (const olid of deliveredOrders) {
      const slid = `SH-${olid}`;
      const prod = pick(products);
      const shipDate = pick(orderDates);
      const transitPlanned = rand(2, 14);
      const transitActual = transitPlanned + rand(-2, 5);
      const delDate = addDays(shipDate, Math.max(1, transitActual));

      await client.query(
        `INSERT INTO analytics.fact_shipments
         (shipment_line_id, shipment_id, order_line_id, ship_date, delivery_date,
          org_id, carrier_id, lane_id, product_id, shipped_qty, weight_kg,
          freight_cost, currency, transit_days_actual, transit_days_planned, is_on_time, shipment_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'USD',$13,$14,$15,$16) ON CONFLICT DO NOTHING`,
        [slid, `SHIP-${slid.slice(-10)}`, olid, fmt(shipDate), fmt(delDate),
         pick(orgIds), pick(carriers), pick(lanes), prod.product_id,
         rand(10, 500), randFloat(1, 200),
         randFloat(15, 500), transitActual, transitPlanned,
         transitActual <= transitPlanned, delDate <= new Date() ? 'DELIVERED' : 'IN_TRANSIT']
      );
      shipCount++;
    }
    console.log(`  ✅ ${shipCount} shipment lines inserted`);

    // ──── fact_inventory_snapshot ────
    console.log('📊 Seeding fact_inventory_snapshot...');
    let invCount = 0;
    // Weekly snapshots for a subset of products × orgs
    const invDates = allDates.filter((_, i) => i % 7 === 0); // weekly
    const invProducts = products.slice(0, 20); // top 20 products
    const invOrgs = [...PLANTS.map(p => p.org_id), ...DCS.map(d => d.org_id)];
    for (const d of invDates) {
      for (const org of invOrgs) {
        for (const prod of invProducts) {
          const onHand = rand(0, 5000);
          const inTransit = rand(0, 1000);
          const allocated = rand(0, Math.floor(onHand * 0.6));
          const safety = rand(100, 800);
          const available = Math.max(0, onHand - allocated);
          const doh = onHand > 0 ? randFloat(1, 120, 1) : 0;
          const ageBuckets = ['0-30', '31-60', '61-90', '90+'] as const;
          const ageBucket = doh <= 30 ? '0-30' : doh <= 60 ? '31-60' : doh <= 90 ? '61-90' : '90+';

          await client.query(
            `INSERT INTO analytics.fact_inventory_snapshot
             (snapshot_id, snapshot_date, org_id, product_id, on_hand_qty, in_transit_qty, allocated_qty,
              available_qty, safety_stock_qty, unit_cost, inventory_value, days_on_hand, age_bucket, is_excess, is_obsolete)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) ON CONFLICT DO NOTHING`,
            [`INV-${fmt(d)}-${org}-${prod.product_id}`, fmt(d), org, prod.product_id,
             onHand, inTransit, allocated, available, safety, prod.unit_cost, onHand * prod.unit_cost,
             doh, ageBucket, onHand > safety * 3, doh > 90]
          );
          invCount++;
        }
      }
    }
    console.log(`  ✅ ${invCount} inventory snapshots inserted`);

    // ──── fact_production ────
    console.log('⚙️  Seeding fact_production...');
    let prodCount = 0;
    const prodDates = orderDates; // weekdays
    const mfgProducts = products.slice(0, 15);
    const mfgOrgs = PLANTS.map(p => p.org_id);
    for (const d of prodDates) {
      for (const org of mfgOrgs) {
        const prodsToday = mfgProducts.slice(0, rand(2, 5));
        for (const prod of prodsToday) {
          const planned = rand(50, 500);
          const actual = Math.floor(planned * randFloat(0.7, 1.1));
          const scrap = rand(0, Math.floor(actual * 0.05));
          const plannedHrs = randFloat(2, 10);
          const actualHrs = plannedHrs * randFloat(0.8, 1.3);
          const capAvail = randFloat(8, 16);
          const capUsed = Math.min(capAvail, actualHrs);

          await client.query(
            `INSERT INTO analytics.fact_production
             (production_id, production_date, org_id, product_id, planned_qty, actual_qty, scrap_qty,
              planned_hours, actual_hours, capacity_available, capacity_used, schedule_adherence, capacity_utilization, yield_rate)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT DO NOTHING`,
            [`PROD-${fmt(d)}-${org}-${prod.product_id}`, fmt(d), org, prod.product_id,
             planned, actual, scrap, plannedHrs, actualHrs, capAvail, capUsed,
             parseFloat((actual / planned).toFixed(4)),
             parseFloat((capUsed / capAvail).toFixed(4)),
             parseFloat(((actual - scrap) / actual).toFixed(4))]
          );
          prodCount++;
        }
      }
    }
    console.log(`  ✅ ${prodCount} production records inserted`);

    // ──── fact_purchase_orders ────
    console.log('🛒 Seeding fact_purchase_orders...');
    let poCount = 0;
    for (const d of orderDates) {
      const posPerDay = rand(2, 6);
      for (let p = 0; p < posPerDay; p++) {
        const poId = `PO-${fmt(d).replace(/-/g, '')}-${String(p + 1).padStart(3, '0')}`;
        const linesPerPO = rand(1, 3);
        for (let l = 0; l < linesPerPO; l++) {
          const lineId = `${poId}-L${l + 1}`;
          const prod = pick(products);
          const sup = pick(suppliers);
          const ltPlanned = rand(7, 45);
          const ltActual = ltPlanned + rand(-3, 10);
          const promisedDate = addDays(d, ltPlanned);
          const isReceived = Math.random() < 0.7;
          const receivedDate = isReceived ? addDays(d, ltActual) : null;
          const qty = rand(50, 2000);
          const receivedQty = isReceived ? (Math.random() < 0.9 ? qty : rand(Math.floor(qty * 0.6), qty)) : 0;

          await client.query(
            `INSERT INTO analytics.fact_purchase_orders
             (po_line_id, po_id, po_date, promised_date, received_date, org_id, supplier_id, product_id,
              ordered_qty, received_qty, unit_cost, line_value, currency, po_status, is_on_time,
              lead_time_planned, lead_time_actual, quality_ppm)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'USD',$13,$14,$15,$16,$17) ON CONFLICT DO NOTHING`,
            [lineId, poId, fmt(d), fmt(promisedDate), receivedDate ? fmt(receivedDate) : null,
             pick(orgIds), sup, prod.product_id,
             qty, receivedQty, prod.unit_cost, qty * prod.unit_cost,
             !isReceived ? 'OPEN' : (receivedQty >= qty ? 'RECEIVED' : 'PARTIAL'),
             receivedDate ? receivedDate <= promisedDate : null,
             ltPlanned, isReceived ? ltActual : null,
             isReceived ? randFloat(0, 5000, 1) : null]
          );
          poCount++;
        }
      }
    }
    console.log(`  ✅ ${poCount} PO lines inserted`);

    // ──── fact_forecast ────
    console.log('🔮 Seeding fact_forecast...');
    let fcCount = 0;
    const fcDates = allDates.filter((_, i) => i % 7 === 0); // weekly buckets
    const fcProducts = products.slice(0, 15);
    for (const d of fcDates) {
      for (const org of orgIds.slice(0, 4)) {
        for (const prod of fcProducts) {
          const fcQty = rand(100, 3000);
          const actQty = Math.floor(fcQty * randFloat(0.6, 1.4));
          const absErr = Math.abs(actQty - fcQty);
          const pctErr = actQty > 0 ? parseFloat((absErr / actQty).toFixed(4)) : 0;
          const bias = parseFloat(((fcQty - actQty) / Math.max(actQty, 1)).toFixed(4));

          await client.query(
            `INSERT INTO analytics.fact_forecast
             (forecast_id, forecast_date, org_id, product_id, forecast_qty, actual_qty,
              forecast_value, actual_value, abs_error, pct_error, bias, bucket_type)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'WEEKLY') ON CONFLICT DO NOTHING`,
            [`FC-${fmt(d)}-${org}-${prod.product_id}`, fmt(d), org, prod.product_id,
             fcQty, actQty, fcQty * prod.unit_price, actQty * prod.unit_price,
             absErr, pctErr, bias]
          );
          fcCount++;
        }
      }
    }
    console.log(`  ✅ ${fcCount} forecast records inserted`);

    // ──── KPI Catalog ────
    console.log('📖 Seeding KPI Catalog...');
    const kpis = [
      { id: 'OTIF_001', name: 'OTIF %', owner: 'SC Director', q: 'Are we delivering the right product, on time, in full?', formula: 'Delivered On-Time AND In-Full / Total Delivered', unit: '%', grain: 'order_line / week / org', dims: ['org','customer','product','date'], sla: 'Daily 06:00', src: ['fact_orders','fact_shipments'], thresholds: {green:0.95,yellow:0.90,red:0} },
      { id: 'OTD_002', name: 'OTD %', owner: 'SC Director', q: 'What percentage of deliveries arrive on time?', formula: 'Delivered On-Time / Total Delivered', unit: '%', grain: 'order_line / week / org', dims: ['org','customer','date'], sla: 'Daily 06:00', src: ['fact_orders'], thresholds: {green:0.95,yellow:0.90,red:0} },
      { id: 'FILL_003', name: 'Fill Rate %', owner: 'SC Director', q: 'How complete are our deliveries?', formula: 'Delivered Qty / Ordered Qty', unit: '%', grain: 'order_line / week / org', dims: ['org','customer','product','date'], sla: 'Daily 06:00', src: ['fact_orders'], thresholds: {green:0.98,yellow:0.92,red:0} },
      { id: 'BACKLOG_004', name: 'Backlog', owner: 'Planning', q: 'How large is our open order backlog?', formula: 'SUM(ordered_qty - shipped_qty) WHERE status IN (OPEN,PARTIAL)', unit: 'qty', grain: 'order_line / day / org', dims: ['org','customer','product','date'], sla: 'Daily 06:00', src: ['fact_orders'], thresholds: {green:0,yellow:5000,red:10000} },
      { id: 'DOH_005', name: 'Days on Hand', owner: 'Inventory Mgr', q: 'How many days of inventory do we have?', formula: 'On-Hand Qty / Avg Daily Consumption', unit: 'days', grain: 'product-location / day', dims: ['org','product','date'], sla: 'Daily 06:00', src: ['fact_inventory_snapshot'], thresholds: {green:30,yellow:60,red:90} },
      { id: 'TURNS_006', name: 'Inventory Turns', owner: 'Inventory Mgr', q: 'How efficiently are we turning inventory?', formula: 'COGS / Avg Inventory Value (annualized)', unit: 'x', grain: 'product-location / month', dims: ['org','product','date'], sla: 'Weekly', src: ['fact_inventory_snapshot'], thresholds: {green:12,yellow:6,red:3} },
      { id: 'STOCKOUT_007', name: 'Stockout Rate', owner: 'Inventory Mgr', q: 'What percentage of SKU-locations are stocked out?', formula: 'COUNT(available_qty <= 0) / COUNT(*)', unit: '%', grain: 'product-location / day', dims: ['org','product','date'], sla: 'Daily 06:00', src: ['fact_inventory_snapshot'], thresholds: {green:0.02,yellow:0.05,red:0.10} },
      { id: 'EO_008', name: 'Excess & Obsolete', owner: 'Inventory Mgr', q: 'What is the value of excess/obsolete inventory?', formula: 'SUM(inventory_value) WHERE is_excess OR is_obsolete', unit: '$', grain: 'product-location / month', dims: ['org','product','date'], sla: 'Weekly', src: ['fact_inventory_snapshot'], thresholds: {green:0,yellow:100000,red:500000} },
      { id: 'FCACC_009', name: 'Forecast Accuracy (WAPE)', owner: 'Demand Planning', q: 'How accurate are our forecasts?', formula: '1 - SUM(|actual - forecast|) / SUM(actual)', unit: '%', grain: 'product / week / org', dims: ['org','product','date'], sla: 'Weekly', src: ['fact_forecast'], thresholds: {green:0.80,yellow:0.60,red:0} },
      { id: 'FCBIAS_010', name: 'Forecast Bias', owner: 'Demand Planning', q: 'Are we consistently over or under-forecasting?', formula: 'SUM(forecast - actual) / SUM(actual)', unit: '%', grain: 'product / week / org', dims: ['org','product','date'], sla: 'Weekly', src: ['fact_forecast'], thresholds: {green:0.05,yellow:0.15,red:0.25} },
      { id: 'SCHEDADH_011', name: 'Schedule Adherence %', owner: 'Production Mgr', q: 'How well do we adhere to the production schedule?', formula: 'Actual Qty / Planned Qty', unit: '%', grain: 'product-workcenter / day / org', dims: ['org','product','date'], sla: 'Daily 06:00', src: ['fact_production'], thresholds: {green:0.95,yellow:0.85,red:0} },
      { id: 'CAPUTIL_012', name: 'Capacity Utilization', owner: 'Production Mgr', q: 'How much of available capacity are we using?', formula: 'Capacity Used / Capacity Available', unit: '%', grain: 'workcenter / day / org', dims: ['org','date'], sla: 'Daily 06:00', src: ['fact_production'], thresholds: {green:0.85,yellow:0.70,red:0} },
      { id: 'SUPOT_013', name: 'Supplier On-Time %', owner: 'Procurement', q: 'Are suppliers delivering on time?', formula: 'PO Lines On-Time / Total PO Lines Received', unit: '%', grain: 'PO line / week / supplier', dims: ['org','supplier','product','date'], sla: 'Daily 06:00', src: ['fact_purchase_orders'], thresholds: {green:0.95,yellow:0.85,red:0} },
      { id: 'LTVAR_014', name: 'Lead Time Variance', owner: 'Procurement', q: 'How much do actual lead times deviate from planned?', formula: 'AVG(actual_lead_time - planned_lead_time)', unit: 'days', grain: 'PO line / week / supplier', dims: ['org','supplier','date'], sla: 'Weekly', src: ['fact_purchase_orders'], thresholds: {green:2,yellow:5,red:10} },
      { id: 'SUPPPM_015', name: 'Supplier Quality PPM', owner: 'Quality', q: 'What is the defect rate from suppliers?', formula: 'AVG(quality_ppm)', unit: 'PPM', grain: 'PO line / month / supplier', dims: ['org','supplier','date'], sla: 'Monthly', src: ['fact_purchase_orders'], thresholds: {green:100,yellow:500,red:1000} },
      { id: 'FRCOST_016', name: 'Freight Cost / Unit', owner: 'Logistics', q: 'What does it cost to ship one unit?', formula: 'SUM(freight_cost) / SUM(shipped_qty)', unit: '$', grain: 'shipment / week / lane', dims: ['org','carrier','lane','date'], sla: 'Weekly', src: ['fact_shipments'], thresholds: {green:5,yellow:10,red:20} },
      { id: 'TTVAR_017', name: 'Transit Time Variance', owner: 'Logistics', q: 'How much do transit times deviate from planned?', formula: 'AVG(actual_transit - planned_transit)', unit: 'days', grain: 'shipment / week / lane', dims: ['org','carrier','lane','date'], sla: 'Weekly', src: ['fact_shipments'], thresholds: {green:1,yellow:3,red:5} },
      { id: 'CAROT_018', name: 'Carrier On-Time %', owner: 'Logistics', q: 'Are carriers delivering on time?', formula: 'On-Time Shipments / Total Shipments', unit: '%', grain: 'shipment / week / carrier', dims: ['org','carrier','date'], sla: 'Weekly', src: ['fact_shipments'], thresholds: {green:0.95,yellow:0.85,red:0} },
      { id: 'C2C_019', name: 'Cash-to-Cash Cycle', owner: 'Finance', q: 'How long does cash take to cycle through the supply chain?', formula: 'DIO + DSO - DPO (proxy from available data)', unit: 'days', grain: 'org / month', dims: ['org','date'], sla: 'Monthly', src: ['fact_orders','fact_purchase_orders','fact_inventory_snapshot'], thresholds: {green:30,yellow:60,red:90} },
      { id: 'WKCAP_020', name: 'Working Capital', owner: 'Finance', q: 'What is the working capital tied up in the supply chain?', formula: 'Inventory Value + AR proxy - AP proxy', unit: '$', grain: 'org / month', dims: ['org','date'], sla: 'Monthly', src: ['fact_orders','fact_purchase_orders','fact_inventory_snapshot'], thresholds: {green:0,yellow:1000000,red:5000000} },
    ];

    for (const k of kpis) {
      await client.query(
        `INSERT INTO app.kpi_catalog (kpi_id, name, description, owner, business_question, formula_business, unit, grain, dimensions, refresh_sla, source_tables, thresholds)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT DO NOTHING`,
        [k.id, k.name, k.q, k.owner, k.q, k.formula, k.unit, k.grain, k.dims, k.sla, k.src, k.thresholds]
      );
    }
    console.log(`  ✅ ${kpis.length} KPIs inserted`);

    console.log('\n🎉 Seed complete!');

  } catch (err) {
    console.error('❌ Seed error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
