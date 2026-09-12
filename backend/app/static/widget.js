(function () {
  if (window.AgentForgeWidgetLoaded) return;
  window.AgentForgeWidgetLoaded = true;

  // Find script attributes
  const currentScript = document.currentScript || document.querySelector('script[data-agent-id], script[data-slug]');
  const agentId = currentScript ? currentScript.getAttribute('data-agent-id') : null;
  const slug = currentScript ? currentScript.getAttribute('data-slug') : null;
  const apiUrl = (currentScript && currentScript.getAttribute('data-api-url')) || 'http://localhost:8000';
  const theme = (currentScript && currentScript.getAttribute('data-theme')) || 'dark';

  let sessionId = null;
  let isOpen = false;

  // Create Styles
  const styles = document.createElement('style');
  styles.innerHTML = `
    .af-widget-launcher {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.5), 0 8px 10px -6px rgba(79, 70, 229, 0.4);
      cursor: pointer;
      z-index: 999999;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .af-widget-launcher:hover {
      transform: scale(1.05);
      box-shadow: 0 14px 28px -4px rgba(79, 70, 229, 0.6);
    }
    .af-widget-launcher svg {
      width: 28px;
      height: 28px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
    }
    .af-widget-window {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 380px;
      height: 580px;
      max-width: calc(100vw - 48px);
      max-height: calc(100vh - 120px);
      background: #0f172a;
      color: #f8fafc;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      z-index: 999999;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      transition: opacity 0.2s ease, transform 0.2s ease;
      opacity: 0;
      pointer-events: none;
      transform: translateY(16px);
    }
    .af-widget-window.open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }
    .af-widget-header {
      padding: 16px 20px;
      background: #1e293b;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .af-widget-title {
      font-weight: 600;
      font-size: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .af-widget-badge {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 8px #22c55e;
    }
    .af-widget-close {
      cursor: pointer;
      color: #94a3b8;
      font-size: 20px;
      line-height: 1;
    }
    .af-widget-close:hover { color: #f8fafc; }
    .af-widget-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .af-msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13.5px;
      line-height: 1.45;
      word-break: break-word;
    }
    .af-msg.user {
      align-self: flex-end;
      background: #4f46e5;
      color: #ffffff;
      border-bottom-right-radius: 2px;
    }
    .af-msg.assistant {
      align-self: flex-start;
      background: #1e293b;
      color: #e2e8f0;
      border-bottom-left-radius: 2px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .af-citation-tag {
      display: inline-block;
      margin-top: 6px;
      font-size: 11px;
      color: #a5b4fc;
      background: rgba(79, 70, 229, 0.2);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .af-action-card {
      margin-top: 8px;
      padding: 12px;
      background: #334155;
      border-radius: 8px;
      border: 1px solid #6366f1;
    }
    .af-action-title {
      font-size: 12px;
      font-weight: 600;
      color: #818cf8;
      margin-bottom: 6px;
    }
    .af-action-text {
      font-size: 12.5px;
      margin-bottom: 10px;
    }
    .af-action-btns {
      display: flex;
      gap: 8px;
    }
    .af-btn-confirm {
      flex: 1;
      background: #4f46e5;
      color: #ffffff;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
    }
    .af-btn-cancel {
      flex: 1;
      background: #475569;
      color: #cbd5e1;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
    }
    .af-widget-input-row {
      padding: 12px 16px;
      background: #1e293b;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      gap: 8px;
    }
    .af-widget-input {
      flex: 1;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 8px 12px;
      color: #f8fafc;
      font-size: 13.5px;
      outline: none;
    }
    .af-widget-input:focus { border-color: #6366f1; }
    .af-widget-send {
      background: #4f46e5;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 8px 14px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
    }
  `;
  document.head.appendChild(styles);

  // Create UI Container
  const launcher = document.createElement('div');
  launcher.className = 'af-widget-launcher';
  launcher.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
    </svg>
  `;

  const windowContainer = document.createElement('div');
  windowContainer.className = 'af-widget-window';
  windowContainer.innerHTML = `
    <div class="af-widget-header">
      <div class="af-widget-title">
        <span class="af-widget-badge"></span>
        <span id="af-agent-name">AI Employee</span>
      </div>
      <div class="af-widget-close" id="af-close-btn">&times;</div>
    </div>
    <div class="af-widget-messages" id="af-messages">
      <div class="af-msg assistant">
        Hello! I'm your AI business assistant. How can I help you today?
      </div>
    </div>
    <div class="af-widget-input-row">
      <input type="text" class="af-widget-input" id="af-input" placeholder="Ask anything or request an action..." />
      <button class="af-widget-send" id="af-send-btn">Send</button>
    </div>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(windowContainer);

  const messagesDiv = windowContainer.querySelector('#af-messages');
  const inputElem = windowContainer.querySelector('#af-input');
  const sendBtn = windowContainer.querySelector('#af-send-btn');
  const closeBtn = windowContainer.querySelector('#af-close-btn');
  const agentNameElem = windowContainer.querySelector('#af-agent-name');

  // Toggle Window
  launcher.addEventListener('click', () => {
    isOpen = !isOpen;
    if (isOpen) {
      windowContainer.classList.add('open');
      inputElem.focus();
      if (!sessionId) initSession();
    } else {
      windowContainer.classList.remove('open');
    }
  });

  closeBtn.addEventListener('click', () => {
    isOpen = false;
    windowContainer.classList.remove('open');
  });

  // Initialize Session
  async function initSession() {
    try {
      const res = await fetch(`${apiUrl}/api/v1/chat/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agentId, slug: slug, channel: 'web_chat' })
      });
      if (res.ok) {
        const data = await res.json();
        sessionId = data.session_id;
        agentNameElem.textContent = data.agent_name || `${data.business_name} AI`;
      }
    } catch (e) {
      console.warn('AgentForge widget session init fallback:', e);
    }
  }

  // Send Message
  async function sendMessage() {
    const text = inputElem.value.trim();
    if (!text) return;
    inputElem.value = '';

    // Append user message
    const uMsg = document.createElement('div');
    uMsg.className = 'af-msg user';
    uMsg.textContent = text;
    messagesDiv.appendChild(uMsg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Loading indicator
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'af-msg assistant';
    loadingMsg.textContent = 'Thinking...';
    messagesDiv.appendChild(loadingMsg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    if (!sessionId) await initSession();

    try {
      const res = await fetch(`${apiUrl}/api/v1/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      });
      const data = await res.json();
      loadingMsg.remove();

      const aMsg = document.createElement('div');
      aMsg.className = 'af-msg assistant';
      aMsg.innerHTML = data.content.replace(/\n/g, '<br/>');

      // Add citations
      if (data.citations && data.citations.length > 0) {
        const citDiv = document.createElement('div');
        citDiv.className = 'af-citation-tag';
        citDiv.textContent = `Grounded in: ${data.citations[0].title || 'Verified Knowledge'}`;
        aMsg.appendChild(citDiv);
      }

      // Add Action Card if required
      if (data.action_required) {
        const card = document.createElement('div');
        card.className = 'af-action-card';
        card.innerHTML = `
          <div class="af-action-title">CONFIRMATION REQUIRED</div>
          <div class="af-action-text">${data.action_required.prompt_text}</div>
          <div class="af-action-btns">
            <button class="af-btn-confirm" id="btn-confirm-${data.action_required.execution_id}">Confirm</button>
            <button class="af-btn-cancel" id="btn-cancel-${data.action_required.execution_id}">Cancel</button>
          </div>
        `;
        aMsg.appendChild(card);

        // Bind Confirm
        setTimeout(() => {
          const cBtn = card.querySelector(`#btn-confirm-${data.action_required.execution_id}`);
          const xBtn = card.querySelector(`#btn-cancel-${data.action_required.execution_id}`);
          if (cBtn) {
            cBtn.addEventListener('click', async () => {
              card.innerHTML = `<div class="af-action-title">CONFIRMING...</div>`;
              await fetch(`${apiUrl}/api/v1/actions/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ execution_id: data.action_required.execution_id, confirm: true })
              });
              card.innerHTML = `<div class="af-action-title" style="color: #22c55e;">CONFIRMED</div><div>Appointment successfully booked!</div>`;
            });
          }
          if (xBtn) {
            xBtn.addEventListener('click', async () => {
              await fetch(`${apiUrl}/api/v1/actions/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ execution_id: data.action_required.execution_id, confirm: false })
              });
              card.innerHTML = `<div style="color: #94a3b8;">Action cancelled.</div>`;
            });
          }
        }, 50);
      }

      messagesDiv.appendChild(aMsg);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (e) {
      loadingMsg.textContent = "Sorry, I couldn't reach the server. Please try again.";
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  inputElem.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
})();
