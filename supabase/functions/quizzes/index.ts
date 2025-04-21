
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a unique quiz code
function generateQuizCode(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, quizData, quizId, userId } = await req.json();

    if (action === 'list') {
      // Get list of quizzes
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } 
    else if (action === 'create') {
      // Generate a unique quiz code
      const code = generateQuizCode();
      
      // Create a new quiz
      const { data, error } = await supabase
        .from('quizzes')
        .insert([
          { 
            ...quizData,
            code, 
            created_by: userId,
            is_active: true 
          }
        ])
        .select();

      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (action === 'update') {
      // Update an existing quiz
      const { data, error } = await supabase
        .from('quizzes')
        .update(quizData)
        .eq('id', quizId)
        .select();

      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (action === 'delete') {
      // Delete questions first (due to foreign key constraints)
      await supabase
        .from('questions')
        .delete()
        .eq('quiz_id', quizId);
        
      // Then delete the quiz
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);

      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (action === 'toggle') {
      // Toggle quiz active status
      const { data: currentQuiz, error: fetchError } = await supabase
        .from('quizzes')
        .select('is_active')
        .eq('id', quizId)
        .single();
        
      if (fetchError) throw fetchError;
      
      const newStatus = !currentQuiz.is_active;
      
      const { data, error } = await supabase
        .from('quizzes')
        .update({ is_active: newStatus })
        .eq('id', quizId)
        .select();

      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    else if (action === 'get') {
      // Get a single quiz by ID
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          questions (*)
        `)
        .eq('id', quizId)
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
    console.error('Error in quizzes function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
