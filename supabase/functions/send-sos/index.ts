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
    const { user_id, location } = await req.json()

    if (!user_id || !location) {
      return new Response(JSON.stringify({ error: "缺少 user_id 或 location 參數" }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 查詢該騎士已綁定的 LINE 緊急聯絡人
    const { data: contacts, error } = await supabase
      .from('line_contact_person')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'verified')

    if (error || !contacts || contacts.length === 0) {
      return new Response(JSON.stringify({ error: "尚未綁定任何緊急聯絡人" }), { 
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const lineToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN'); //預先設定於supabase的環境變數中
    const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    const messageText = `🚨【V.I.S.O.R. 緊急求救】\n騎士發生狀況！\nGPS 位置：\n${googleMapsUrl}`;

    // 發送給所有已驗證的緊急聯絡人
    for (const contact of contacts) {
      if (!contact.contact_user_id) continue;

      const lineRes = await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${lineToken}`,
        },
        body: JSON.stringify({
          to: contact.contact_user_id,
          messages: [{ type: 'text', text: messageText }],
        }),
      });

      if (!lineRes.ok) {
        const errText = await lineRes.text();
        console.error(`LINE API 傳送給 ${contact.contact_user_id} 失敗: ${errText}`);
      }
    }

    return new Response(JSON.stringify({ status: 'success', sent_count: contacts.length }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 
    })

  } catch (error) {
    console.error("SOS Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 
    })
  }
})