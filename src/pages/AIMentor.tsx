import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Brain, Zap, Target, BookOpen, ChevronRight, Sparkles } from 'lucide-react';
import { WORLDS } from '../constants/worlds';
import { useGameStore } from '../store/gameStore';

type OracleResult = {
  pattern: string;
  difficulty: string;
  confidence: number;
  similar: string[];
  lessons: string[];
  explanation: string;
};

// Keyword-based pattern detection
function detectPattern(question: string): OracleResult {
  const q = question.toLowerCase();

  const patterns: Array<{ keywords: string[]; pattern: string; difficulty: string; similar: string[]; lessons: string[]; explanation: string }> = [
    {
      keywords: ['subarray', 'substring', 'window', 'contiguous', 'consecutive', 'maximum sum subarray'],
      pattern: 'Sliding Window',
      difficulty: 'Medium',
      similar: ['Two Pointer', 'Prefix Sum', "Kadane's Algorithm"],
      lessons: ['Fixed Window', 'Variable Window', 'Frequency Window'],
      explanation: 'This problem involves finding an optimal contiguous subarray or substring. The sliding window technique maintains a window of elements and slides it across the array, typically reducing O(n²) brute force to O(n).',
    },
    {
      keywords: ['two sum', 'pair', 'complement', 'target sum', 'sorted array', 'palindrome check', 'container', 'rain water'],
      pattern: 'Two Pointers',
      difficulty: 'Easy-Medium',
      similar: ['Sliding Window', 'Hash Map', 'Binary Search'],
      lessons: ['Opposite Direction Pointers', 'Same Direction Pointers', 'Fast & Slow Pointer'],
      explanation: 'Two pointers work elegantly here. By placing pointers at strategic positions and moving them based on comparisons, you eliminate redundant checks and achieve O(n) time complexity.',
    },
    {
      keywords: ['frequency', 'count', 'anagram', 'duplicate', 'appeared', 'most frequent', 'top k'],
      pattern: 'Hash Map / Frequency Count',
      difficulty: 'Easy-Medium',
      similar: ['Sorting', 'Counting Sort', 'Two Pointers'],
      lessons: ['Frequency Maps', 'Pair Problems', 'Duplicate Detection'],
      explanation: 'Using a hash map to count element frequencies enables O(1) lookup. This pattern converts O(n²) brute force solutions into elegant O(n) solutions.',
    },
    {
      keywords: ['binary search', 'sorted', 'rotated', 'find minimum', 'search insert', 'target in array', 'monotonic'],
      pattern: 'Binary Search',
      difficulty: 'Medium',
      similar: ['Two Pointers', 'Divide & Conquer'],
      lessons: ['Classic Binary Search', 'Search on Answer', 'Lower/Upper Bound'],
      explanation: 'The sorted or monotonic nature of this problem enables binary search, reducing time from O(n) to O(log n). Apply search on answer if the answer space is monotonic.',
    },
    {
      keywords: ['tree', 'node', 'root', 'leaf', 'height', 'depth', 'lca', 'ancestor', 'path'],
      pattern: 'Tree DFS / BFS',
      difficulty: 'Medium',
      similar: ['Graph DFS', 'Recursion', 'Dynamic Programming on Trees'],
      lessons: ['Tree Traversals', 'BST Operations', 'Tree Diameter & LCA'],
      explanation: 'Tree problems typically require traversal (DFS/BFS) or recursive decomposition. Define what information each subtree returns and combine results upward.',
    },
    {
      keywords: ['graph', 'connected', 'island', 'cycle', 'path', 'neighbor', 'adjacency', 'shortest path', 'dijkstra'],
      pattern: 'Graph BFS / DFS',
      difficulty: 'Medium-Hard',
      similar: ['Union Find', 'Topological Sort', 'Shortest Path Algorithms'],
      lessons: ['Graph DFS & BFS', 'Shortest Path Algorithms', 'Union Find'],
      explanation: 'Graph traversal (BFS for shortest paths, DFS for connectivity) is the core technique. Maintain a visited set to avoid cycles and explore all reachable nodes.',
    },
    {
      keywords: ['dp', 'dynamic', 'optimal', 'minimum cost', 'maximum profit', 'ways', 'combinations count', 'knapsack', 'fibonacci'],
      pattern: 'Dynamic Programming',
      difficulty: 'Medium-Hard',
      similar: ['Recursion + Memoization', 'Greedy', 'Divide & Conquer'],
      lessons: ['1D DP', '2D DP', 'Knapsack Patterns', 'DP on Trees'],
      explanation: 'This has overlapping subproblems and optimal substructure — the hallmarks of DP. Define your state clearly, write the recurrence relation, and handle base cases.',
    },
    {
      keywords: ['stack', 'push', 'pop', 'bracket', 'parenthesis', 'next greater', 'histogram', 'monotone'],
      pattern: 'Stack / Monotonic Stack',
      difficulty: 'Medium',
      similar: ['Queue', 'Two Pointers', 'Array Manipulation'],
      lessons: ['Monotonic Stack', 'Parentheses Problems', 'Expression Evaluation'],
      explanation: 'A monotonic stack maintains elements in sorted order and efficiently answers "next greater/smaller element" queries in O(n) time.',
    },
    {
      keywords: ['backtrack', 'subset', 'permutation', 'combination', 'generate all', 'n-queens', 'word search'],
      pattern: 'Backtracking',
      difficulty: 'Medium-Hard',
      similar: ['Recursion', 'Dynamic Programming', 'Branch & Bound'],
      lessons: ['Subsets & Combinations', 'Permutations', 'Decision Trees'],
      explanation: 'Explore all possibilities by making choices, recursing, and undoing (backtracking). Prune branches early to optimize. Build a decision tree mentally to understand the state space.',
    },
    {
      keywords: ['prefix', 'range sum', 'subarray sum equals k', 'prefix product'],
      pattern: 'Prefix Sum',
      difficulty: 'Easy-Medium',
      similar: ['Hash Map', 'Sliding Window', 'Difference Array'],
      lessons: ['Prefix Sum', 'Range Queries', 'Difference Array'],
      explanation: 'Precompute prefix sums to answer range queries in O(1). For subarray sum problems, combine with a hash map to find subarrays with a specific sum.',
    },
  ];

  for (const p of patterns) {
    const matchCount = p.keywords.filter((k) => q.includes(k)).length;
    if (matchCount > 0) {
      const confidence = Math.min(95, 60 + matchCount * 15);
      return { ...p, confidence };
    }
  }

  return {
    pattern: 'Array Traversal / Simulation',
    difficulty: 'Easy-Medium',
    confidence: 45,
    similar: ['Two Pointers', 'Hash Map', 'Prefix Sum'],
    lessons: ['Array Traversal', 'Frequency Counting', 'Simulation'],
    explanation: 'Based on the problem description, this appears to involve direct array manipulation or simulation. Try brute force first, then optimize using a hash map or two-pointer approach.',
  };
}

