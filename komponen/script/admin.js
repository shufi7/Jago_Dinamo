import { ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js"; // Import 'remove'

document.addEventListener('DOMContentLoaded', () => {
    const orderTableBody = document.getElementById('orderTableBody');

    const database = window.firebaseDatabase;

    if (!database) {
        console.error("Firebase Realtime Database belum diinisialisasi.");
        orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Terjadi kesalahan saat menghubungkan ke database. Mohon coba lagi.</td></tr>'; // Ubah colspan ke 10
        return;
    }

    const ordersRef = ref(database, 'Pelanggan');

    onValue(ordersRef, (snapshot) => {
        const orders = snapshot.val();
        orderTableBody.innerHTML = ''; // Hapus baris sebelumnya sebelum merender ulang

        if (orders) {
            Object.keys(orders).forEach(orderId => {
                const order = orders[orderId];
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
            });

        } else {
            orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center">Belum ada pemesanan.</td></tr>'; // Ubah colspan ke 10
        }
    }, (error) => {
        console.error("Error fetching orders: ", error);
        orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Gagal memuat data pemesanan. Mohon periksa koneksi internet Anda.</td></tr>'; // Ubah colspan ke 10
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
});