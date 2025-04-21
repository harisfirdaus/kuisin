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

    const { action, questionData, questionId, quizId } = await req.json();

    if (action === 'list') {
      // Get list of questions for a quiz
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } 
    else if (action === 'create') {
      // Create a new question
      console.log('Creating new question with data:', { quizId, questionData });
      
      if (!quizId || !questionData) {
        throw new Error('Missing required fields: quizId or questionData');
      }

      if (!questionData.question_text || !questionData.options || !questionData.correct_option) {
        throw new Error('Missing required question fields');
      }

      const { data, error } = await supabase
        .from('questions')
        .insert([{ 
          ...questionData,
          quiz_id: quizId
        }])
        .select();

      if (error) {
        console.error('Error creating question:', error);
        throw error;
      }
      
      console.log('Question created successfully:', data);
      
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (action === 'update') {
      // Update an existing question
      const { data, error } = await supabase
        .from('questions')
        .update(questionData)
        .eq('id', questionId)
        .select();

      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (action === 'delete') {
      // Delete the question
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (action === 'get') {
      // Get a single question by ID
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', questionId)
        .single();

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
    console.error('Error in questions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
