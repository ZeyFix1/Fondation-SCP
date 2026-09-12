// GESTION DES BROUILLONS (Local Storage)
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
  alert('Brouillon sauvegardé localement sur cet appareil !');
}

// Charger le brouillon si disponible
window.addEventListener('DOMContentLoaded', () => {
  const savedDraft = localStorage.getItem('scp_draft');
  if (savedDraft && document.getElementById('scpReportForm')) {
    const draft = JSON.parse(savedDraft);
    if(confirm("Un brouillon non envoyé a été trouvé. Voulez-vous le charger ?")) {
      document.getElementById('category').value = draft.category;
      document.getElementById('author').value = draft.author;
      document.getElementById('reportTitle').value = draft.title;
      document.getElementById('reportDate').value = draft.date;
      document.getElementById('content').value = draft.content;
      document.getElementById('attachment').value = draft.attachment;
      document.getElementById('extraInfo').value = draft.extraInfo;
    }
  }
});

// LOGIQUE D'ADMINISTRATION POUR ZEYFIX
let currentUser = localStorage.getItem('scp_user') || 'guest';

function loginAsZeyfix() {
  const password = prompt("Entrez le mot de passe Administrateur (Zeyfix) :");
  // En production, utiliser Firebase Auth. Exemple de validation simplifiée :
  if (password === "votre_mot_de_passe_secret") {
    currentUser = "zeyfix";
    localStorage.setItem('scp_user', 'zeyfix');
    alert("Accréditation Niveau 5 accordée : Bienvenue Zeyfix.");
    location.reload();
  } else {
    alert("Accès refusé. Tentative enregistrée.");
  }
}

// Fonction de suppression (Accessible uniquement à Zeyfix)
function deleteReport(reportId) {
  if (currentUser !== 'zeyfix') {
    alert("ERREUR : Accréditation insuffisante. Seul Zeyfix peut supprimer des rapports.");
    return;
  }
  
  if (confirm("Êtes-vous sûr de vouloir effacer définitivement ce rapport ?")) {
    // Code pour supprimer de la base de données (Firebase/Supabase)
    console.log("Rapport supprimé ID:", reportId);
  }
}
