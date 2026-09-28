const API_URL = 'https://teleclv.onrender.com';

let loadingTimeout;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('predictionForm');
    if (form) form.addEventListener('submit', handlePrediction);
});

async function handlePrediction(event) {
    event.preventDefault();

    const resultContainer = document.getElementById('result');
    const resultContent = document.getElementById('resultContent');
    const spinner = document.getElementById('spinner');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorContainer = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');

    resultContainer.style.display = 'block';
    errorContainer.style.display = 'none';
    resultContent.style.display = 'none';
    spinner.style.display = 'block';
    loadingMessage.style.display = 'block';
    loadingMessage.textContent = 'Connexion au service de prédiction...';

    loadingTimeout = setTimeout(() => {
        loadingMessage.textContent =
            'Le service peut être en sortie de veille. Le premier appel peut prendre quelques secondes.';
    }, 5000);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(collectFormData()),
            signal: controller.signal
        });

        if (!response.ok) {
            let detail = `Erreur HTTP ${response.status}`;
            try {
                const payload = await response.json();
                if (payload.detail) detail = payload.detail;
            } catch (_) {
                // Réponse non JSON : conserver le message HTTP.
            }
            throw new Error(detail);
        }

        const data = await response.json();
        displayResult(data);
    } catch (error) {
        if (error.name === 'AbortError') {
            displayError('Le service met trop de temps à répondre. Réessayez dans quelques secondes.');
        } else if (error.message.includes('Failed to fetch')) {
            displayError('Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.');
        } else {
            displayError(error.message || 'Une erreur est survenue pendant la prédiction.');
        }
    } finally {
        clearTimeout(timeoutId);
        clearTimeout(loadingTimeout);
        spinner.style.display = 'none';
        loadingMessage.style.display = 'none';
    }
}

function collectFormData() {
    return {
        gender: document.getElementById('gender').value,
        SeniorCitizen: Number(document.querySelector('input[name="SeniorCitizen"]:checked').value),
        Partner: document.querySelector('input[name="Partner"]:checked').value,
        Dependents: document.querySelector('input[name="Dependents"]:checked').value,
        PhoneService: document.querySelector('input[name="PhoneService"]:checked').value,
        MultipleLines: document.getElementById('MultipleLines').value,
        InternetService: document.getElementById('InternetService').value,
        OnlineSecurity: document.getElementById('OnlineSecurity').value,
        OnlineBackup: document.getElementById('OnlineBackup').value,
        DeviceProtection: document.getElementById('DeviceProtection').value,
        TechSupport: document.getElementById('TechSupport').value,
        StreamingTV: document.getElementById('StreamingTV').value,
        StreamingMovies: document.getElementById('StreamingMovies').value,
        Contract: document.getElementById('Contract').value,
        PaperlessBilling: document.querySelector('input[name="PaperlessBilling"]:checked').value,
        PaymentMethod: document.getElementById('PaymentMethod').value
    };
}

function displayResult(data) {
    document.getElementById('clvValue').textContent = formatCurrency(data.clv_estime);

    const segmentElement = document.getElementById('clvSegment');
    segmentElement.textContent = data.segment || 'Non défini';

    document.getElementById('resultContent').style.display = 'block';
}

function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

function displayError(message) {
    const resultContainer = document.getElementById('result');
    const errorContainer = document.getElementById('error');

    resultContainer.style.display = 'none';
    document.getElementById('errorMessage').textContent = message;
    errorContainer.style.display = 'block';
}
