// GESTION DU STOCKAGE DES RAPPORTS (LocalStorage Global Simulation / API)
const STORAGE_KEY = 'scp_foundation_reports_db';

// Charger les rapports au démarrage
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('reportsContainer')) {
    displayReports();
  }
  
  // Charger les données dans le formulaire si brouillon existant
  const savedDraft = localStorage.getItem('scp_draft');
  if (savedDraft && document.getElementById('scpReportForm')) {
    const draft = JSON.parse(savedDraft);
    if(confirm("Un brouillon sauvegardé a été trouvé. Voulez-vous le charger ?")) {
      document.getElementById('category').value = draft.category || 'Scientifique';
      document.getElementById('author').value = draft.author || '';
      document.getElementById('reportTitle').value = draft.title || '';
      document.getElementById('reportDate').value = draft.date || '';
      document.getElementById('content').value = draft.content || '';
      document.getElementById('attachment').value = draft.attachment || '';
      document.getElementById('extraInfo').value = draft.extraInfo || '';
    }
  }
  
  // Intercepter l'envoi du formulaire
  const form = document.getElementById('scpReportForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      sendReport();
    });
  }
  
  updateAuthUI();
});

// SAUVEGARDER UN BROUILLON
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
  alert('💾 BROUILLON SAUVEGARDÉ EN SÉCURITÉ LOCALEMENT.');
}

// ENVOYER ET STOCKER LE RAPPORT
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
  reports.unshift(newReport); // Ajouter au début
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));

  // Effacer le brouillon
  localStorage.removeItem('scp_draft');

  alert('📤 RAPPORT TRANSMIS ET ARCHIVÉ AVEC SUCCÈS DANS LA BASE DE DONNÉES !');
  window.location.href = 'rapport.html';
}

// AFFICHER LES RAPPORTS
function displayReports(filter = 'All') {
  const container = document.getElementById('reportsContainer');
  if (!container) return;

  const reports = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const currentUser = localStorage.getItem('scp_user');

  if (reports.length === 0) {
    container.innerHTML = '<p><em>Aucun rapport enregistré dans les archives actuellement.</em></p>';
    return;
  }

  const filteredReports = filter === 'All' 
    ? reports 
    : reports.filter(r => r.category === filter);

  container.innerHTML = filteredReports.map(r => `
    <div class="report-card">
      <h3>[ ${r.category.toUpperCase()} ] ${escapeHtml(r.title)}</h3>
      <p><strong>Auteur / Matricule :</strong> ${escapeHtml(r.author)} | <strong>Date :</strong> ${r.date || r.timestamp}</p>
      <hr style="border: 0; border-top: 1px solid #ccc;">
      <p style="white-space: pre-wrap;">${escapeHtml(r.content)}</p>
      
      ${r.attachment ? `<p><strong>📷 Pièce jointe :</strong> <a href="${escapeHtml(r.attachment)}" target="_blank" style="color:#900000;">Consulter l'annexe</a></p>` : ''}
      ${r.extraInfo ? `<p style="background: #eee; padding: 8px; border-left: 3px solid #333;"><strong>Notes additionnelles :</strong> ${escapeHtml(r.extraInfo)}</p>` : ''}
      
      ${currentUser === 'zeyfix' ? `<button class="delete-btn" onclick="deleteReport('${r.id}')">❌ SUPPRIMER CE RAPPORT (ACCÈS ZEYFIX)</button>` : ''}
    </div>
  `).join('');
}

// FILTRER PAR CATÉGORIE
function filterReports(category) {
  displayReports(category);
}

// SYSTÈME DE CONNEXION / ACCRÉDITATION ZEYFIX
function loginAsZeyfix() {
  const password = prompt("IDENTIFICATION REQUISE : Entrez le mot de passe Administrateur :");
  if (password === "zeyfix123") { // Modifie le mot de passe ici si tu veux
    localStorage.setItem('scp_user', 'zeyfix');
    alert("ACCRÉDITATION NIVEAU 5 ACCORDÉE : Bienvenue Administrateur ZeyFix.");
    location.reload();
  } else if (password !== null) {
    alert("❌ ÉCHEC D'AUTHENTIFICATION : Accès refusé.");
  }
}

function logout() {
  localStorage.removeItem('scp_user');
  alert("Déconnexion effectuée.");
  location.reload();
}

function updateAuthUI() {
  const authStatus = document.getElementById('authStatus');
  if (!authStatus) return;
  
  const currentUser = localStorage.getItem('scp_user');
  if (currentUser === 'zeyfix') {
    authStatus.innerHTML = `<span style="color: #00ff00; font-family: monospace;">[CONNECTÉ : ZEYFIX]</span> <button onclick="logout()">Déconnexion</button>`;
  } else {
    authStatus.innerHTML = `<button onclick="loginAsZeyfix()">Connexion Administration (ZeyFix)</button>`;
  }
}

// SUPPRESSION DE RAPPORT (RÉSERVÉ À ZEYFIX)
function deleteReport(id) {
  const currentUser = localStorage.getItem('scp_user');
  if (currentUser !== 'zeyfix') {
    alert("ERREUR DE SÉCURITÉ : Vous n'avez pas l'accréditation nécessaire.");
    return;
  }

  if (confirm("⚠️ Confirmation : Voulez-vous détruire définitivement ce rapport d'archive ?")) {
    let reports = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    reports = reports.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    displayReports();
  }
}

function escapeHtml(str) {
  return (str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