type Message = {
  role: 'user' | 'sensei';
  content: string;
  timestamp: Date;
};

const SENSEI_RESPONSES: Record<string, string> = {
  default: "I'm Sensei, your AI DSA guide. Ask me to explain any concept, pattern, or get personalized advice for your journey!",
  greeting: "Welcome, warrior! I'm here to guide your algorithmic journey. Ask me anything about patterns, concepts, or your learning strategy.",
  hard: "Hard problems demand patience. Break it down: identify the pattern, start with brute force O(n²) or O(2^n), then optimize. What specific problem is challenging you?",
  easy: "Easy problems build your foundation. Make sure you understand the pattern deeply — the same technique appears in harder variants. Which pattern would you like to explore?",
  dp: "Dynamic Programming is about recognizing overlapping subproblems. The key insight: if you've solved a subproblem once, cache the result. Start with recursive thinking, add memoization, then convert to tabulation. What DP topic confuses you?",
  graph: "Graphs are just nodes and connections. For most problems: BFS gives shortest paths, DFS reveals connectivity. Union-Find handles dynamic connectivity. What graph concept shall we explore?",
  tree: "Trees are recursive by nature. Every tree problem can be solved by asking: 'What do I need from each subtree?' Return that info up to the root. Want me to walk through any specific tree pattern?",
  array: "Arrays are the foundation of DSA. Master these patterns in order: Traversal → Prefix Sum → Two Pointers → Sliding Window → Sorting. Which one are you working on?",
  recursion: "Recursion is magical but needs discipline. Always define: (1) What does the function return? (2) What's the simplest base case? (3) How does recursion reduce the problem? Trust the recursion!",
  stack: "Stacks solve 'previous/next greater element' problems elegantly. The key insight: if the current element makes previous stack elements irrelevant, pop them. This is the monotonic stack pattern.",
  binary: "Binary search isn't just for sorted arrays — it works on any monotonic property. Ask: 'Is there a threshold where answers switch from NO to YES?' Binary search on that threshold!",
  streak: "Consistency beats intensity. A 30-minute daily session compounds faster than 5-hour weekend marathons. Your streak is your most valuable asset — protect it!",
  beginner: "Start with Array patterns (World 1-2), then Two Pointers and Sliding Window. Don't skip — each world unlocks mental models that make harder patterns click. The roadmap is your ally.",
  weakest: "To identify your weaknesses: look at your difficulty distribution. If you're solving mostly Easy problems, push into Medium. If Medium is comfortable, the growth is in Hard. Where are you stuck?",
};

function getSenseiResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes('hello') || q.includes('hi') || q.includes('hey')) return SENSEI_RESPONSES.greeting;
  if (q.includes('dynamic programming') || q.includes(' dp ') || q.includes('memoization')) return SENSEI_RESPONSES.dp;
  if (q.includes('graph') || q.includes('bfs') || q.includes('dfs') || q.includes('dijkstra')) return SENSEI_RESPONSES.graph;
  if (q.includes('tree') || q.includes('binary tree') || q.includes('bst')) return SENSEI_RESPONSES.tree;
  if (q.includes('array') || q.includes('subarray')) return SENSEI_RESPONSES.array;
  if (q.includes('recursion') || q.includes('recursive')) return SENSEI_RESPONSES.recursion;
  if (q.includes('stack') || q.includes('monotonic')) return SENSEI_RESPONSES.stack;
  if (q.includes('binary search') || q.includes('binary search on answer')) return SENSEI_RESPONSES.binary;
  if (q.includes('hard') || q.includes('difficult') || q.includes('stuck')) return SENSEI_RESPONSES.hard;
  if (q.includes('easy') || q.includes('beginner') || q.includes('start')) return SENSEI_RESPONSES.beginner;
  if (q.includes('streak') || q.includes('consistency') || q.includes('daily')) return SENSEI_RESPONSES.streak;
  if (q.includes('weak') || q.includes('improve') || q.includes('worse')) return SENSEI_RESPONSES.weakest;
  return `Great question! The key to mastering "${input.slice(0, 30)}..." lies in recognizing the underlying pattern. In DSA, there are ~15 core patterns that solve 90% of problems. Once you identify the pattern, the solution follows naturally. Which aspect would you like me to break down further?`;
}

