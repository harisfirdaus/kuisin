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

    const { action, participantId, quizId, questionId, answerData } = await req.json()

    if (action === 'participantDetails') {
      try {
        // Get participant details with quiz information
        const { data: participant, error: participantError } = await supabaseClient
          .from('participants')
          .select(`
            *,
            quizzes (
              title,
              code
            )
          `)
          .eq('id', participantId)
          .single()

        if (participantError) {
          throw new Error(`Error fetching participant: ${participantError.message}`)
        }

        if (!participant) {
          throw new Error('Participant not found')
        }

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

        if (answersError) {
          throw new Error(`Error fetching answers: ${answersError.message}`)
        }

        return new Response(
          JSON.stringify({
            data: {
              participant,
              answers: answers || []
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          },
        )
      } catch (error) {
        console.error('Error in participantDetails:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }
    }

    if (action === 'submit') {
      if (!participantId || !questionId || !answerData) {
        throw new Error('Missing required fields')
      }

      const { data, error } = await supabaseClient
        .from('answers')
        .insert([
          {
            participant_id: participantId,
            question_id: questionId,
            selected_option: answerData.selectedOption,
            is_correct: answerData.isCorrect,
            points_earned: answerData.pointsEarned
          }
        ])
        .select()

      if (error) throw error

      return new Response(
        JSON.stringify({ data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    if (action === 'list') {
      if (!participantId) {
        throw new Error('Missing participantId')
      }

      const { data, error } = await supabaseClient
        .from('answers')
        .select('*')
        .eq('participant_id', participantId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return new Response(
        JSON.stringify({ data }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    throw new Error(`Unknown action: ${action}`)
  } catch (error) {
    console.error('Error in answers function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
}) 