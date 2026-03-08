import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { action, token } = await req.json();

    if (action === "request") {
      // Get user from auth header
      const authHeader = req.headers.get("authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error: userError } = await userClient.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate secure token
      const tokenValue = crypto.randomUUID() + "-" + crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      // Store token
      const { error: insertError } = await supabase
        .from("account_deletion_tokens")
        .insert({
          user_id: user.id,
          token: tokenValue,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) throw insertError;

      // For now, return the token directly since we don't have email sending configured
      // In production, this would send an email with a confirmation link
      return new Response(
        JSON.stringify({
          success: true,
          message: "Deletion request created. Please confirm to proceed.",
          confirmation_token: tokenValue,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "confirm") {
      if (!token) {
        return new Response(JSON.stringify({ error: "Token required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find and validate token
      const { data: tokenData, error: tokenError } = await supabase
        .from("account_deletion_tokens")
        .select("*")
        .eq("token", token)
        .eq("used", false)
        .single();

      if (tokenError || !tokenData) {
        return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (new Date(tokenData.expires_at) < new Date()) {
        return new Response(JSON.stringify({ error: "Token has expired" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userId = tokenData.user_id;

      // Mark token as used
      await supabase
        .from("account_deletion_tokens")
        .update({ used: true })
        .eq("id", tokenData.id);

      // Delete user data
      await supabase.from("scan_reports").delete().eq("user_id", userId);
      await supabase.from("report_upvotes").delete().eq("user_id", userId);
      await supabase.from("community_reports").delete().eq("user_id", userId);
      await supabase.from("profiles").delete().eq("user_id", userId);
      await supabase.from("account_deletion_tokens").delete().eq("user_id", userId);

      // Delete auth user
      const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
      if (deleteError) throw deleteError;

      return new Response(
        JSON.stringify({ success: true, message: "Account deleted successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
