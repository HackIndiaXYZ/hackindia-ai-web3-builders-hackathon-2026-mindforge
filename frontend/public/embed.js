(function () {
  if (window.__AGENTFORGE_EMBED_INITIALIZED__) return;
  window.__AGENTFORGE_EMBED_INITIALIZED__ = true;

  var currentScript =
    document.currentScript ||
    document.querySelector('script[src*="embed.js"]') ||
    document.querySelector('script[src*="loader.js"]');

  var slug =
    (currentScript && (
      currentScript.getAttribute("data-slug") ||
      currentScript.getAttribute("data-workspace-slug") ||
      currentScript.getAttribute("data-agent-id")
    )) || "sweet-crust-bakery";

  var scriptSrc = (currentScript && currentScript.src) || "";
  var host = "http://localhost:3000";
  try {
    if (scriptSrc) {
      host = new URL(scriptSrc).origin;
    } else if (typeof window !== "undefined" && window.location) {
      host = window.location.origin;
    }
  } catch (e) {
    host = "http://localhost:3000";
  }

  var style = document.createElement("style");
  style.textContent = [
    ".agentforge-bubble {",
    "  position: fixed;",
    "  bottom: 24px;",
    "  right: 24px;",
    "  width: 56px;",
    "  height: 56px;",
    "  border-radius: 50%;",
    "  background: #09090b;",
    "  color: #ffffff;",
    "  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);",
    "  cursor: pointer;",
    "  display: flex;",
    "  align-items: center;",
    "  justify-content: center;",
    "  z-index: 999999;",
    "  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;",
    "  border: 1px solid rgba(255, 255, 255, 0.18);",
    "  user-select: none;",
    "}",
    ".agentforge-bubble:hover {",
    "  transform: scale(1.06);",
    "  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.4);",
    "}",
    ".agentforge-bubble:active {",
    "  transform: scale(0.96);",
    "}",
    ".agentforge-iframe-container {",
    "  position: fixed;",
    "  bottom: 92px;",
    "  right: 24px;",
    "  width: 400px;",
    "  height: 600px;",
    "  max-width: calc(100vw - 32px);",
    "  max-height: calc(100vh - 120px);",
    "  border-radius: 16px;",
    "  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08);",
    "  z-index: 999998;",
    "  overflow: hidden;",
    "  display: none;",
    "  background: #09090b;",
    "  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);",
    "  transform: translateY(12px) scale(0.98);",
    "  opacity: 0;",
    "}",
    ".agentforge-iframe-container.open {",
    "  display: block;",
    "  transform: translateY(0) scale(1);",
    "  opacity: 1;",
    "}",
    ".agentforge-iframe {",
    "  width: 100%;",
    "  height: 100%;",
    "  border: none;",
    "  background: transparent;",
    "}"
  ].join("\n");
  document.head.appendChild(style);

  var bubble = document.createElement("div");
  bubble.className = "agentforge-bubble";
  bubble.setAttribute("aria-label", "Open AgentForge AI Assistant");
  bubble.innerHTML = '<svg class="af-chat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg><svg class="af-close-icon" style="display:none;" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

  var container = document.createElement("div");
  container.className = "agentforge-iframe-container";
  var iframe = document.createElement("iframe");
  iframe.className = "agentforge-iframe";
  iframe.src = host + "/" + encodeURIComponent(slug) + "?widget=true";
  iframe.title = "AgentForge AI Assistant";
  iframe.setAttribute("allow", "clipboard-write");
  container.appendChild(iframe);

  document.body.appendChild(container);
  document.body.appendChild(bubble);

  var isOpen = false;
  bubble.addEventListener("click", function () {
    isOpen = !isOpen;
    if (isOpen) {
      container.classList.add("open");
      bubble.querySelector(".af-chat-icon").style.display = "none";
      bubble.querySelector(".af-close-icon").style.display = "block";
    } else {
      container.classList.remove("open");
      bubble.querySelector(".af-chat-icon").style.display = "block";
      bubble.querySelector(".af-close-icon").style.display = "none";
    }
  });
})();
