import { useState, useEffect, useRef } from "react";
import { supabase } from "./App";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg: "#0A0E1A",
  bgCard: "#0F1523",
  bgCard2: "#121827",
  border: "#1A2035",
  accent: "#6C63FF",
  accentLight: "#9B95FF",
  accentDim: "#13123A",
  green: "#2DD4BF",
  greenDim: "#0A2028",
  amber: "#F59E0B",
  amberDim: "#251800",
  red: "#EF4444",
  redDim: "#200A0A",
  text: "#EDF2FF",
  textSec: "#8892A4",
  textMuted: "#3D4A63",
};

const QUESTIONS = [
  { id: "sleep",  emoji: "🌙", label: "Comment as-tu dormi cette nuit ?",        options: ["Très mal", "Mal", "Moyen", "Bien", "Très bien"],          scores: [0, 2, 5, 8, 10] },
  { id: "energy", emoji: "⚡", label: "Ton niveau d'énergie ce matin ?",          options: ["Épuisé(e)", "Fatigué(e)", "Neutre", "Énergique", "Plein d'énergie"], scores: [0, 2, 5, 8, 10] },
  { id: "mood",   emoji: "💭", label: "Comment tu te sens émotionnellement ?",    options: ["Très bas", "Bas", "Neutre", "Bien", "Excellent"],           scores: [0, 2, 5, 8, 10] },
  { id: "stress", emoji: "🌊", label: "Ton niveau de stress aujourd'hui ?",       options: ["Extrême", "Élevé", "Modéré", "Faible", "Aucun"],           scores: [0, 2, 5, 8, 10] },
  { id: "social", emoji: "🤝", label: "As-tu envie de voir des gens ?",           options: ["Pas du tout", "Plutôt non", "Indifférent(e)", "Oui", "Absolument"], scores: [0, 2, 5, 8, 10] },
];

const NAV = [
  { id: "home",      emoji: "◈", label: "Accueil" },
  { id: "checkin",   emoji: "◎", label: "Bilan" },
  { id: "history",   emoji: "◑", label: "Historique" },
  { id: "ai",        emoji: "✦", label: "Coach IA" },
  { id: "resources", emoji: "◉", label: "Aide" },
];

function getRisk(score) {
  if (score === null || score === undefined) return { label: "—", color: C.textMuted, level: null };
  if (score >= 75) return { label: "Faible", color: C.green, level: "low" };
  if (score >= 50) return { label: "Modéré", color: C.amber, level: "medium" };
  return { label: "Élevé", color: C.red, level: "high" };
}

function ScoreRing({ score, size = 88 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const pct = score !== null && score !== undefined ? score / 100 : 0;
  const risk = getRisk(score);
  const stroke = score == null ? C.border : score >= 75 ? C.green : score >= 50 ? C.amber : C.red;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={stroke} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size > 60 ? 22 : 14, fontWeight: 800, color: stroke, fontFamily: "'Sora', monospace", letterSpacing: -1 }}>
          {score !== null && score !== undefined ? score : "?"}
        </span>
        {size > 60 && <span style={{ fontSize: 10, color: risk.color, marginTop: 2, fontWeight: 600 }}>{risk.label}</span>}
      </div>
    </div>
  );
}

