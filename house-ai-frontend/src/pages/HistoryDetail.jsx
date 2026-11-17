import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getHistoryItem } from "../api";
import AnswerCard from "../components/AnswerCard";

export default function HistoryDetail() {
  const { id } = useParams(); // the number in /history/:id
  const [item, setItem] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    getHistoryItem(id)
      .then(setItem)
      .catch(() => setErrorMsg("Couldn't find that query."));
  }, [id]);

  return (
    <section className="history">
      <Link to="/history" className="back-link">← Back to history</Link>

      {errorMsg && <p className="fallback-note">{errorMsg}</p>}
      {!item && !errorMsg && <p className="fallback-note">Loading…</p>}

      {item && (
        <>
          <AnswerCard question={item.query} answer={item.answer} meta={item.meta} />
          <span className="history-date">{new Date(item.created_at).toLocaleString()}</span>
        </>
      )}
    </section>
  );
}
