// Badge catalog — ids must match server/src/utils/gamify.js
export const BADGE_META = {
  "first-quiz": { icon: "📝", name: "First Quiz", desc: "Completed your first quiz" },
  "quiz-10": { icon: "🧠", name: "Quiz Veteran", desc: "Completed 10 quizzes" },
  "perfect-score": { icon: "💯", name: "Perfectionist", desc: "Scored 100% on a quiz" },
  "first-solve": { icon: "✅", name: "First Blood", desc: "Solved your first coding problem" },
  "solver-10": { icon: "⚔️", name: "Problem Crusher", desc: "Solved 10 coding problems" },
  "interview-1": { icon: "🎤", name: "Interview Ready", desc: "Completed a mock interview" },
  "streak-3": { icon: "🔥", name: "On Fire", desc: "3-day practice streak" },
  "streak-7": { icon: "⚡", name: "Unstoppable", desc: "7-day practice streak" },
  "streak-30": { icon: "🏆", name: "Legend", desc: "30-day practice streak" },
  "xp-500": { icon: "🌟", name: "Rising Star", desc: "Earned 500 XP" },
  "xp-2000": { icon: "👑", name: "XP Royalty", desc: "Earned 2000 XP" },
};

export const ALL_BADGE_IDS = Object.keys(BADGE_META);
