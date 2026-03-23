// GANTI DENGAN URL GOOGLE SCRIPT KAMU
const API_URL = "https://script.google.com/macros/s/AKfycbw0CxFN5F8u6b-vLWGFl6_52LdJ5l-hptcpIoMa6gvZS7ngIWWqov7mX8VM2IYR3NzM_Q/exec";

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
            // Update Status
            const statusEl = document.getElementById('status-connection');
            statusEl.innerText = "Connected";
            statusEl.className = "status-connected";

            // Update Angka Card
            document.getElementById('val-tempLM').innerText = data.latest.tempLM;
            document.getElementById('val-tempDHT').innerText = data.latest.tempDHT;
            document.getElementById('val-hum').innerText = data.latest.hum;
            document.getElementById('val-co2').innerText = data.latest.co2;
            
            document.getElementById('special-condition').innerText = "Data Terakhir: " + data.latest.waktu;
        }

        if (data.history) {
            const labels = data.history.map(d => String(d.waktu).substring(0, 5));
            
            chartSuhu.data.labels = labels;
            chartSuhu.data.datasets[0].data = data.history.map(d => d.tempLM);
            chartSuhu.data.datasets[1].data = data.history.map(d => d.tempDHT);
            chartSuhu.update();

            chartLingkungan.data.labels = labels;
            chartLingkungan.data.datasets[0].data = data.history.map(d => d.hum);
            chartLingkungan.data.datasets[1].data = data.history.map(d => d.co2);
            chartLingkungan.update();

            // Update Tabel
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
    intervalId = setInterval(fetchData, 5000); // Update tiap 5 detik
});

document.getElementById('btn-stop').addEventListener('click', () => {
    isLogging = false;
    document.getElementById('btn-start').disabled = false;
    document.getElementById('btn-stop').disabled = true;
    clearInterval(intervalId);
});

initCharts();
