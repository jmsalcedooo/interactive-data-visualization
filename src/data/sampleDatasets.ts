import { Dataset } from '../types';
import { analyzeColumns, cleanDatasetRows } from '../utils/dataProcessor';

const salesRawData = [
  { Date: '2025-01-05', Region: 'North America', Category: 'Electronics', Product: 'Pro Ultra Laptop', Channel: 'Direct Online', UnitsSold: 145, Revenue: 217500, Cost: 130500, Profit: 87000, Rating: 4.8, CustomerSatisfaction: 94 },
  { Date: '2025-01-12', Region: 'Europe', Category: 'Electronics', Product: 'Noise-Cancelling Buds', Channel: 'Retail Partner', UnitsSold: 420, Revenue: 84000, Cost: 42000, Profit: 42000, Rating: 4.6, CustomerSatisfaction: 91 },
  { Date: '2025-01-18', Region: 'Asia Pacific', Category: 'Smart Home', Product: 'AI Security Hub', Channel: 'Direct Online', UnitsSold: 310, Revenue: 77500, Cost: 43400, Profit: 34100, Rating: 4.4, CustomerSatisfaction: 88 },
  { Date: '2025-01-25', Region: 'Latin America', Category: 'Apparel', Product: 'Merino Travel Jacket', Channel: 'Mobile App', UnitsSold: 190, Revenue: 38000, Cost: 17100, Profit: 20900, Rating: 4.7, CustomerSatisfaction: 95 },
  { Date: '2025-02-02', Region: 'North America', Category: 'Office', Product: 'Ergo Standing Desk', Channel: 'Enterprise B2B', UnitsSold: 85, Revenue: 68000, Cost: 37400, Profit: 30600, Rating: 4.9, CustomerSatisfaction: 97 },
  { Date: '2025-02-08', Region: 'Europe', Category: 'Smart Home', Product: 'Smart Thermostat V2', Channel: 'Retail Partner', UnitsSold: 280, Revenue: 56000, Cost: 28000, Profit: 28000, Rating: 4.5, CustomerSatisfaction: 89 },
  { Date: '2025-02-14', Region: 'Asia Pacific', Category: 'Electronics', Product: 'Pro Ultra Laptop', Channel: 'Direct Online', UnitsSold: 210, Revenue: 315000, Cost: 189000, Profit: 126000, Rating: 4.8, CustomerSatisfaction: 93 },
  { Date: '2025-02-21', Region: 'North America', Category: 'Apparel', Product: 'Ultralight Runners', Channel: 'Mobile App', UnitsSold: 540, Revenue: 81000, Cost: 36450, Profit: 44550, Rating: 4.6, CustomerSatisfaction: 92 },
  { Date: '2025-03-01', Region: 'Middle East', Category: 'Electronics', Product: 'Cinema 4K Monitor', Channel: 'Enterprise B2B', UnitsSold: 95, Revenue: 95000, Cost: 57000, Profit: 38000, Rating: 4.7, CustomerSatisfaction: 90 },
  { Date: '2025-03-07', Region: 'Europe', Category: 'Office', Product: 'Executive Task Chair', Channel: 'Direct Online', UnitsSold: 165, Revenue: 82500, Cost: 41250, Profit: 41250, Rating: 4.8, CustomerSatisfaction: 96 },
  { Date: '2025-03-15', Region: 'North America', Category: 'Smart Home', Product: 'AI Security Hub', Channel: 'Direct Online', UnitsSold: 410, Revenue: 102500, Cost: 57400, Profit: 45100, Rating: 4.5, CustomerSatisfaction: 90 },
  { Date: '2025-03-22', Region: 'Asia Pacific', Category: 'Apparel', Product: 'Merino Travel Jacket', Channel: 'Retail Partner', UnitsSold: 320, Revenue: 64000, Cost: 28800, Profit: 35200, Rating: 4.7, CustomerSatisfaction: 93 },
  { Date: '2025-04-04', Region: 'Latin America', Category: 'Electronics', Product: 'Noise-Cancelling Buds', Channel: 'Mobile App', UnitsSold: 280, Revenue: 56000, Cost: 28000, Profit: 28000, Rating: 4.3, CustomerSatisfaction: 87 },
  { Date: '2025-04-10', Region: 'North America', Category: 'Electronics', Product: 'Cinema 4K Monitor', Channel: 'Direct Online', UnitsSold: 190, Revenue: 190000, Cost: 114000, Profit: 76000, Rating: 4.9, CustomerSatisfaction: 96 },
  { Date: '2025-04-18', Region: 'Europe', Category: 'Apparel', Product: 'Ultralight Runners', Channel: 'Mobile App', UnitsSold: 610, Revenue: 91500, Cost: 41175, Profit: 50325, Rating: 4.7, CustomerSatisfaction: 94 },
  { Date: '2025-04-26', Region: 'Asia Pacific', Category: 'Office', Product: 'Ergo Standing Desk', Channel: 'Enterprise B2B', UnitsSold: 130, Revenue: 104000, Cost: 57200, Profit: 46800, Rating: 4.6, CustomerSatisfaction: 91 },
  { Date: '2025-05-03', Region: 'North America', Category: 'Smart Home', Product: 'Smart Thermostat V2', Channel: 'Retail Partner', UnitsSold: 380, Revenue: 76000, Cost: 38000, Profit: 38000, Rating: 4.5, CustomerSatisfaction: 89 },
  { Date: '2025-05-11', Region: 'Middle East', Category: 'Office', Product: 'Executive Task Chair', Channel: 'Enterprise B2B', UnitsSold: 115, Revenue: 57500, Cost: 28750, Profit: 28750, Rating: 4.8, CustomerSatisfaction: 95 },
  { Date: '2025-05-19', Region: 'Europe', Category: 'Electronics', Product: 'Pro Ultra Laptop', Channel: 'Direct Online', UnitsSold: 260, Revenue: 390000, Cost: 234000, Profit: 156000, Rating: 4.9, CustomerSatisfaction: 98 },
  { Date: '2025-05-27', Region: 'Latin America', Category: 'Smart Home', Product: 'AI Security Hub', Channel: 'Direct Online', UnitsSold: 230, Revenue: 57500, Cost: 32200, Profit: 25300, Rating: 4.4, CustomerSatisfaction: 86 },
  { Date: '2025-06-05', Region: 'North America', Category: 'Apparel', Product: 'Merino Travel Jacket', Channel: 'Mobile App', UnitsSold: 440, Revenue: 88000, Cost: 39600, Profit: 48400, Rating: 4.8, CustomerSatisfaction: 95 },
  { Date: '2025-06-14', Region: 'Asia Pacific', Category: 'Electronics', Product: 'Noise-Cancelling Buds', Channel: 'Retail Partner', UnitsSold: 580, Revenue: 116000, Cost: 58000, Profit: 58000, Rating: 4.6, CustomerSatisfaction: 92 },
  { Date: '2025-06-22', Region: 'Europe', Category: 'Office', Product: 'Ergo Standing Desk', Channel: 'Enterprise B2B', UnitsSold: 175, Revenue: 140000, Cost: 77000, Profit: 63000, Rating: 4.7, CustomerSatisfaction: 93 },
  { Date: '2025-06-30', Region: 'North America', Category: 'Electronics', Product: 'Pro Ultra Laptop', Channel: 'Direct Online', UnitsSold: 340, Revenue: 510000, Cost: 306000, Profit: 204000, Rating: 4.9, CustomerSatisfaction: 97 },
];

