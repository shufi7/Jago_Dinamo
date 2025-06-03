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

    const questionDiv = document.createElement("div");
    questionDiv.classList.add("mb-4"); 
    questionDiv.innerHTML = `<p class="fw-bold">${node.soal}</p>`;

    const choicesDiv = document.createElement("div");
    choicesDiv.classList.add("d-grid", "gap-2"); 
    node.pilihan.forEach((opt) => {
        const button = document.createElement("button");
        button.classList.add("btn", "btn-outline-primary", "w-100", "mb-2", "text-start"); 
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
        choicesDiv.appendChild(button);
    });
    questionDiv.appendChild(choicesDiv);
    container.appendChild(questionDiv);
}

function tampilkanHasil() {
    const hasilContainerDiv = document.getElementById("hasil-container");
    const hasilDiv = document.getElementById("hasil");
    
    hasilDiv.innerHTML = ""; 

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

    let hasilDiagnosisHTML = "";
    if (max === 0) {
        hasilDiagnosisHTML = "<p class='text-center'>Tidak terdeteksi kerusakan yang spesifik berdasarkan jawaban Anda. Anda mungkin perlu konsultasi langsung dengan teknisi kami.</p>";
    } else {
        hasilDiagnosisHTML = "<p class='mb-3'>Berdasarkan jawaban Anda, kemungkinan kerusakan ada pada komponen berikut:</p><ul class='list-unstyled'>";
        kerusakan.forEach(k => {
            hasilDiagnosisHTML += `<li class='mb-2 p-2 border-start border-warning border-3'>`; 
            hasilDiagnosisHTML += `<strong>${namaKomponen[k] || k}</strong>`;
            if (estimasiBiaya[k]) {
                hasilDiagnosisHTML += ` <br> <span class='small'>Estimasi biaya perbaikan: <strong>Rp ${estimasiBiaya[k].toLocaleString('id-ID')}</strong></span>`;
            }
            hasilDiagnosisHTML += `</li>`;
        });
        hasilDiagnosisHTML += "</ul><p class='mt-3 small text-muted fst-italic'>Perlu diingat bahwa ini adalah diagnosis awal berdasarkan gejala umum. Untuk diagnosis yang lebih akurat dan penanganan yang tepat, disarankan untuk melakukan pemeriksaan langsung oleh teknisi ahli kami.</p>";
    }

    hasilDiagnosisHTML += `
        <div class="d-flex justify-content-center justify-content-md-between flex-wrap mt-4 pt-3 border-top" style="border-color: #495057 !important;">
            <button class="btn btn-secondary mb-2 mb-md-0 me-md-2" onclick="mulaiDiagnosis()"><i class="bi bi-arrow-clockwise"></i> Mulai Ulang Diagnosis</button>
            <a href="pemesanan.html" class="btn btn-success"><i class="bi bi-cart-check"></i> Lanjut ke Pemesanan</a>
        </div>
    `;
    hasilDiv.innerHTML = hasilDiagnosisHTML;

    
    hasilContainerDiv.style.display = 'block'; 
    
    void hasilContainerDiv.offsetWidth; 
    hasilContainerDiv.classList.add('show');

   
    hasilContainerDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function mulaiDiagnosis() {
    resetPoin();

    const container = document.getElementById("quiz-container");
   
    container.innerHTML = "<div class='text-center p-5'><div class='spinner-border text-primary' role='status' style='width: 3rem; height: 3rem;'><span class='visually-hidden'>Memuat...</span></div><p class='mt-3 fs-5'>Memuat pertanyaan, mohon tunggu...</p></div>";

    const hasilContainerDiv = document.getElementById("hasil-container");
    
    hasilContainerDiv.classList.remove('show');
    if (hasilContainerDiv.style.display !== 'none') { 
        hasilContainerDiv.style.display = 'none'; 
    }


    fetch("komponen/data/diagnosis.json")
        .then(response => response.json())
        .then(data => {
            currentNode = data;
            renderNode(currentNode);
        })
        .catch(error => {
            console.error("Gagal memuat data pohon diagnosis:", error);
            container.innerHTML = `<div class='alert alert-danger'>Gagal memuat data. Harap coba lagi nanti.</div>`;
        });
}

document.addEventListener("DOMContentLoaded", mulaiDiagnosis);