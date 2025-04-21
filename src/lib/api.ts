import { supabase } from "@/integrations/supabase/client";

// Authentication
export const loginAdmin = async (email: string, password: string) => {
  const response = await supabase.functions.invoke('auth', {
    body: { action: 'login', email, password },
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
};

// Quiz management
export const getQuizzes = async () => {
  const response = await supabase.functions.invoke('quizzes', {
    body: { action: 'list' },
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
};

export const createQuiz = async (quizData: any, userId: string) => {
  const response = await supabase.functions.invoke('quizzes', {
    body: { action: 'create', quizData, userId },
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
};

export const updateQuiz = async (quizId: string, quizData: any) => {
  const response = await supabase.functions.invoke('quizzes', {
    body: { action: 'update', quizId, quizData },
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
};

export const deleteQuiz = async (quizId: string) => {
  const response = await supabase.functions.invoke('quizzes', {
    body: { action: 'delete', quizId },
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
};

export const toggleQuizStatus = async (quizId: string) => {
  const response = await supabase.functions.invoke('quizzes', {
    body: { action: 'toggle', quizId },
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
};

export const getQuiz = async (quizId: string) => {
  const response = await supabase.functions.invoke('quizzes', {
    body: { action: 'get', quizId },
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
};

// Question management
export const getQuestions = async (quizId: string) => {
  const response = await supabase.functions.invoke('questions', {
    body: { action: 'list', quizId },
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
};

export const createQuestion = async (quizId: string, questionData: any) => {
  const response = await supabase.functions.invoke('questions', {
    body: { action: 'create', quizId, questionData },
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
};

export const updateQuestion = async (questionId: string, questionData: any) => {
  const response = await supabase.functions.invoke('questions', {
    body: { action: 'update', questionId, questionData },
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
};

export const deleteQuestion = async (questionId: string) => {
  const response = await supabase.functions.invoke('questions', {
    body: { action: 'delete', questionId },
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
};

// Participant management
export const getParticipants = async (quizId: string) => {
  const response = await supabase.functions.invoke('participants', {
    body: { action: 'list', quizId },
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
};

export const joinQuiz = async (quizCode: string, participantName: string) => {
  try {
    const response = await supabase.functions.invoke('participants', {
      body: { action: 'join', quizCode, participantName },
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data.success) {
      throw new Error(response.data.error || 'Gagal bergabung ke kuis');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error in joinQuiz:', error);
    if (error.message.includes('Edge Function returned a non-2xx status code')) {
      throw new Error('Gagal terhubung ke server. Silakan coba lagi.');
    }
    throw error;
  }
};

export const updateParticipant = async (participantId: string, participantData: any) => {
  const response = await supabase.functions.invoke('participants', {
    body: { action: 'update', participantId, participantData },
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
};

export const getLeaderboard = async (quizId: string) => {
  const response = await supabase.functions.invoke('participants', {
    body: { action: 'leaderboard', quizId },
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
};

// Answer management
export const submitAnswer = async (participantId: string, questionId: string, answerData: any) => {
  try {
    const response = await supabase.functions.invoke('answers', {
      body: { 
        action: 'submit', 
        participantId, 
        questionId, 
        answerData 
      },
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data.success) {
      throw new Error(response.data.error || 'Gagal mengirim jawaban');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error in submitAnswer:', error);
    if (error.message.includes('Edge Function returned a non-2xx status code')) {
      throw new Error('Gagal terhubung ke server. Silakan coba lagi.');
    }
    throw error;
  }
};

export const getAnswers = async (participantId: string) => {
  const response = await supabase.functions.invoke('answers', {
    body: { action: 'list', participantId },
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data;
};

// Add new function to get participant answers
export const getParticipantAnswers = async (participantId: string, quizId?: string) => {
  try {
    const response = await supabase.functions.invoke('answers', {
      body: { 
        action: 'participantDetails',
        participantId,
        quizId
      }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};
