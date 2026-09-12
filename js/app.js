const STORAGE_KEY = 'scp_foundation_reports_db';

document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
  startClock();

  if (document.getElementById('reportsContainer')) {
    displayReports();
  }

  // Restauration du brouillon
  const savedDraft = localStorage.getItem('scp_draft');
  if (savedDraft && document.getElementById('scpReportForm')) {
    const draft = JSON.parse(savedDraft);
    if (confirm("Un brouillon non transmis a été trouvé. Charger le contenu ?")) {
      document.getElementById('category').value = draft.category || 'Scientifique';
      document.getElementById('author').value = draft.author || '';
      document.getElementById('reportTitle').value = draft.title || '';
      document.getElementById('reportDate').value = draft.date || '';
      document.getElementById('content').value = draft.content || '';
      document.getElementById('attachment').value = draft.attachment || '';
      document.getElementById('extraInfo').value = draft.extraInfo || '';
    }
  }

  // Soumission du formulaire
  const form = document.getElementById('scpReportForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      sendReport();
    });
  }

  // Terminal CLI
  const cliInput = document.getElementById('cliInput');
  if (cliInput) {
    cliInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleCommand(cliInput.value);
        cliInput.value = '';
      }
    });
  }
});

function startClock() {
  const clockEl = document.getElementById('clock');
  if (!clockEl) return;
  setInterval(() => {
    const now = new Date();
    clockEl.innerText = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }, 1000);
}

function saveDraft() {
  const draft = {
    category: document.getElementById('category').value,
    author: document.getElementById('author').value,
    title: document.getElementById('reportTitle').value,
    date: document.getElementById('reportDate').value,
    content: document.getElementById('content').value,
    attachment: document.getElementById('attachment').value,
    extraInfo: document.getElementById('extraInfo').value
  };
  localStorage.setItem('scp_draft', JSON.stringify(draft));
  alert('💾 Brouillon enregistré dans le cache local.');
}

function sendReport() {
  const newReport = {
    id: Date.now().toString(),
    category: document.getElementById('category').value,
    author: document.getElementById('author').value,
    title: document.getElementById('reportTitle').value,
    date: document.getElementById('reportDate').value,
    content: document.getElementById('content').value,
    attachment: document.getElementById('attachment').value,
    extraInfo: document.getElementById('extraInfo').value,
    timestamp: new Date().toLocaleDateString('fr-FR')
  };

  const reports = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  reports.unshift(newReport);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));

  localStorage.removeItem('scp_draft');
  alert('📤 Rapport transmis au réseau central.');
  window.location.href = 'rapport.html';
}

function displayReports(filter = 'All') {
  const container = document.getElementById('reportsContainer');
  if (!container) return;

  const reports = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const currentUser = localStorage.getItem('scp_user');

  if (reports.length === 0) {
    container.innerHTML = '<p style="color:var(--text-dim);"><em>Aucun rapport enregistré sur le réseau.</em></p>';
    return;
  }

  const filtered = filter === 'All' ? reports : reports.filter(r => r.category === filter);

  container.innerHTML = filtered.map(r => `
    <div class="report-card">
      <h3>[ ${r.category.toUpperCase()} ] ${escapeHtml(r.title)}</h3>
      <p style="color:var(--text-dim); font-size:0.85rem;"><strong>Auteur :</strong> ${escapeHtml(r.author)} | <strong>Date :</strong> ${r.date || r.timestamp}</p>
      <hr style="border:0; border-top:1px solid var(--panel-border); margin:12px 0;">
      <p style="white-space: pre-wrap;">${escapeHtml(r.content)}</p>
      ${r.attachment ? `<p><strong>📷 Pièce jointe :</strong> <a href="${escapeHtml(r.attachment)}" target="_blank" style="color:var(--accent-red);">Consulter</a></p>` : ''}
      ${r.extraInfo ? `<p style="background:rgba(255,255,255,0.03); padding:10px; border-left:3px solid var(--accent-red); margin-top:10px;"><strong>Notes :</strong> ${escapeHtml(r.extraInfo)}</p>` : ''}
      ${currentUser === 'zeyfix' ? `<button onclick="deleteReport('${r.id}')" style="background:var(--accent-red); color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-family:'Fira Code'; margin-top:10px;">SUPPRIMER</button>` : ''}
    </div>
  `).join('');
}

function filterReports(cat) { displayReports(cat); }

function loginAsZeyfix() {
  const password = prompt("MOT DE PASSE D'ADMINISTRATION (ZEYFIX) :");
  if (password === "zeyfix123") {
    localStorage.setItem('scp_user', 'zeyfix');
    alert("ACCÈS ACCORDÉ : Identifiants administrateur validés.");
    location.reload();
  } else if (password !== null) {
    alert("❌ Accès refusé : Mot de passe invalide.");
  }
}

function logout() {
  localStorage.removeItem('scp_user');
  location.reload();
}

function updateAuthUI() {
  const authStatus = document.getElementById('authStatus');
  const currentUser = localStorage.getItem('scp_user');

  if (authStatus) {
    if (currentUser === 'zeyfix') {
      authStatus.innerHTML = `<span style="color:var(--accent-green); font-family:'Fira Code'; font-size:0.85rem; margin-right:10px;">[ SESSIONS : ZEYFIX ]</span> <button onclick="logout()">Déconnexion</button>`;
    } else {
      authStatus.innerHTML = `<button onclick="loginAsZeyfix()">Connexion Administration</button>`;
    }
  }

  if (currentUser === 'zeyfix') {
    document.querySelectorAll('.censor').forEach(el => el.classList.add('revealed'));
  }
}

function deleteReport(id) {
  if (localStorage.getItem('scp_user') !== 'zeyfix') return;
  if (confirm("Confirmer la suppression définitive du rapport ?")) {
    let reports = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    reports = reports.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    displayReports();
  }
}

function handleCommand(cmd) {
  const output = document.getElementById('terminalOutput');
  const cleanCmd = cmd.trim().toLowerCase();
  let response = '';

  switch (cleanCmd) {
    case 'help':
      response = `<br><strong>COMMANDES DISPONIBLES :</strong><br>- <code>status</code> : État des installations<br>- <code>list scp</code> : Liste des entités<br>- <code>auth zeyfix</code> : Authentification O5<br>- <code>clear</code> : Effacer la console`;
      break;
    case 'status':
      response = `<br><span style="color:var(--accent-green);">[OK]</span> Tous les sites régionaux sont sous confinement standard.`;
      break;
    case 'list scp':
      response = `<br>- SCP-173 (Euclid)<br>- SCP-096 (Euclid)<br>- SCP-682 (Keter)<br>- SCP-999 (Safe)`;
      break;
    case 'auth zeyfix':
      loginAsZeyfix();
      return;
    case 'clear':
      output.innerHTML = '';
      return;
    default:
      response = `<br><span style="color:var(--accent-red);">Commande non reconnue. Saisissez 'help'.</span>`;
  }

  output.innerHTML += `<p><span class="prompt">SCPOS@SITE-19:~#</span> ${escapeHtml(cmd)}</p>` + response;
  output.scrollTop = output.scrollHeight;
}

function filterSCPs() {
  const input = document.getElementById('searchSCP').value.toLowerCase();
  document.querySelectorAll('.scp-card').forEach(card => {
    const text = card.getAttribute('data-scp') + " " + card.innerText.toLowerCase();
    card.style.display = text.includes(input) ? 'block' : 'none';
  });
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
