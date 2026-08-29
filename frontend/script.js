const API_URL = 'https://teleclv.onrender.com';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('predictionForm');
    if (form) form.addEventListener('submit', handlePrediction);
});

async function handlePrediction(event) {
    event.preventDefault();
    const resultContainer = document.getElementById('result');
    const resultContent = document.getElementById('resultContent');
    const spinner = document.getElementById('spinner');
    const errorContainer = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    
    resultContainer.style.display = 'none';
    errorContainer.style.display = 'none';
    spinner.classList.add('active');
    resultContainer.style.display = 'block';
    
    try {
        const formData = collectFormData();
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error(`Erreur serveur : ${response.status}`);
        const data = await response.json();
        displayResult(data);
    } catch (error) {
        displayError(error.message);
    } finally {
        spinner.classList.remove('active');
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
    errorMessage.textContent = `Une erreur est survenue : ${message}. Veuillez réessayer.`;
    errorContainer.style.display = 'block';
}