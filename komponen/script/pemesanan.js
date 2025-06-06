import { ref, push, set, get } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded: Script pemesanan.js dimuat.'); // Debug
    const formPemesanan = document.getElementById('formPemesanan');
    console.log('formPemesanan ditemukan:', formPemesanan); // Debug

    // Elemen Modal Kustom
    const pemesananAlertModalElement = document.getElementById('pemesananAlertModal');
    const pemesananAlertModalBody = document.getElementById('pemesananAlertModalBody');
    let pemesananAlertModal; // Variabel untuk instance Modal

    // Inisialisasi Modal setelah DOMContentLoaded
    if (pemesananAlertModalElement) {
        pemesananAlertModal = new bootstrap.Modal(pemesananAlertModalElement);
        console.log('Modal Bootstrap diinisialisasi.'); // Debug
    } else {
        console.warn('Elemen #pemesananAlertModal tidak ditemukan di HTML.'); // Debug
    }

    // Fungsi untuk menampilkan modal alert kustom
    function showPemesananAlert(message) {
        console.log('Menampilkan alert kustom:', message); // Debug
        if (pemesananAlertModalBody && pemesananAlertModal) {
            pemesananAlertModalBody.textContent = message;
            pemesananAlertModal.show();
        } else {
            console.error('Modal Body atau Modal Instance tidak tersedia. Fallback ke alert bawaan.'); // Debug
            alert(message); // Fallback ke alert bawaan jika modal tidak terinisialisasi
        }
    }

    if (formPemesanan) {
        formPemesanan.addEventListener('submit', async function(event) {
            event.preventDefault();
            console.log('Form disubmit.'); // Debug

            const namaPelanggan = document.getElementById('namaPelanggan').value;
            const nomorTelepon = document.getElementById('nomorTelepon').value;
            const alamatPelanggan = document.getElementById('alamatPelanggan').value;
            const jenisKendaraan = document.getElementById('jenisKendaraan').value;
            const nomorPolisiElement = document.getElementById('nomorPolisi'); // Ambil elemennya dulu
            const nomorPolisi = nomorPolisiElement ? nomorPolisiElement.value : ''; 
            const keluhan = document.getElementById('keluhan').value;
            const hasilDiagnosis = document.getElementById('hasilDiagnosis').value;
            const tanggalKunjungan = document.getElementById('tanggalKunjungan').value; // Format: YYYY-MM-DD
            const waktuKunjungan = document.getElementById('waktuKunjungan').value;

            console.log('Nilai input form:', { namaPelanggan, nomorTelepon, tanggalKunjungan, waktuKunjungan }); // Debug

            // Validasi field yang wajib diisi
            if (!namaPelanggan || !nomorTelepon || !alamatPelanggan || !keluhan || !tanggalKunjungan || !waktuKunjungan) {
                console.warn('Mohon lengkapi semua field yang wajib diisi.');
                showPemesananAlert('Mohon lengkapi semua field yang wajib diisi.');
                return;
            }

            // --- Validasi Tanggal Kunjungan (Tidak boleh tanggal yang sudah lewat) ---
            const today = new Date();
            // Normalisasi today ke awal hari lokal (00:00:00)
            const todayNormalizedMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime(); 
            
            // Parsing tanggal kunjungan dari string YYYY-MM-DD dan normalisasi ke awal hari lokal
            const [year, month, day] = tanggalKunjungan.split('-').map(Number);
            const selectedDateNormalizedMs = new Date(year, month - 1, day).getTime(); // month - 1 karena bulan di Date object berbasis 0

            console.log('Tanggal hari ini (normalized lokal, ms):', todayNormalizedMs); // Debug
            console.log('Tanggal terpilih (normalized lokal, ms):', selectedDateNormalizedMs); // Debug

            if (selectedDateNormalizedMs < todayNormalizedMs) {
                console.warn('Tanggal kunjungan tidak boleh di masa lalu.');
                showPemesananAlert('Mohon maaf, tanggal kunjungan tidak boleh di masa lalu. Silakan pilih tanggal hari ini atau setelahnya.');
                return;
            }
            // --- Akhir Validasi Tanggal Kunjungan ---

            // --- Validasi Waktu Kunjungan (hanya jika tanggal yang dipilih adalah hari ini) ---
            if (selectedDateNormalizedMs === todayNormalizedMs) { // Jika tanggal yang dipilih adalah hari ini
                const currentHour = today.getHours();
                const currentMinute = today.getMinutes();

                if (waktuKunjungan === 'pagi') { // Pagi (08:00 - 11:00)
                    // Jika jam saat ini sudah lewat dari 11:00
                    if (currentHour > 11 || (currentHour === 11 && currentMinute > 0)) {
                        console.warn('Slot waktu pagi sudah lewat.');
                        showPemesananAlert('Mohon maaf, slot waktu "Pagi (08:00 - 11:00)" sudah lewat untuk hari ini. Silakan pilih slot waktu lain.');
                        return;
                    }
                } else if (waktuKunjungan === 'siang') { // Siang (13:00 - 16:00)
                    // Jika jam saat ini sudah lewat dari 16:00
                    if (currentHour > 16 || (currentHour === 16 && currentMinute > 0)) {
                        console.warn('Slot waktu siang sudah lewat.');
                        showPemesananAlert('Mohon maaf, slot waktu "Siang (13:00 - 16:00)" sudah lewat untuk hari ini. Silakan pilih slot waktu lain.');
                        return;
                    }
                    // Tambahan: jika jam sekarang masih sebelum 13:00 dan sudah lewat 11:00, maka pagi sudah lewat tapi siang belum
                    if (currentHour < 13 && currentHour >= 11) { // Jika sudah lewat pagi tapi belum masuk siang
                        console.warn('Slot waktu pagi sudah lewat, dan slot siang belum bisa dipilih.');
                        showPemesananAlert('Mohon maaf, slot waktu "Pagi (08:00 - 11:00)" sudah lewat. Silakan pilih "Siang (13:00 - 16:00)" jika jam sudah memungkinkan, atau pilih tanggal lain.');
                        return;
                    }
                }
            }
            // --- Akhir Validasi Waktu Kunjungan ---

            const database = window.firebaseDatabase;
            console.log('Objek database Firebase:', database); // Debug

            if (!database) {
                console.error("Firebase Realtime Database belum diinisialisasi. Periksa konfigurasi Firebase di HTML.");
                showPemesananAlert('Terjadi kesalahan sistem. Mohon coba lagi nanti.');
                return;
            }

            try {
                const ordersRef = ref(database, 'Pelanggan');
                console.log('Mencoba mengambil data dari Firebase...'); // Debug
                const snapshot = await get(ordersRef);
                const activeOrdersForSlot = [];

                if (snapshot.exists()) {
                    const allOrders = snapshot.val();
                    console.log('Data yang ada di Firebase:', allOrders); // Debug
                    for (const orderId in allOrders) {
                        const order = allOrders[orderId];
                        // Filter berdasarkan tanggal kunjungan, waktu kunjungan, DAN status 'menunggu'
                        if (order.tanggalKunjungan === tanggalKunjungan && 
                            order.waktuKunjungan === waktuKunjungan && 
                            order.status === 'menunggu') { // Hanya hitung pesanan yang masih menunggu
                            activeOrdersForSlot.push(order);
                        }
                    }
                    console.log('Pesanan aktif untuk slot ini:', activeOrdersForSlot.length, activeOrdersForSlot); // Debug
                } else {
                    console.log('Tidak ada pesanan yang ditemukan di Firebase.'); // Debug
                }

                // Cek jumlah pesanan yang aktif/menunggu untuk slot ini
                // Jika sudah ada 2 pesanan yang menunggu, maka slot dianggap penuh (activeOrdersForSlot.length >= 2)
                if (activeOrdersForSlot.length >= 3) { // Batas 2 orang
                    console.warn('Slot jadwal ini sudah penuh. Mohon pilih tanggal atau waktu lain.');
                    showPemesananAlert('Mohon maaf, slot jadwal untuk tanggal ' + tanggalKunjungan + ' pada jam ' + waktuKunjungan + ' sudah penuh. Silakan pilih tanggal atau waktu lain.');
                    return;
                }

                console.log('Mencoba mengirim data ke Firebase...'); // Debug
                const newPemesananRef = push(ordersRef);
                await set(newPemesananRef, {
                    nama: namaPelanggan,
                    telepon: nomorTelepon,
                    alamat: alamatPelanggan,
                    mobil: jenisKendaraan,
                    nomorPolisi: nomorPolisi,
                    deskripsi: keluhan,
                    kerusakan: hasilDiagnosis || '-',
                    status: 'menunggu',
                    tanggalKunjungan: tanggalKunjungan,
                    waktuKunjungan: waktuKunjungan,
                    createdAt: new Date().toISOString()
                });

                console.log('Pemesanan berhasil dikirim ke Firebase!');
                formPemesanan.reset();

                // Redirect ke success.html setelah 0.5 detik (500 ms)
                setTimeout(() => {
                    console.log('Redirecting ke success.html'); // Debug
                    window.location.href = 'success.html';
                }, 500);

            } catch (error) {
                console.error("Error menambahkan dokumen ke Firebase: ", error);
                showPemesananAlert('Terjadi kesalahan saat mengirim pemesanan. Mohon coba lagi.');
            }
        });
    } else {
        console.error('Form dengan ID "formPemesanan" tidak ditemukan.'); // Debug
    }
});