const saasRawData = [
  { Month: '2025-01', Tier: 'Starter', Region: 'North America', MRR: 48000, ActiveUsers: 8400, ChurnRate: 3.2, NPS: 62, ConversionRate: 4.1, ServerLatencyMs: 48 },
  { Month: '2025-01', Tier: 'Professional', Region: 'North America', MRR: 115000, ActiveUsers: 3200, ChurnRate: 1.8, NPS: 74, ConversionRate: 6.8, ServerLatencyMs: 42 },
  { Month: '2025-01', Tier: 'Enterprise', Region: 'North America', MRR: 260000, ActiveUsers: 780, ChurnRate: 0.6, NPS: 86, ConversionRate: 12.5, ServerLatencyMs: 38 },
  { Month: '2025-02', Tier: 'Starter', Region: 'Europe', MRR: 52000, ActiveUsers: 9100, ChurnRate: 3.0, NPS: 64, ConversionRate: 4.3, ServerLatencyMs: 52 },
  { Month: '2025-02', Tier: 'Professional', Region: 'Europe', MRR: 128000, ActiveUsers: 3600, ChurnRate: 1.6, NPS: 76, ConversionRate: 7.2, ServerLatencyMs: 44 },
  { Month: '2025-02', Tier: 'Enterprise', Region: 'Europe', MRR: 290000, ActiveUsers: 890, ChurnRate: 0.5, NPS: 88, ConversionRate: 13.1, ServerLatencyMs: 39 },
  { Month: '2025-03', Tier: 'Starter', Region: 'Asia Pacific', MRR: 58000, ActiveUsers: 10400, ChurnRate: 2.8, NPS: 66, ConversionRate: 4.8, ServerLatencyMs: 65 },
  { Month: '2025-03', Tier: 'Professional', Region: 'Asia Pacific', MRR: 145000, ActiveUsers: 4100, ChurnRate: 1.5, NPS: 78, ConversionRate: 7.6, ServerLatencyMs: 58 },
  { Month: '2025-03', Tier: 'Enterprise', Region: 'Asia Pacific', MRR: 330000, ActiveUsers: 1020, ChurnRate: 0.4, NPS: 89, ConversionRate: 14.0, ServerLatencyMs: 45 },
  { Month: '2025-04', Tier: 'Starter', Region: 'North America', MRR: 64000, ActiveUsers: 11800, ChurnRate: 2.5, NPS: 69, ConversionRate: 5.2, ServerLatencyMs: 46 },
  { Month: '2025-04', Tier: 'Professional', Region: 'North America', MRR: 162000, ActiveUsers: 4700, ChurnRate: 1.3, NPS: 81, ConversionRate: 8.4, ServerLatencyMs: 40 },
  { Month: '2025-04', Tier: 'Enterprise', Region: 'North America', MRR: 380000, ActiveUsers: 1190, ChurnRate: 0.4, NPS: 91, ConversionRate: 15.2, ServerLatencyMs: 36 },
  { Month: '2025-05', Tier: 'Starter', Region: 'Europe', MRR: 71000, ActiveUsers: 13200, ChurnRate: 2.3, NPS: 71, ConversionRate: 5.6, ServerLatencyMs: 49 },
  { Month: '2025-05', Tier: 'Professional', Region: 'Europe', MRR: 184000, ActiveUsers: 5400, ChurnRate: 1.2, NPS: 83, ConversionRate: 9.1, ServerLatencyMs: 41 },
  { Month: '2025-05', Tier: 'Enterprise', Region: 'Europe', MRR: 430000, ActiveUsers: 1360, ChurnRate: 0.3, NPS: 93, ConversionRate: 16.4, ServerLatencyMs: 35 },
  { Month: '2025-06', Tier: 'Starter', Region: 'Asia Pacific', MRR: 79000, ActiveUsers: 14800, ChurnRate: 2.1, NPS: 73, ConversionRate: 6.0, ServerLatencyMs: 60 },
  { Month: '2025-06', Tier: 'Professional', Region: 'Asia Pacific', MRR: 205000, ActiveUsers: 6100, ChurnRate: 1.1, NPS: 85, ConversionRate: 9.8, ServerLatencyMs: 51 },
  { Month: '2025-06', Tier: 'Enterprise', Region: 'Asia Pacific', MRR: 495000, ActiveUsers: 1550, ChurnRate: 0.3, NPS: 94, ConversionRate: 17.8, ServerLatencyMs: 34 },
];

