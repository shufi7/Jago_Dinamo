const hasilPoin = {
    aki: 0,
    brush: 0,
    dinamo: 0,
    solenoid: 0,
    kabel: 0,
    sekring: 0,
    lilitan: 0
};


function renderSoal(dataSoal) {
    const container = document.getElementById("quiz-container");
    container.innerHTML = '';
    
    if (!dataSoal || dataSoal.length === 0) {
        container.innerHTML = '<div class="alert alert-danger">Data soal tidak tersedia. Silakan refresh halaman.</div>';
        return;
    }
    
    dataSoal.forEach((q, i) => {
        const div = document.createElement("div");
        div.classList.add("mb-4", "p-3", "border", "rounded");
        div.innerHTML = `<p class="fw-bold">${i + 1}. ${q.soal}</p>`;
        
        q.pilihan.forEach((opt, j) => {
            div.innerHTML += `
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="soal${i}" id="soal${i}_pilihan${j}" value='${JSON.stringify(opt.poin)}' required>
                    <label class="form-check-label" for="soal${i}_pilihan${j}">${opt.jawaban}</label>
                </div>`;
        });
        
        container.appendChild(div);
    });
}

function hitungDiagnosa() {
    const radios = document.querySelectorAll("input[type='radio']:checked");
    const totalSoal = document.querySelectorAll('[id^="soal"]').length / 4; // 4 pilihan per soal
    
    if (radios.length < totalSoal) {
        alert(`Silakan jawab semua pertanyaan terlebih dahulu. Masih ada ${totalSoal - radios.length} pertanyaan yang belum dijawab.`);
        return;
    }

    // Reset hasil poin
    let hasil = {...hasilPoin};

    radios.forEach(r => {
        try {
            const poin = JSON.parse(r.value);
            for (let key in poin) {
                if (hasil.hasOwnProperty(key)) {
                    hasil[key] += poin[key];
                }
            }
        } catch (e) {
            console.error("Error parsing radio value:", e);
        }
    });

    let max = 0;
    let kerusakan = [];
    for (let k in hasil) {
        if (hasil[k] > max) {
            max = hasil[k];
            kerusakan = [k];
        } else if (hasil[k] === max && max > 0) {
            kerusakan.push(k);
        }
    }

    const estimasiBiaya = {
        aki: 300000,
        brush: 150000,
        dinamo: 800000,
        solenoid: 250000,
        kabel: 100000,
        sekring: 50000,
        lilitan: 400000
    };

    let hasilDiagnosis = "";
    if (max === 0) {
        hasilDiagnosis = "Tidak terdeteksi kerusakan yang spesifik berdasarkan jawaban Anda.";
    } else {
        hasilDiagnosis = "Kemungkinan kerusakan pada:\n";
        kerusakan.forEach(k => {
            hasilDiagnosis += `- ${k.charAt(0).toUpperCase() + k.slice(1)}`;
            if (estimasiBiaya[k]) {
                hasilDiagnosis += `  Estimasi biaya perbaikan: Rp ${estimasiBiaya[k].toLocaleString('id-ID')}\n\n`;
            }
        });
    }

    document.getElementById("hasil").textContent = hasilDiagnosis;
}

// Fungsi untuk memuat data soal
function loadQuestions() {
    fetch("diagnosis.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            console.log("Soal berhasil dimuat:", data);
            renderSoal(data);
        })
        .catch(error => {
            console.error("Gagal memuat data soal dari server, menggunakan data fallback:", error);
            renderSoal(fallbackData);
        });
}

// Jalankan saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', function() {
    loadQuestions();
});