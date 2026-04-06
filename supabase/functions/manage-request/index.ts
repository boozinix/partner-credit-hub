import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, request_id, tracking_id, comments, approver_name } = await req.json();

    // Get the request
    let query = supabase.from("credit_requests").select("*");
    if (request_id) query = query.eq("id", request_id);
    else if (tracking_id) query = query.eq("tracking_id", tracking_id);
    
    const { data: request, error: fetchError } = await query.single();
    if (fetchError || !request) {
      return new Response(JSON.stringify({ error: "Request not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const changedBy = approver_name || "System";
    let newStatus: string;
    let comment: string;

    switch (action) {
      case "approve": {
        if (request.status === "SUBMITTED" || request.status === "FINANCE_REVIEW") {
          if (request.tier === "UNDER_10K") {
            newStatus = "APPROVED";
            comment = "Approved by Finance. Tier 1 — no further approval needed.";
          } else {
            newStatus = "DIRECTOR_PENDING";
            comment = "Finance approved. Routed to Director.";
          }
        } else if (request.status === "DIRECTOR_PENDING") {
          if (request.tier === "BETWEEN_10K_50K") {
            newStatus = "APPROVED";
            comment = "Director approved. Tier 2 — no further approval needed.";
          } else {
            newStatus = "VP_PENDING";
            comment = "Director approved. Routed to VP for final review.";
          }
        } else if (request.status === "VP_PENDING") {
          newStatus = "APPROVED";
          comment = "VP approved. Credit fully approved.";
        } else {
          return new Response(JSON.stringify({ error: "Cannot approve in current status" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        break;
      }
      case "deny": {
        newStatus = "DENIED";
        comment = comments || "Request denied.";
        break;
      }
      case "send_back": {
        newStatus = "NEEDS_CHANGES";
        comment = comments || "Changes requested.";
        break;
      }
      case "resubmit": {
        newStatus = "FINANCE_REVIEW";
        comment = comments || "Resubmitted by customer.";
        break;
      }
      case "payout": {
        newStatus = "PAID_OUT";
        comment = "Credit disbursed.";
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Update status
    await supabase
      .from("credit_requests")
      .update({ status: newStatus })
      .eq("id", request.id);

    // Log history
    await supabase.from("status_history").insert({
      request_id: request.id,
      from_status: request.status,
      to_status: newStatus,
      changed_by: changedBy,
      comments: comment,
    });

    return new Response(
      JSON.stringify({ success: true, new_status: newStatus, comment }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
