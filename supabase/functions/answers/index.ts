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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { action, participantId, quizId } = await req.json()

    if (action === 'participantDetails') {
      // Get participant details
      const { data: participant, error: participantError } = await supabaseClient
        .from('participants')
        .select('*')
        .eq('id', participantId)
        .single()

      if (participantError) throw participantError

      // Get answers with questions details
      const { data: answers, error: answersError } = await supabaseClient
        .from('answers')
        .select(`
          id,
          selected_option,
          is_correct,
          points_earned,
          created_at,
          questions (
            id,
            question_text,
            options,
            correct_option
          )
        `)
        .eq('participant_id', participantId)
        .order('created_at', { ascending: true })

      if (answersError) throw answersError

      return new Response(
        JSON.stringify({
          data: {
            participant,
            answers
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    throw new Error(`Unknown action: ${action}`)
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
}) 