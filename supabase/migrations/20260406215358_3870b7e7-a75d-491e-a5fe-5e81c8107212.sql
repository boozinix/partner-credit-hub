
CREATE TYPE public.request_status AS ENUM (
  'SUBMITTED', 'FINANCE_REVIEW', 'DIRECTOR_PENDING', 'VP_PENDING', 
  'NEEDS_CHANGES', 'APPROVED', 'DENIED', 'PAID_OUT'
);

CREATE TYPE public.request_tier AS ENUM ('UNDER_10K', 'BETWEEN_10K_50K', 'OVER_50K');
CREATE TYPE public.approver_role AS ENUM ('FINANCE', 'DIRECTOR', 'VP');

CREATE TABLE public.approvers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role public.approver_role NOT NULL,
  is_ooo BOOLEAN NOT NULL DEFAULT false,
  ooo_delegate_id UUID REFERENCES public.approvers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.credit_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_id TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  aws_account_id TEXT NOT NULL,
  aws_marketplace_deal_id TEXT,
  credit_amount DECIMAL(12,2) NOT NULL,
  credit_type TEXT NOT NULL DEFAULT 'Post-Deal Credit',
  tier public.request_tier NOT NULL,
  status public.request_status NOT NULL DEFAULT 'SUBMITTED',
  products TEXT[] NOT NULL DEFAULT '{}',
  business_justification TEXT,
  deal_start_date DATE,
  deal_end_date DATE,
  invoice_number TEXT,
  fiscal_year TEXT NOT NULL DEFAULT 'FY2026',
  assigned_approver_id UUID REFERENCES public.approvers(id),
  internal_notes TEXT,
  denial_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.approval_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.credit_requests(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES public.approvers(id),
  role public.approver_role NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  comments TEXT,
  acted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.credit_requests(id) ON DELETE CASCADE,
  from_status public.request_status,
  to_status public.request_status NOT NULL,
  changed_by TEXT NOT NULL,
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.approvers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access" ON public.approvers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.credit_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.approval_steps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON public.status_history FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_credit_requests_updated_at
  BEFORE UPDATE ON public.credit_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_credit_requests_status ON public.credit_requests(status);
CREATE INDEX idx_credit_requests_tracking_id ON public.credit_requests(tracking_id);
CREATE INDEX idx_credit_requests_customer_email ON public.credit_requests(customer_email);
CREATE INDEX idx_approval_steps_request_id ON public.approval_steps(request_id);
CREATE INDEX idx_status_history_request_id ON public.status_history(request_id);
