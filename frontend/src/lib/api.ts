const API_BASE = 'http://localhost:5000/api';

export async function analyzeSecurity(planContent: string) {
    const response = await fetch(`${API_BASE}/ai/security-lens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planContent })
    });
    return response.json();
}

export async function analyzeContradictions(planContent: string) {
    const response = await fetch(`${API_BASE}/ai/contradiction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planContent })
    });
    return response.json();
}

export async function assessRisk(planContent: string) {
    const response = await fetch(`${API_BASE}/ai/risk-label`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planContent })
    });
    return response.json();
}

export async function refinePlan(planContent: string, issues: any[]) {
    const response = await fetch(`${API_BASE}/ai/refine-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planContent, issues })
    });
    return response.json();
}
