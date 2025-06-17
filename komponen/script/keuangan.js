import { ref, onValue, update, remove, set } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js"; // Added 'set' to imports

document.addEventListener('DOMContentLoaded', () => {
    const financeTableBody = document.getElementById('financeTableBody');
    const database = window.firebaseDatabase;

    // Elemen Toast
    const liveToastElement = document.getElementById('liveToast');
    const toastMessageElement = document.getElementById('toastMessage');
    let liveToast;

    // Elemen Modal Keuangan
    const financeModalElement = document.getElementById('financeModal');
    const financeModalLabel = document.getElementById('financeModalLabel');
    const financeForm = document.getElementById('financeForm');
    const financeOrderIdInput = document.getElementById('financeOrderId');
    const modalNamaPelanggan = document.getElementById('modalNamaPelanggan');
    const modalJenisKendaraan = document.getElementById('modalJenisKendaraan');
    const modalKerusakan = document.getElementById('modalKerusakan');
    const hargaServiceInput = document.getElementById('hargaService');
    const hargaModalInput = document.getElementById('hargaModal');
    const barangDigunakanContainer = document.getElementById('barangDigunakanContainer');
    const addBarangButton = document.getElementById('addBarangButton');
    const saveFinanceDataButton = document.getElementById('saveFinanceDataButton');
    let financeModal;

    // Elemen Modal Konfirmasi Hapus
    const deleteConfirmationModalElement = document.getElementById('deleteConfirmationModal');
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    let deleteModal; // Variabel untuk instance Modal
    let orderIdToDelete = null; // Menyimpan ID pesanan yang akan dihapus sementara

    // Inisialisasi Toast dan Modal
    if (liveToastElement) {
        liveToast = new bootstrap.Toast(liveToastElement, { autohide: true, delay: 3000 });
    }
    if (financeModalElement) {
        financeModal = new bootstrap.Modal(financeModalElement);
    }
    if (deleteConfirmationModalElement) {
        deleteModal = new bootstrap.Modal(deleteConfirmationModalElement);
    }

    // Fungsi untuk menampilkan Toast
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
        financeTableBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Terjadi kesalahan saat menghubungkan ke database. Mohon coba lagi.</td></tr>';
        showToast('Terjadi kesalahan saat menghubungkan ke database.', 'error');
        return;
    }

    const ordersRef = ref(database, 'Pelanggan');
    const adminSummaryRef = ref(database, 'admin_summary'); // Added admin_summary reference

    // Function to re-calculate and update admin_summary
    async function updateAdminSummary() {
        const allOrdersSnapshot = await new Promise((resolve) => {
            onValue(ordersRef, (snapshot) => {
                resolve(snapshot);
            }, { onlyOnce: true }); // Use onlyOnce to get current data and then detach
        });
        const allOrders = allOrdersSnapshot.val() || {};

        let totalRevenueMonth = 0;
        let grossRevenue = 0;
        let totalModal = 0;
        let usedItemsAggregation = {};

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        Object.keys(allOrders).forEach(id => {
            const order = allOrders[id];
            if (order.status === 'Disetujui' && order.progres === 'Selesai diperbaiki') {
                const orderDate = order.tanggalKunjungan ? new Date(order.tanggalKunjungan) : null;

                if (order.harga_service) {
                    grossRevenue += order.harga_service;
                }
                if (order.harga_modal) {
                    totalModal += order.harga_modal;
                }

                if (orderDate && orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
                    if (order.harga_service) {
                        totalRevenueMonth += order.harga_service;
                    }
                }

                if (order.barang_dipakai && order.barang_dipakai.length > 0) {
                    order.barang_dipakai.forEach(item => {
                        if (item.nama_barang && item.jumlah_stok) {
                            usedItemsAggregation[item.nama_barang] = (usedItemsAggregation[item.nama_barang] || 0) + item.jumlah_stok;
                        }
                    });
                }
            }
        });

        const netRevenue = grossRevenue - totalModal;

        try {
            await set(adminSummaryRef, {
                total_revenue_month: totalRevenueMonth,
                gross_revenue: grossRevenue,
                net_revenue: netRevenue,
                used_items_total: usedItemsAggregation
            });
            console.log('Admin summary updated successfully.');
        } catch (error) {
            console.error('Error updating admin summary:', error);
            showToast('Gagal memperbarui ringkasan admin.', 'error');
        }
    }


    onValue(ordersRef, (snapshot) => {
        const orders = snapshot.val();
        financeTableBody.innerHTML = '';
        let hasCompletedOrders = false;

        if (orders) {
            Object.keys(orders).forEach(orderId => {
                const order = orders[orderId];

                // Hanya tampilkan pesanan yang statusnya 'Disetujui' DAN progresnya 'Selesai diperbaiki'
                if (order.status === 'Disetujui' && order.progres === 'Selesai diperbaiki') {
                    hasCompletedOrders = true;
                    const newRow = financeTableBody.insertRow();

                    newRow.insertCell().textContent = order.nama;
                    newRow.insertCell().textContent = order.mobil || '-';
                    newRow.insertCell().textContent = order.deskripsi;
                    newRow.insertCell().textContent = order.kerusakan || '-';
                    newRow.insertCell().textContent = order.progres || '-';
                    
                    // Tampilkan harga service dan modal dari Firebase jika sudah ada
                    newRow.insertCell().textContent = order.harga_service ? `Rp ${order.harga_service.toLocaleString('id-ID')}` : 'Belum diinput';
                    newRow.insertCell().textContent = order.harga_modal ? `Rp ${order.harga_modal.toLocaleString('id-ID')}` : 'Belum diinput';
                    
                    // Tampilkan barang dipakai
                    const barangCell = newRow.insertCell();
                    if (order.barang_dipakai && order.barang_dipakai.length > 0) {
                        const ul = document.createElement('ul');
                        ul.classList.add('list-unstyled', 'mb-0');
                        order.barang_dipakai.forEach(item => {
                            if (item.nama_barang && item.jumlah_stok) {
                                const li = document.createElement('li');
                                li.textContent = `${item.nama_barang} (${item.jumlah_stok})`;
                                ul.appendChild(li);
                            }
                        });
                        barangCell.appendChild(ul);
                    } else {
                        barangCell.textContent = 'Belum diinput';
                    }

                    const actionCell = newRow.insertCell();
                    const editButton = document.createElement('button');
                    editButton.classList.add('btn', 'btn-info', 'btn-sm', 'me-2');
                    editButton.textContent = 'Input Keuangan';
                    editButton.setAttribute('data-id', orderId);
                    
                    editButton.addEventListener('click', () => openFinanceModal(orderId, order));
                    actionCell.appendChild(editButton);

                    // Tambahkan tombol hapus
                    const deleteButton = document.createElement('button');
                    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
                    deleteButton.textContent = 'Hapus';
                    deleteButton.setAttribute('data-id', orderId);
                    actionCell.appendChild(deleteButton);

                    deleteButton.addEventListener('click', (e) => {
                        orderIdToDelete = e.target.dataset.id; // Simpan ID untuk modal
                        if (deleteModal) {
                            deleteModal.show(); // Tampilkan modal konfirmasi
                        } else {
                            // Fallback jika modal belum diinisialisasi
                            if (confirm(`Anda yakin ingin menghapus data pemesanan dari ${order.nama} ini?`)) {
                                deleteOrder(orderIdToDelete);
                            }
                        }
                    });
                }
            });

            if (!hasCompletedOrders) {
                financeTableBody.innerHTML = '<tr><td colspan="9" class="text-center">Belum ada pesanan yang selesai diperbaiki.</td></tr>';
            }

        } else {
            financeTableBody.innerHTML = '<tr><td colspan="9" class="text-center">Belum ada pesanan.</td></tr>';
        }
    }, (error) => {
        console.error("Error fetching orders:", error);
        financeTableBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Gagal memuat data keuangan. Mohon periksa koneksi internet Anda.</td></tr>';
        showToast('Gagal memuat data keuangan.', 'error');
    });

    // Event listener untuk tombol 'Hapus' di dalam modal konfirmasi
    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', () => {
            if (orderIdToDelete) {
                deleteOrder(orderIdToDelete);
                deleteModal.hide(); // Sembunyikan modal setelah aksi
                orderIdToDelete = null; // Reset ID
            }
        });
    }

    // Fungsi untuk menghapus pesanan
    function deleteOrder(orderId) {
        const orderRef = ref(database, `Pelanggan/${orderId}`);
        remove(orderRef)
            .then(async () => {
                console.log(`Data pesanan ${orderId} berhasil dihapus.`);
                showToast(`Data pesanan berhasil dihapus.`, 'success');
                await updateAdminSummary(); // Recalculate and update admin_summary after deletion
            })
            .catch((error) => {
                console.error("Error menghapus data: ", error);
                showToast(`Gagal menghapus data pesanan.`, 'error');
            });
    }

    // --- Logika Modal Keuangan ---
    function openFinanceModal(orderId, orderData) {
        financeOrderIdInput.value = orderId;
        modalNamaPelanggan.value = orderData.nama || '';
        modalJenisKendaraan.value = orderData.mobil || '';
        modalKerusakan.value = orderData.kerusakan || '';
        
        hargaServiceInput.value = orderData.harga_service || 0;
        hargaModalInput.value = orderData.harga_modal || 0;

        // Bersihkan dan isi input barang yang digunakan
        barangDigunakanContainer.innerHTML = ''; // Kosongkan container
        if (orderData.barang_dipakai && orderData.barang_dipakai.length > 0) {
            orderData.barang_dipakai.forEach(item => {
                addBarangInputField(item.nama_barang, item.jumlah_stok);
            });
        } else {
            addBarangInputField(); // Tambahkan satu baris kosong jika belum ada barang
        }

        financeModal.show();
    }

    // Fungsi untuk menambah baris input barang dinamis
    function addBarangInputField(namaBarang = '', jumlahStok = '') {
        const div = document.createElement('div');
        div.classList.add('row', 'mb-3', 'barang-item-row');
        div.innerHTML = `
            <div class="col-6">
                <input type="text" class="form-control barang-nama" placeholder="Nama Barang" value="${namaBarang}">
            </div>
            <div class="col-4">
                <input type="number" class="form-control barang-stok" min="0" placeholder="Jumlah Stok" value="${jumlahStok}">
            </div>
            <div class="col-2 d-flex align-items-end">
                <button type="button" class="btn btn-danger btn-sm remove-barang-btn w-100"><i class="bi bi-x-lg"></i></button>
            </div>
        `;
        barangDigunakanContainer.appendChild(div);

        // Tambahkan event listener untuk tombol hapus pada baris baru
        div.querySelector('.remove-barang-btn').addEventListener('click', (e) => {
            e.target.closest('.barang-item-row').remove();
        });
    }

    addBarangButton.addEventListener('click', () => addBarangInputField());

    // Event listener untuk menyimpan data keuangan
    financeForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const orderId = financeOrderIdInput.value;
        const hargaService = parseFloat(hargaServiceInput.value);
        const hargaModal = parseFloat(hargaModalInput.value);

        const barangDipakai = [];
        document.querySelectorAll('#barangDigunakanContainer .barang-item-row').forEach(row => {
            const namaBarang = row.querySelector('.barang-nama').value.trim();
            const jumlahStok = parseFloat(row.querySelector('.barang-stok').value);
            if (namaBarang && !isNaN(jumlahStok) && jumlahStok >= 0) {
                barangDipakai.push({ nama_barang: namaBarang, jumlah_stok: jumlahStok });
            }
        });

        const updates = {
            harga_service: hargaService,
            harga_modal: hargaModal,
            barang_dipakai: barangDipakai.length > 0 ? barangDipakai : null // Simpan null jika tidak ada barang
        };

        const orderRef = ref(database, `Pelanggan/${orderId}`);
        try {
            await update(orderRef, updates); // First, update the specific order details
            showToast('Data keuangan berhasil disimpan!', 'success');
            financeModal.hide();
            await updateAdminSummary(); // Recalculate and update admin_summary after saving
        } catch (error) {
            console.error("Error menyimpan data keuangan:", error);
            showToast('Gagal menyimpan data keuangan. Mohon coba lagi.', 'error');
        }
    });
});