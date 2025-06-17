import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js"; // Dipindahkan dari HTML jika ada
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js"; // Dipindahkan dari HTML jika ada
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js"; // 'remove' dihapus karena tombol hapus dihilangkan

document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi Firebase jika belum ada (pastikan hanya dilakukan sekali di aplikasi Anda)
    let database;
    if (window.firebaseDatabase) {
        database = window.firebaseDatabase;
    } else {
        const firebaseConfig = {
            apiKey: "AIzaSyCsbdGGAw-MOYt1LuiQ6bGZqmXiBQH6wVk",
            authDomain: "jagodinamodata.firebaseapp.com",
            databaseURL: "https://jagodinamodata-default-rtdb.firebaseio.com",
            projectId: "jagodinamodata",
            storageBucket: "jagodinamodata.firebasestorage.app",
            messagingSenderId: "1045178326640",
            appId: "1:1045178326640:web:e3abf0380697b738481eb5",
            measurementId: "G-4XBR0MDY7L"
        };
        const app = initializeApp(firebaseConfig);
        getAnalytics(app); // Perbaikan: getAnalytics(app)
        database = getDatabase(app);
        window.firebaseDatabase = database; // Simpan di global agar bisa diakses
    }


    const orderTableBody = document.getElementById('orderTableBody');

    // Elemen Toast
    const liveToastElement = document.getElementById('liveToast');
    const toastMessageElement = document.getElementById('toastMessage');
    let liveToast;

    // Elemen Modal Konfirmasi Hapus (Dihapus dari HTML, jadi ini mungkin tidak akan ditemukan)
    const deleteConfirmationModalElement = document.getElementById('deleteConfirmationModal'); // Ini mungkin tidak ada di HTML Anda sekarang
    const confirmDeleteButton = document.getElementById('confirmDeleteButton'); // Ini mungkin tidak ada di HTML Anda sekarang
    // let deleteModal; // Hapus inisialisasi modal jika elemennya tidak ada
    // let orderIdToDelete = null; // Hapus jika tidak digunakan

    // Inisialisasi Toast
    if (liveToastElement) {
        liveToast = new bootstrap.Toast(liveToastElement, {
            autohide: true,
            delay: 3000
        });
    }
    // Jika deleteConfirmationModalElement tidak ada di HTML adminprogres.html, bagian ini tidak perlu
    /*
    if (deleteConfirmationModalElement) {
        deleteModal = new bootstrap.Modal(deleteConfirmationModalElement);
    }
    */

    // Fungsi untuk menampilkan Toast
    function showToast(message, type = 'success') {
        if (liveToastElement && toastMessageElement && liveToast) {
            toastMessageElement.textContent = message;
            liveToastElement.classList.remove('bg-success', 'bg-danger', 'bg-info', 'bg-warning'); // Hapus semua kelas warna
            if (type === 'success') { liveToastElement.classList.add('bg-success'); }
            else if (type === 'error' || type === 'danger') { liveToastElement.classList.add('bg-danger'); }
            else if (type === 'info') { liveToastElement.classList.add('bg-info'); }
            else if (type === 'warning') { liveToastElement.classList.add('bg-warning'); }
            liveToast.show();
        }
    }

    if (!database) {
        console.error("Firebase Realtime Database belum diinisialisasi.");
        orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Terjadi kesalahan saat menghubungkan ke database. Mohon coba lagi.</td></tr>'; // Colspan 10 karena kolom Aksi masih ada tapi isinya beda
        showToast('Terjadi kesalahan: Database tidak terhubung.', 'error');
        return;
    }

    const ordersRef = ref(database, 'Pelanggan');

    onValue(ordersRef, (snapshot) => {
        const orders = snapshot.val();
        orderTableBody.innerHTML = '';
        let hasRelevantOrders = false; // Mengganti hasApprovedOrders dengan nama yang lebih sesuai

        if (orders) {
            Object.keys(orders).forEach(orderId => {
                const order = orders[orderId];

                // --- LOGIKA FILTER UTAMA UNTUK adminprogres.html ---
                // Tampilkan hanya pesanan yang statusnya 'Disetujui' TAPI progresnya BUKAN 'Selesai diperbaiki'
                // Ini akan membuat pesanan yang selesai secara otomatis hilang dari daftar ini
                if (order.status === 'Disetujui' && order.progres !== 'Selesai diperbaiki') {
                    hasRelevantOrders = true;
                    const newRow = orderTableBody.insertRow();
                    newRow.setAttribute('data-id', orderId);

                    newRow.insertCell().textContent = order.nama;
                    newRow.insertCell().textContent = order.telepon;
                    newRow.insertCell().textContent = order.alamat;
                    newRow.insertCell().textContent = order.mobil || '-';
                    newRow.insertCell().textContent = order.deskripsi;

                    // KOLOM KOMPONEN RUSAK (EDITABLE)
                    const kerusakanCell = newRow.insertCell();
                    const kerusakanInput = document.createElement('input');
                    kerusakanInput.type = 'text';
                    kerusakanInput.classList.add('form-control', 'form-control-sm');
                    kerusakanInput.value = order.kerusakan || '';
                    kerusakanInput.setAttribute('data-field', 'kerusakan');
                    kerusakanCell.appendChild(kerusakanInput);

                    newRow.insertCell().textContent = order.tanggalKunjungan || '-';
                    newRow.insertCell().textContent = order.waktuKunjungan || '-';

                    // KOLOM STATUS PERBAIKAN (DROPDOWN)
                    const progresCell = newRow.insertCell();
                    const progresSelect = document.createElement('select');
                    progresSelect.classList.add('form-select', 'form-select-sm');
                    progresSelect.setAttribute('data-field', 'progres');

                    const statusOptions = [
                        { value: 'Belum diperbaiki', text: 'Belum diperbaiki' },
                        { value: 'Sedang diperbaiki', text: 'Sedang diperbaiki' },
                        { value: 'Selesai diperbaiki', text: 'Selesai diperbaiki' }
                    ];

                    statusOptions.forEach(option => {
                        const optElement = document.createElement('option');
                        optElement.value = option.value;
                        optElement.textContent = option.text;
                        if (order.progres === option.value) {
                            optElement.selected = true;
                        }
                        progresSelect.appendChild(optElement);
                    });
                    progresCell.appendChild(progresSelect);

                    // === KOLOM HARGA (EDITABLE) ===
                    const hargaCell = newRow.insertCell();
                    const hargaInput = document.createElement('input');
                    hargaInput.type = 'number';
                    hargaInput.min = '0';
                    hargaInput.classList.add('form-control', 'form-control-sm');
                    hargaInput.value = order.harga !== undefined ? order.harga : 0;
                    hargaInput.setAttribute('data-field', 'harga');
                    hargaCell.appendChild(hargaInput);
                    // ==============================

                    const actionCell = newRow.insertCell(); // Kolom Aksi

                    const saveButton = document.createElement('button');
                    saveButton.classList.add('btn', 'btn-primary', 'btn-sm', 'me-2');
                    saveButton.textContent = 'Simpan';
                    saveButton.setAttribute('data-id', orderId);
                    actionCell.appendChild(saveButton);

                    // --- Event Listener Tombol Simpan ---
                    saveButton.addEventListener('click', () => {
                        const newKerusakan = kerusakanInput.value;
                        const newProgres = progresSelect.value;
                        const newHarga = parseFloat(hargaInput.value);

                        updateOrderDetails(orderId, {
                            kerusakan: newKerusakan,
                            progres: newProgres,
                            harga: newHarga
                        });
                    });

                    // --- LOGIKA MENAMPILKAN TOMBOL "LANJUT KE KEUANGAN" setelah Simpan ---
                    // Ini akan muncul setelah admin mengubah progres menjadi "Selesai diperbaiki"
                    // (tombol "Hapus" tidak ada lagi di sini)
                    if (order.progres === 'Selesai diperbaiki' && order.status === 'Disetujui') {
                         // Jika pesanan sudah selesai, tambahkan tombol "Lanjut ke Keuangan"
                         // Ini akan berguna jika halaman di-refresh dan pesanan sudah Selesai diperbaiki
                         const financeLink = document.createElement('a');
                         financeLink.href = `keuangan.html?orderId=${orderId}`; // Lewatkan ID pesanan
                         financeLink.classList.add('btn', 'btn-info', 'btn-sm', 'ms-2'); // ms-2 untuk margin kiri
                         financeLink.textContent = 'Keuangan';
                         actionCell.appendChild(financeLink);
                         // Tombol simpan mungkin perlu disembunyikan atau diganti di sini
                         saveButton.style.display = 'none';
                    } else {
                         // Jika belum selesai, pastikan tombol simpan ada
                         saveButton.style.display = 'inline-block';
                    }

                    // --- TOMBOL HAPUS TIDAK ADA LAGI DI SINI ---
                } 
            });

            if (!hasRelevantOrders) {
                orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center">Belum ada pesanan yang disetujui dan sedang dalam perbaikan.</td></tr>'; // Colspan 10
            }

        } else {
            orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center">Belum ada pesanan.</td></tr>'; // Colspan 10
        }
    }, (error) => {
        console.error("Error fetching orders:", error);
        orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Gagal memuat data pesanan. Mohon periksa koneksi internet Anda.</td></tr>'; // Colspan 10
        showToast('Gagal memuat data pesanan.', 'error');
    });

    /*
    // Event listener untuk tombol Konfirmasi Hapus (Dihapus dari sini)
    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', () => {
            if (orderIdToDelete) {
                // deleteOrder(orderIdToDelete); // Fungsi deleteOrder juga dihapus
                // deleteModal.hide();
                // orderIdToDelete = null;
            }
        });
    }
    */

    function updateOrderDetails(orderId, updates) {
        const orderRef = ref(database, `Pelanggan/${orderId}`);
        update(orderRef, updates)
            .then(() => {
                showToast(`Detail pesanan berhasil diperbarui.`);
                
                // --- Setelah update berhasil, jika progresnya "Selesai diperbaiki",
                // --- kita perlu menampilkan tombol "Lanjut ke Keuangan" SECARA LANGSUNG
                // --- TANPA MENUNGGU onValue() trigger.
                if (updates.progres === 'Selesai diperbaiki') {
                    const rowElement = document.querySelector(`tr[data-id="${orderId}"]`);
                    if (rowElement) {
                        const actionCell = rowElement.cells[9]; // Asumsi kolom aksi adalah kolom ke-10 (indeks 9)
                        actionCell.innerHTML = ''; // Hapus tombol Simpan/Hapus
                        
                        const financeLink = document.createElement('a');
                        financeLink.href = `keuangan.html?orderId=${orderId}`; // Lewatkan ID pesanan
                        financeLink.classList.add('btn', 'btn-info', 'btn-sm', 'w-100'); // Tombol penuh lebar
                        financeLink.textContent = 'Lanjut ke Keuangan';
                        actionCell.appendChild(financeLink);
                        showToast(`Pesanan ${orderId} selesai. Lanjut ke Keuangan.`, 'info');
                    }
                }
                // Pesanan yang 'Selesai diperbaiki' akan hilang dari tabel ini saat onValue() berikutnya terpicu
                // karena filter di atas, tetapi user sudah melihat tombol Lanjut Keuangan.
            })
            .catch((error) => {
                console.error("Error memperbarui detail pesanan:", error);
                showToast(`Gagal mengubah detail pesanan. Mohon coba lagi.`, 'error');
            });
    }
    /*
    // Fungsi deleteOrder (Dihapus dari sini)
    function deleteOrder(orderId) {
        const orderRef = ref(database, `Pelanggan/${orderId}`);
        remove(orderRef)
            .then(() => {
                showToast(`Data pesanan berhasil dihapus.`, 'success');
            })
            .catch((error) => {
                console.error("Error menghapus data:", error);
                showToast(`Gagal menghapus data pesanan. Mohon coba lagi.`, 'error');
            });
    }
    */
});
