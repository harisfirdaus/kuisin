
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, participantData, participantId, quizId, quizCode, participantName } = await req.json();

    if (action === 'list') {
      // Get list of participants for a quiz
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('quiz_id', quizId)
        .order('score', { ascending: false })
        .order('completion_time', { ascending: true });

      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } 
    else if (action === 'join') {
      // First, get the quiz ID from the code
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('id, title, is_active')
        .eq('code', quizCode)
        .single();
      
      if (quizError) {
        return new Response(JSON.stringify({ success: false, error: 'Kode kuis tidak valid' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (!quizData.is_active) {
        return new Response(JSON.stringify({ success: false, error: 'Kuis ini tidak aktif' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Create a new participant
      const { data, error } = await supabase
        .from('participants')
        .insert([
          { 
            name: participantName,
            quiz_id: quizData.id,
            score: 0
          }
        ])
        .select();

      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, data, quiz: quizData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (action === 'update') {
      // Update participant score and completion time
      const { data, error } = await supabase
        .from('participants')
        .update(participantData)
        .eq('id', participantId)
        .select();

      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (action === 'leaderboard') {
      // Get leaderboard for a quiz
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('quiz_id', quizId)
        .order('score', { ascending: false })
        .order('completion_time', { ascending: true })
        .limit(50);

      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in participants function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
