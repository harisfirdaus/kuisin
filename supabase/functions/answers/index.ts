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

        // Get participant details and check if this is the last question
        const { data: participant, error: participantError } = await supabaseClient
          .from('participants')
          .select(`
            *,
            quizzes!inner (
              id,
              questions (count)
            )
          `)
          .eq('id', participantId)
          .single();

        if (participantError) {
          console.error('Error fetching participant:', participantError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to fetch participant details',
              details: participantError.message 
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          );
        }

        // Count answered questions
        const { count: answeredQuestions, error: countError } = await supabaseClient
          .from('answers')
          .select('*', { count: 'exact' })
          .eq('participant_id', participantId);

        if (countError) {
          console.error('Error counting answers:', countError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to count answers',
              details: countError.message 
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          );
        }

        // Calculate new score
        const newScore = (participant.score || 0) + pointsEarned;

        // Update participant data
        const updateData: any = { score: newScore };

        // If this is the last question, calculate completion time
        if (answeredQuestions === participant.quizzes.questions[0].count) {
          const startTime = new Date(participant.created_at).getTime();
          const endTime = new Date().getTime();
          const completionTime = Math.round((endTime - startTime) / 1000); // Convert to seconds
          updateData.completion_time = completionTime;
        }

        const { error: updateError } = await supabaseClient
          .from('participants')
          .update(updateData)
          .eq('id', participantId);

        if (updateError) {
          console.error('Error updating participant:', updateError);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to update participant',
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
              newScore,
              isComplete: answeredQuestions === participant.quizzes.questions[0].count,
              completionTime: updateData.completion_time
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