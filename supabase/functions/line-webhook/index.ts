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
      //訊息?、純文字?
      if (event.type === 'message' && event.message.type === 'text') {
        const receivedText = event.message.text.trim(); // LINE 傳進來的字
        const senderUserId = event.source.userId;
        const lineToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');  

        // 檢查是否為純數字且剛好 6 位數
        const isSixDigits = /^\d{6}$/.test(receivedText);
        
        if (!isSixDigits) {
          if (lineToken) {
            await fetch('https://api.line.me/v2/bot/message/reply', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${lineToken}` },
              body: JSON.stringify({
                replyToken: event.replyToken,
                messages: [{ type: 'text', text: '⚠️ 請輸入正確的 6 位數字驗證碼。' }],
              }),
            });
          }
          continue; 
        }

        // 去資料庫查詢這組 6 位數驗證碼
        const { data: binding, error } = await supabase
          .from('line_contact_person')
          .select('*')
          .eq('verification_code', receivedText)
          .eq('status', 'pending')
          .single();

        // 找不到資料 (驗證碼錯誤或不存在)
        if (!binding || error) {
          if (lineToken) {
            await fetch('https://api.line.me/v2/bot/message/reply', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${lineToken}` },
              body: JSON.stringify({
                replyToken: event.replyToken,
                messages: [{ type: 'text', text: '❌ 驗證碼錯誤或不存在，請確認後再試。' }],
              }),
            });
          }
          continue; 
        }

        // // 判斷這筆驗證碼是否建立超過 3 分鐘
        // const createdAt = new Date(binding.created_at).getTime();
        // const now = new Date().getTime();
        // const diffMinutes = (now - createdAt) / (1000 * 60);

        // if (diffMinutes > 3) {
        //   await supabase.from('line_contact_person').delete().eq('id', binding.id);
          
        //   if (lineToken) {
        //     await fetch('https://api.line.me/v2/bot/message/reply', {
        //       method: 'POST',
        //       headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${lineToken}` },
        //       body: JSON.stringify({
        //         replyToken: event.replyToken,
        //         messages: [{ type: 'text', text: '❌ 綁定失敗：此驗證碼已過期（超過 3 分鐘），請在 APP 重新產生。' }],
        //       }),
        //     });
        //   }
        //   continue; 
        // }

        // 5. 檢查是否已經是該使用者的緊急聯絡人 (防重複綁定 + 偵錯 Log)
        console.log('--- 開始檢查重複綁定 ---');
        console.log('當前發送訊息的 LINE ID (senderUserId):', senderUserId);
        console.log('當前 APP 用戶 ID (user_id):', binding.user_id);

        const { data: duplicateCheck, error: dupError } = await supabase
          .from('line_contact_person')
          .select('*')
          .eq('user_id', binding.user_id)
          .eq('contact_user_id', senderUserId)
          .eq('status', 'verified');

        console.log('查詢重複結果 (duplicateCheck):', duplicateCheck);
        console.log('查詢錯誤 (dupError):', dupError);

        if (duplicateCheck && duplicateCheck.length > 0) {
          console.log('偵測到重複，準備攔截...');
          await supabase.from('line_contact_person').delete().eq('id', binding.id);
          
          if (lineToken) {
            await fetch('https://api.line.me/v2/bot/message/reply', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${lineToken}` },
              body: JSON.stringify({
                replyToken: event.replyToken,
                messages: [{ type: 'text', text: '❌ 綁定失敗：您已經加入過了，無法重複新增為緊急聯絡人！' }],
              }),
            });
          }
          continue;
        }

        // 6. 檢查已綁定的聯絡人數量是否已達上限 (最多 3 人)
        const { data: verifiedContacts, error: fetchError } = await supabase
          .from('line_contact_person')
          .select('contact_name')
          .eq('user_id', binding.user_id)
          .eq('status', 'verified');

        if (verifiedContacts && verifiedContacts.length >= 3) {
          await supabase.from('line_contact_person').delete().eq('id', binding.id);
          
          if (lineToken) {
            await fetch('https://api.line.me/v2/bot/message/reply', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${lineToken}` },
              body: JSON.stringify({
                replyToken: event.replyToken,
                messages: [{ type: 'text', text: '❌ 綁定失敗：該帳號的緊急聯絡人已達上限（最多 3 位）。' }],
              }),
            });
          }
          continue;
        }

        // 7. 尋找 1、2、3 之間的空缺位子進行補位編號
        const usedNumbers = (verifiedContacts || []).map(c => {
          const match = c.contact_name?.match(/緊急聯絡人(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        });

        let nextSlot = 1;
        for (let i = 1; i <= 3; i++) {
          if (!usedNumbers.includes(i)) {
            nextSlot = i;
            break;
          }
        }
        const dynamicName = `緊急聯絡人${nextSlot}`;

        // 8. 更新資料庫
        const { error: updateError } = await supabase
          .from('line_contact_person')
          .update({ 
            contact_user_id: senderUserId, 
            contact_name: dynamicName, 
            status: 'verified' 
          })
          .eq('id', binding.id);

        // 9. 確定更新沒有錯誤後發送成功或失敗訊息
        if (!updateError) {
          if (lineToken) {
            await fetch('https://api.line.me/v2/bot/message/reply', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${lineToken}`,
              },
              body: JSON.stringify({
                replyToken: event.replyToken,
                messages: [{ type: 'text', text: `✅ 成功！您已成為 V.I.S.O.R. 的指定${dynamicName}。` }],
              }),
            });
          }
        } else {
          console.error('資料庫更新失敗:', updateError);
          if (lineToken) {
            await fetch('https://api.line.me/v2/bot/message/reply', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${lineToken}`,
              },
              body: JSON.stringify({
                replyToken: event.replyToken,
                messages: [{ type: 'text', text: 'X﹏X綁定失敗！' }],
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
    console.error("Webhook Error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 
    })
  }
})