import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para las tablas de Supabase
export interface Tenant {
  id: string
  name: string
  slug: string
  domain?: string
  settings: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  tenant_id: string
  email: string
  full_name?: string
  company_name?: string
  role: 'user' | 'admin' | 'super_admin'
  settings: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CompanyAnalysis {
  id: string
  tenant_id: string
  user_id: string
  company_url: string
  company_name?: string
  analysis_data: Record<string, any>
  status: 'pending' | 'processing' | 'completed' | 'failed'
  findings: any[]
  recommendations: any[]
  created_at: string
  updated_at: string
}

export interface Agent {
  id: string
  tenant_id: string
  name: string
  description?: string
  personality: Record<string, any>
  knowledge: Record<string, any>
  skills: any[]
  context: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AgentConversation {
  id: string
  tenant_id: string
  user_id: string
  agent_id: string
  session_id: string
  messages: any[]
  created_at: string
  updated_at: string
}

export interface Prompt {
  id: string
  tenant_id: string
  name: string
  description?: string
  content: string
  category?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface McpIntegration {
  id: string
  tenant_id: string
  user_id: string
  provider: string
  credentials: Record<string, any>
  settings: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  tenant_id: string
  user_id: string
  title: string
  type: string
  data: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SystemConfig {
  id: string
  tenant_id: string
  key: string
  value: Record<string, any>
  description?: string
  created_at: string
  updated_at: string
}

export interface UsageLimit {
  id: string
  tenant_id: string
  user_id: string
  resource_type: string
  current_usage: number
  limit_value: number
  reset_date: string
  created_at: string
  updated_at: string
} 