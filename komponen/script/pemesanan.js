document.addEventListener('DOMContentLoaded', function() {
    const formPemesanan = document.getElementById('formPemesanan');
    if (formPemesanan) {
        formPemesanan.addEventListener('submit', function(event) {
            event.preventDefault(); 

           
            const nama = document.getElementById('namaPelanggan').value;
            const telepon = document.getElementById('nomorTelepon').value;
            const alamat = document.getElementById('alamatPelanggan').value;
            const jenisKendaraan = document.getElementById('jenisKendaraan').value;
            const nomorPolisi = document.getElementById('nomorPolisi').value;
            const keluhan = document.getElementById('keluhan').value;
            const hasilDiagnosis = document.getElementById('hasilDiagnosis').value;
            const tanggal = document.getElementById('tanggalKunjungan').value;
            const waktu = document.getElementById('waktuKunjungan').value;

            
            if (!nama || !telepon || !alamat || !keluhan || !tanggal || !waktu) {
                alert('Mohon lengkapi semua field yang wajib diisi.');
                return;
            }

           
            console.log("Data Pemesanan:");
            console.log({
                nama,
                telepon,
                alamat,
                jenisKendaraan,
                nomorPolisi,
                keluhan,
                hasilDiagnosis,
                tanggal,
                waktu
            });

            alert(`Terima kasih, ${nama}! Permintaan servis Anda telah kami terima. Teknisi kami akan segera menghubungi Anda untuk konfirmasi jadwal.`)
        });
    }
});

import { ref, push, set } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    const pemesananForm = document.getElementById('formPemesanan');

    if (pemesananForm) {
        pemesananForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const namaPelanggan = document.getElementById('namaPelanggan').value;
            const nomorTelepon = document.getElementById('nomorTelepon').value;
            const alamatPelanggan = document.getElementById('alamatPelanggan').value;
            const jenisKendaraan = document.getElementById('jenisKendaraan').value;
            const keluhan = document.getElementById('keluhan').value;
            const hasilDiagnosis = document.getElementById('hasilDiagnosis').value;
            const tanggalKunjungan = document.getElementById('tanggalKunjungan').value;
            const waktuKunjungan = document.getElementById('waktuKunjungan').value;

            const database = window.firebaseDatabase;

            if (!database) {
                console.error("Firebase Realtime Database belum diinisialisasi.");
                alert("Terjadi kesalahan saat menghubungkan ke database. Mohon coba lagi.");
                return;
            }

            try {
                const newPemesananRef = push(ref(database, 'Pelanggan'));
                await set(newPemesananRef, {
                    nama: namaPelanggan,
                    telepon: nomorTelepon,
                    alamat: alamatPelanggan,
                    mobil: jenisKendaraan,
                    deskripsi: keluhan,
                    kerusakan: hasilDiagnosis || '-',
                    status: 'menunggu',
                    tanggalKunjungan: tanggalKunjungan,
                    waktuKunjungan: waktuKunjungan,
                    createdAt: new Date().toISOString()
                });

                pemesananForm.reset(); // Mengosongkan form

                // Tambahkan kode ini untuk redirect ke success.html setelah 2 detik
                setTimeout(() => {
                    window.location.href = 'success.html'; // Sesuaikan path jika success.html berada di folder yang berbeda
                }, 500); // 2000 milidetik = 2 detik

            } catch (error) {
                console.error("Error menambahkan dokumen: ", error);
                alert('Terjadi kesalahan saat mengirim pemesanan. Mohon coba lagi.');
            }
        });
    }
});