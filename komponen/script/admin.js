<<<<<<< HEAD
import { ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js"; // Import 'remove'
=======
import { ref, onValue, update } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
>>>>>>> 85d5a54a8244e8848a34d1367bdfe0e4e81c055e

document.addEventListener('DOMContentLoaded', () => {
    const orderTableBody = document.getElementById('orderTableBody');

    const database = window.firebaseDatabase;

    if (!database) {
        console.error("Firebase Realtime Database belum diinisialisasi.");
<<<<<<< HEAD
        orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Terjadi kesalahan saat menghubungkan ke database. Mohon coba lagi.</td></tr>'; // Ubah colspan ke 10
=======
        orderTableBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Terjadi kesalahan saat menghubungkan ke database. Mohon coba lagi.</td></tr>';
>>>>>>> 85d5a54a8244e8848a34d1367bdfe0e4e81c055e
        return;
    }

    const ordersRef = ref(database, 'Pelanggan');

    onValue(ordersRef, (snapshot) => {
        const orders = snapshot.val();
<<<<<<< HEAD
        orderTableBody.innerHTML = ''; // Hapus baris sebelumnya sebelum merender ulang
=======
        orderTableBody.innerHTML = ''; 
>>>>>>> 85d5a54a8244e8848a34d1367bdfe0e4e81c055e

        if (orders) {
            let hasPendingOrders = false; 

            Object.keys(orders).forEach(orderId => {
                const order = orders[orderId];

                if (order.status !== 'Disetujui' && order.status !== 'Tidak Disetujui') {
                    hasPendingOrders = true; 
                    const newRow = orderTableBody.insertRow();

<<<<<<< HEAD
                const statusCell = newRow.insertCell();
                const statusSelect = document.createElement('select');
                statusSelect.classList.add('form-select');
                statusSelect.setAttribute('data-id', orderId);
                statusSelect.innerHTML = `
                    <option value="Disetujui" ${order.status === 'Disetujui' ? 'selected' : ''}>Disetujui</option>
                    <option value="Tidak Disetujui" ${order.status === 'Tidak Disetujui' ? 'selected' : ''}>Tidak Disetujui</option>
                    <option value="menunggu" ${order.status === 'menunggu' ? 'selected' : ''}>Menunggu Disetujui</option>
                `;
                statusCell.appendChild(statusSelect);

                // Tambahkan event listener untuk perubahan status
                statusSelect.addEventListener('change', (e) => {
                    const changedOrderId = e.target.dataset.id;
                    const newStatus = e.target.value;
                    updateOrderStatus(changedOrderId, newStatus);
                });

                // SEL BARU UNTUK TOMBOL HAPUS
                const actionCell = newRow.insertCell();
                const deleteButton = document.createElement('button');
                deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
                deleteButton.textContent = 'Hapus';
                deleteButton.setAttribute('data-id', orderId); // Simpan ID pesanan di tombol hapus
                actionCell.appendChild(deleteButton);

                // Tambahkan event listener untuk tombol hapus
                deleteButton.addEventListener('click', (e) => {
                    const idToDelete = e.target.dataset.id;
                    if (confirm(`Anda yakin ingin menghapus data ini?`)) { // Konfirmasi penghapusan
                        deleteOrder(idToDelete);
                    }
                });
=======
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
                }
>>>>>>> 85d5a54a8244e8848a34d1367bdfe0e4e81c055e
            });

            if (!hasPendingOrders) {
                orderTableBody.innerHTML = '<tr><td colspan="9" class="text-center">Tidak ada pemesanan yang menunggu.</td></tr>';
            }

        } else {
<<<<<<< HEAD
            orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center">Belum ada pemesanan.</td></tr>'; // Ubah colspan ke 10
        }
    }, (error) => {
        console.error("Error fetching orders: ", error);
        orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Gagal memuat data pemesanan. Mohon periksa koneksi internet Anda.</td></tr>'; // Ubah colspan ke 10
=======
            orderTableBody.innerHTML = '<tr><td colspan="9" class="text-center">Belum ada pemesanan.</td></tr>';
        }
    }, (error) => {
        console.error("Error fetching orders: ", error);
        orderTableBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Gagal memuat data pemesanan. Mohon periksa koneksi internet Anda.</td></tr>';
>>>>>>> 85d5a54a8244e8848a34d1367bdfe0e4e81c055e
    });

    function updateOrderStatus(orderId, newStatus) {
        const orderRef = ref(database, `Pelanggan/${orderId}`);
        update(orderRef, { status: newStatus })
            .then(() => {
                console.log(`Status pesanan ${orderId} diperbarui menjadi ${newStatus}`);
            })
            .catch((error) => {
                console.error("Error memperbarui status: ", error);
                alert(`Gagal mengubah status pemesanan ${orderId}. Mohon coba lagi.`);
            });
    }
<<<<<<< HEAD

    // FUNGSI BARU UNTUK MENGHAPUS DATA
    function deleteOrder(orderId) {
        const orderRef = ref(database, `Pelanggan/${orderId}`);
        remove(orderRef)
            .then(() => {
                console.log(`Data pesanan ${orderId} berhasil dihapus.`);
                // UI akan otomatis diperbarui karena onValue listener
            })
            .catch((error) => {
                console.error("Error menghapus data: ", error);
                alert(`Gagal menghapus data pesanan ${orderId}. Mohon coba lagi.`);
            });
    }
=======
>>>>>>> 85d5a54a8244e8848a34d1367bdfe0e4e81c055e
});