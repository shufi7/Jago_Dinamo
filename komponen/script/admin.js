import { ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    const orderTableBody = document.getElementById('orderTableBody');
    const database = window.firebaseDatabase;

    if (!database) {
        console.error("Firebase Realtime Database belum diinisialisasi.");
        orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Terjadi kesalahan saat menghubungkan ke database. Mohon coba lagi.</td></tr>';
        return;
    }

    const ordersRef = ref(database, 'Pelanggan');

    onValue(ordersRef, (snapshot) => {
        const orders = snapshot.val();
        orderTableBody.innerHTML = ''; // Hapus baris sebelumnya

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
                statusCell.classList.add('text-center'); // Pusatkan konten sel status

                // Logika untuk menampilkan tombol atau ikon berdasarkan status
                if (order.status === 'Disetujui') {
                    statusCell.innerHTML = '<span class="text-success fs-4">&#10003;</span>'; // Tanda centang hijau
                } else if (order.status === 'Tidak Disetujui') {
                    statusCell.innerHTML = '<span class="text-danger fs-4">&#10006;</span>'; // Tanda silang merah
                } else {
                    // Jika status 'menunggu' atau belum diatur, tampilkan tombol
                    const approveButton = document.createElement('button');
                    approveButton.classList.add('btn', 'btn-success', 'btn-sm', 'me-2');
                    approveButton.textContent = 'Terima';
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

                // Sel untuk tombol hapus
                const actionCell = newRow.insertCell();
                const deleteButton = document.createElement('button');
                deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
                deleteButton.textContent = 'Hapus';
                deleteButton.setAttribute('data-id', orderId);
                actionCell.appendChild(deleteButton);

                deleteButton.addEventListener('click', (e) => {
                    const idToDelete = e.target.dataset.id;
                    if (confirm(`Anda yakin ingin menghapus data ini?`)) {
                        deleteOrder(idToDelete);
                    }
                });
            });

        } else {
            orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center">Belum ada pemesanan.</td></tr>';
        }
    }, (error) => {
        console.error("Error fetching orders: ", error);
        orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Gagal memuat data pemesanan. Mohon periksa koneksi internet Anda.</td></tr>';
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

    function deleteOrder(orderId) {
        const orderRef = ref(database, `Pelanggan/${orderId}`);
        remove(orderRef)
            .then(() => {
                console.log(`Data pesanan ${orderId} berhasil dihapus.`);
            })
            .catch((error) => {
                console.error("Error menghapus data: ", error);
                alert(`Gagal menghapus data pesanan ${orderId}. Mohon coba lagi.`);
            });
    }
});