import { ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    const orderTableBody = document.getElementById('orderTableBody');
    const database = window.firebaseDatabase;

    // Elemen Toast
    const liveToastElement = document.getElementById('liveToast');
    const toastMessageElement = document.getElementById('toastMessage');
    let liveToast;

    // Elemen Modal Konfirmasi Hapus
    const deleteConfirmationModalElement = document.getElementById('deleteConfirmationModal');
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    let deleteModal;
    let orderIdToDelete = null;

    // Inisialisasi Toast dan Modal setelah DOMContentLoaded
    if (liveToastElement) {
        liveToast = new bootstrap.Toast(liveToastElement, {
            autohide: true,
            delay: 3000
        });
    }
    if (deleteConfirmationModalElement) {
        deleteModal = new bootstrap.Modal(deleteConfirmationModalElement);
    }

    // Fungsi untuk menampilkan Toast
    function showToast(message, type = 'success') {
        if (liveToastElement && toastMessageElement) {
            toastMessageElement.textContent = message;
            liveToastElement.classList.remove('bg-success', 'bg-danger');
            if (type === 'success') {
                liveToastElement.classList.add('bg-success');
            } else if (type === 'error') {
                liveToastElement.classList.add('bg-danger');
            }
            liveToast.show();
        }
    }

    if (!database) {
        console.error("Firebase Realtime Database belum diinisialisasi.");
        // Sesuaikan colspan jadi 11 (sebelumnya 10, tambah 1 untuk harga)
        orderTableBody.innerHTML = '<tr><td colspan="11" class="text-center text-danger">Terjadi kesalahan saat menghubungkan ke database. Mohon coba lagi.</td></tr>';
        return;
    }

    const ordersRef = ref(database, 'Pelanggan');

    onValue(ordersRef, (snapshot) => {
        const orders = snapshot.val();
        orderTableBody.innerHTML = '';

        if (orders) {
            let hasApprovedOrders = false;

            Object.keys(orders).forEach(orderId => {
                const order = orders[orderId];

                if (order.status === 'Disetujui') {
                    hasApprovedOrders = true;
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

                    // === KOLOM HARGA BARU (EDITABLE) ===
                    const hargaCell = newRow.insertCell();
                    const hargaInput = document.createElement('input');
                    hargaInput.type = 'number'; // Tipe number untuk angka
                    hargaInput.min = '0'; // Harga tidak bisa negatif
                    hargaInput.classList.add('form-control', 'form-control-sm');
                    // Pastikan harga diambil dari Firebase atau default 0
                    hargaInput.value = order.harga !== undefined ? order.harga : 0;
                    hargaInput.setAttribute('data-field', 'harga');
                    hargaCell.appendChild(hargaInput);
                    // ==================================

                    const actionCell = newRow.insertCell();

                    const saveButton = document.createElement('button');
                    saveButton.classList.add('btn', 'btn-primary', 'btn-sm', 'me-2');
                    saveButton.textContent = 'Simpan';
                    saveButton.setAttribute('data-id', orderId);
                    actionCell.appendChild(saveButton);

                    const deleteButton = document.createElement('button');
                    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
                    deleteButton.textContent = 'Hapus';
                    deleteButton.setAttribute('data-id', orderId);
                    actionCell.appendChild(deleteButton);

                    saveButton.addEventListener('click', () => {
                        const newKerusakan = kerusakanInput.value;
                        const newProgres = progresSelect.value;
                        const newHarga = parseFloat(hargaInput.value); // Ambil nilai harga sebagai float/number

                        updateOrderDetails(orderId, {
                            kerusakan: newKerusakan,
                            progres: newProgres,
                            harga: newHarga // Sertakan harga di sini
                        });
                    });

                    deleteButton.addEventListener('click', (e) => {
                        orderIdToDelete = e.target.dataset.id;
                        if (deleteModal) {
                            deleteModal.show();
                        } else {
                            if (confirm(`Anda yakin ingin menghapus data ini?`)) {
                                deleteOrder(orderIdToDelete);
                            }
                        }
                    });
                }
            });

            if (!hasApprovedOrders) {
                // Sesuaikan colspan jadi 11
                orderTableBody.innerHTML = '<tr><td colspan="11" class="text-center">Belum ada pemesanan yang disetujui.</td></tr>';
            }

        } else {
            // Sesuaikan colspan jadi 11
            orderTableBody.innerHTML = '<tr><td colspan="11" class="text-center">Belum ada pemesanan.</td></tr>';
        }
    }, (error) => {
        console.error("Error fetching orders: ", error);
        // Sesuaikan colspan jadi 11
        orderTableBody.innerHTML = '<tr><td colspan="11" class="text-center text-danger">Gagal memuat data pemesanan. Mohon periksa koneksi internet Anda.</td></tr>';
        showToast('Gagal memuat data pemesanan.', 'error');
    });

    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', () => {
            if (orderIdToDelete) {
                deleteOrder(orderIdToDelete);
                deleteModal.hide();
                orderIdToDelete = null;
            }
        });
    }

    function updateOrderDetails(orderId, updates) {
        const orderRef = ref(database, `Pelanggan/${orderId}`);
        update(orderRef, updates)
            .then(() => {
                showToast(`Detail pesanan berhasil diperbarui.`);
            })
            .catch((error) => {
                console.error("Error memperbarui detail pesanan: ", error);
                showToast(`Gagal mengubah detail pesanan. Mohon coba lagi.`, 'error');
            });
    }

    function deleteOrder(orderId) {
        const orderRef = ref(database, `Pelanggan/${orderId}`);
        remove(orderRef)
            .then(() => {
                showToast(`Data pesanan berhasil dihapus.`, 'error');
            })
            .catch((error) => {
                console.error("Error menghapus data: ", error);
                showToast(`Gagal menghapus data pesanan. Mohon coba lagi.`, 'error');
            });
    }
});