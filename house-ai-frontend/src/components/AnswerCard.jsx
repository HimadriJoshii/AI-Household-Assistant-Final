import { useState } from "react";

const ICON = { food: "🥗", appliance: "🔧", energy: "⚡", general: "🏠" };

// Shows the answer + category/urgency badges + YouTube video + follow-up chips.
export default function AnswerCard({ question, answer, meta = {}, onFollowUp }) {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const { category = "general", urgency = "low", video, follow_ups = [] } = meta;

  const copy = async () => {
    await navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const speak = () => {
    if (speaking) { speechSynthesis.cancel(); return setSpeaking(false); }
    const u = new SpeechSynthesisUtterance(answer);
    u.onend = () => setSpeaking(false);
    speechSynthesis.speak(u);
    setSpeaking(true);
  };

  return (
    <div className="answer-card">
      {question && <p className="answer-question">“{question}”</p>}
      <div className="badges">
        <span className={`badge badge--${category}`}>{ICON[category]} {category}</span>
        <span className={`badge badge--urg-${urgency}`}>● {urgency} urgency</span>
      </div>

      <span className="answer-label">Recommendation</span>
      <p className="answer-text" style={{ whiteSpace: "pre-wrap" }}>{answer}</p>

      <div className="actions">
        <button className="chip" onClick={speak}>{speaking ? "⏹ Stop" : "🔊 Read aloud"}</button>
        <button className="chip" onClick={copy}>{copied ? "✓ Copied" : "📋 Copy"}</button>
      </div>

      {video && (
        <div className="video-box">
          <span className="answer-label">▶ Recommended video</span>
          <div className="video-frame">
            <iframe
              src={`https://www.youtube.com/embed/${video.id}`}
              title={video.title}
              allow="accelerometer; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="video-title">{video.title}</p>
        </div>
      )}

      {onFollowUp && follow_ups.length > 0 && (
        <div className="followups">
          <span className="answer-label">You might also ask</span>
          {follow_ups.map((q) => (
            <button key={q} className="chip chip--q" onClick={() => onFollowUp(q)}>{q}</button>
          ))}
        </div>
      )}
    </div>
  );
}
