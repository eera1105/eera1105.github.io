
document.querySelector("#js-new-quote").addEventListener("click", newQuote);
document.querySelector("#js-tweet").addEventListener("click", tweetQuote);

const current = { quote: "", author: "" };
const ENDPOINT = "https://dummyjson.com/quotes/random"; // no key, CORS-friendly

function setLoading(isLoading) {
  const btn = document.querySelector("#js-new-quote");
  const quoteBox = document.querySelector("#js-quote-text");
  const authorBox = document.querySelector("#js-answer-text");
  btn.disabled = isLoading;
  if (isLoading) {
    quoteBox.textContent = "Loading a new quote…";
    authorBox.textContent = "";
  }
}

async function newQuote() {
  setLoading(true);
  try {
    const res = await fetch(ENDPOINT, { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const data = await res.json();  // { id, quote, author }
    current.quote = data.quote;
    current.author = data.author || "Unknown";
    display(current.quote, current.author);
  } catch (err) {
    console.error("Fetch error:", err);
    alert("Failed to get a new quote (see console for details).");
  } finally {
    setLoading(false);
  }
}

function display(quote, author) {
  document.querySelector("#js-quote-text").textContent = `“${quote}”`;
  document.querySelector("#js-answer-text").textContent = `— ${author}`;
}

function tweetQuote() {
  const tweet = `"${current.quote}" — ${current.author}`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&hashtags=quotes`;
  window.open(url, "_blank", "noopener,noreferrer");
}

newQuote();
