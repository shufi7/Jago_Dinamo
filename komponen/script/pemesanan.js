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
    const pemesananForm = document.getElementById('formPemesanan'); // Menggunakan ID form yang sudah ada

    if (pemesananForm) {
        pemesananForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Mengambil nilai dari input form berdasarkan ID yang sudah ada di pemesanan.html
            const namaPelanggan = document.getElementById('namaPelanggan').value;
            const nomorTelepon = document.getElementById('nomorTelepon').value;
            const alamatPelanggan = document.getElementById('alamatPelanggan').value;
            const jenisKendaraan = document.getElementById('jenisKendaraan').value;
            const keluhan = document.getElementById('keluhan').value;
            const hasilDiagnosis = document.getElementById('hasilDiagnosis').value;
            const tanggalKunjungan = document.getElementById('tanggalKunjungan').value; // Tetap ada di form
            const waktuKunjungan = document.getElementById('waktuKunjungan').value; // Tetap ada di form

            // Mengakses instance database Firebase dari objek window
            const database = window.firebaseDatabase;

            if (!database) {
                console.error("Firebase Realtime Database belum diinisialisasi.");
                alert("Terjadi kesalahan saat menghubungkan ke database. Mohon coba lagi.");
                return;
            }

            try {
                // Membuat referensi baru dengan kunci unik di node 'Pelanggan'
                const newPemesananRef = push(ref(database, 'Pelanggan')); // UBAH ke 'Pelanggan'
                await set(newPemesananRef, {
                    nama: namaPelanggan, // UBAH ke 'nama'
                    telepon: nomorTelepon, // UBAH ke 'telepon'
                    alamat: alamatPelanggan, // UBAH ke 'alamat'
                    mobil: jenisKendaraan, // UBAH ke 'mobil'
                    deskripsi: keluhan, // UBAH ke 'deskripsi'
                    kerusakan: hasilDiagnosis || '-', // UBAH ke 'kerusakan', berikan '-' jika kosong
                    status: 'menunggu', // UBAH status awal menjadi 'menunggu'
                    // Tanggal dan waktu kunjungan tetap disimpan jika perlu, meskipun tidak diminta di struktur baru
                    tanggalKunjungan: tanggalKunjungan,
                    waktuKunjungan: waktuKunjungan,
                    createdAt: new Date().toISOString() // Timestamp saat pemesanan dibuat (tetap ada)
                });

                alert('Pemesanan berhasil dikirim!');
                pemesananForm.reset(); // Mengosongkan form setelah submit
            } catch (error) {
                console.error("Error menambahkan dokumen: ", error);
                alert('Terjadi kesalahan saat mengirim pemesanan. Mohon coba lagi.');
            }
        });
    }
});