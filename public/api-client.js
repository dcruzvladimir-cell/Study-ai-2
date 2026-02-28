// API Client for StudyAI Backend

const API = {
  // Base URL for all API calls
  baseUrl: 'http://localhost:3000/api',

  // Save notes to backend
  async saveNotes(notes) {
    try {
      const response = await fetch(`${this.baseUrl}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      return await response.json();
    } catch (error) {
      console.error('Error saving notes:', error);
      return { error: error.message };
    }
  },

  // Get notes from backend
  async getNotes() {
    try {
      const response = await fetch(`${this.baseUrl}/notes`);
      return await response.json();
    } catch (error) {
      console.error('Error getting notes:', error);
      return { error: error.message };
    }
  },

  // Generate flashcards from notes
  async generateFlashcards(notes, difficulty = 'medium') {
    try {
      const response = await fetch(`${this.baseUrl}/generate-flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, difficulty })
      });
      return await response.json();
    } catch (error) {
      console.error('Error generating flashcards:', error);
      return { error: error.message };
    }
  },

  // Get flashcards
  async getFlashcards() {
    try {
      const response = await fetch(`${this.baseUrl}/flashcards`);
      return await response.json();
    } catch (error) {
      console.error('Error getting flashcards:', error);
      return { error: error.message };
    }
  },

  // Generate quiz from notes
  async generateQuiz(notes, difficulty = 'medium') {
    try {
      const response = await fetch(`${this.baseUrl}/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, difficulty })
      });
      return await response.json();
    } catch (error) {
      console.error('Error generating quiz:', error);
      return { error: error.message };
    }
  },

  // Get quiz
  async getQuiz() {
    try {
      const response = await fetch(`${this.baseUrl}/quiz`);
      return await response.json();
    } catch (error) {
      console.error('Error getting quiz:', error);
      return { error: error.message };
    }
  },

  // Submit quiz answer
  async submitQuizAnswer(quizId, userAnswer) {
    try {
      const response = await fetch(`${this.baseUrl}/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, userAnswer })
      });
      return await response.json();
    } catch (error) {
      console.error('Error submitting answer:', error);
      return { error: error.message };
    }
  }
};

// Example usage:
/*
// Save notes
const notesSaved = await API.saveNotes("Your study notes here...");
console.log(notesSaved);

// Generate flashcards
const flashcardsResult = await API.generateFlashcards("Your notes...", "easy");
console.log(flashcardsResult.flashcards);

// Generate quiz
const quizResult = await API.generateQuiz("Your notes...", "medium");
console.log(quizResult.quizzes);

// Submit answer
const submitResult = await API.submitQuizAnswer(0, 0);
console.log(submitResult);
*/
