# Services Analysis: Frontend-Backend Integration

## Current Status

### Existing Backend Endpoints ✅

| Endpoint | Method | Controller | Status |
|----------|--------|------------|--------|
| `/api/dashboard` | GET | dashboardController | ✅ Working |
| `/api/kpis/daily` | GET | kpiController | ✅ Working |
| `/api/kpis/daily/range` | GET | kpiController | ✅ Working |
| `/api/kpis/hourly` | GET | kpiController | ✅ Working |
| `/api/imt` | GET | imtController | ✅ Working |
| `/api/imt/country/:country` | GET | imtController | ✅ Working |
| `/api/revenue/by-channel` | GET | revenueController | ✅ Working |
| `/api/users/active` | GET | userController | ✅ Working |
| `/api/comparisons` | GET | kpiController | ✅ Working |
| `/api/export/excel` | GET | exportController | ✅ Working |
| `/api/export/pdf` | GET | exportController | ✅ Working |

### Frontend API Service Usage ✅

All endpoints used by `frontend/src/services/api.js` exist in the backend. The frontend service is properly configured.

## Gaps for Comprehensive KPI Dashboard

The new comprehensive dashboard (with 7 categories) requires additional endpoints:

### 1. Acquisition & KYC Tab
**Required Data:**
- Nouveaux inscrits (NEW_REG) - ❌ **Missing**
- Activations - ✅ Available (ActiveUsers.app_activations)
- Taux d'activation - ✅ Calculable
- Réactivations - ❌ **Missing**
- Canal d'inscription distribution - ❌ **Missing**
- Paliers KYC (Basic/Standard/Full) - ❌ **Missing**
- Cohortes de conversion J+N - ❌ **Missing**

**Endpoint to create:** `/api/acquisition`

### 2. Retention Tab
**Required Data:**
- DAU/WAU/MAU - ✅ Available (ActiveUsers)
- Taux d'activité - ✅ Calculable
- Fréquence moyenne transactions - ✅ Calculable (from DailyKpi)
- ATV (Average Transaction Value) - ✅ Calculable (from DailyKpi)
- Cohortes de rétention (heatmap) - ❌ **Missing**

**Endpoint to create:** `/api/cohorts/retention`

### 3. Transactions Tab
**Required Data:**
- Total, success, failure rates - ✅ Available (DailyKpi, HourlyKpi)
- Transactions par produit - ✅ Available (DailyKpi.business_type)
- Pacing vs objectif - ❌ **Missing**
- Heures de pointe (heatmap) - ✅ Calculable (from HourlyKpi)
- Motifs d'échec breakdown - ❌ **Missing**

**Endpoints to create:**
- `/api/failures/reasons`
- `/api/targets` (for pacing)

### 4. Revenue Tab
**Required Data:**
- Total revenue, take-rate, ARPU, ARPAT - ✅ Calculable (DailyKpi + ActiveUsers)
- Revenue par produit/canal - ✅ Available (RevenueByChannel, DailyKpi)
- Comparaisons (D-1, MoM, YoY) - ✅ Available (comparisons endpoint)
- Contribution par produit (%) - ✅ Calculable

**Status:** ✅ Fully supported with existing endpoints

### 5. Merchants & QR Tab
**Required Data:**
- Marchands actifs - ❌ **Missing**
- Transactions QR count & amount - ❌ **Missing**
- Ticket moyen QR - ❌ **Missing**
- Top marchands par volume - ❌ **Missing**
- Taux d'acceptation QR - ❌ **Missing**
- Densité géographique par région - ❌ **Missing**

**Endpoint to create:** `/api/merchants`

### 6. Agents (PDV) Tab
**Required Data:**
- Agents actifs - ❌ **Missing**
- Cash-In/Out ratio - ❌ **Missing**
- Stock float moyen - ❌ **Missing**
- Délai réappro (heures) - ❌ **Missing**
- Distribution par zone - ❌ **Missing**
- Tensions de liquidité - ❌ **Missing**
- Top 10 agents (table) - ❌ **Missing**

**Endpoint to create:** `/api/agents`

### 7. Channels Tab
**Required Data:**
- Parts USSD/App/API/STK - ✅ Partially (RevenueByChannel)
- Distribution transactions - ✅ Partially (RevenueByChannel)
- Taux de succès par canal - ❌ **Missing**
- Latence moyenne par canal (ms) - ❌ **Missing**
- Métriques détaillées canal - ❌ **Missing**

**Endpoint to create:** `/api/channels/metrics`

## Required New Endpoints Summary

1. **`/api/acquisition`** - GET
   - Returns: new_registrations, activations, activation_rate, reactivations, by_channel, kyc_levels, conversion_cohorts

2. **`/api/merchants`** - GET
   - Returns: active_merchants, qr_transactions, qr_amount, avg_ticket, top_merchants, acceptance_rate, density_by_region

3. **`/api/agents`** - GET
   - Returns: active_agents, cash_in_out_ratio, avg_float, reload_time, by_zone, liquidity_tensions, top_agents

4. **`/api/channels/metrics`** - GET
   - Returns: ussd/app/api/stk shares, success_rates, latency, detailed_metrics

5. **`/api/cohorts/retention`** - GET
   - Returns: retention heatmap by cohort/week

6. **`/api/cohorts/conversion`** - GET
   - Returns: conversion rates J+1, J+7, J+14, J+30

7. **`/api/failures/reasons`** - GET
   - Returns: failure breakdown by reason (insufficient balance, timeout, kyc limit, network error, etc.)

8. **`/api/targets`** - GET
   - Returns: daily/hourly targets for pacing calculations

## Implementation Plan

### Phase 1: Backend Endpoints (Priority)
1. Create models (if needed) for new data types
2. Create controllers for each new endpoint
3. Create routes and register in app.js
4. Add caching with cacheService
5. Add authentication middleware

### Phase 2: Frontend Integration
1. Update `frontend/src/services/api.js` with new endpoint functions
2. Update dashboard views to fetch real data instead of using demo data
3. Add loading states and error handling
4. Test all integrations

### Phase 3: Testing
1. Test each endpoint individually
2. Test frontend-backend integration
3. Test error scenarios
4. Performance testing with cache

## Notes

- Current dashboard uses **demo/hardcoded data**
- All backend endpoints use **JWT authentication**
- All endpoints implement **Redis caching** (5 min TTL)
- Date format: `YYYYMMDD` (e.g., "20251025")
