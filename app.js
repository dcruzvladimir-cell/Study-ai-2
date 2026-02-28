const express = require('express');
const path = require('path');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Loaded SUPABASE_URL:', JSON.stringify(supabaseUrl));
console.log('Loaded SUPABASE_KEY length:', supabaseKey ? supabaseKey.length : 0);

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase credentials not found in .env file');
  console.warn('Please add SUPABASE_URL and SUPABASE_KEY to your .env file');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
const cors = require('cors');
app.use(cors()); // allow all origins during development
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  // serve static HTML instead of API test page
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Save notes
app.post('/api/notes', async (req, res) => {
  try {
    const { notes, userId } = req.body;
    if (!notes) {
      return res.status(400).json({ error: 'Notes are required' });
    }

    const { data, error } = await supabase
      .from('notes')
      .upsert({ 
        id: userId || '1', 
        content: notes,
        updated_at: new Date()
      }, { onConflict: 'id' });

    if (error) throw error;
    res.json({ success: true, message: 'Notes saved', notesLength: notes.length });
  } catch (error) {
    console.error('Error saving notes:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get notes
app.get('/api/notes', async (req, res) => {
  try {
    const userId = req.query.userId || '1';
    const { data, error } = await supabase
      .from('notes')
      .select('content')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json({ notes: data?.content || '' });
  } catch (error) {
    console.error('Error getting notes:', error);
    res.json({ notes: '' });
  }
});

// API: Generate flashcards
app.post('/api/generate-flashcards', async (req, res) => {
  try {
    const { notes, difficulty, userId } = req.body;
    
    if (!notes || notes.trim().length === 0) {
      return res.status(400).json({ error: 'Notes are required' });
    }

    // Simple flashcard generation
    const sentences = notes.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const flashcards = sentences.slice(0, 10).map((sentence, i) => ({
      question: `What do you know about: "${sentence.trim().substring(0, 50)}..."?`,
      answer: sentence.trim(),
      difficulty: difficulty || 'medium'
    }));

    // Save to database
    for (const card of flashcards) {
      await supabase.from('flashcards').insert({
        user_id: userId || '1',
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty
      });
    }

    res.json({ 
      success: true, 
      flashcards: flashcards,
      message: `Generated ${flashcards.length} flashcards` 
    });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get flashcards
app.get('/api/flashcards', async (req, res) => {
  try {
    const userId = req.query.userId || '1';
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ flashcards: data || [] });
  } catch (error) {
    console.error('Error getting flashcards:', error);
    res.json({ flashcards: [] });
  }
});

// API: Generate quiz
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { notes, difficulty, userId } = req.body;
    
    if (!notes || notes.trim().length === 0) {
      return res.status(400).json({ error: 'Notes are required' });
    }

    // Simple quiz generation
    const sentences = notes.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const quizzes = sentences.slice(0, 5).map((sentence, i) => ({
      question: `Based on your notes, what is the main idea of: "${sentence.trim().substring(0, 60)}..."?`,
      options: [
        sentence.trim(),
        'Opposite of the statement',
        'A different concept',
        'None of the above'
      ],
      correctAnswer: 0,
      difficulty: difficulty || 'medium'
    }));

    // Save to database
    for (const quiz of quizzes) {
      await supabase.from('quizzes').insert({
        user_id: userId || '1',
        question: quiz.question,
        options: quiz.options,
        correct_answer: quiz.correctAnswer,
        difficulty: quiz.difficulty
      });
    }

    res.json({ 
      success: true, 
      quizzes: quizzes,
      message: `Generated ${quizzes.length} quiz questions` 
    });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: error.message });
  }
});

// API: Get quiz
app.get('/api/quiz', async (req, res) => {
  try {
    const userId = req.query.userId || '1';
    const { data, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ quizzes: data || [] });
  } catch (error) {
    console.error('Error getting quiz:', error);
    res.json({ quizzes: [] });
  }
});

// API: Submit quiz answer
app.post('/api/quiz/submit', async (req, res) => {
  try {
    const { quizId, userAnswer, userId } = req.body;
    
    const { data, error } = await supabase
      .from('quizzes')
      .select('correct_answer')
      .eq('id', quizId)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const isCorrect = userAnswer === data.correct_answer;
    
    // Save user answer
    await supabase.from('quiz_answers').insert({
      quiz_id: quizId,
      user_id: userId || '1',
      user_answer: userAnswer,
      is_correct: isCorrect
    });

    res.json({ 
      correct: isCorrect,
      correctAnswer: data.correct_answer,
      message: isCorrect ? 'Correct!' : 'Incorrect. Try again!'
    });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server (only in development, not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log(`📦 Supabase connected: ${supabaseUrl ? 'Yes ✓' : 'No ✗'}`);
  });
}

// Export for Vercel serverless functions
module.exports = app;
