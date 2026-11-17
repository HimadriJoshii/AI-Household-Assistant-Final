import { useState, useRef } from "react";
import { askAssistant } from "../api";
import AnswerCard from "../components/AnswerCard";

export default function Home() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState(null);
  const [listening, setListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const inputRef = useRef(null);

  const handleSubmit = async (override) => {
    const trimmed = (typeof override === "string" ? override : query).trim();
    if (!trimmed || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // The backend saves this query to your History automatically
      const reply = await askAssistant(trimmed);
      setAnswer(reply);
      // (We no longer clear the search bar here, so your question stays put)
    } catch {
      setErrorMsg("Couldn't reach the assistant — try again in a moment.");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Voice input (Chrome / Edge) using the browser's Web Speech API
  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Voice input isn't supported in this browser — try Chrome.");
    const rec = new SR();
    rec.lang = "en-IN";
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setQuery(text);
      handleSubmit(text);
    };
    rec.start();
  };

  const followUp = (q) => { setQuery(q); handleSubmit(q); };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <>
      <header className="hero">
        <span className="eyebrow">Household AI Assistant</span>
        <h1 className="hero-title">
          Ask your home
          <br />
          anything.
        </h1>
        <p className="hero-subtitle">
          Food safety, appliances, or energy saving — ask in plain
          language and get a recommendation back.
        </p>
      </header>

      <section className="switchboard">
        <div className="query-bar">
          <input
            ref={inputRef}
            className="query-input"
            type="text"
            placeholder="e.g. My fridge is making a loud humming noise"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className={`mic ${listening ? "mic--on" : ""}`} onClick={startVoice} aria-label="Speak">🎤</button>
          <button
            className="query-submit"
            onClick={() => handleSubmit()}
            disabled={isLoading}
          >
            {isLoading ? "Thinking…" : "Ask"}
          </button>
        </div>

        {errorMsg && <p className="fallback-note">{errorMsg}</p>}

        {answer && !errorMsg && (
          <AnswerCard answer={answer.response} meta={answer} onFollowUp={followUp} />
        )}
      </section>
    </>
  );
}
