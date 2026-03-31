export interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  status: "active" | "draft" | "archived"
  lastModified: string
  integrations: number
}

export interface ParsedRequirement {
  services: {
    name: string
    version: string
    type: "mandatory" | "optional"
    confidence: number
  }[]
  detectedFields: string[]
}

// Alias for use in config engine
export type ParsedRequirements = ParsedRequirement

export interface FieldMapping {
  sourceField: string
  targetField: string
  confidence: number
  status: "mapped" | "review" | "unmapped"
}

export interface VersionDiff {
  added: string[]
  removed: string[]
  renamed: { from: string; to: string }[]
}

export interface SimulationResult {
  status: "success" | "failure" | "partial"
  latency: number
  logs: { level: "info" | "warn" | "error"; message: string; timestamp: string }[]
  fallbackTriggered: boolean
  apiResponse: Record<string, unknown>
}

export const mockProjects: Project[] = [
  {
    id: "proj-001",
    name: "Payment Gateway Integration",
    description: "Connect to multiple payment providers with automatic failover and retry logic",
    createdAt: "2026-02-15",
    status: "active",
    lastModified: "2026-03-28",
    integrations: 4,
  },
  {
    id: "proj-002",
    name: "KYC Verification Pipeline",
    description: "Identity verification workflow with multi-provider support and compliance checks",
    createdAt: "2026-01-20",
    status: "active",
    lastModified: "2026-03-25",
    integrations: 3,
  },
  {
    id: "proj-003",
    name: "Banking API Aggregator",
    description: "Unified banking API interface for account data and transaction history",
    createdAt: "2026-03-01",
    status: "draft",
    lastModified: "2026-03-20",
    integrations: 2,
  },
  {
    id: "proj-004",
    name: "Fraud Detection Service",
    description: "Real-time fraud scoring and risk assessment integration",
    createdAt: "2025-12-10",
    status: "archived",
    lastModified: "2026-02-14",
    integrations: 5,
  },
]

export const mockParsedRequirements: ParsedRequirement = {
  services: [
    { name: "KYC Service", version: "v2.1", type: "mandatory", confidence: 95 },
    { name: "Payment Gateway", version: "v3.0", type: "mandatory", confidence: 92 },
    { name: "Email Notification", version: "v1.5", type: "optional", confidence: 78 },
    { name: "Audit Logger", version: "v2.0", type: "optional", confidence: 85 },
  ],
  detectedFields: [
    "customer_id",
    "first_name",
    "last_name",
    "email",
    "phone",
    "address",
    "document_type",
    "document_number",
  ],
}

export const mockFieldMappings: FieldMapping[] = [
  { sourceField: "customer_id", targetField: "user_identifier", confidence: 98, status: "mapped" },
  { sourceField: "first_name", targetField: "given_name", confidence: 95, status: "mapped" },
  { sourceField: "last_name", targetField: "family_name", confidence: 95, status: "mapped" },
  { sourceField: "email", targetField: "email_address", confidence: 100, status: "mapped" },
  { sourceField: "phone", targetField: "phone_number", confidence: 92, status: "mapped" },
  { sourceField: "address", targetField: "postal_address", confidence: 88, status: "review" },
  { sourceField: "document_type", targetField: "id_document_type", confidence: 75, status: "review" },
  { sourceField: "document_number", targetField: "id_number", confidence: 82, status: "mapped" },
]

export const mockVersionDiff: VersionDiff = {
  added: ["verification_method", "biometric_score", "liveness_check"],
  removed: ["legacy_verification_code"],
  renamed: [
    { from: "ssn", to: "tax_identification_number" },
    { from: "dob", to: "date_of_birth" },
  ],
}

export const mockSimulationResult: SimulationResult = {
  status: "success",
  latency: 234,
  logs: [
    { level: "info", message: "Simulation started", timestamp: "2026-03-31T10:00:00Z" },
    { level: "info", message: "KYC Service v2.1 initialized", timestamp: "2026-03-31T10:00:01Z" },
    { level: "info", message: "Payment Gateway v3.0 connected", timestamp: "2026-03-31T10:00:02Z" },
    { level: "warn", message: "Email service response delayed (150ms)", timestamp: "2026-03-31T10:00:03Z" },
    { level: "info", message: "All mappings validated successfully", timestamp: "2026-03-31T10:00:04Z" },
    { level: "info", message: "Simulation completed", timestamp: "2026-03-31T10:00:05Z" },
  ],
  fallbackTriggered: false,
  apiResponse: {
    status: "completed",
    transaction_id: "txn_abc123xyz",
    verified: true,
    risk_score: 12,
    processing_time_ms: 234,
  },
}

export const mockFailedSimulationResult: SimulationResult = {
  status: "failure",
  latency: 1542,
  logs: [
    { level: "info", message: "Simulation started", timestamp: "2026-03-31T11:00:00Z" },
    { level: "info", message: "KYC Service v2.1 initialized", timestamp: "2026-03-31T11:00:01Z" },
    { level: "error", message: "Payment Gateway connection timeout", timestamp: "2026-03-31T11:00:03Z" },
    { level: "warn", message: "Attempting fallback provider...", timestamp: "2026-03-31T11:00:04Z" },
    { level: "error", message: "Fallback provider unavailable", timestamp: "2026-03-31T11:00:05Z" },
    { level: "error", message: "Simulation failed: No available payment providers", timestamp: "2026-03-31T11:00:06Z" },
  ],
  fallbackTriggered: true,
  apiResponse: {
    status: "failed",
    error_code: "PROVIDER_UNAVAILABLE",
    message: "All payment providers are currently unavailable",
  },
}

export const sampleInputJson = `{
  "customer_id": "cust_12345",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0123",
  "address": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94102"
  },
  "document_type": "passport",
  "document_number": "AB1234567"
}`
