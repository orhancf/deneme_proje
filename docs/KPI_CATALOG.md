# KPI Catalog — Supply Chain Control Tower

## Overview

The KPI Catalog is the **single source of truth** for all metric definitions. Every chart and tile in the dashboards is driven by this catalog.

## KPI Definitions

### Service KPIs

| ID | Name | Formula | Owner | Unit | Grain | Refresh |
| --- | --- | --- | --- | --- | --- | --- |
| OTIF_001 | OTIF % | On-Time AND In-Full / Total Delivered | SC Director | % | order_line / week / org | Daily 06:00 |
| OTD_002 | OTD % | On-Time / Total Delivered | SC Director | % | order_line / week / org | Daily 06:00 |
| FILL_003 | Fill Rate % | Delivered Qty / Ordered Qty | SC Director | % | order_line / week / org | Daily 06:00 |
| BACKLOG_004 | Backlog | SUM(ordered - shipped) WHERE OPEN | Planning | qty | order_line / day / org | Daily 06:00 |

### Inventory KPIs

| ID | Name | Formula | Owner | Unit | Grain | Refresh |
| --- | --- | --- | --- | --- | --- | --- |
| DOH_005 | Days on Hand | On-Hand / Avg Daily Consumption | Inventory Mgr | days | product-loc / day | Daily 06:00 |
| TURNS_006 | Inventory Turns | COGS / Avg Inventory Value | Inventory Mgr | x | product-loc / month | Weekly |
| STOCKOUT_007 | Stockout Rate | COUNT(avail ≤ 0) / COUNT(*) | Inventory Mgr | % | product-loc / day | Daily 06:00 |
| EO_008 | Excess & Obsolete | SUM(value) WHERE excess OR obsolete | Inventory Mgr | $ | product-loc / month | Weekly |

### Planning KPIs

| ID | Name | Formula | Owner | Unit | Grain | Refresh |
| --- | --- | --- | --- | --- | --- | --- |
| FCACC_009 | Forecast Accuracy | 1 - SUM(\|actual-forecast\|) / SUM(actual) | Demand Planning | % | product / week / org | Weekly |
| FCBIAS_010 | Forecast Bias | SUM(forecast-actual) / SUM(actual) | Demand Planning | % | product / week / org | Weekly |

### Production KPIs

| ID | Name | Formula | Owner | Unit | Grain | Refresh |
| --- | --- | --- | --- | --- | --- | --- |
| SCHEDADH_011 | Schedule Adherence | Actual / Planned | Production Mgr | % | product-WC / day / org | Daily 06:00 |
| CAPUTIL_012 | Capacity Utilization | Used / Available | Production Mgr | % | WC / day / org | Daily 06:00 |

### Procurement KPIs

| ID | Name | Formula | Owner | Unit | Grain | Refresh |
| --- | --- | --- | --- | --- | --- | --- |
| SUPOT_013 | Supplier OT % | PO Lines On-Time / Total Received | Procurement | % | PO line / week / supplier | Daily 06:00 |
| LTVAR_014 | Lead Time Variance | AVG(actual LT - planned LT) | Procurement | days | PO line / week / supplier | Weekly |
| SUPPPM_015 | Supplier Quality PPM | AVG(quality_ppm) | Quality | PPM | PO line / month / supplier | Monthly |

### Logistics KPIs

| ID | Name | Formula | Owner | Unit | Grain | Refresh |
| --- | --- | --- | --- | --- | --- | --- |
| FRCOST_016 | Freight Cost/Unit | SUM(freight) / SUM(shipped_qty) | Logistics | $ | shipment / week / lane | Weekly |
| TTVAR_017 | Transit Time Variance | AVG(actual - planned transit) | Logistics | days | shipment / week / lane | Weekly |
| CAROT_018 | Carrier OT % | On-Time Shipments / Total | Logistics | % | shipment / week / carrier | Weekly |

### Finance KPIs

| ID | Name | Formula | Owner | Unit | Grain | Refresh |
| --- | --- | --- | --- | --- | --- | --- |
| C2C_019 | Cash-to-Cash Cycle | DIO + DSO - DPO (proxy) | Finance | days | org / month | Monthly |
| WKCAP_020 | Working Capital | Inv Value + AR - AP (proxy) | Finance | $ | org / month | Monthly |

## Thresholds

Each KPI has three threshold levels:

- 🟢 **Green** — On target
- 🟡 **Yellow** — Warning, needs attention
- 🔴 **Red** — Critical, action required

Example: OTIF_001 → Green ≥ 95%, Yellow ≥ 90%, Red < 90%
