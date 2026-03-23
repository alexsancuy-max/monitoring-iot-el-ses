/**
 * Project: IoT Gateway for Elmia & Moses
 * Deskripsi: Menghandle input dari ESP32 dan output ke Web Dashboard
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Sheet1"); // Pastikan nama sheet kamu "Sheet1"
  
  // -------------------------------------------------------
  // BAGIAN 1: MENERIMA DATA DARI ESP32 (Jika ada parameter)
  // -------------------------------------------------------
  if (e.parameter.tempLM || e.parameter.tempDHT || e.parameter.hum || e.parameter.co2) {
    var sekarang = new Date();
    
    // Format Tanggal dan Waktu Indonesia
    var tanggal = Utilities.formatDate(sekarang, "GMT+7", "dd/MM/yyyy");
    var waktu = Utilities.formatDate(sekarang, "GMT+7", "HH:mm:ss");
    
    var tempLM = e.parameter.tempLM || "0";
    var tempDHT = e.parameter.tempDHT || "0";
    var hum = e.parameter.hum || "0";
    var co2 = e.parameter.co2 || "0";

    // Simpan ke baris baru di Spreadsheet
    sheet.appendRow([tanggal, waktu, tempLM, tempDHT, hum, co2]);
    
    return ContentService.createTextOutput("Data Berhasil Disimpan di Sheets").setMimeType(ContentService.MimeType.TEXT);
  } 
  
  // -------------------------------------------------------
  // BAGIAN 2: MENGIRIM DATA KE WEB VS CODE (Jika dipanggil Web)
  // -------------------------------------------------------
  else {
    var lastRow = sheet.getLastRow();
    
    // Jika sheet masih kosong
    if (lastRow < 2) {
      return ContentService.createTextOutput(JSON.stringify({"status": "kosong"}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Ambil baris terakhir
    var range = sheet.getRange(lastRow, 1, 1, 6).getValues()[0];
    
    var result = {
      "tanggal": range[0],
      "waktu": range[1],
      "tempLM": range[2],
      "tempDHT": range[3],
      "hum": range[4],
      "co2": range[5]
    };
    
    // Kirim sebagai JSON ke Dashboard Web
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi tambahan untuk menangani Request dari beberapa Browser (CORS)
function doPost(e) {
  return doGet(e);
}

URLNYA : https://script.google.com/macros/s/AKfycbw0CxFN5F8u6b-vLWGFl6_52LdJ5l-hptcpIoMa6gvZS7ngIWWqov7mX8VM2IYR3NzM_Q/exec

CODING HTML (DI VSCODE)
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monitoring Dashboard - Elmia & Moses</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    
    <div class="snowflakes" aria-hidden="true">
        <div class="snowflake">❅</div>
        <div class="snowflake">❅</div>
        <div class="snowflake">❆</div>
        <div class="snowflake">❄</div>
        <div class="snowflake">❅</div>
        <div class="snowflake">❆</div>
        <div class="snowflake">❄</div>
        <div class="snowflake">❅</div>
        <div class="snowflake">❆</div>
        <div class="snowflake">❄</div>
    </div>

    <div class="container">
        <header>
            <div class="header-left">
                <h1>Air Quality Monitoring</h1>
                <p class="names">Created by: Elmia Pratiwie & Moses Alexander</p>
            </div>
            <div class="header-right">
                <span id="status-connection" class="status-disconnected">Disconnected</span>
            </div>
        </header>

        <section class="main-data">
            <div class="data-card temp-lm">
                <h3>Suhu LM35</h3>
                <div class="value"><span id="val-tempLM">--</span> <span class="unit">°C</span></div>
            </div>
            <div class="data-card temp-dht">
                <h3>Suhu DHT22</h3>
                <div class="value"><span id="val-tempDHT">--</span> <span class="unit">°C</span></div>
            </div>
            <div class="data-card humidity">
                <h3>Kelembapan</h3>
                <div class="value"><span id="val-hum">--</span> <span class="unit">%</span></div>
            </div>
            <div class="data-card co2">
                <h3>CO2 Level</h3>
                <div class="value"><span id="val-co2">--</span> <span class="unit">ppm</span></div>
            </div>
        </section>

        <section class="controls-section">
            <div class="control-panel">
                <h3>Controls</h3>
                <div class="control-group">
                    <label>Interval (Detik):</label>
                    <input type="number" id="interval-input" value="5" min="2" max="60">
                </div>
                <div class="button-group">
                    <button id="btn-start" class="btn-start">Start Logging</button>
                    <button id="btn-stop" class="btn-stop" disabled>Stop</button>
                </div>
            </div>
            <div class="status-panel">
                <h3>Kondisi Khusus</h3>
                <div id="special-condition" class="condition-safe">Menunggu data...</div>
            </div>
        </section>

        <section class="charts-section">
            <div class="chart-container">
                <h3>Grafik Suhu (°C) vs Waktu</h3>
                <canvas id="chartSuhu"></canvas>
            </div>
            <div class="chart-container">
                <h3>Grafik Lingkungan (Hum & CO2) vs Waktu</h3>
                <canvas id="chartLingkungan"></canvas>
            </div>
        </section>

        <section class="table-section">
            <h3>Log Data Real-time (Spreadsheet View)</h3>
            <div class="table-wrapper">
                <table id="data-table">
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Waktu (HH:mm)</th>
                            <th>Suhu LM35 (°C)</th>
                            <th>Suhu DHT22 (°C)</th>
                            <th>Kelembapan (%)</th>
                            <th>CO2 (ppm)</th>
                        </tr>
                    </thead>
                    <tbody id="table-body">
                        <tr>
                            <td colspan="6" style="text-align:center;">Memuat data...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

    </div>

    <script src="script.js"></script>
</body>
</html>

CODING BAGIAN SCRIPT.JS (DI VS.CODE)
const API_URL = "https://script.google.com/macros/s/AKfycbw0CxFN5F8u6b-vLWGFl6_52LdJ5l-hptcpIoMa6gvZS7ngIWWqov7mX8VM2IYR3NzM_Q/exec"; // Ganti dengan URL kamu ya!

let isLogging = false;
let intervalId = null;
let chartSuhu, chartLingkungan;

// 1. Fungsi Inisialisasi Grafik (Gambar Kotak Grafiknya)
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

// 2. Fungsi Ambil Data & Update Grafik
async function fetchData() {
    if (!isLogging) return;
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (data.latest) {
            // Update Angka di Card
            document.getElementById('val-tempLM').innerText = data.latest.tempLM;
            document.getElementById('val-tempDHT').innerText = data.latest.tempDHT;
            document.getElementById('val-hum').innerText = data.latest.kelembapan;
            document.getElementById('val-co2').innerText = data.latest.co2;
            
            document.getElementById('special-condition').innerText = "Data Terupdate!";
            document.getElementById('special-condition').className = "condition-safe";
        }

        if (data.history) {
            const history = data.history;
            const labels = history.map(d => d.waktu.substring(0, 5)); // Ambil Jam:Menit saja

            // Update Garis di Grafik Suhu
            chartSuhu.data.labels = labels;
            chartSuhu.data.datasets[0].data = history.map(d => d.tempLM);
            chartSuhu.data.datasets[1].data = history.map(d => d.tempDHT);
            chartSuhu.update();

            // Update Garis di Grafik Lingkungan
            chartLingkungan.data.labels = labels;
            chartLingkungan.data.datasets[0].data = history.map(d => d.kelembapan);
            chartLingkungan.data.datasets[1].data = history.map(d => d.co2);
            chartLingkungan.update();

            // Update Tabel
            const tbody = document.getElementById('table-body');
            tbody.innerHTML = "";
            [...history].reverse().forEach(row => {
                tbody.innerHTML += `<tr>
                    <td>${row.tanggal}</td>
                    <td>${row.waktu.substring(0, 5)}</td>
                    <td>${row.tempLM}</td>
                    <td>${row.tempDHT}</td>
                    <td>${row.kelembapan}</td>
                    <td>${row.co2}</td>
                </tr>`;
            });
        }
    } catch (e) { console.log("Gagal ambil data"); }
}

// 3. Tombol Start & Stop
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
});

// Jalankan Inisialisasi Grafik saat web dibuka
initCharts();
