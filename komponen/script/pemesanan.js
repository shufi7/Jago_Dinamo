import { ref, push, set, get } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js"; 

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded: Script pemesanan.js dimuat.');
    const formPemesanan = document.getElementById('formPemesanan');
    console.log('formPemesanan ditemukan:', formPemesanan);

    const pemesananAlertModalElement = document.getElementById('pemesananAlertModal');
    const pemesananAlertModalBody = document.getElementById('pemesananAlertModalBody');
    let pemesananAlertModal;

    if (pemesananAlertModalElement) {
        pemesananAlertModal = new bootstrap.Modal(pemesananAlertModalElement);
        console.log('Modal Bootstrap diinisialisasi.');
    } else {
        console.warn('Elemen #pemesananAlertModal tidak ditemukan di HTML.');
    }

    function showPemesananAlert(message) {
        console.log('Menampilkan alert kustom:', message);
        if (pemesananAlertModalBody && pemesananAlertModal) {
            pemesananAlertModalBody.textContent = message;
            pemesananAlertModal.show();
        } else {
            console.error('Modal Body atau Modal Instance tidak tersedia. Fallback ke alert bawaan.');
            alert(message);
        }
    }

    if (formPemesanan) {
        formPemesanan.addEventListener('submit', async function(event) {
            event.preventDefault();
            console.log('Form disubmit.');

            const namaPelanggan = document.getElementById('namaPelanggan').value;
            const nomorTelepon = document.getElementById('nomorTelepon').value;
            const alamatPelanggan = document.getElementById('alamatPelanggan').value;
            const jenisKendaraan = document.getElementById('jenisKendaraan').value;
            const nomorPolisiElement = document.getElementById('nomorPolisi');
            const nomorPolisi = nomorPolisiElement ? nomorPolisiElement.value : ''; 
            const keluhan = document.getElementById('keluhan').value;
            const hasilDiagnosis = document.getElementById('hasilDiagnosis').value;
            const tanggalKunjungan = document.getElementById('tanggalKunjungan').value;
            const waktuKunjungan = document.getElementById('waktuKunjungan').value;

            console.log('Nilai input form:', { namaPelanggan, nomorTelepon, tanggalKunjungan, waktuKunjungan });

            if (!namaPelanggan || !nomorTelepon || !alamatPelanggan || !keluhan || !tanggalKunjungan || !waktuKunjungan) {
                console.warn('Mohon lengkapi semua field yang wajib diisi.');
                showPemesananAlert('Mohon lengkapi semua field yang wajib diisi.');
                return;
            }

            const today = new Date();
            const todayNormalizedMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime(); 
            const [year, month, day] = tanggalKunjungan.split('-').map(Number);
            const selectedDateNormalizedMs = new Date(year, month - 1, day).getTime();

            console.log('Tanggal hari ini (normalized lokal, ms):', todayNormalizedMs);
            console.log('Tanggal terpilih (normalized lokal, ms):', selectedDateNormalizedMs);

            if (selectedDateNormalizedMs < todayNormalizedMs) {
                console.warn('Tanggal kunjungan tidak boleh di masa lalu.');
                showPemesananAlert('Mohon maaf, tanggal kunjungan tidak boleh di masa lalu. Silakan pilih tanggal hari ini atau setelahnya.');
                return;
            }

            if (selectedDateNormalizedMs === todayNormalizedMs) {
                const currentHour = today.getHours();
                const currentMinute = today.getMinutes();

                if (waktuKunjungan === 'pagi') {
                    if (currentHour > 11 || (currentHour === 11 && currentMinute > 0)) {
                        console.warn('Slot waktu pagi sudah lewat.');
                        showPemesananAlert('Mohon maaf, slot waktu "Pagi (08:00 - 11:00)" sudah lewat untuk hari ini. Silakan pilih slot waktu lain.');
                        return;
                    }
                } else if (waktuKunjungan === 'siang') {
                    if (currentHour > 16 || (currentHour === 16 && currentMinute > 0)) {
                        console.warn('Slot waktu siang sudah lewat.');
                        showPemesananAlert('Mohon maaf, slot waktu "Siang (13:00 - 16:00)" sudah lewat untuk hari ini. Silakan pilih slot waktu lain.');
                        return;
                    }
                    if (currentHour < 13 && currentHour >= 11) {
                        console.warn('Slot waktu pagi sudah lewat, dan slot siang belum bisa dipilih.');
                        showPemesananAlert('Mohon maaf, slot waktu "Pagi (08:00 - 11:00)" sudah lewat. Silakan pilih "Siang (13:00 - 16:00)" jika jam sudah memungkinkan, atau pilih tanggal lain.');
                        return;
                    }
                }
            }

            const database = window.firebaseDatabase;
            console.log('Objek database Firebase:', database);

            if (!database) {
                console.error("Firebase Realtime Database belum diinisialisasi. Periksa konfigurasi Firebase di HTML.");
                showPemesananAlert('Terjadi kesalahan sistem. Mohon coba lagi nanti.');
                return;
            }

            try {
                const ordersRef = ref(database, 'Pelanggan');
                console.log('Mencoba mengambil data dari Firebase...');
                const snapshot = await get(ordersRef);
                const activeOrdersForSlot = [];

                if (snapshot.exists()) {
                    const allOrders = snapshot.val();
                    console.log('Data yang ada di Firebase:', allOrders);
                    for (const orderId in allOrders) {
                        const order = allOrders[orderId];
                        if (order.tanggalKunjungan === tanggalKunjungan && 
                            order.waktuKunjungan === waktuKunjungan && 
                            order.status === 'menunggu') {
                            activeOrdersForSlot.push(order);
                        }
                    }
                    console.log('Pesanan aktif untuk slot ini:', activeOrdersForSlot.length, activeOrdersForSlot);
                } else {
                    console.log('Tidak ada pesanan yang ditemukan di Firebase.');
                }

                if (activeOrdersForSlot.length >= 3) {
                    console.warn('Slot jadwal ini sudah penuh. Mohon pilih tanggal atau waktu lain.');
                    showPemesananAlert('Mohon maaf, slot jadwal untuk tanggal ' + tanggalKunjungan + ' pada jam ' + waktuKunjungan + ' sudah penuh. Silakan pilih tanggal atau waktu lain.');
                    return;
                }

                console.log('Mencoba mengirim data ke Firebase...');
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

                setTimeout(() => {
                    console.log('Redirecting ke success.html');
                    window.location.href = 'success.html';
                }, 500);

            } catch (error) {
                console.error("Error menambahkan dokumen ke Firebase: ", error);
                showPemesananAlert('Terjadi kesalahan saat mengirim pemesanan. Mohon coba lagi.');
            }
        });
    } else {
        console.error('Form dengan ID "formPemesanan" tidak ditemukan.');
    }
});
