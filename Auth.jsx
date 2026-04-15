import { useState } from "react";
import { supabase } from "./App";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg: "#0A0E1A",
  bgCard: "#0F1523",
  border: "#1A2035",
  borderHover: "#2A3555",
  accent: "#6C63FF",
  accentLight: "#9B95FF",
  accentDim: "#15143A",
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

const inp = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 14,
  border: `1px solid ${C.border}`,
  background: C.bgCard,
  color: C.text,
  fontSize: 14,
  outline: "none",
  marginBottom: 12,
  fontFamily: "'Sora', sans-serif",
  transition: "border-color 0.2s",
};

function Pill({ color, children }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", background: `${color}22`, color, border: `1px solid ${color}44`, fontFamily: "'Sora', monospace" }}>
      {children}
    </span>
  );
}

function Checkbox({ checked, onChange, children, accent = C.accent }) {
  return (
    <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", marginBottom: 14, padding: "10px 12px", borderRadius: 12, background: checked ? `${accent}08` : "transparent", border: `1px solid ${checked ? accent + "33" : "transparent"}`, transition: "all 0.2s" }}>
      <div onClick={onChange} style={{
        width: 22, height: 22, borderRadius: 7, flexShrink: 0, marginTop: 1,
        border: `2px solid ${checked ? accent : C.textMuted}`,
        background: checked ? accent : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}>
        {checked && <span style={{ color: "#fff", fontSize: 12, fontWeight: 800, lineHeight: 1 }}>✓</span>}
      </div>
      <span style={{ fontSize: 13, color: checked ? C.text : C.textSec, lineHeight: 1.6 }}>{children}</span>
    </label>
  );
}

function PrivacyModal({ onClose }) {
  const sections = [
    {
      title: "1. Responsable du traitement",
      text: "MindGuard SAS — Cayenne, Guyane française — privacy@mindguard.app — Conformément au RGPD (Règlement UE 2016/679).",
    },
    {
      title: "2. Données collectées",
      text: "Données d'identification : email, prénom, âge, profession. Données de bien-être : réponses au check-in quotidien (humeur, sommeil, stress, énergie). Données techniques : logs de connexion (sécurité). Nous ne collectons jamais votre localisation, contacts ou données bancaires.",
    },
    {
      title: "3. Base légale (Art. 6 & 9 RGPD)",
      text: "Vos données de bien-être relèvent de l'Art. 9 RGPD (données sensibles). Leur traitement repose exclusivement sur votre consentement explicite et révocable. Les données de compte reposent sur l'exécution du contrat.",
    },
    {
      title: "4. Partage de données",
      text: "MindGuard ne vend jamais de données identifiables. Seules des données 100% anonymisées et agrégées peuvent être partagées (k-anonymat k≥10), uniquement avec votre consentement opt-in explicite. Chaque partenaire signe un accord anti-ré-identification.",
    },
    {
      title: "5. Vos droits RGPD (Art. 15-21)",
      text: "Accès · Rectification · Suppression · Portabilité · Opposition · Retrait du consentement. Contactez : privacy@mindguard.app — Délai de réponse : 30 jours. Réclamation CNIL : cnil.fr",
    },
    {
      title: "6. Sécurité & hébergement",
      text: "Chiffrement TLS 1.3 en transit, AES-256 au repos. Hébergement exclusif en Union Européenne. Hachage bcrypt pour les mots de passe. Journalisation des accès.",
    },
    {
      title: "7. Durée de conservation",
      text: "Données de compte : durée du compte + 30 jours. Données bien-être : 3 ans glissants. Logs de sécurité : 12 mois. Données marketing : jusqu'au retrait du consentement + 3 ans (preuve légale).",
    },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 16px" }}>
      <div style={{ background: C.bgCard, borderRadius: "24px 24px 0 0", border: `1px solid ${C.border}`, padding: 28, maxWidth: 500, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 4 }}>Politique de confidentialité</div>
            <Pill color={C.green}>RGPD Conforme · v1.0 · Avril 2026</Pill>
          </div>
          <button onClick={onClose} style={{ background: C.border, border: "none", color: C.textSec, width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: i < sections.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.accentLight, marginBottom: 7 }}>{s.title}</div>
            <div style={{ fontSize: 12.5, color: C.textSec, lineHeight: 1.75 }}>{s.text}</div>
          </div>
        ))}
        <div style={{ background: C.amberDim, border: `1px solid ${C.amber}44`, borderRadius: 14, padding: 14, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: C.amber, fontWeight: 700, marginBottom: 5 }}>⚕️ Avertissement médical</div>
          <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.6 }}>MindGuard est un outil de bien-être et de prévention, pas un dispositif médical. Il ne pose aucun diagnostic et ne remplace pas une consultation professionnelle. En cas de détresse : appelez le <strong style={{ color: C.text }}>3114</strong> ou le <strong style={{ color: C.text }}>15</strong>.</div>
        </div>
        <button onClick={onClose} style={{ width: "100%", padding: 14, borderRadius: 14, background: C.accent, color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>Compris, fermer</button>
      </div>
    </div>
  );
}

