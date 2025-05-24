const estimasiBiaya = {
    aki: 300000,
    brush: 150000,
    dinamo: 800000,
    solenoid: 250000,
    kabel: 100000,
    sekring: 50000,
    lilitan: 400000
};

const namaKomponen = {
    aki: "Aki",
    brush: "Brush Dinamo",
    dinamo: "Dinamo Starter",
    solenoid: "Solenoid",
    kabel: "Kabel Kelistrikan",
    sekring: "Sekring",
    lilitan: "Lilitan Dinamo"
};

let hasilPoin = {};
let currentNode = null;

function resetPoin() {
    hasilPoin = {
        aki: 0,
        brush: 0,
        dinamo: 0,
        solenoid: 0,
        kabel: 0,
        sekring: 0,
        lilitan: 0
    };
}

function renderNode(node) {
    const container = document.getElementById("quiz-container");
    container.innerHTML = '';

    if (!node) return;

    const div = document.createElement("div");
    div.classList.add("mb-3");
    div.innerHTML = `<p class="fw-bold">${node.soal}</p>`;

    node.pilihan.forEach((opt) => {
        const button = document.createElement("button");
        button.classList.add("btn", "btn-outline-primary", "d-block", "mb-2");
        button.textContent = opt.jawaban;
        button.onclick = () => {
            for (let key in opt.poin) {
                if (hasilPoin.hasOwnProperty(key)) {
                    hasilPoin[key] += opt.poin[key];
                }
            }

            if (opt.next) {
                currentNode = opt.next;
                renderNode(currentNode);
            } else {
                tampilkanHasil();
            }
        };
        div.appendChild(button);
    });

    container.appendChild(div);
}

function tampilkanHasil() {
    const hasilDiv = document.getElementById("hasil");
    hasilDiv.style.display = "block";

    let max = 0;
    let kerusakan = [];
    for (let k in hasilPoin) {
        if (hasilPoin[k] > max) {
            max = hasilPoin[k];
            kerusakan = [k];
        } else if (hasilPoin[k] === max && max > 0) {
            kerusakan.push(k);
        }
    }

    let hasilDiagnosis = "";
    if (max === 0) {
        hasilDiagnosis = "Tidak terdeteksi kerusakan yang spesifik berdasarkan jawaban Anda.";
    } else {
        hasilDiagnosis = "Kemungkinan kerusakan pada:<br/>";
        kerusakan.forEach(k => {
            hasilDiagnosis += `- <strong>${namaKomponen[k] || k}</strong>`;
            if (estimasiBiaya[k]) {
                hasilDiagnosis += ` | Estimasi biaya: <strong>Rp ${estimasiBiaya[k].toLocaleString('id-ID')}</strong><br/>`;
            }
        });
    }

    hasilDiagnosis += `
        <div class="d-flex justify-content-between mt-4">
            <button class="btn btn-secondary" onclick="mulaiDiagnosis()">Mulai Ulang Diagnosis</button>
            <a href="pesan.html" class="btn btn-success">Pesan Perbaikan →</a>
        </div>
    `;

    hasilDiv.innerHTML = hasilDiagnosis;
    hasilDiv.scrollIntoView({ behavior: 'smooth' });
}

function mulaiDiagnosis() {
    resetPoin();

    const container = document.getElementById("quiz-container");
    container.innerHTML = "<div class='text-muted'>Memuat pertanyaan...</div>";

    const hasilDiv = document.getElementById("hasil");
    hasilDiv.innerHTML = "";
    hasilDiv.style.display = "none";

    fetch("diagnosis.json")
        .then(response => response.json())
        .then(data => {
            currentNode = data;
            renderNode(currentNode);
        })
        .catch(error => {
            console.error("Gagal memuat data pohon diagnosis:", error);
            container.innerHTML = `<div class='alert alert-danger'>Gagal memuat data.</div>`;
        });
}

document.addEventListener("DOMContentLoaded", mulaiDiagnosis);
