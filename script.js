/* ============================================
   FIAUSSE Feedback — JavaScript
   ============================================ */

// ---- Configuration ----
// Replace this URL with your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzS6ode1eFZuabUo1ZEA3CSdVFqOgNNOLXBIgFwkgk8ncopzHdMhpAN0bstD_01Jz7kZQ/exec';

// ---- State ----
let currentStep = 1;
const totalSteps = 4;
let selectedSatisfaction = 0;
let selectedNps = null;

// ---- Star Rating ----
const stars = document.querySelectorAll('.star');
const starLabel = document.getElementById('starLabel');

const starLabels = {
    1: '😞 Très insatisfait',
    2: '😕 Insatisfait',
    3: '😐 Neutre',
    4: '😊 Satisfait',
    5: '🤩 Très satisfait'
};

stars.forEach(star => {
    star.addEventListener('click', () => {
        selectedSatisfaction = parseInt(star.dataset.value);
        document.getElementById('satisfaction').value = selectedSatisfaction;
        updateStars();
    });

    star.addEventListener('mouseenter', () => {
        const val = parseInt(star.dataset.value);
        stars.forEach(s => {
            const sVal = parseInt(s.dataset.value);
            s.classList.toggle('hover-preview', sVal <= val && sVal > selectedSatisfaction);
        });
        starLabel.textContent = starLabels[val];
    });

    star.addEventListener('mouseleave', () => {
        stars.forEach(s => s.classList.remove('hover-preview'));
        starLabel.textContent = selectedSatisfaction ? starLabels[selectedSatisfaction] : 'Sélectionnez une note';
    });
});

function updateStars() {
    stars.forEach(s => {
        const val = parseInt(s.dataset.value);
        s.classList.toggle('active', val <= selectedSatisfaction);
    });
    starLabel.textContent = starLabels[selectedSatisfaction];
    clearError('satisfactionError');
}

// ---- NPS Scale ----
const npsButtons = document.querySelectorAll('.nps-btn');

npsButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        selectedNps = parseInt(btn.dataset.value);
        document.getElementById('nps').value = selectedNps;
        npsButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        clearError('npsError');
    });
});

// ---- Character Counters ----
const textareas = [
    { id: 'appreciation', countId: 'appreciationCount', max: 500 },
    { id: 'improvements', countId: 'improvementsCount', max: 500 },
    { id: 'problems', countId: 'problemsCount', max: 500 },
    { id: 'missingProducts', countId: 'missingProductsCount', max: 500 },
    { id: 'suggestions', countId: 'suggestionsCount', max: 1000 }
];

textareas.forEach(({ id, countId, max }) => {
    const textarea = document.getElementById(id);
    const counter = document.getElementById(countId);

    textarea.addEventListener('input', () => {
        if (textarea.value.length > max) {
            textarea.value = textarea.value.substring(0, max);
        }
        counter.textContent = textarea.value.length;
    });
});

// ---- Navigation ----
function updateProgressBar() {
    const percent = (currentStep / totalSteps) * 100;
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressText').textContent = `Étape ${currentStep} / ${totalSteps}`;
}

function showStep(step) {
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    const targetStep = document.querySelector(`.form-step[data-step="${step}"]`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
    currentStep = step;
    updateProgressBar();

    // Scroll to form top
    document.getElementById('feedback-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function nextStep(fromStep) {
    if (validateStep(fromStep)) {
        showStep(fromStep + 1);
    }
}

function prevStep(fromStep) {
    showStep(fromStep - 1);
}

// ---- Validation ----
function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
    }
}

function clearError(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = '';
    }
}

function validateStep(step) {
    let isValid = true;

    if (step === 1) {
        const name = document.getElementById('userName');
        const email = document.getElementById('userEmail');

        if (!name.value.trim()) {
            showError('userNameError', 'Veuillez entrer votre nom');
            name.classList.add('input-error');
            isValid = false;
        } else {
            clearError('userNameError');
            name.classList.remove('input-error');
        }

        if (!email.value.trim()) {
            showError('userEmailError', 'Veuillez entrer votre email');
            email.classList.add('input-error');
            isValid = false;
        } else if (!isValidEmail(email.value)) {
            showError('userEmailError', 'Veuillez entrer un email valide');
            email.classList.add('input-error');
            isValid = false;
        } else {
            clearError('userEmailError');
            email.classList.remove('input-error');
        }
    }

    if (step === 2) {
        if (!selectedSatisfaction) {
            showError('satisfactionError', 'Veuillez donner une note de satisfaction');
            isValid = false;
        }

        if (selectedNps === null) {
            showError('npsError', 'Veuillez sélectionner un score NPS');
            isValid = false;
        }
    }

    if (step === 3) {
        const appreciation = document.getElementById('appreciation');
        const improvements = document.getElementById('improvements');

        if (!appreciation.value.trim()) {
            showError('appreciationError', 'Veuillez remplir ce champ');
            appreciation.classList.add('input-error');
            isValid = false;
        } else {
            clearError('appreciationError');
            appreciation.classList.remove('input-error');
        }

        if (!improvements.value.trim()) {
            showError('improvementsError', 'Veuillez remplir ce champ');
            improvements.classList.add('input-error');
            isValid = false;
        } else {
            clearError('improvementsError');
            improvements.classList.remove('input-error');
        }
    }

    return isValid;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---- Clear errors on input ----
document.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => {
        el.classList.remove('input-error');
        const errorEl = document.getElementById(el.id + 'Error');
        if (errorEl) errorEl.textContent = '';
    });
});

// ---- Form Submission ----
document.getElementById('surveyForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validateStep(4)) return;

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div> Envoi en cours...';
    submitBtn.classList.add('loading');

    const formData = {
        timestamp: new Date().toLocaleString('fr-FR'),
        nom: document.getElementById('userName').value.trim(),
        email: document.getElementById('userEmail').value.trim(),
        satisfaction: selectedSatisfaction + '/5',
        nps: selectedNps + '/10',
        appreciation: document.getElementById('appreciation').value.trim(),
        ameliorations: document.getElementById('improvements').value.trim(),
        problemes: document.getElementById('problems').value.trim() || 'Aucun',
        produits_manquants: document.getElementById('missingProducts').value.trim() || 'Aucun',
        suggestions: document.getElementById('suggestions').value.trim() || 'Aucune'
    };

    try {
        if (GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
        }

        // Show success
        document.getElementById('surveyForm').style.display = 'none';
        document.getElementById('successMessage').classList.remove('hidden');

        // Log to console for debugging
        console.log('📋 Feedback envoyé:', formData);

    } catch (error) {
        console.error('Erreur d\'envoi:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
            Envoyer mon avis
        `;
        submitBtn.classList.remove('loading');
    }
});

// ---- Reset Form ----
function resetForm() {
    document.getElementById('surveyForm').reset();
    document.getElementById('surveyForm').style.display = 'block';
    document.getElementById('successMessage').classList.add('hidden');

    // Reset state
    selectedSatisfaction = 0;
    selectedNps = null;
    stars.forEach(s => s.classList.remove('active'));
    npsButtons.forEach(b => b.classList.remove('active'));
    starLabel.textContent = 'Sélectionnez une note';

    // Reset char counters
    textareas.forEach(({ countId }) => {
        document.getElementById(countId).textContent = '0';
    });

    // Go to step 1
    showStep(1);
}

// ---- Initialize ----
updateProgressBar();