function CGUModal({ onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 16px" }}>
      <div style={{ background: C.bgCard, borderRadius: "24px 24px 0 0", border: `1px solid ${C.border}`, padding: 28, maxWidth: 500, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 4 }}>Conditions Générales d'Utilisation</div>
            <Pill color={C.accent}>Version 1.0 · Avril 2026</Pill>
          </div>
          <button onClick={onClose} style={{ background: C.border, border: "none", color: C.textSec, width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        {[
          { title: "Art. 1 — Nature du service", text: "MindGuard est une application de suivi du bien-être mental. Elle propose un check-in quotidien, un score de bien-être algorithmique, des alertes précoces non médicales et des conseils personnalisés." },
          { title: "Art. 2 — Ce que MindGuard n'est PAS", text: "MindGuard n'est pas un dispositif médical, ne pose aucun diagnostic, ne remplace pas un médecin ou psychologue, et n'est pas un service d'urgence." },
          { title: "Art. 3 — Âge minimum", text: "L'utilisation est réservée aux personnes de 16 ans et plus. Pour les 16-18 ans, l'accord d'un représentant légal est requis." },
          { title: "Art. 4 — Compte utilisateur", text: "Un compte par personne. L'utilisateur est responsable de la confidentialité de ses identifiants. Tout accès frauduleux est de sa responsabilité." },
          { title: "Art. 5 — Tarifs", text: "Plan Gratuit : check-in quotidien, score hebdomadaire, historique 7 jours. Plan Premium (7,99€/mois) : historique illimité, alertes précoces, coach IA quotidien, rapport PDF médecin." },
          { title: "Art. 6 — Limitation de responsabilité", text: "MindGuard SAS ne saurait être tenu responsable des décisions prises par l'utilisateur sur la base des informations de l'application, ni d'une dégradation de l'état de santé." },
          { title: "Art. 7 — Résiliation", text: "L'utilisateur peut supprimer son compte à tout moment. Toutes ses données sont effacées dans un délai de 30 jours." },
          { title: "Art. 8 — Droit applicable", text: "CGU soumises au droit français. Tribunaux compétents : Cayenne (Guyane). Médiation consommateur disponible (Art. L.612-1 Code de la consommation)." },
        ].map((s, i, arr) => (
          <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.text, marginBottom: 6 }}>{s.title}</div>
            <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.7 }}>{s.text}</div>
          </div>
        ))}
        <button onClick={onClose} style={{ width: "100%", padding: 14, borderRadius: 14, background: C.accent, color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Sora', sans-serif", marginTop: 8 }}>Compris, fermer</button>
      </div>
    </div>
  );
}

