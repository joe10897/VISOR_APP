import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let body = {}
    try {
      body = await req.json()
    } catch (_) {}

    const events = body.events || []

    if (events.length === 0) {
      return new Response(JSON.stringify({ status: 'verified_ok' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const receivedText = event.message.text.trim()
        const senderUserId = event.source.userId

        // 🔍 這裡必須對應正確的資料表名稱：line_contact_person
        const { data: binding, error } = await supabase
          .from('line_contact_person')
          .select('*')
          .eq('verification_code', receivedText)
          .eq('status', 'pending')
          .single()

        if (binding && !error) {
          // 🔍 這裡也必須對應正確的資料表名稱：line_contact_person
          await supabase
            .from('line_contact_person')
            .update({ 
              contact_user_id: senderUserId, 
              contact_name: "緊急聯絡人",
              status: 'verified' 
            })
            .eq('id', binding.id);

          const lineToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
          if (lineToken) {
            await fetch('https://api.line.me/v2/bot/message/reply', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${lineToken}`,
              },
              body: JSON.stringify({
                replyToken: event.replyToken,
                messages: [{ type: 'text', text: '✅ 成功！您已成為 V.I.S.O.R. 的指定緊急聯絡人。' }],
              }),
            });
          }
        }
      }
    }

    return new Response(JSON.stringify({ status: 'ok' }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 
    })

  } catch (error) {
    console.error("Webhook Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 
    })
  }
})