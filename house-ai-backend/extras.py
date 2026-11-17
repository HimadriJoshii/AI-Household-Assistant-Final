"""Extra AI features: smart metadata (category/urgency/follow-ups) + YouTube video lookup."""
import os, re, json, requests
from urllib.parse import quote
from langchain_core.messages import SystemMessage, HumanMessage
from intent_ai_agent import llm

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")  # optional - falls back to scraping

PROMPT = """You analyse a household assistant Q&A. Return ONLY JSON:
{"category":"food|appliance|energy|general","urgency":"low|medium|high",
"video_query":"short YouTube search query for a helpful how-to video",
"follow_ups":["3 short follow-up questions the user may ask next"]}"""


def get_meta(query, answer):
    try:
        r = llm.invoke([SystemMessage(content=PROMPT),
                        HumanMessage(content=f"Question: {query}\nAnswer: {answer}")])
        m = json.loads(re.search(r"\{.*\}", r.content, re.S).group())
        return {
            "category": m.get("category", "general"),
            "urgency": m.get("urgency", "low"),
            "video_query": m.get("video_query") or query,
            "follow_ups": (m.get("follow_ups") or [])[:3],
        }
    except Exception:
        return {"category": "general", "urgency": "low", "video_query": query, "follow_ups": []}


def find_video(q):
    """Return {id, title} of the top YouTube result, or None."""
    try:
        if YOUTUBE_API_KEY:
            d = requests.get("https://www.googleapis.com/youtube/v3/search", timeout=8, params={
                "part": "snippet", "q": q, "type": "video", "maxResults": 1,
                "videoEmbeddable": "true", "safeSearch": "strict", "key": YOUTUBE_API_KEY}).json()
            it = d["items"][0]
            return {"id": it["id"]["videoId"], "title": it["snippet"]["title"]}
        # No key: read the public results page
        html = requests.get(f"https://www.youtube.com/results?search_query={quote(q)}",
                            headers={"User-Agent": "Mozilla/5.0", "Accept-Language": "en"},
                            timeout=8).text
        vid = re.search(r'"videoId":"([\w-]{11})"', html).group(1)
        title = re.search(r'"title":\{"runs":\[\{"text":"(.*?)"\}', html)
        return {"id": vid, "title": title.group(1) if title else q}
    except Exception:
        return None
