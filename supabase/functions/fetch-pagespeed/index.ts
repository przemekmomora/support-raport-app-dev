import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PageSpeedResult {
  mobileScore: number;
  desktopScore: number;
  pagespeedUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_PAGESPEED_API_KEY = Deno.env.get("GOOGLE_PAGESPEED_API_KEY");
    if (!GOOGLE_PAGESPEED_API_KEY) {
      throw new Error("GOOGLE_PAGESPEED_API_KEY is not configured");
    }

    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    console.log(`Fetching PageSpeed data for: ${normalizedUrl}`);

    // Fetch mobile score
    const mobileApiUrl = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    mobileApiUrl.searchParams.set("url", normalizedUrl);
    mobileApiUrl.searchParams.set("key", GOOGLE_PAGESPEED_API_KEY);
    mobileApiUrl.searchParams.set("strategy", "mobile");
    mobileApiUrl.searchParams.set("category", "performance");

    // Fetch desktop score
    const desktopApiUrl = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    desktopApiUrl.searchParams.set("url", normalizedUrl);
    desktopApiUrl.searchParams.set("key", GOOGLE_PAGESPEED_API_KEY);
    desktopApiUrl.searchParams.set("strategy", "desktop");
    desktopApiUrl.searchParams.set("category", "performance");

    // Run both requests in parallel
    const [mobileResponse, desktopResponse] = await Promise.all([
      fetch(mobileApiUrl.toString()),
      fetch(desktopApiUrl.toString()),
    ]);

    if (!mobileResponse.ok) {
      const errorData = await mobileResponse.json();
      console.error("Mobile API error:", errorData);
      throw new Error(`Mobile PageSpeed API error: ${JSON.stringify(errorData)}`);
    }

    if (!desktopResponse.ok) {
      const errorData = await desktopResponse.json();
      console.error("Desktop API error:", errorData);
      throw new Error(`Desktop PageSpeed API error: ${JSON.stringify(errorData)}`);
    }

    const mobileData = await mobileResponse.json();
    const desktopData = await desktopResponse.json();

    // Extract performance scores (0-1 scale, convert to 0-100)
    const mobileScore = Math.round(
      (mobileData.lighthouseResult?.categories?.performance?.score ?? 0) * 100
    );
    const desktopScore = Math.round(
      (desktopData.lighthouseResult?.categories?.performance?.score ?? 0) * 100
    );

    // Generate PageSpeed Insights URL that will show/run analysis for this URL
    // Note: API doesn't return a persistent analysis ID, so we use the URL-based format
    const pagespeedUrl = `https://pagespeed.web.dev/analysis?hl=pl&url=${encodeURIComponent(normalizedUrl)}`;

    const result: PageSpeedResult = {
      mobileScore,
      desktopScore,
      pagespeedUrl,
    };

    console.log(`PageSpeed results - Mobile: ${mobileScore}, Desktop: ${desktopScore}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error fetching PageSpeed data:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