export default function AIMentor() {
  const [activeTab, setActiveTab] = useState<'sensei' | 'oracle'>('sensei');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'sensei', content: SENSEI_RESPONSES.default, timestamp: new Date() },
  ]);
  const [inputText, setInputText] = useState('');
  const [oracleInput, setOracleInput] = useState('');
  const [oracleResult, setOracleResult] = useState<OracleResult | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { level, streak, completedWorlds, completedPatterns } = useGameStore();

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const userMsg: Message = { role: 'user', content: inputText, timestamp: new Date() };
    setMessages((m) => [...m, userMsg]);
    setInputText('');
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
    const response = getSenseiResponse(inputText);
    setMessages((m) => [...m, { role: 'sensei', content: response, timestamp: new Date() }]);
    setIsTyping(false);
  };

  const analyzePattern = async () => {
    if (!oracleInput.trim()) return;
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 600));
    const result = detectPattern(oracleInput);
    setOracleResult(result);
    setIsAnalyzing(false);
  };

  const quickPrompts = [
    "How do I identify a DP problem?",
    "Explain the Two Pointer technique",
    "When should I use BFS vs DFS?",
    "How to improve my streak?",
    "Explain Sliding Window pattern",
    "What should I learn after arrays?",
  ];

  return (
    <div className="min-h-screen bg-[#070B14] pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/30 to-blue-600/20 border border-purple-500/30 flex items-center justify-center text-2xl float-anim">
            🧙‍♂️
          </div>
          <div>
            <h1 className="font-orbitron text-2xl font-bold text-white">
              AI <span className="gradient-text">Sensei</span>
            </h1>
            <p className="text-slate-500 text-sm">Your personal DSA master</p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'sensei', icon: Brain, label: 'Chat with Sensei' },
            { id: 'oracle', icon: Target, label: 'Pattern Oracle' },
          ].map(({ id, icon: Icon, label }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(id as 'sensei' | 'oracle')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === id
                  ? 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                  : 'glass border border-white/5 text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={16} />
              {label}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'sensei' ? (
            <motion.div
              key="sensei"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chat */}
                <div className="lg:col-span-2 flex flex-col h-[500px] glass rounded-2xl border border-purple-500/20 overflow-hidden">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                          msg.role === 'sensei'
                            ? 'bg-purple-500/20 border border-purple-500/30'
                            : 'bg-cyan-500/20 border border-cyan-500/30'
                        }`}>
                          {msg.role === 'sensei' ? '🧙‍♂️' : '🧑'}
                        </div>
                        <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'sensei'
                            ? 'bg-purple-500/10 border border-purple-500/20 text-slate-200 rounded-tl-sm'
                            : 'bg-cyan-500/10 border border-cyan-500/20 text-slate-200 rounded-tr-sm'
                        }`}>
                          {msg.content}
                        </div>
                      </motion.div>
                    ))}
                    {isTyping && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-sm">
                          🧙‍♂️
                        </div>
                        <div className="px-4 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 rounded-tl-sm flex items-center gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-purple-400 rounded-full"
                              animate={{ y: [0, -4, 0] }}
                              transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-white/5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask Sensei anything about DSA..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/40 transition-colors"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={sendMessage}
                        disabled={!inputText.trim()}
                        className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center disabled:opacity-40 hover:bg-purple-500/30 transition-all"
                      >
                        <Send size={16} />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Quick prompts */}
                  <div className="glass rounded-2xl p-4 border border-white/5">
                    <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Sparkles size={12} />
                      Quick Prompts
                    </h3>
                    <div className="space-y-1.5">
                      {quickPrompts.map((prompt) => (
                        <motion.button
                          key={prompt}
                          whileHover={{ x: 4 }}
                          onClick={() => {
                            setInputText(prompt);
                          }}
                          className="w-full text-left text-xs text-slate-500 hover:text-slate-300 px-3 py-2 rounded-lg hover:bg-white/5 transition-all flex items-center gap-2"
                        >
                          <ChevronRight size={12} className="shrink-0" />
                          {prompt}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Your Stats for context */}
                  <div className="glass rounded-2xl p-4 border border-white/5">
                    <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
                      <BookOpen size={12} />
                      Your Profile
                    </h3>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Level</span>
                        <span className="text-cyan-400">{level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Streak</span>
                        <span className="text-orange-400">{streak} days 🔥</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Worlds</span>
                        <span className="text-white">{completedWorlds.length} / 21</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Patterns</span>
                        <span className="text-white">{completedPatterns.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="oracle"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="glass rounded-2xl border border-cyan-500/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Target size={20} className="text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold">Pattern Oracle</h2>
                    <p className="text-slate-500 text-xs">Paste any coding problem to detect its pattern</p>
                  </div>
                </div>

                <textarea
                  value={oracleInput}
                  onChange={(e) => setOracleInput(e.target.value)}
                  placeholder="Paste your coding problem here...&#10;&#10;Example: Given an array of integers, find the maximum sum of any contiguous subarray..."
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 transition-colors resize-none mb-4"
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={analyzePattern}
                  disabled={!oracleInput.trim() || isAnalyzing}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 font-semibold hover:from-cyan-500/30 hover:to-blue-500/30 transition-all disabled:opacity-40 mb-6"
                >
                  {isAnalyzing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Zap size={16} />
                      </motion.div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Detect Pattern
                    </>
                  )}
                </motion.button>

                <AnimatePresence>
                  {oracleResult && !isAnalyzing && (
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="space-y-4"
                    >
                      {/* Primary result */}
                      <div className="glass rounded-2xl p-5 border border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-transparent">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="text-xs text-slate-500 mb-1">DETECTED PATTERN</div>
                            <h3 className="text-xl font-bold text-cyan-400">{oracleResult.pattern}</h3>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-500 mb-1">CONFIDENCE</div>
                            <div className="text-xl font-bold text-white">{oracleResult.confidence}%</div>
                          </div>
                        </div>

                        {/* Confidence bar */}
                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${oracleResult.confidence}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-slate-500">Difficulty:</span>
                          <span className="text-xs font-semibold text-yellow-400">{oracleResult.difficulty}</span>
                        </div>

                        <p className="text-slate-400 text-sm leading-relaxed">{oracleResult.explanation}</p>
                      </div>

                      {/* Similar patterns */}
                      <div className="glass rounded-xl p-4 border border-white/5">
                        <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Similar Patterns</h4>
                        <div className="flex flex-wrap gap-2">
                          {oracleResult.similar.map((s) => (
                            <span key={s} className="px-3 py-1 rounded-full glass border border-white/10 text-slate-300 text-xs">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Recommended lessons */}
                      <div className="glass rounded-xl p-4 border border-white/5">
                        <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">
                          Recommended Lessons
                        </h4>
                        <div className="space-y-2">
                          {oracleResult.lessons.map((lesson) => {
                            const world = WORLDS.flatMap((w) => w.patterns.map((p) => ({ ...p, worldId: w.id, worldName: w.name }))).find(
                              (p) => p.name.toLowerCase().includes(lesson.toLowerCase()) || lesson.toLowerCase().includes(p.name.toLowerCase())
                            );
                            return (
                              <div key={lesson} className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                  <BookOpen size={12} className="text-cyan-400" />
                                  {lesson}
                                </div>
                                {world && (
                                  <a
                                    href={`/world/${world.worldId}`}
                                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                                  >
                                    World {world.worldId} <ChevronRight size={10} />
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
