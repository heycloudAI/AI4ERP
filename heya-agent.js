/**
 * Heya — Agent conversationnel HeyCloud4ERP
 * Version proxy — appels  via heya-proxy.php (pas de clé API exposée)
 *
 * INTÉGRATION : une seule ligne juste avant </body>
 *   <script src="heya-agent.js"></script>
 */
(function () {

  const PROXY_URL = 'https://heya-proxy.vercel.app/api/proxy';

  const ICON_SEND  = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`;
  const ICON_CLOSE = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

  const AVATAR = (w, h) => `<svg width="${w}" height="${h}" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">
    <circle cx="21" cy="21" r="21" fill="#E6F1FB"/>
    <rect x="12" y="10" width="18" height="16" rx="6" fill="#185FA5"/>
    <line x1="21" y1="10" x2="21" y2="6" stroke="#185FA5" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="21" cy="5.5" r="2" fill="#378ADD"/>
    <rect x="15" y="15" width="4" height="3" rx="1.5" fill="#E6F1FB"/>
    <rect x="23" y="15" width="4" height="3" rx="1.5" fill="#E6F1FB"/>
    <circle cx="17" cy="16.5" r="1" fill="#185FA5"/>
    <circle cx="25" cy="16.5" r="1" fill="#185FA5"/>
    <path d="M17 21 Q21 24 25 21" stroke="#E6F1FB" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <ellipse cx="21" cy="35" rx="7" ry="5" fill="#185FA5" opacity="0.18"/>
    <rect x="19" y="26" width="4" height="4" rx="1" fill="#185FA5" opacity="0.5"/>
  </svg>`;

  const LAUNCHER_ICON = `<svg width="32" height="32" viewBox="0 0 42 42" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="10" width="18" height="16" rx="6" fill="#E6F1FB"/>
    <line x1="21" y1="10" x2="21" y2="6" stroke="#E6F1FB" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="21" cy="5.5" r="2" fill="#85B7EB"/>
    <rect x="15" y="15" width="4" height="3" rx="1.5" fill="#185FA5"/>
    <rect x="23" y="15" width="4" height="3" rx="1.5" fill="#185FA5"/>
    <circle cx="17" cy="16.5" r="1" fill="#E6F1FB"/>
    <circle cx="25" cy="16.5" r="1" fill="#E6F1FB"/>
    <path d="M17 21 Q21 24 25 21" stroke="#185FA5" stroke-width="1.5" stroke-linecap="round" fill="none"/>
  </svg>`;

  const CSS = `
    #heya-launcher {
      position: fixed; bottom: 28px; right: 28px;
      width: 60px; height: 60px; border-radius: 50%;
      background: #185FA5; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      z-index: 99999;
      box-shadow: 0 4px 20px rgba(24,95,165,0.35);
      transition: transform 0.2s, background 0.2s;
    }
    #heya-launcher:hover { background: #0C447C; transform: scale(1.06); }

    #heya-panel {
      position: fixed; bottom: 102px; right: 28px;
      width: 370px; height: 520px;
      background: #fff;
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 16px;
      display: flex; flex-direction: column;
      z-index: 99998;
      box-shadow: 0 8px 40px rgba(0,0,0,0.15);
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      transition: opacity 0.25s, transform 0.25s;
    }
    #heya-panel.heya-hidden { opacity: 0; pointer-events: none; transform: translateY(16px); }

    @media (max-width: 480px) {
      #heya-panel { width: calc(100vw - 20px); right: 10px; bottom: 88px; }
      #heya-launcher { bottom: 14px; right: 14px; }
    }

    #heya-header {
      background: #185FA5; padding: 14px 16px;
      display: flex; align-items: center; gap: 12px; flex-shrink: 0;
    }
    .heya-av-lg { width: 42px; height: 42px; border-radius: 50%; background: #E6F1FB; flex-shrink: 0; overflow: hidden; }
    .heya-hname { font-size: 15px; font-weight: 600; color: #E6F1FB; }
    .heya-hstatus { font-size: 11px; color: #85B7EB; display: flex; align-items: center; gap: 5px; margin-top: 2px; }
    .heya-dot { width: 7px; height: 7px; border-radius: 50%; background: #5cb85c; display: inline-block; animation: hpulse 2s infinite; }
    @keyframes hpulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    #heya-close { background: none; border: none; cursor: pointer; color: #85B7EB; margin-left: auto; padding: 4px; display: flex; align-items: center; }
    #heya-close:hover { color: #E6F1FB; }

    #heya-msgs {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
    }
    #heya-msgs::-webkit-scrollbar { width: 4px; }
    #heya-msgs::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }

    .hmsg { display: flex; gap: 8px; align-items: flex-end; }
    .hmsg.huser { flex-direction: row-reverse; }
    .hbubble {
      max-width: 80%; padding: 10px 13px; border-radius: 14px;
      font-size: 13.5px; line-height: 1.6; color: #1a1a1a;
      background: #f0f0ef; border: 1px solid rgba(0,0,0,0.07);
    }
    .hmsg.huser .hbubble { background: #185FA5; color: #fff; border-color: #185FA5; }
    .heya-av-sm { width: 28px; height: 28px; border-radius: 50%; background: #E6F1FB; flex-shrink: 0; overflow: hidden; }

    .htyping { display: flex; gap: 5px; align-items: center; padding: 10px 14px; }
    .htdot { width: 7px; height: 7px; border-radius: 50%; background: #bbb; animation: hblink 1.2s infinite; }
    .htdot:nth-child(2){animation-delay:.2s} .htdot:nth-child(3){animation-delay:.4s}
    @keyframes hblink{0%,80%,100%{opacity:.25}40%{opacity:1}}

    #heya-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 4px 14px 8px; flex-shrink: 0; }
    .hchip {
      font-size: 12px; padding: 5px 11px; border-radius: 20px;
      border: 1px solid rgba(0,0,0,0.15); background: #f5f5f4;
      cursor: pointer; color: #444; font-family: inherit;
      transition: background .15s, color .15s;
    }
    .hchip:hover { background: #dbeafe; color: #185FA5; border-color: #93c5fd; }

    #heya-inputrow {
      display: flex; gap: 8px; padding: 10px 12px;
      border-top: 1px solid rgba(0,0,0,0.08); align-items: flex-end; flex-shrink: 0;
    }
    #heya-input {
      flex: 1; border: 1px solid rgba(0,0,0,0.15); border-radius: 20px;
      padding: 8px 14px; font-size: 13.5px; resize: none;
      min-height: 36px; max-height: 80px;
      background: #f5f5f4; color: #1a1a1a; line-height: 1.5;
      font-family: inherit; outline: none;
    }
    #heya-input:focus { border-color: #378ADD; background: #fff; }
    #heya-sendbtn {
      width: 36px; height: 36px; border-radius: 50%;
      background: #185FA5; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; color: #fff; transition: background .15s;
    }
    #heya-sendbtn:hover { background: #0C447C; }
    #heya-sendbtn:disabled { background: #ccc; cursor: default; }
    #heya-footer { text-align: center; font-size: 10px; color: #bbb; padding: 5px 0 8px; flex-shrink: 0; }
  `;

  const SYSTEM = `Tu es Heya, l'assistante conversationnelle de HeyCloud4ERP. Experte en Cloud ERP et IA agentique, professionnelle, chaleureuse et directe.

HeyCloud4ERP propose deux approches IA pour Oracle ERP Cloud :
1. Oracle AI Agent Studio : agents natifs Oracle, sans surcoût licence, Finance/PPM/Procurement/SCM, déploiement progressif et sécurisé.
2. AI4ERP Custom Platform : plateforme agentique propriétaire, boucle 6 étapes (Input→Memory/RAG→LLM→Guardrails→Action→Learn), compatible Claude/GPT/Gemini, pour cas complexes multi-ERP.

Services : Oracle AI Agent Studio, AI4ERP custom agents, implémentation Cloud ERP (Oracle Fusion, SAP S/4HANA, D365), PPM, Optimisation & Run, Data/Reporting/Gouvernance, Voice & NL ERP.
Clients : Orange Business, BNP Paribas, TechnipFMC, Faurecia, RATP, L'Oréal.
25+ ans expérience Oracle. Programmes Europe, Moyen-Orient, Asie-Pacifique.
Contact : contact@heycloud4erp.com — réponse sous 24h, sans engagement.

Règles : réponds en français (ou langue du visiteur), concise (2-4 phrases), jamais de tarifs précis, oriente vers contact@heycloud4erp.com pour devis ou RDV. Tu te prénommes Heya.`;

  function init() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const root = document.createElement('div');
    root.innerHTML = `
      <button id="heya-launcher" aria-label="Ouvrir Heya">${LAUNCHER_ICON}</button>
      <div id="heya-panel" class="heya-hidden" role="dialog" aria-label="Chat Heya">
        <div id="heya-header">
          <div class="heya-av-lg">${AVATAR(42,42)}</div>
          <div>
            <div class="heya-hname">Heya</div>
            <div class="heya-hstatus"><span class="heya-dot"></span>En ligne · Experte Oracle &amp; AI ERP</div>
          </div>
          <button id="heya-close" aria-label="Fermer">${ICON_CLOSE}</button>
        </div>
        <div id="heya-msgs" aria-live="polite">
          <div class="hmsg">
            <div class="heya-av-sm">${AVATAR(28,28)}</div>
            <div class="hbubble">Bonjour ! Je suis <strong>Heya</strong>, votre assistante HeyCloud4ERP 👋<br><br>Je réponds à vos questions sur Oracle AI Agent Studio, la plateforme AI4ERP et nos services. Comment puis-je vous aider ?</div>
          </div>
        </div>
        <div id="heya-chips">
          <button class="hchip">Oracle AI Agent Studio</button>
          <button class="hchip">AI4ERP vs Oracle natif</button>
          <button class="hchip">Demander un devis</button>
          <button class="hchip">Prendre contact</button>
        </div>
        <div id="heya-inputrow">
          <textarea id="heya-input" placeholder="Posez votre question à Heya…" rows="1" aria-label="Votre message"></textarea>
          <button id="heya-sendbtn" aria-label="Envoyer">${ICON_SEND}</button>
        </div>
        <div id="heya-footer">Propulsé par Claude · HeyCloud4ERP</div>
      </div>`;
    document.body.appendChild(root);

    const launcher = document.getElementById('heya-launcher');
    const panel    = document.getElementById('heya-panel');
    const closeBtn = document.getElementById('heya-close');
    const msgs     = document.getElementById('heya-msgs');
    const chips    = document.getElementById('heya-chips');
    const input    = document.getElementById('heya-input');
    const sendBtn  = document.getElementById('heya-sendbtn');

    let history = [], loading = false;

    launcher.onclick = () => {
      panel.classList.toggle('heya-hidden');
      if (!panel.classList.contains('heya-hidden')) input.focus();
    };
    closeBtn.onclick = () => panel.classList.add('heya-hidden');

    chips.querySelectorAll('.hchip').forEach(c => {
      c.onclick = () => { input.value = c.textContent; chips.style.display = 'none'; send(); };
    });

    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
    input.addEventListener('input',   () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 80) + 'px'; });
    sendBtn.onclick = send;

    function md(t) {
      return t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.+?)\*/g, '<em>$1</em>')
              .replace(/\n- /g, '<br>• ').replace(/^- /, '• ')
              .replace(/\n/g, '<br>');
    }

    function addMsg(role, text) {
      const w = document.createElement('div');
      w.className = 'hmsg' + (role === 'user' ? ' huser' : '');
      if (role !== 'user') {
        const av = document.createElement('div'); av.className = 'heya-av-sm';
        av.innerHTML = AVATAR(28, 28); w.appendChild(av);
      }
      const b = document.createElement('div'); b.className = 'hbubble';
      b.innerHTML = md(text); w.appendChild(b);
      msgs.appendChild(w); msgs.scrollTop = msgs.scrollHeight;
    }

    function showTyping() {
      const w = document.createElement('div'); w.className = 'hmsg'; w.id = 'heya-typing';
      const av = document.createElement('div'); av.className = 'heya-av-sm';
      av.innerHTML = AVATAR(28, 28);
      const b = document.createElement('div'); b.className = 'hbubble htyping';
      b.innerHTML = '<span class="htdot"></span><span class="htdot"></span><span class="htdot"></span>';
      w.appendChild(av); w.appendChild(b); msgs.appendChild(w);
      msgs.scrollTop = msgs.scrollHeight;
    }
    function removeTyping() { const t = document.getElementById('heya-typing'); if (t) t.remove(); }

    async function send() {
      const text = input.value.trim();
      if (!text || loading) return;
      input.value = ''; input.style.height = 'auto';
      chips.style.display = 'none';
      addMsg('user', text);
      history.push({ role: 'user', content: text });
      loading = true; sendBtn.disabled = true;
      showTyping();
      try {
        const res = await fetch(PROXY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1000,
            system: SYSTEM,
            messages: history
          })
        });
        const data = await res.json();
        removeTyping();
        const reply = data.content?.[0]?.text || 'Une erreur est survenue. Contactez-nous à contact@heycloud4erp.com';
        addMsg('bot', reply);
        history.push({ role: 'assistant', content: reply });
      } catch (e) {
        removeTyping();
        addMsg('bot', 'Une erreur est survenue. Contactez-nous à **contact@heycloud4erp.com**');
        console.error('[Heya]', e);
      }
      loading = false; sendBtn.disabled = false; input.focus();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
