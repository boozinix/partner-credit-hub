# Partner Credit Funding Portal

A two-sided workflow portal that replaces a manual Excel-based credit approval process for AWS Marketplace partner deals.

## The Problem

When customers purchase Red Hat products on AWS Marketplace and qualify for post-deal credits, the Finance team at AWS tracked every request manually in an Excel spreadsheet. Customers had no visibility. Account Managers had no visibility. Approvals were routed by email. Nobody knew how much of the annual credit budget was left.

## The Solution

A live portal with:

- Customer-facing request submission + real-time status tracker
- Finance queue with automatic tier-based approval routing (<$10K, $10-50K, >$50K)
- Director/VP approver views
- Live budget pool tracking with donut chart
- OOO handling with alternate approver reassignment

## Live Demo

https://partner-credits-demo.lovable.app

## Built With

Lovable (React + TypeScript + Supabase + Tailwind + Recharts)

## Run Locally

```bash
npm install && npm run dev
```

Database: Supabase (see `.env.example` for required vars)

## What I Cut

See the "About This Build" section on the landing page for full tradeoff narrative.
