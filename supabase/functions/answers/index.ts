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

    const { action, answerData, participantId, questionId, quizId } = await req.json();

    if (action === 'submit') {
      // Get the question to check correct answer and points
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select('*')
        .eq('id', questionId)
        .single();
        
      if (questionError) throw questionError;
      
      // Determine if answer is correct
      const isCorrect = answerData.selected_option === questionData.correct_option;
      const pointsEarned = isCorrect ? questionData.points : 0;
      
      // Save the answer
      const { data, error } = await supabase
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

      if (error) throw error;
      
      // Update participant's score
      const { data: participantData, error: participantError } = await supabase
        .from('participants')
        .select('score')
        .eq('id', participantId)
        .single();
        
      if (participantError) throw participantError;
      
      const newScore = participantData.score + pointsEarned;
      
      await supabase
        .from('participants')
        .update({ score: newScore })
        .eq('id', participantId);
      
      return new Response(JSON.stringify({ 
        success: true, 
        data,
        isCorrect,
        pointsEarned,
        newScore 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (action === 'list') {
      // Get all answers for a participant
      const { data, error } = await supabase
        .from('answers')
        .select(`
          *,
          questions:question_id (*)
        `)
        .eq('participant_id', participantId);

      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (action === 'participantDetails') {
      // Get all answers for a specific participant with question details
      const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select(`
          *,
          questions:question_id (*)
        `)
        .eq('participant_id', participantId);

      if (answersError) throw answersError;
      
      // Get participant info
      const { data: participant, error: participantError } = await supabase
        .from('participants')
        .select('*')
        .eq('id', participantId)
        .single();
        
      if (participantError) throw participantError;
      
      // Get quiz info if quizId is provided
      let quiz = null;
      if (quizId) {
        const { data: quizData, error: quizError } = await supabase
          .from('quizzes')
          .select('*')
          .eq('id', quizId)
          .single();
          
        if (!quizError) {
          quiz = quizData;
        }
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        data: { 
          answers,
          participant,
          quiz 
        } 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in answers function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
