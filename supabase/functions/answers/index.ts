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
      try {
        console.log('Submit answer request:', { participantId, questionId, answerData });

        if (!participantId || !questionId || !answerData) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Missing required fields',
              details: { participantId, questionId, answerData }
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400,
            }
          );
        }

        // Get question details first
        const { data: question, error: questionError } = await supabaseClient
          .from('questions')
          .select('*')
          .eq('id', questionId)
          .single();

        if (questionError) {
          console.error('Error fetching question:', questionError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to fetch question details',
              details: questionError.message 
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          );
        }

        // Calculate if answer is correct and points earned
        const isCorrect = answerData.selected_option === question.correct_option;
        const pointsEarned = isCorrect ? question.points : 0;

        // Insert answer
        const { data: answer, error: answerError } = await supabaseClient
          .from('answers')
          .insert([
            {
              participant_id: participantId,
              question_id: questionId,
              selected_option: answerData.selected_option,
              is_correct: isCorrect,
              points_earned: pointsEarned
            }
          ])
          .select();

        if (answerError) {
          console.error('Error inserting answer:', answerError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to save answer',
              details: answerError.message 
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          );
        }

        // Update participant score
        const { data: participant, error: participantError } = await supabaseClient
          .from('participants')
          .select('score')
          .eq('id', participantId)
          .single();

        if (participantError) {
          console.error('Error fetching participant:', participantError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to fetch participant score',
              details: participantError.message 
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          );
        }

        const newScore = (participant.score || 0) + pointsEarned;

        const { error: updateError } = await supabaseClient
          .from('participants')
          .update({ score: newScore })
          .eq('id', participantId);

        if (updateError) {
          console.error('Error updating participant score:', updateError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to update score',
              details: updateError.message 
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          );
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            data: {
              answer,
              isCorrect,
              pointsEarned,
              newScore
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      } catch (error) {
        console.error('Error in submit action:', error);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Internal server error',
            details: error.message 
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        );
      }
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