// ─── CHECK-IN ─────────────────────────────────────────────────────────────────
function CheckIn({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [fading, setFading] = useState(false);
  const q = QUESTIONS[step];

  function select(idx) {
    if (fading) return;
    const newA = { ...answers, [q.id]: { idx, score: q.scores[idx], label: q.options[idx] } };
    setAnswers(newA);
    setFading(true);
    setTimeout(() => {
      setFading(false);
      if (step === QUESTIONS.length - 1) {
        const total = Math.round(Object.values(newA).reduce((s, a) => s + a.score, 0) / QUESTIONS.length * 10);
        onComplete(total, newA);
      } else {
        setStep(s => s + 1);
      }
    }, 350);
  }

  return (
    <div style={{ paddingTop: 10 }}>
      {/* Progress */}
      <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
        {QUESTIONS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? C.accent : C.border, transition: "background 0.3s" }} />
        ))}
      </div>
      <div style={{ opacity: fading ? 0 : 1, transform: fading ? "translateY(10px)" : "translateY(0)", transition: "all 0.3s" }}>
        <div style={{ fontSize: 32, marginBottom: 14 }}>{q.emoji}</div>
        <div style={{ fontSize: 19, fontWeight: 700, color: C.text, marginBottom: 6, lineHeight: 1.4, letterSpacing: -0.3 }}>{q.label}</div>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 28, fontFamily: "'Sora', monospace" }}>Question {step + 1} / {QUESTIONS.length}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, i) => {
            const sel = answers[q.id]?.idx === i;
            return (
              <button key={i} onClick={() => select(i)} style={{
                padding: "14px 18px", borderRadius: 14, textAlign: "left", cursor: "pointer",
                border: `1px solid ${sel ? C.accent : C.border}`,
                background: sel ? C.accentDim : C.bgCard,
                color: sel ? C.accentLight : C.textSec,
                fontSize: 14, fontWeight: sel ? 600 : 400, transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: 12,
                fontFamily: "'Sora', sans-serif",
              }}>
                <span style={{
                  width: 22, height: 22, borderRadius: "50%",
                  border: `2px solid ${sel ? C.accent : C.textMuted}`,
                  background: sel ? C.accent : "transparent",
                  flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                }}>
                  {sel && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", display: "block" }} />}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── HISTORY BAR ──────────────────────────────────────────────────────────────
function HistBar({ day, score, isToday }) {
  const h = score !== null && score !== undefined ? Math.max(8, (score / 100) * 80) : 8;
  const col = score === null ? C.textMuted : score >= 75 ? C.green : score >= 50 ? C.amber : C.red;
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ fontSize: 10, color: isToday ? C.accent : C.textMuted, fontWeight: isToday ? 700 : 400, fontFamily: "'Sora', monospace" }}>
        {score !== null && score !== undefined ? score : "—"}
      </div>
      <div style={{ width: "100%", height: 80, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <div style={{
          width: "80%", height: h, borderRadius: "4px 4px 0 0",
          background: isToday ? `${C.accent}44` : col,
          border: isToday ? `1.5px dashed ${C.accent}` : "none",
          transition: "height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }} />
      </div>
      <div style={{ fontSize: 10, color: isToday ? C.accent : C.textMuted, fontWeight: isToday ? 700 : 400 }}>{day}</div>
    </div>
  );
}

// ─── AI COACH SCREEN ─────────────────────────────────────────────────────────
function AICoach({ user, todayScore, answers }) {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: `Bonjour ${user.prenom} ! Je suis ton coach bien-être IA. Je peux analyser ton bilan du jour, te donner des conseils personnalisés, ou répondre à tes questions sur la santé mentale. Comment puis-je t'aider ? 🧠`
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const ANTHROPIC_API_KEY = ""; // ⚠️ En production : utilise un backend proxy pour ne pas exposer ta clé

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(m => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    // Contexte utilisateur pour l'IA
    const systemPrompt = `Tu es le coach bien-être IA de MindGuard, une app de prévention du burnout et de la dépression. 
Tu t'appelles MindGuard AI.

PROFIL UTILISATEUR :
- Prénom : ${user.prenom}
- Score bien-être aujourd'hui : ${todayScore !== null ? `${todayScore}/100 (risque ${getRisk(todayScore).label})` : "pas encore fait son check-in"}
${answers ? `- Détail du bilan : Sommeil=${answers.sleep?.label}, Énergie=${answers.energy?.label}, Humeur=${answers.mood?.label}, Stress=${answers.stress?.label}, Social=${answers.social?.label}` : ""}

RÈGLES IMPORTANTES :
1. Tu es un outil de BIEN-ÊTRE, pas un médecin. Tu ne poses jamais de diagnostic.
2. Si l'utilisateur montre des signaux de détresse grave, redirige-le vers le 3114 (prévention suicide) ou un médecin.
3. Tes conseils sont bienveillants, concrets et basés sur des techniques validées (TCC, pleine conscience, etc.)
4. Réponds en français, avec chaleur et sans jargon médical.
5. Si on te parle d'une crise : sois présent, rassurant, et oriente vers les ressources professionnelles.
6. Tes réponses sont concises (3-5 phrases max) sauf si une explication plus longue est demandée.

AVERTISSEMENT LÉGAL : Rappelle ponctuellement que tu n'es pas un professionnel de santé.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [...messages.filter(m => m.role !== "assistant" || messages.indexOf(m) > 0), { role: "user", content: userMsg }].map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const aiText = data.content?.[0]?.text || "Je suis désolé, je n'ai pas pu générer une réponse. Réessaie dans un instant.";
      setMessages(m => [...m, { role: "assistant", content: aiText }]);
    } catch {
      // Réponses de secours si pas d'API key
      const fallbacks = [
        `Bonjour ${user.prenom} ! Pour profiter du coach IA en temps réel, configure ta clé API Anthropic dans le fichier Dashboard.jsx. En attendant, voici un conseil : ${todayScore < 50 ? "Ton score suggère de la fatigue. Accorde-toi 20 minutes de repos aujourd'hui, sans écran." : todayScore < 75 ? "Un niveau modéré de stress est normal. Essaie la technique 4-7-8 : inspire 4s, retiens 7s, expire 8s." : "Tu es en forme ! C'est le bon moment pour planifier quelque chose qui te fait plaisir."}`,
        "Pour activer le vrai coach IA Claude : ouvre Dashboard.jsx et ajoute ta clé Anthropic API dans ANTHROPIC_API_KEY. Tu peux l'obtenir sur console.anthropic.com.",
        "Une technique utile quand le stress monte : pose une main sur ta poitrine, une sur ton ventre. Respire lentement 5 fois en sentant ton ventre se gonfler. Ça active le système nerveux parasympathique.",
      ];
      setMessages(m => [...m, { role: "assistant", content: fallbacks[Math.floor(Math.random() * fallbacks.length)] }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", paddingTop: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, ${C.green})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✦</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Coach IA MindGuard</div>
          <div style={{ fontSize: 11, color: C.green }}>● En ligne · Basé sur Claude</div>
        </div>
        {!ANTHROPIC_API_KEY && (
          <div style={{ marginLeft: "auto", background: C.amberDim, border: `1px solid ${C.amber}44`, borderRadius: 8, padding: "4px 10px", fontSize: 10, color: C.amber }}>Mode démo</div>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            marginBottom: 14,
          }}>
            {m.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${C.accent}, ${C.green})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginRight: 10, marginTop: 2 }}>✦</div>
            )}
            <div style={{
              maxWidth: "78%", padding: "12px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role === "user" ? C.accent : C.bgCard,
              border: m.role === "user" ? "none" : `1px solid ${C.border}`,
              color: C.text, fontSize: 13.5, lineHeight: 1.7,
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${C.accent}, ${C.green})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>✦</div>
            <div style={{ padding: "12px 16px", borderRadius: "18px 18px 18px 4px", background: C.bgCard, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.accentLight, animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 10, paddingBottom: 4 }}>
        <input
          style={{ ...inp, marginBottom: 0, flex: 1, borderRadius: 14, background: C.bgCard, border: `1px solid ${C.border}`, fontSize: 13 }}
          placeholder="Pose ta question..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
          padding: "0 18px", borderRadius: 14, background: input.trim() ? C.accent : C.border,
          color: "#fff", border: "none", cursor: input.trim() ? "pointer" : "not-allowed",
          fontSize: 18, transition: "background 0.2s",
        }}>↑</button>
      </div>
      <div style={{ fontSize: 10.5, color: C.textMuted, textAlign: "center", marginTop: 8, lineHeight: 1.6 }}>
        MindGuard AI n'est pas un médecin. En cas de détresse : <strong style={{ color: C.text }}>3114</strong> (24h/24, gratuit)
      </div>

      <style>{`
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; } 40% { transform: scale(1.2); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard({ user, onLogout }) {
  const [screen, setScreen] = useState("home");
  const [todayScore, setTodayScore] = useState(null);
  const [todayAnswers, setTodayAnswers] = useState(null);
  const [aiTip, setAiTip] = useState("");
  const [history, setHistory] = useState([
    { day: "Lun", score: 68, date: "" },
    { day: "Mar", score: 74, date: "" },
    { day: "Mer", score: 61, date: "" },
    { day: "Jeu", score: 55, date: "" },
    { day: "Ven", score: 70, date: "" },
    { day: "Sam", score: 82, date: "" },
    { day: "Auj", score: null, date: new Date().toISOString().split("T")[0] },
  ]);
  const [tipLoading, setTipLoading] = useState(false);

  // Restore today's check-in from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`mg_checkin_${user.email}_${new Date().toISOString().split("T")[0]}`);
    if (saved) {
      const { score, answers } = JSON.parse(saved);
      setTodayScore(score);
      setTodayAnswers(answers);
      updateHistoryToday(score);
    }
  }, []);

  function updateHistoryToday(score) {
    setHistory(h => h.map(d => d.day === "Auj" ? { ...d, score } : d));
  }

  async function generateAITip(score, answers) {
    setTipLoading(true);
    const scoreDesc = score >= 75 ? "bon" : score >= 50 ? "modéré" : "bas";
    const details = answers ? `Sommeil: ${answers.sleep?.label}, Énergie: ${answers.energy?.label}, Humeur: ${answers.mood?.label}, Stress: ${answers.stress?.label}, Social: ${answers.social?.label}` : "";

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Génère UN conseil bien-être personnalisé, concret et actionnable pour ${user.prenom} dont le score de bien-être est ${score}/100 (niveau ${scoreDesc}). Détails : ${details}. Maximum 2 phrases. Commence directement par le conseil, sans formule de politesse. En français.`
          }],
        }),
      });
      const data = await res.json();
      setAiTip(data.content?.[0]?.text || getStaticTip(score));
    } catch {
      setAiTip(getStaticTip(score));
    }
    setTipLoading(false);
  }

  function getStaticTip(score) {
    if (score >= 75) return "Tu es en forme aujourd'hui ! C'est le bon moment pour avancer sur un projet important ou planifier quelque chose qui te fait plaisir.";
    if (score >= 50) return "Quelques signaux de fatigue détectés. Essaie la technique 4-7-8 : inspire 4 secondes, retiens 7, expire 8. Répète 3 fois.";
    return "Des signes de surmenage sont présents. Accorde-toi 20 minutes de repos sans écran, et considère d'en parler à quelqu'un de confiance.";
  }

  function handleCheckin(score, answers) {
    setTodayScore(score);
    setTodayAnswers(answers);
    updateHistoryToday(score);
    // Sauvegarde locale
    localStorage.setItem(`mg_checkin_${user.email}_${new Date().toISOString().split("T")[0]}`, JSON.stringify({ score, answers }));
    generateAITip(score, answers);
    setScreen("result");
  }

  const weekAvg = history.filter(d => d.score !== null && d.day !== "Auj").reduce((s, d, _, a) => s + d.score / a.length, 0);
  const todayDate = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Sora', sans-serif", color: C.text, maxWidth: 430, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, ${C.green})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🧠</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>MindGuard</div>
            <div style={{ fontSize: 10, color: C.textMuted }}>Bonjour, {user.prenom} 👋</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user.demo && (
            <div style={{ background: C.amberDim, border: `1px solid ${C.amber}44`, borderRadius: 8, padding: "3px 8px", fontSize: 9, color: C.amber, fontWeight: 600 }}>DÉMO</div>
          )}
          <button onClick={onLogout} style={{ background: "none", border: `1px solid ${C.border}`, color: C.textSec, padding: "6px 12px", borderRadius: 10, cursor: "pointer", fontSize: 12, fontFamily: "'Sora', sans-serif" }}>Déco</button>
        </div>
      </div>

      <div style={{ padding: "16px 20px 100px" }}>

        {/* HOME */}
        {screen === "home" && (
          <div>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 20, textTransform: "capitalize", letterSpacing: 0.3 }}>{todayDate}</div>

            {/* Score hero */}
            <div style={{ background: `linear-gradient(135deg, ${C.bgCard} 0%, ${C.accentDim} 100%)`, border: `1px solid ${C.border}`, borderRadius: 20, padding: 22, marginBottom: 16, display: "flex", alignItems: "center", gap: 20 }}>
              <ScoreRing score={todayScore} size={96} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: C.textMuted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8, fontSize: 11 }}>Bien-être aujourd'hui</div>
                <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, letterSpacing: -0.5 }}>
                  {todayScore === null ? "Bilan en attente" : todayScore >= 75 ? "Tu es en forme ! 🌟" : todayScore >= 50 ? "Sois vigilant(e) ⚠️" : "Prends soin de toi 💙"}
                </div>
                {weekAvg > 0 && <div style={{ fontSize: 11, color: C.textMuted }}>Moy. semaine : {Math.round(weekAvg)}/100</div>}
              </div>
            </div>

            {/* CTA bilan */}
            {todayScore === null ? (
              <button onClick={() => setScreen("checkin")} style={{
                width: "100%", padding: 16, borderRadius: 16, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg, ${C.accent}, #8B5CF6)`,
                color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 16,
                boxShadow: `0 8px 32px ${C.accent}44`, fontFamily: "'Sora', sans-serif",
              }}>
                ◎ Faire mon bilan du jour (5 questions)
              </button>
            ) : (
              <button onClick={() => setScreen("result")} style={{
                width: "100%", padding: 14, borderRadius: 14, border: `1px solid ${C.border}`, cursor: "pointer",
                background: C.bgCard, color: C.accentLight, fontSize: 13, fontWeight: 600, marginBottom: 16,
                fontFamily: "'Sora', sans-serif",
              }}>
                Voir mon résultat du jour →
              </button>
            )}

            {/* Conseil IA */}
            {(aiTip || tipLoading) && (
              <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, fontWeight: 700 }}>✦ Conseil IA personnalisé</div>
                {tipLoading ? (
                  <div style={{ fontSize: 13, color: C.textMuted }}>Génération en cours...</div>
                ) : (
                  <div style={{ fontSize: 14, color: C.text, lineHeight: 1.75 }}>{aiTip}</div>
                )}
              </div>
            )}

            {/* Alerte rouge */}
            {todayScore !== null && todayScore < 50 && (
              <div style={{ background: C.redDim, border: `1px solid ${C.red}44`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: C.red, fontWeight: 700, marginBottom: 6 }}>⚠️ Alerte précoce</div>
                <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.6 }}>Ton score est bas plusieurs jours consécutifs. Si tu te sens dépassé(e), parle à un médecin ou appelle le <strong style={{ color: C.text }}>3114</strong> (gratuit, 24h/24).</div>
              </div>
            )}

            {/* Graphique semaine */}
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Cette semaine</div>
                {weekAvg > 0 && <div style={{ fontSize: 11, color: C.textMuted, fontFamily: "'Sora', monospace" }}>Moy. {Math.round(weekAvg)}</div>}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {history.map((d, i) => <HistBar key={i} day={d.day} score={d.score} isToday={d.day === "Auj"} />)}
              </div>
            </div>
          </div>
        )}

        {/* CHECK-IN */}
        {screen === "checkin" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, marginTop: 8 }}>
              <button onClick={() => setScreen("home")} style={{ background: "none", border: "none", color: C.textSec, fontSize: 22, cursor: "pointer", lineHeight: 1, padding: 0 }}>←</button>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Bilan du jour</div>
            </div>
            <CheckIn onComplete={handleCheckin} />
          </div>
        )}

        {/* RESULT */}
        {screen === "result" && todayScore !== null && (
          <div style={{ paddingTop: 16 }}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 18, letterSpacing: 1.5, textTransform: "uppercase" }}>Résultat du jour</div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <ScoreRing score={todayScore} size={130} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, marginBottom: 10 }}>
                {todayScore >= 75 ? "Bonne forme ! 🌟" : todayScore >= 50 ? "Sois vigilant(e) ⚠️" : "Prends soin de toi 💙"}
              </div>
              <div style={{ fontSize: 14, color: C.textSec, lineHeight: 1.75, maxWidth: 320, margin: "0 auto" }}>
                {todayScore >= 75
                  ? "Ton état mental est solide. Continue à maintenir tes bonnes habitudes — elles font la différence."
                  : todayScore >= 50
                  ? "Quelques signaux de fatigue. Accorde-toi du repos et réduis les sources de stress cette semaine."
                  : "Des signes de surmenage sont présents. Il est important de prendre du recul et de chercher du soutien."}
              </div>
            </div>

            {/* Détail des réponses */}
            {todayAnswers && (
              <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 14, letterSpacing: 1, textTransform: "uppercase" }}>Détail du bilan</div>
                {QUESTIONS.map(q => {
                  const ans = todayAnswers[q.id];
                  const col = ans?.score >= 7 ? C.green : ans?.score >= 4 ? C.amber : C.red;
                  return (
                    <div key={q.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{q.emoji}</span>
                        <span style={{ fontSize: 12.5, color: C.textSec }}>{q.label.slice(0, 28)}...</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: col }}>{ans?.label || "—"}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {todayScore < 50 && (
              <div style={{ background: C.redDim, border: `1px solid ${C.red}44`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: C.red, fontWeight: 700, marginBottom: 6 }}>⚠️ Alerte précoce</div>
                <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.6 }}>Ton score est préoccupant. Si tu te sens dépassé(e), parle à un médecin ou appelle le <strong style={{ color: C.text }}>3114</strong> (prévention suicide, gratuit 24h/24).</div>
              </div>
            )}

            {(aiTip || tipLoading) && (
              <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: C.accent, marginBottom: 10, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>✦ Recommandation IA</div>
                {tipLoading ? <div style={{ fontSize: 13, color: C.textMuted }}>Génération en cours...</div> : <div style={{ fontSize: 14, color: C.text, lineHeight: 1.75 }}>{aiTip}</div>}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setScreen("ai")} style={{ flex: 1, padding: 14, borderRadius: 14, background: C.accentDim, color: C.accentLight, border: `1px solid ${C.accent}44`, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
                Parler au coach IA →
              </button>
              <button onClick={() => setScreen("home")} style={{ flex: 1, padding: 14, borderRadius: 14, background: C.accent, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
                Accueil
              </button>
            </div>
          </div>
        )}

        {/* HISTORY */}
        {screen === "history" && (
          <div style={{ paddingTop: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, letterSpacing: -0.3 }}>Historique</div>
            <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.8 }}>7 derniers jours</div>
              <div style={{ display: "flex", gap: 6 }}>
                {history.map((d, i) => <HistBar key={i} day={d.day} score={d.score} isToday={d.day === "Auj"} />)}
              </div>
            </div>
            {[...history].reverse().filter(d => d.score !== null).map((d, i) => {
              const risk = getRisk(d.score);
              return (
                <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 18px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{d.day === "Auj" ? "Aujourd'hui" : d.day}</div>
                    <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>Risque {risk.label}</div>
                  </div>
                  <ScoreRing score={d.score} size={46} />
                </div>
              );
            })}
            <div style={{ background: C.accentDim, border: `1px solid ${C.accent}33`, borderRadius: 14, padding: 16, marginTop: 8 }}>
              <div style={{ fontSize: 12, color: C.accentLight, fontWeight: 700, marginBottom: 5 }}>🔒 Premium — Historique illimité</div>
              <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.6 }}>Avec le plan Premium, accède à 1 an d'historique, des graphiques détaillés et des rapports PDF à partager avec ton médecin.</div>
            </div>
          </div>
        )}

        {/* AI COACH */}
        {screen === "ai" && <AICoach user={user} todayScore={todayScore} answers={todayAnswers} />}

        {/* RESOURCES */}
        {screen === "resources" && (
          <div style={{ paddingTop: 10 }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, letterSpacing: -0.3 }}>Ressources</div>
            {[
              { title: "Respiration 4-7-8", desc: "Technique anti-stress validée cliniquement", emoji: "🌬️", color: C.green, action: "Lancer la technique" },
              { title: "Méditation guidée 5 min", desc: "Pleine conscience pour réduire l'anxiété", emoji: "🧘", color: C.accent, action: "Commencer" },
              { title: "Journal de gratitude", desc: "3 choses positives du jour — impact prouvé", emoji: "📝", color: C.amber, action: "Écrire" },
              { title: "Trouver un psychologue", desc: "Annuaire certifié près de chez toi", emoji: "🤝", color: C.accentLight, action: "Rechercher" },
            ].map((r, i) => (
              <div key={i} style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 12, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${r.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{r.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 3 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: C.textMuted }}>{r.desc}</div>
                </div>
                <div style={{ fontSize: 11, color: r.color, fontWeight: 600, flexShrink: 0 }}>{r.action} ›</div>
              </div>
            ))}

            {/* Premium */}
            <div style={{ background: `linear-gradient(135deg, ${C.accentDim}, ${C.bgCard})`, border: `1px solid ${C.accent}44`, borderRadius: 16, padding: 20, marginTop: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: C.accentLight, fontWeight: 700, marginBottom: 8 }}>✦ Premium · 7,99€/mois</div>
              <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.7, marginBottom: 14 }}>
                Coach IA quotidien · Historique illimité · Rapports PDF médecin · Alertes avancées · Séances guidées
              </div>
              <button style={{ padding: "12px 24px", borderRadius: 12, background: C.accent, color: "#fff", border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
                Essai 7 jours gratuits →
              </button>
            </div>

            {/* Urgence */}
            <div style={{ background: C.redDim, border: `1px solid ${C.red}44`, borderRadius: 16, padding: 18 }}>
              <div style={{ fontSize: 13, color: C.red, fontWeight: 700, marginBottom: 8 }}>🆘 Urgence · Détresse immédiate</div>
              <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.7 }}>
                <strong style={{ color: C.text }}>3114</strong> — Numéro national prévention suicide (gratuit, 24h/24, 7j/7)<br />
                <strong style={{ color: C.text }}>15</strong> — SAMU (urgences médicales)<br />
                <strong style={{ color: C.text }}>3114</strong> — Chat en ligne sur <strong style={{ color: C.text }}>3114.fr</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 430, background: C.bgCard,
        borderTop: `1px solid ${C.border}`, display: "flex",
        justifyContent: "space-around", padding: "10px 0 18px",
        backdropFilter: "blur(12px)",
      }}>
        {NAV.map(tab => {
          const active = screen === tab.id || (tab.id === "checkin" && screen === "result");
          return (
            <button key={tab.id} onClick={() => setScreen(tab.id === "checkin" && todayScore !== null ? "result" : tab.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              background: "none", border: "none", cursor: "pointer",
              color: active ? C.accent : C.textMuted, fontFamily: "'Sora', sans-serif",
              transition: "color 0.2s", padding: "0 8px",
            }}>
              <span style={{ fontSize: 17, transition: "transform 0.2s", transform: active ? "scale(1.2)" : "scale(1)" }}>{tab.emoji}</span>
              <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 400, letterSpacing: 0.3 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1A2035; border-radius: 2px; }
      `}</style>
    </div>
  );
}
