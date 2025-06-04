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

            alert(`Terima kasih, ${nama}! Permintaan servis Anda telah kami terima. Teknisi kami akan segera menghubungi Anda untuk konfirmasi jadwal.`);
            
          
        });
    }
});
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "API_KEY_ANDA",
  authDomain: "jagodinamodata.firebaseapp.com",
  databaseURL: "https://jagodinamodata-default-rtdb.firebaseio.com",
  projectId: "jagodinamodata",
  storageBucket: "jagodinamodata.appspot.com",
  messagingSenderId: "SENDER_ID_ANDA",
  appId: "APP_ID_ANDA"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.getElementById("formPemesanan").addEventListener("submit", function (e) {
  e.preventDefault();

  const nama = document.getElementById("namaPelanggan").value;
  const telepon = document.getElementById("nomorTelepon").value;
  const alamat = document.getElementById("alamatPelanggan").value;
  const kendaraan = document.getElementById("jenisKendaraan").value;
  const plat = document.getElementById("nomorPolisi").value;
  const keluhan = document.getElementById("keluhan").value;
  const diagnosis = document.getElementById("hasilDiagnosis").value;
  const tanggal = document.getElementById("tanggalKunjungan").value;
  const waktu = document.getElementById("waktuKunjungan").value;

  const newRef = push(ref(database, 'pemesanan'));

  set(newRef, {
    nama,
    telepon,
    alamat,
    kendaraan: kendaraan + ' | ' + plat,
    deskripsi: keluhan,
    kerusakan: diagnosis,
    jadwal: tanggal + ' ' + waktu,
    status: 'menunggu'
  })
    .then(() => {
      alert("Data berhasil dikirim!");
      document.getElementById("formPemesanan").reset();
    })
    .catch((error) => {
      console.error("Gagal mengirim data: ", error);
    });
});
