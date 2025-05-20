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
    dataSoal.forEach((q, i) => {
        const div = document.createElement("div");
        div.classList.add("mb-3");
        div.innerHTML = `<p><strong>${i + 1}. ${q.soal}</strong></p>`;
        q.pilihan.forEach((opt, j) => {
            div.innerHTML += `
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="soal${i}" id="soal${i}_pilihan${j}" value='${JSON.stringify(opt.poin)}'>
                    <label class="form-check-label" for="soal${i}_pilihan${j}">${opt.jawaban}</label>
                </div>`;
        });
        container.appendChild(div);
    });
}

function hitungDiagnosa() {
    const radios = document.querySelectorAll("input[type='radio']:checked");
    const totalSoal = document.querySelectorAll("fieldset").length || document.querySelectorAll("input[type='radio']").length / 4;

    if (radios.length < totalSoal) {
        alert(`Silakan jawab semua pertanyaan terlebih dahulu. Masih ada ${totalSoal - radios.length} pertanyaan yang belum dijawab.`);
        return;
    }

    let hasil = {...hasilPoin};

    radios.forEach(r => {
        const poin = JSON.parse(r.value);
        for (let key in poin) {
            hasil[key] += poin[key];
        }
    });

    let max = 0;
    let kerusakan = "Tidak terdeteksi kerusakan yang spesifik";
    for (let k in hasil) {
        if (hasil[k] > max) {
            max = hasil[k];
            kerusakan = `Kemungkinan kerusakan pada: ${k}`;
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

    let biaya = 0;
    const komponen = kerusakan.split(': ')[1];
    if (estimasiBiaya[komponen]) {
        biaya = estimasiBiaya[komponen];
        kerusakan += `\nEstimasi biaya perbaikan: Rp ${biaya.toLocaleString('id-ID')}`;
    }

    document.getElementById("hasil").innerText = kerusakan;
}

// Ambil data soal dari JSON
fetch("dataSoal.json")
    .then(response => response.json())
    .then(data => renderSoal(data))
    .catch(error => console.error("Gagal memuat data soal:", error));