// ─── MAIN AUTH COMPONENT ──────────────────────────────────────────────────────
export default function Auth({ onSuccess }) {
  const [mode, setMode] = useState("register");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ email: "", password: "", confirm: "", prenom: "", age: "", profession: "" });
  const [consents, setConsents] = useState({ cgu: false, rgpd: false, analytics_anon: false, partner_anon: false, marketing: false, research: false });
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showCGU, setShowCGU] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [supabaseMode] = useState(false); // Passe à true quand tu configures Supabase

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggle = k => setConsents(c => ({ ...c, [k]: !c[k] }));

  function validateStep1() {
    const e = {};
    if (!form.email.includes("@")) e.email = "Email invalide";
    if (form.password.length < 8) e.password = "Minimum 8 caractères";
    if (mode === "register" && form.password !== form.confirm) e.confirm = "Les mots de passe ne correspondent pas";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2() {
    const e = {};
    if (!form.prenom.trim()) e.prenom = "Prénom requis";
    if (!form.age || Number(form.age) < 16 || Number(form.age) > 120) e.age = "Âge invalide (min. 16 ans)";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validateStep1()) return;
    setLoading(true);
    setErrors({});
    try {
      if (supabaseMode) {
        const { access_token, user, error } = await supabase.signIn(form.email, form.password);
        if (error) throw new Error("Email ou mot de passe incorrect");
        // Récupère le profil depuis la table 'profiles'
        const profiles = await supabase.query("profiles", "GET", null, `?user_id=eq.${user.id}&select=*`);
        const profile = profiles[0] || {};
        onSuccess({ id: user.id, email: user.email, prenom: profile.prenom || user.email.split("@")[0], token: access_token, consents: profile.consents || {} });
      } else {
        // Mode démo sans Supabase
        setTimeout(() => {
          setLoading(false);
          onSuccess({ email: form.email, prenom: form.email.split("@")[0], consents: {}, demo: true });
        }, 1200);
        return;
      }
    } catch (err) {
      setErrors({ submit: err.message });
    }
    setLoading(false);
  }

  async function handleSubmit() {
    if (!consents.cgu || !consents.rgpd) {
      setErrors({ submit: "Vous devez accepter les CGU et la politique de confidentialité pour continuer." });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      if (supabaseMode) {
        const { access_token, user, error } = await supabase.signUp(form.email, form.password);
        if (error) throw new Error(error.message);
        // Crée le profil avec consentements horodatés
        await supabase.query("profiles", "POST", {
          user_id: user.id,
          prenom: form.prenom,
          age: Number(form.age),
          profession: form.profession,
          consents: {
            ...consents,
            timestamp: new Date().toISOString(),
            ip_hash: "hashed", // à hasher côté serveur en production
          },
          plan: "free",
          created_at: new Date().toISOString(),
        });
        onSuccess({ id: user.id, email: form.email, prenom: form.prenom, token: access_token, consents });
      } else {
        // Mode démo
        setTimeout(() => {
          setLoading(false);
          onSuccess({ email: form.email, prenom: form.prenom, consents, demo: true });
        }, 1500);
        return;
      }
    } catch (err) {
      setErrors({ submit: err.message });
    }
    setLoading(false);
  }

  const steps = ["Compte", "Profil", "Confidentialité"];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Sora', sans-serif", color: C.text }}>
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showCGU && <CGUModal onClose={() => setShowCGU(false)} />}

      {/* Background glow */}
      <div style={{ position: "fixed", top: -100, left: "50%", transform: "translateX(-50%)", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${C.accent}15 0%, transparent 70%)`, pointerEvents: "none" }} />

      <div style={{ maxWidth: 420, margin: "0 auto", padding: "0 20px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Logo */}
        <div style={{ paddingTop: 40, paddingBottom: 32, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.accent}, ${C.green})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧠</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>MindGuard</div>
            <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: 1 }}>BIEN-ÊTRE MENTAL</div>
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 4, background: C.bgCard, borderRadius: 14, padding: 4, marginBottom: 28, border: `1px solid ${C.border}` }}>
          {["register", "login"].map(m => (
            <button key={m} onClick={() => { setMode(m); setStep(1); setErrors({}); }} style={{
              flex: 1, padding: "10px 0", borderRadius: 10, border: "none", cursor: "pointer",
              background: mode === m ? C.accent : "transparent",
              color: mode === m ? "#fff" : C.textSec,
              fontSize: 13, fontWeight: 600, transition: "all 0.2s", fontFamily: "'Sora', sans-serif",
            }}>
              {m === "register" ? "Créer un compte" : "Se connecter"}
            </button>
          ))}
        </div>

        {/* Login */}
        {mode === "login" && (
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: -0.5 }}>Bon retour 👋</div>
            <div style={{ fontSize: 13, color: C.textSec, marginBottom: 24 }}>Connecte-toi pour accéder à ton tableau de bord.</div>
            <label style={{ fontSize: 12, color: C.textSec, marginBottom: 6, display: "block", fontWeight: 600 }}>Email</label>
            <input style={inp} type="email" placeholder="toi@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
            {errors.email && <div style={{ fontSize: 11, color: C.red, marginTop: -8, marginBottom: 10 }}>{errors.email}</div>}
            <label style={{ fontSize: 12, color: C.textSec, marginBottom: 6, display: "block", fontWeight: 600 }}>Mot de passe</label>
            <input style={inp} type="password" placeholder="••••••••" value={form.password} onChange={e => set("password", e.target.value)} />
            {errors.submit && (
              <div style={{ background: C.redDim, border: `1px solid ${C.red}33`, borderRadius: 12, padding: 12, marginBottom: 14, fontSize: 12.5, color: C.red }}>{errors.submit}</div>
            )}
            <button onClick={handleLogin} disabled={loading} style={{ width: "100%", padding: 15, borderRadius: 14, background: loading ? C.textMuted : C.accent, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Sora', sans-serif", marginTop: 4 }}>
              {loading ? "Connexion..." : "Me connecter →"}
            </button>
          </div>
        )}

        {/* Register multi-step */}
        {mode === "register" && (
          <div style={{ flex: 1 }}>
            {/* Step indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700,
                      background: i + 1 < step ? C.green : i + 1 === step ? C.accent : C.border,
                      color: i + 1 <= step ? "#fff" : C.textMuted,
                      transition: "all 0.3s",
                    }}>
                      {i + 1 < step ? "✓" : i + 1}
                    </div>
                    <div style={{ fontSize: 10, color: i + 1 === step ? C.text : C.textMuted, fontWeight: i + 1 === step ? 600 : 400 }}>{s}</div>
                  </div>
                  {i < steps.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: i + 1 < step ? C.green : C.border, margin: "0 6px", marginBottom: 18, transition: "background 0.3s" }} />
                  )}
                </div>
              ))}
            </div>

            {/* STEP 1 — Compte */}
            {step === 1 && (
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: -0.5 }}>Crée ton compte</div>
                <div style={{ fontSize: 13, color: C.textSec, marginBottom: 24 }}>Ton email ne sera jamais partagé ni vendu.</div>
                <label style={{ fontSize: 12, color: C.textSec, marginBottom: 6, display: "block", fontWeight: 600 }}>Adresse email</label>
                <input style={inp} type="email" placeholder="toi@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
                {errors.email && <div style={{ fontSize: 11, color: C.red, marginTop: -8, marginBottom: 10 }}>{errors.email}</div>}
                <label style={{ fontSize: 12, color: C.textSec, marginBottom: 6, display: "block", fontWeight: 600 }}>Mot de passe</label>
                <input style={inp} type="password" placeholder="Minimum 8 caractères" value={form.password} onChange={e => set("password", e.target.value)} />
                {errors.password && <div style={{ fontSize: 11, color: C.red, marginTop: -8, marginBottom: 10 }}>{errors.password}</div>}
                <label style={{ fontSize: 12, color: C.textSec, marginBottom: 6, display: "block", fontWeight: 600 }}>Confirmer le mot de passe</label>
                <input style={inp} type="password" placeholder="Répète ton mot de passe" value={form.confirm} onChange={e => set("confirm", e.target.value)} />
                {errors.confirm && <div style={{ fontSize: 11, color: C.red, marginTop: -8, marginBottom: 10 }}>{errors.confirm}</div>}
                <div style={{ background: C.greenDim, border: `1px solid ${C.green}33`, borderRadius: 12, padding: 12, marginBottom: 20, fontSize: 12, color: C.green, lineHeight: 1.6 }}>
                  🔒 Mot de passe haché avec bcrypt · Connexion TLS 1.3 · Hébergement UE uniquement
                </div>
                <button onClick={() => validateStep1() && setStep(2)} style={{ width: "100%", padding: 15, borderRadius: 14, background: C.accent, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>
                  Continuer →
                </button>
              </div>
            )}

            {/* STEP 2 — Profil */}
            {step === 2 && (
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: -0.5 }}>Ton profil</div>
                <div style={{ fontSize: 13, color: C.textSec, marginBottom: 24 }}>Permet de personnaliser tes conseils. Ces données restent privées.</div>
                <label style={{ fontSize: 12, color: C.textSec, marginBottom: 6, display: "block", fontWeight: 600 }}>Prénom *</label>
                <input style={inp} type="text" placeholder="Ton prénom" value={form.prenom} onChange={e => set("prenom", e.target.value)} />
                {errors.prenom && <div style={{ fontSize: 11, color: C.red, marginTop: -8, marginBottom: 10 }}>{errors.prenom}</div>}
                <label style={{ fontSize: 12, color: C.textSec, marginBottom: 6, display: "block", fontWeight: 600 }}>Âge * (min. 16 ans)</label>
                <input style={inp} type="number" placeholder="Ton âge" value={form.age} onChange={e => set("age", e.target.value)} />
                {errors.age && <div style={{ fontSize: 11, color: C.red, marginTop: -8, marginBottom: 10 }}>{errors.age}</div>}
                <label style={{ fontSize: 12, color: C.textSec, marginBottom: 6, display: "block", fontWeight: 600 }}>Profession (optionnel)</label>
                <select style={{ ...inp, marginBottom: 20 }} value={form.profession} onChange={e => set("profession", e.target.value)}>
                  <option value="">Sélectionner...</option>
                  {["Salarié(e)", "Indépendant(e) / Freelance", "Étudiant(e)", "Sans emploi", "Retraité(e)", "Professionnel de santé", "Enseignant(e)", "Autre"].map(p => <option key={p}>{p}</option>)}
                </select>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: 15, borderRadius: 14, background: "transparent", color: C.textSec, border: `1px solid ${C.border}`, fontSize: 13, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>← Retour</button>
                  <button onClick={() => validateStep2() && setStep(3)} style={{ flex: 2, padding: 15, borderRadius: 14, background: C.accent, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>Continuer →</button>
                </div>
              </div>
            )}

            {/* STEP 3 — Consentements */}
            {step === 3 && (
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, letterSpacing: -0.5 }}>Tes choix</div>
                <div style={{ fontSize: 13, color: C.textSec, marginBottom: 22 }}>Tu contrôles totalement tes données. Chaque consentement est indépendant et révocable.</div>

                {/* Obligatoires */}
                <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 14 }}>
                  <div style={{ marginBottom: 14 }}><Pill color={C.red}>Obligatoires</Pill></div>
                  <Checkbox checked={consents.cgu} onChange={() => toggle("cgu")}>
                    J'accepte les{" "}
                    <span onClick={() => setShowCGU(true)} style={{ color: C.accentLight, cursor: "pointer", textDecoration: "underline" }}>Conditions Générales d'Utilisation</span>.
                    MindGuard est un outil de bien-être, non un dispositif médical.
                  </Checkbox>
                  <Checkbox checked={consents.rgpd} onChange={() => toggle("rgpd")}>
                    J'ai lu et accepte la{" "}
                    <span onClick={() => setShowPrivacy(true)} style={{ color: C.accentLight, cursor: "pointer", textDecoration: "underline" }}>Politique de confidentialité</span>.
                    Mes données sont traitées selon le RGPD.
                  </Checkbox>
                </div>

                {/* Partage anonymisé */}
                <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 14 }}>
                  <div style={{ marginBottom: 6 }}><Pill color={C.amber}>Optionnel · Partage anonymisé</Pill></div>
                  <div style={{ fontSize: 11.5, color: C.textMuted, marginBottom: 14, lineHeight: 1.6 }}>Données 100% anonymisées — impossible de t'identifier. K-anonymat ≥ 10. Révocable à tout moment dans les paramètres.</div>
                  <Checkbox checked={consents.analytics_anon} onChange={() => toggle("analytics_anon")} accent={C.amber}>
                    Améliorer l'algorithme MindGuard avec mes données anonymisées.
                  </Checkbox>
                  <Checkbox checked={consents.partner_anon} onChange={() => toggle("partner_anon")} accent={C.amber}>
                    Partager mes données anonymisées avec nos partenaires certifiés (mutuelles, DRH, chercheurs).
                    <span style={{ display: "block", fontSize: 11, color: C.amber, marginTop: 4, fontWeight: 600 }}>🎁 1 mois Premium offert en échange</span>
                  </Checkbox>
                </div>

                {/* Communications */}
                <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 16 }}>
                  <div style={{ marginBottom: 12 }}><Pill color={C.green}>Optionnel · Communications</Pill></div>
                  <Checkbox checked={consents.research} onChange={() => toggle("research")} accent={C.green}>
                    Participer à des études scientifiques anonymes sur la santé mentale.
                  </Checkbox>
                  <Checkbox checked={consents.marketing} onChange={() => toggle("marketing")} accent={C.green}>
                    Recevoir conseils bien-être et actualités MindGuard par email (max. 2/mois, désinscription 1 clic).
                  </Checkbox>
                </div>

                {consents.partner_anon && (
                  <div style={{ background: C.amberDim, border: `1px solid ${C.amber}44`, borderRadius: 14, padding: 14, marginBottom: 16 }}>
                    <div style={{ fontSize: 12.5, color: C.amber, fontWeight: 700, marginBottom: 4 }}>🎉 Merci pour ta confiance !</div>
                    <div style={{ fontSize: 12, color: C.textSec, lineHeight: 1.6 }}>Tu recevras 1 mois Premium gratuit activé automatiquement après ta confirmation d'email.</div>
                  </div>
                )}

                {errors.submit && (
                  <div style={{ background: C.redDim, border: `1px solid ${C.red}33`, borderRadius: 12, padding: 14, marginBottom: 16, fontSize: 12.5, color: C.red, lineHeight: 1.6 }}>{errors.submit}</div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => setStep(2)} style={{ flex: 1, padding: 15, borderRadius: 14, background: "transparent", color: C.textSec, border: `1px solid ${C.border}`, fontSize: 13, cursor: "pointer", fontFamily: "'Sora', sans-serif" }}>← Retour</button>
                  <button onClick={handleSubmit} disabled={loading} style={{ flex: 2, padding: 15, borderRadius: 14, background: loading ? C.textMuted : C.accent, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Sora', sans-serif" }}>
                    {loading ? "Création..." : "Créer mon compte ✓"}
                  </button>
                </div>

                <div style={{ fontSize: 11, color: C.textMuted, textAlign: "center", marginTop: 18, lineHeight: 1.7 }}>
                  Conformément au RGPD, tu peux exercer tes droits à tout moment · privacy@mindguard.app
                  <br />Consentements horodatés et archivés conformément à l'Art. 7 RGPD
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ paddingBottom: 40 }} />
      </div>
    </div>
  );
}
