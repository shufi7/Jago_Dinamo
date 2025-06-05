// admin.js
import { ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    const orderTableBody = document.getElementById('orderTableBody');
    const database = window.firebaseDatabase;

    // Elemen Toast
    const liveToastElement = document.getElementById('liveToast');
    const toastMessageElement = document.getElementById('toastMessage');
    let liveToast; // Variabel untuk instance Toast

    // Elemen Modal Konfirmasi Hapus
    const deleteConfirmationModalElement = document.getElementById('deleteConfirmationModal');
    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
    let deleteModal; // Variabel untuk instance Modal
    let orderIdToDelete = null; // Menyimpan ID pesanan yang akan dihapus sementara

    // Inisialisasi Toast dan Modal setelah DOMContentLoaded
    // Pastikan Bootstrap JS sudah dimuat (bootstrap.bundle.min.js)
    if (liveToastElement) {
        liveToast = new bootstrap.Toast(liveToastElement, {
            autohide: true,
            delay: 3000 // Toast akan otomatis hilang setelah 3 detik
        });
    }
    if (deleteConfirmationModalElement) {
        deleteModal = new bootstrap.Modal(deleteConfirmationModalElement);
    }

    // Fungsi untuk menampilkan Toast
    function showToast(message, type = 'success') {
        if (liveToastElement && toastMessageElement && liveToast) {
            toastMessageElement.textContent = message;
            // Hapus semua kelas warna dan tambahkan yang baru
            liveToastElement.classList.remove('bg-success', 'bg-danger', 'bg-info', 'bg-warning');
            if (type === 'success') {
                liveToastElement.classList.add('bg-success');
            } else if (type === 'error' || type === 'danger') { // Menggunakan 'danger' untuk konsistensi Bootstrap
                liveToastElement.classList.add('bg-danger');
            } else if (type === 'info') {
                liveToastElement.classList.add('bg-info');
            } else if (type === 'warning') {
                liveToastElement.classList.add('bg-warning');
            }
            liveToast.show();
        }
    }

    if (!database) {
        console.error("Firebase Realtime Database belum diinisialisasi.");
        orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Terjadi kesalahan saat menghubungkan ke database. Mohon coba lagi.</td></tr>';
        showToast('Terjadi kesalahan saat menghubungkan ke database.', 'error'); // Tampilkan toast
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

                // Hanya tampilkan pesanan yang statusnya 'menunggu' atau 'Tidak Disetujui'.
                if (order.status === 'menunggu' || order.status === 'Tidak Disetujui') {
                    hasRelevantOrders = true;
                    const newRow = orderTableBody.insertRow();

                    newRow.insertCell().textContent = order.nama;
                    newRow.insertCell().textContent = order.telepon;
                    newRow.insertCell().textContent = order.alamat;
                    newRow.insertCell().textContent = order.mobil || '-';
                    newRow.insertCell().textContent = order.deskripsi;
                    newRow.insertCell().textContent = order.kerusakan || '-';
                    newRow.insertCell().textContent = order.tanggalKunjungan || '-';
                    newRow.insertCell().textContent = order.waktuKunjungan || '-';

                    const statusCell = newRow.insertCell();
                    statusCell.classList.add('text-center');

                    const actionCell = newRow.insertCell();

                    if (order.status === 'menunggu') {
                        const approveButton = document.createElement('button');
                        approveButton.classList.add('btn', 'btn-success', 'btn-sm', 'me-2');
                        approveButton.textContent = 'Setujui';
                        approveButton.setAttribute('data-id', orderId);
                        approveButton.addEventListener('click', () => updateOrderStatus(orderId, 'Disetujui'));

                        const rejectButton = document.createElement('button');
                        rejectButton.classList.add('btn', 'btn-danger', 'btn-sm');
                        rejectButton.textContent = 'Tolak';
                        rejectButton.setAttribute('data-id', orderId);
                        rejectButton.addEventListener('click', () => updateOrderStatus(orderId, 'Tidak Disetujui'));

                        statusCell.appendChild(approveButton);
                        statusCell.appendChild(rejectButton);

                    } else if (order.status === 'Tidak Disetujui') {
                        const statusText = document.createElement('span');
                        statusText.textContent = 'Tidak Disetujui';
                        statusText.classList.add('badge', 'bg-danger');
                        statusCell.appendChild(statusText);

                        const deleteButton = document.createElement('button');
                        deleteButton.classList.add('btn', 'btn-outline-danger', 'btn-sm', 'ms-2');
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
                }
            });

            if (!hasRelevantOrders) {
                orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center">Tidak ada pemesanan yang menunggu atau ditolak.</td></tr>';
            }

        } else {
            orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center">Belum ada pemesanan.</td></tr>';
        }
    }, (error) => {
        console.error("Error fetching orders: ", error);
        orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Gagal memuat data pemesanan. Mohon periksa koneksi internet Anda.</td></tr>';
        showToast('Gagal memuat data pemesanan.', 'error'); // Tampilkan toast
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

    function updateOrderStatus(orderId, newStatus) {
        const orderRef = ref(database, `Pelanggan/${orderId}`);
        update(orderRef, { status: newStatus })
            .then(() => {
                console.log(`Status pesanan ${orderId} diperbarui menjadi ${newStatus}`);
                showToast(`Status pesanan berhasil diperbarui menjadi "${newStatus}".`, 'success');
            })
            .catch((error) => {
                console.error("Error memperbarui status: ", error);
                showToast(`Gagal mengubah status pesanan.`, 'error');
            });
    }

    function deleteOrder(orderId) {
        const orderRef = ref(database, `Pelanggan/${orderId}`);
        remove(orderRef)
            .then(() => {
                console.log(`Data pesanan ${orderId} berhasil dihapus.`);
                showToast(`Data pesanan berhasil dihapus.`, 'success');
            })
            .catch((error) => {
                console.error("Error menghapus data: ", error);
                showToast(`Gagal menghapus data pesanan.`, 'error');
            });
    }
});
