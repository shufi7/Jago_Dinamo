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
    const resultHarga = document.getElementById('resultHarga'); // Elemen baru untuk harga
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
        statusMessage.style.display = 'none';

        const nama = inputNama.value.trim();
        const telepon = inputTelepon.value.trim();

        if (nama === '' || telepon === '') {
            // Bisa diganti dengan toast jika ingin tampilan lebih cantik
            alert('Nama dan Nomor Telepon harus diisi.');
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

            if (foundOrder && foundOrder.status === 'Disetujui') {
                // Tampilkan hasil
                resultNama.textContent = foundOrder.nama;
                resultTelepon.textContent = foundOrder.telepon;
                resultKerusakan.textContent = foundOrder.kerusakan || 'Belum ada data kerusakan';
                resultProgres.textContent = foundOrder.progres || 'Belum diperbarui';
                // Tampilkan harga. Format sebagai mata uang jika perlu (misal: "Rp 150.000")
                resultHarga.textContent = foundOrder.harga !== undefined ? `Rp ${foundOrder.harga.toLocaleString('id-ID')}` : 'Belum ada biaya';


                // Tampilan pesan status berdasarkan progres
                statusMessage.classList.remove('alert-success', 'alert-warning', 'alert-info');
                statusMessage.style.display = 'block';

                if (foundOrder.progres === 'Selesai diperbaiki') {
                    statusMessage.classList.add('alert-success');
                    statusMessage.textContent = 'Perbaikan Anda telah selesai! Silakan hubungi kami untuk pengambilan dan pembayaran.';
                } else if (foundOrder.progres === 'Sedang diperbaiki') {
                    statusMessage.classList.add('alert-info');
                    statusMessage.textContent = 'Perbaikan Anda sedang dalam proses. Teknisi kami sedang mengerjakannya.';
                } else if (foundOrder.progres === 'Belum diperbaiki') {
                    statusMessage.classList.add('alert-warning');
                    statusMessage.textContent = 'Perbaikan Anda belum dimulai. Tim kami akan segera menanganinya.';
                } else {
                    statusMessage.classList.add('alert-info');
                    statusMessage.textContent = 'Status progres Anda akan segera diperbarui.';
                }

                progresResult.style.display = 'block';
            } else {
                noDataFound.style.display = 'block';
            }

        } catch (error) {
            console.error("Error fetching data: ", error);
            noDataFound.textContent = 'Terjadi kesalahan saat mencari data. Mohon coba lagi.';
            noDataFound.style.display = 'block';
        }
    });
});