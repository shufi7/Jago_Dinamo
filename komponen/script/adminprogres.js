import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
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
        getAnalytics(app);
        database = getDatabase(app);
        window.firebaseDatabase = database;
    }

    const orderTableBody = document.getElementById('orderTableBody');
    const liveToastElement = document.getElementById('liveToast');
    const toastMessageElement = document.getElementById('toastMessage');
    let liveToast;
    const deleteConfirmationModalElement = document.getElementById('deleteConfirmationModal');
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');

    if (liveToastElement) {
        liveToast = new bootstrap.Toast(liveToastElement, {
            autohide: true,
            delay: 3000
        });
    }

    function showToast(message, type = 'success') {
        if (liveToastElement && toastMessageElement && liveToast) {
            toastMessageElement.textContent = message;
            liveToastElement.classList.remove('bg-success', 'bg-danger', 'bg-info', 'bg-warning');
            if (type === 'success') { liveToastElement.classList.add('bg-success'); }
            else if (type === 'error' || type === 'danger') { liveToastElement.classList.add('bg-danger'); }
            else if (type === 'info') { liveToastElement.classList.add('bg-info'); }
            else if (type === 'warning') { liveToastElement.classList.add('bg-warning'); }
            liveToast.show();
        }
    }

    if (!database) {
        console.error("Firebase Realtime Database belum diinisialisasi.");
        orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Terjadi kesalahan saat menghubungkan ke database. Mohon coba lagi.</td></tr>';
        showToast('Terjadi kesalahan: Database tidak terhubung.', 'error');
        return;
    }

    const ordersRef = ref(database, 'Pelanggan');

    onValue(ordersRef, (snapshot) => {
        const orders = snapshot.val();
        orderTableBody.innerHTML = '';
        let hasRelevantOrders = false;

        if (orders) {
            Object.keys(orders).forEach(orderId => {
                const order = orders[orderId];
                if (order.status === 'Disetujui' && order.progres !== 'Selesai diperbaiki') {
                    hasRelevantOrders = true;
                    const newRow = orderTableBody.insertRow();
                    newRow.setAttribute('data-id', orderId);

                    newRow.insertCell().textContent = order.nama;
                    newRow.insertCell().textContent = order.telepon;
                    newRow.insertCell().textContent = order.alamat;
                    newRow.insertCell().textContent = order.mobil || '-';
                    newRow.insertCell().textContent = order.deskripsi;

                    const kerusakanCell = newRow.insertCell();
                    const kerusakanInput = document.createElement('input');
                    kerusakanInput.type = 'text';
                    kerusakanInput.classList.add('form-control', 'form-control-sm');
                    kerusakanInput.value = order.kerusakan || '';
                    kerusakanInput.setAttribute('data-field', 'kerusakan');
                    kerusakanCell.appendChild(kerusakanInput);

                    newRow.insertCell().textContent = order.tanggalKunjungan || '-';
                    newRow.insertCell().textContent = order.waktuKunjungan || '-';

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

                    const hargaCell = newRow.insertCell();
                    const hargaInput = document.createElement('input');
                    hargaInput.type = 'number';
                    hargaInput.min = '0';
                    hargaInput.classList.add('form-control', 'form-control-sm');
                    hargaInput.value = order.harga !== undefined ? order.harga : 0;
                    hargaInput.setAttribute('data-field', 'harga');
                    hargaCell.appendChild(hargaInput);

                    const actionCell = newRow.insertCell();
                    const saveButton = document.createElement('button');
                    saveButton.classList.add('btn', 'btn-primary', 'btn-sm', 'me-2');
                    saveButton.textContent = 'Simpan';
                    saveButton.setAttribute('data-id', orderId);
                    actionCell.appendChild(saveButton);

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

                    if (order.progres === 'Selesai diperbaiki' && order.status === 'Disetujui') {
                         const financeLink = document.createElement('a');
                         financeLink.href = `keuangan.html?orderId=${orderId}`;
                         financeLink.classList.add('btn', 'btn-info', 'btn-sm', 'ms-2');
                         financeLink.textContent = 'Keuangan';
                         actionCell.appendChild(financeLink);
                         saveButton.style.display = 'none';
                    } else {
                         saveButton.style.display = 'inline-block';
                    }
                } 
            });

            if (!hasRelevantOrders) {
                orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center">Belum ada pesanan yang disetujui dan sedang dalam perbaikan.</td></tr>';
            }

        } else {
            orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center">Belum ada pesanan.</td></tr>';
        }
    }, (error) => {
        console.error("Error fetching orders:", error);
        orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Gagal memuat data pesanan. Mohon periksa koneksi internet Anda.</td></tr>';
        showToast('Gagal memuat data pesanan.', 'error');
    });

    function updateOrderDetails(orderId, updates) {
        const orderRef = ref(database, `Pelanggan/${orderId}`);
        update(orderRef, updates)
            .then(() => {
                showToast(`Detail pesanan berhasil diperbarui.`);
                if (updates.progres === 'Selesai diperbaiki') {
                    const rowElement = document.querySelector(`tr[data-id="${orderId}"]`);
                    if (rowElement) {
                        const actionCell = rowElement.cells[9];
                        actionCell.innerHTML = '';
                        const financeLink = document.createElement('a');
                        financeLink.href = `keuangan.html?orderId=${orderId}`;
                        financeLink.classList.add('btn', 'btn-info', 'btn-sm', 'w-100');
                        financeLink.textContent = 'Lanjut ke Keuangan';
                        actionCell.appendChild(financeLink);
                        showToast(`Pesanan ${orderId} selesai. Lanjut ke Keuangan.`, 'info');
                    }
                }
            })
            .catch((error) => {
                console.error("Error memperbarui detail pesanan:", error);
                showToast(`Gagal mengubah detail pesanan. Mohon coba lagi.`, 'error');
            });
    }
});
