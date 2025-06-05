// komponen/script/progres.js
import { ref, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    const database = window.firebaseDatabase;
    const formCekProgres = document.getElementById('formCekProgres');
    const inputNama = document.getElementById('inputNama');
    const inputTelepon = document.getElementById('inputTelepon');
    const progresResult = document.getElementById('progresResult');
    const noDataFound = document.getElementById('noDataFound');

    const resultNama = document.getElementById('resultNama');
    const resultTelepon = document.getElementById('resultTelepon');
    const resultKerusakan = document.getElementById('resultKerusakan');
    const resultProgres = document.getElementById('resultProgres');
    const resultHarga = document.getElementById('resultHarga');
    const statusMessage = document.getElementById('statusMessage');

    if (!database) {
        console.error("Firebase Realtime Database belum diinisialisasi.");
        noDataFound.textContent = 'Terjadi kesalahan saat menghubungkan ke database. Mohon coba lagi.';
        noDataFound.style.display = 'block';
        return;
    }

    formCekProgres.addEventListener('submit', async (e) => {
        e.preventDefault();

        progresResult.style.display = 'none';
        noDataFound.style.display = 'none';
        statusMessage.style.display = 'none'; // Sembunyikan pesan status saat pencarian baru

        const nama = inputNama.value.trim();
        const telepon = inputTelepon.value.trim();

        if (nama === '' || telepon === '') {
            console.warn('Nama dan Nomor Telepon harus diisi.'); // Notifikasi di konsol
            // Anda bisa menambahkan indikator visual di UI tanpa alert() di sini
            noDataFound.textContent = 'Nama dan Nomor Telepon harus diisi.';
            noDataFound.style.display = 'block';
            return;
        }

        const ordersRef = ref(database, 'Pelanggan');

        try {
            const snapshot = await get(ordersRef);
            const allOrders = snapshot.val();
            let foundOrder = null;

            if (allOrders) {
                for (const orderId in allOrders) {
                    const order = allOrders[orderId];
                    if (order.nama && order.telepon &&
                        order.nama.toLowerCase() === nama.toLowerCase() &&
                        order.telepon === telepon) {
                        foundOrder = order;
                        break;
                    }
                }
            }

            if (foundOrder) {
                // Bersihkan kelas alert sebelumnya
                statusMessage.classList.remove('alert-success', 'alert-warning', 'alert-info', 'alert-danger');

                // Tampilkan detail pesanan
                resultNama.textContent = foundOrder.nama;
                resultTelepon.textContent = foundOrder.telepon;
                resultKerusakan.textContent = foundOrder.kerusakan || 'Belum ada data kerusakan';

                // Logika untuk menampilkan progres dan harga berdasarkan status
                if (foundOrder.status === 'Disetujui') {
                    resultHarga.textContent = foundOrder.harga !== undefined ? `Rp ${foundOrder.harga.toLocaleString('id-ID')}` : 'Belum ada biaya';
                    
                    // Logika spesifik untuk progres ketika status 'Disetujui'
                    if (foundOrder.progres === 'Selesai diperbaiki') {
                        resultProgres.textContent = foundOrder.progres;
                        statusMessage.classList.add('alert-success');
                        statusMessage.textContent = 'Perbaikan Anda telah selesai! Silakan hubungi kami untuk pengambilan dan pembayaran.';
                    } else if (foundOrder.progres === 'Sedang diperbaiki') {
                        resultProgres.textContent = foundOrder.progres;
                        statusMessage.classList.add('alert-info');
                        statusMessage.textContent = 'Perbaikan Anda sedang dalam proses. Teknisi kami sedang mengerjakannya.';
                    } else if (foundOrder.progres === 'Belum diperbaiki') {
                        resultProgres.textContent = foundOrder.progres;
                        statusMessage.classList.add('alert-warning');
                        statusMessage.textContent = 'Perbaikan Anda belum dimulai. Tim kami akan segera menanganinya.';
                    } else {
                        // Jika progres kosong atau nilai lain yang tidak terdefinisi
                        resultProgres.textContent = 'Menunggu pembaruan progres';
                        statusMessage.classList.add('alert-info');
                        statusMessage.textContent = 'Status progres Anda akan segera diperbarui.';
                    }
                    statusMessage.style.display = 'block'; // Pastikan pesan status terlihat
                    progresResult.style.display = 'block'; // Pastikan hasil terlihat

                } else if (foundOrder.status === 'Tidak Disetujui') {
                    resultProgres.textContent = 'Tidak disetujui';
                    resultHarga.textContent = 'Tidak berlaku';
                    statusMessage.classList.add('alert-warning'); // Menggunakan alert-warning untuk penolakan
                    statusMessage.textContent = 'Status: Permintaan Anda Tidak Disetujui. Silakan hubungi kami untuk informasi lebih lanjut.';
                    statusMessage.style.display = 'block';
                    progresResult.style.display = 'block'; // Tetap tampilkan detail pesanan meskipun ditolak

                } else if (foundOrder.status === 'menunggu') {
                    resultProgres.textContent = 'Menunggu pembaruan';
                    resultHarga.textContent = 'Akan dikonfirmasi';
                    statusMessage.classList.add('alert-info');
                    statusMessage.textContent = 'Status: Permintaan Anda Sedang Menunggu Disetujui. Kami akan segera menghubungi Anda.';
                    statusMessage.style.display = 'block';
                    progresResult.style.display = 'block'; // Tetap tampilkan detail pesanan

                } else {
                    // Untuk status yang tidak dikenali
                    resultProgres.textContent = 'Status tidak dikenal';
                    resultHarga.textContent = 'Akan dikonfirmasi';
                    statusMessage.classList.add('alert'); // Kelas alert default
                    statusMessage.textContent = `Status: ${foundOrder.status}. (Status tidak dikenal)`;
                    statusMessage.style.display = 'block';
                    progresResult.style.display = 'block';
                }
                
            } else {
                // Jika pesanan tidak ditemukan
                noDataFound.style.display = 'block';
            }

        } catch (error) {
            console.error("Error fetching data: ", error);
            noDataFound.textContent = 'Terjadi kesalahan saat mencari data. Mohon coba lagi.';
            noDataFound.style.display = 'block';
        }
    });
});
