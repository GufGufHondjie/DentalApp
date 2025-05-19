// @ts-ignore Deno import
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore Deno import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, apikey",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  try {
    const body = await req.json();

    const {
      secret_token,
      email,
      password,
      full_name,
      sedula_nr,
      phone_number,
      preferred_lang,
      notes,
      address,
      date_of_birth,
      gender,
    } = body;

    const expectedSecret = Deno.env.get("REGISTER_PATIENT_SECRET");
    if (!secret_token || secret_token !== expectedSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers,
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers,
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      },
    });

    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (userError || !userData?.user?.id) {
      return new Response(JSON.stringify({ error: userError?.message || "User creation failed" }), {
        status: 400,
        headers,
      });
    }

    const userId = userData.user.id;

    const { error: rpcError } = await supabase.rpc("register_new_patient", {
      new_user_id: userId,
      full_name,
      email,
      sedula_nr,
      phone_number,
      preferred_lang,
      notes,
      address,
      date_of_birth,
      gender,
    });

    if (rpcError) {
      return new Response(JSON.stringify({ error: rpcError.message }), {
        status: 500,
        headers,
      });
    }

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Unknown error" }), {
      status: 500,
      headers,
    });
  }
});