const energyRawData = [
  { Country: 'United States', Sector: 'Power Generation', EnergySource: 'Solar PV', OutputTWh: 245.8, CarbonOffsetMT: 112.5, InvestmentMillionUSD: 4200, GridEfficiency: 92.4, JobsCreated: 145000 },
  { Country: 'United States', Sector: 'Power Generation', EnergySource: 'Wind Offshore', OutputTWh: 380.2, CarbonOffsetMT: 185.0, InvestmentMillionUSD: 5800, GridEfficiency: 94.1, JobsCreated: 88000 },
  { Country: 'Germany', Sector: 'Industrial', EnergySource: 'Hydrogen Fuel Cell', OutputTWh: 88.4, CarbonOffsetMT: 46.2, InvestmentMillionUSD: 2900, GridEfficiency: 89.6, JobsCreated: 32000 },
  { Country: 'Germany', Sector: 'Power Generation', EnergySource: 'Wind Onshore', OutputTWh: 210.6, CarbonOffsetMT: 104.8, InvestmentMillionUSD: 3100, GridEfficiency: 93.8, JobsCreated: 64000 },
  { Country: 'China', Sector: 'Power Generation', EnergySource: 'Hydroelectric', OutputTWh: 890.0, CarbonOffsetMT: 450.0, InvestmentMillionUSD: 11200, GridEfficiency: 96.5, JobsCreated: 240000 },
  { Country: 'China', Sector: 'Power Generation', EnergySource: 'Solar PV', OutputTWh: 610.4, CarbonOffsetMT: 295.0, InvestmentMillionUSD: 9800, GridEfficiency: 91.8, JobsCreated: 310000 },
  { Country: 'Japan', Sector: 'Transportation', EnergySource: 'Battery Storage / EV', OutputTWh: 140.2, CarbonOffsetMT: 78.5, InvestmentMillionUSD: 4100, GridEfficiency: 95.0, JobsCreated: 75000 },
  { Country: 'United Kingdom', Sector: 'Power Generation', EnergySource: 'Wind Offshore', OutputTWh: 195.0, CarbonOffsetMT: 96.4, InvestmentMillionUSD: 3700, GridEfficiency: 94.7, JobsCreated: 42000 },
  { Country: 'Denmark', Sector: 'Power Generation', EnergySource: 'Wind Offshore', OutputTWh: 94.5, CarbonOffsetMT: 48.0, InvestmentMillionUSD: 1600, GridEfficiency: 96.2, JobsCreated: 21000 },
  { Country: 'Norway', Sector: 'Power Generation', EnergySource: 'Hydroelectric', OutputTWh: 175.2, CarbonOffsetMT: 89.0, InvestmentMillionUSD: 2100, GridEfficiency: 97.4, JobsCreated: 18500 },
  { Country: 'India', Sector: 'Power Generation', EnergySource: 'Solar PV', OutputTWh: 340.5, CarbonOffsetMT: 168.0, InvestmentMillionUSD: 4900, GridEfficiency: 90.5, JobsCreated: 190000 },
  { Country: 'Australia', Sector: 'Power Generation', EnergySource: 'Rooftop Solar', OutputTWh: 165.8, CarbonOffsetMT: 82.3, InvestmentMillionUSD: 2400, GridEfficiency: 93.1, JobsCreated: 49000 },
];

function buildDataset(id: string, name: string, description: string, iconName: string, rawData: Record<string, any>[]): Dataset {
  const columns = analyzeColumns(rawData);
  const data = cleanDatasetRows(rawData, columns);
  return { id, name, description, iconName, data, columns };
}

export const INITIAL_DATASETS: Dataset[] = [
  buildDataset(
    'sales_omnichannel',
    'Global Sales & Channel Analytics',
    'Revenue, profit margins, units sold, and satisfaction metrics across international markets and product categories.',
    'TrendingUp',
    salesRawData
  ),
  buildDataset(
    'saas_growth',
    'SaaS Subscription & Product Metrics',
    'Monthly recurring revenue (MRR), churn rate, active user expansion, latency, and NPS scores by tier.',
    'BarChart3',
    saasRawData
  ),
  buildDataset(
    'energy_decarbonization',
    'Clean Energy & Sustainability',
    'Renewable energy generation output (TWh), carbon reduction offsets, capital investment, and green job creation.',
    'Zap',
    energyRawData
  ),
];
