// GANTI DENGAN URL WEB APP GOOGLE SCRIPT TERBARU KAMU
const API_URL = "https://script.google.com/macros/s/AKfycbySs111BMgZm0pnhd2qLPq5qq1A_AmWo_LKVbGJwwNrLYFBZMkjsa31LoRjaDN9zZMvdQ/exec";

let isLogging = false;
let intervalId = null;
let chartSuhu, chartLingkungan;

function initCharts() {
    const ctxSuhu = document.getElementById('chartSuhu').getContext('2d');
    chartSuhu = new Chart(ctxSuhu, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: 'Temp LM35', data: [], borderColor: '#ff85a2', tension: 0.3, fill: false },
                { label: 'Temp DHT22', data: [], borderColor: '#f48fb1', tension: 0.3, fill: false }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const ctxLing = document.getElementById('chartLingkungan').getContext('2d');
    chartLingkungan = new Chart(ctxLing, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: 'Hum (%)', data: [], borderColor: '#e1bee7', tension: 0.3, fill: false },
                { label: 'CO2 (ppm)', data: [], borderColor: '#a1887f', tension: 0.3, fill: false }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

async function fetchData() {
    if (!isLogging) return;
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.latest) {
            const statusEl = document.getElementById('status-connection');
            statusEl.innerText = "Connected";
            statusEl.className = "status-connected";

            // Update Angka di Card (Gunakan toFixed untuk merapikan desimal)
            document.getElementById('val-tempLM').innerText = Number(data.latest.tempLM).toFixed(1);
            document.getElementById('val-tempDHT').innerText = Number(data.latest.tempDHT).toFixed(1);
            document.getElementById('val-hum').innerText = Number(data.latest.hum).toFixed(1);
            document.getElementById('val-co2').innerText = data.latest.co2;
            
            // Perbaiki tampilan waktu di Kondisi Khusus
            let cleanTime = String(data.latest.waktu).split(' ')[4] || String(data.latest.waktu);
            document.getElementById('special-condition').innerText = "Data Terakhir: " + cleanTime;
        }

        if (data.history) {
            const labels = data.history.map(d => String(d.waktu).includes(':') ? String(d.waktu).substring(0, 5) : "Data");
            
            chartSuhu.data.labels = labels;
            chartSuhu.data.datasets[0].data = data.history.map(d => d.tempLM);
            chartSuhu.data.datasets[1].data = data.history.map(d => d.tempDHT);
            chartSuhu.update();

            chartLingkungan.data.labels = labels;
            chartLingkungan.data.datasets[0].data = data.history.map(d => d.hum);
            chartLingkungan.data.datasets[1].data = data.history.map(d => d.co2);
            chartLingkungan.update();

            const tbody = document.getElementById('table-body');
            tbody.innerHTML = "";
            [...data.history].reverse().forEach(row => {
                tbody.innerHTML += `<tr>
                    <td>${row.tanggal}</td>
                    <td>${row.waktu}</td>
                    <td>${row.tempLM}</td>
                    <td>${row.tempDHT}</td>
                    <td>${row.hum}</td>
                    <td>${row.co2}</td>
                </tr>`;
            });
        }
    } catch (e) {
        console.log("Error Fetching:", e);
        document.getElementById('status-connection').innerText = "Disconnected";
    }
}

document.getElementById('btn-start').addEventListener('click', () => {
    isLogging = true;
    document.getElementById('btn-start').disabled = true;
    document.getElementById('btn-stop').disabled = false;
    fetchData();
    intervalId = setInterval(fetchData, 5000);
});

document.getElementById('btn-stop').addEventListener('click', () => {
    isLogging = false;
    document.getElementById('btn-start').disabled = false;
    document.getElementById('btn-stop').disabled = true;
    clearInterval(intervalId);
    document.getElementById('status-connection').innerText = "Disconnected";
});

initCharts();
