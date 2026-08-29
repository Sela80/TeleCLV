const API_URL = 'https://teleclv.onrender.com';

let loadingTimeout;

document.addEventListener('DOMContentLoaded', function() {
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
    
    // Reset display
    resultContainer.style.display = 'block';
    errorContainer.style.display = 'none';
    resultContent.style.display = 'none';
    spinner.style.display = 'block';
    loadingMessage.style.display = 'block';
    loadingMessage.textContent = 'Connexion au serveur...';
    
    // Message après 5 secondes
    loadingTimeout = setTimeout(() => {
        loadingMessage.textContent = 'Le serveur démarre, encore quelques secondes...';
    }, 5000);
    
    try {
        const formData = collectFormData();
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // Timeout 60s
        
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        clearTimeout(loadingTimeout);
        
        if (!response.ok) {
            throw new Error(`Erreur serveur : ${response.status}`);
        }
        
        const data = await response.json();
        displayResult(data);
        
    } catch (error) {
        clearTimeout(loadingTimeout);
        
        if (error.name === 'AbortError') {
            displayError('Le service met du temps à répondre. Le serveur est peut-être en veille. Réessayez dans quelques secondes.');
        } else if (error.message.includes('Failed to fetch')) {
            displayError('Impossible de joindre le serveur. Vérifiez votre connexion internet ou réessayez plus tard.');
        } else {
            displayError(`Une erreur est survenue : ${error.message}. Réessayez dans quelques secondes.`);
        }
    } finally {
        spinner.style.display = 'none';
        loadingMessage.style.display = 'none';
    }
}

function collectFormData() {
    return {
        gender: document.getElementById('gender').value,
        SeniorCitizen: parseInt(document.querySelector('input[name="SeniorCitizen"]:checked').value),
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
    const resultContent = document.getElementById('resultContent');
    const clvValue = document.getElementById('clvValue');
    clvValue.textContent = formatCurrency(data.clv_estime);
    resultContent.style.display = 'block';
}

function formatCurrency(value) {
    return `$ ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function displayError(message) {
    const resultContainer = document.getElementById('result');
    const errorContainer = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    resultContainer.style.display = 'none';
    errorMessage.textContent = message;
    errorContainer.style.display = 'block';
}