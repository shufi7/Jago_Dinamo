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
