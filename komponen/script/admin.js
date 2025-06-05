// admin.js
import { ref, onValue, update } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
// Hapus 'remove' karena tidak akan digunakan lagi di sini

document.addEventListener('DOMContentLoaded', () => {
    const orderTableBody = document.getElementById('orderTableBody');
    const database = window.firebaseDatabase;

    if (!database) {
        console.error("Firebase Realtime Database belum diinisialisasi.");
        // Sesuaikan colspan menjadi 9 (dari 10) karena 1 kolom (Aksi) dihapus
        orderTableBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Terjadi kesalahan saat menghubungkan ke database. Mohon coba lagi.</td></tr>';
        return;
    }

    const ordersRef = ref(database, 'Pelanggan');

    onValue(ordersRef, (snapshot) => {
        const orders = snapshot.val();
        orderTableBody.innerHTML = ''; // Hapus baris sebelumnya

        if (orders) {
            let hasPendingOrders = false; // Flag untuk melacak apakah ada pesanan yang menunggu

            Object.keys(orders).forEach(orderId => {
                const order = orders[orderId];

                // Hanya tampilkan pesanan yang statusnya 'menunggu' atau belum diatur.
                // Jika sudah 'Disetujui' atau 'Tidak Disetujui', jangan tampilkan di admin.html
                if (order.status !== 'Disetujui' && order.status !== 'Tidak Disetujui') {
                    hasPendingOrders = true; // Set flag
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

                    // Tombol 'Setujui' dan 'Tolak' hanya muncul jika statusnya 'menunggu'
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

                    // --- HAPUS KODE UNTUK KOLOM AKSI DAN TOMBOL HAPUS DARI SINI ---
                    // const actionCell = newRow.insertCell();
                    // const deleteButton = document.createElement('button');
                    // deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
                    // deleteButton.textContent = 'Hapus';
                    // deleteButton.setAttribute('data-id', orderId);
                    // actionCell.appendChild(deleteButton);
                    // deleteButton.addEventListener('click', (e) => {
                    //     const idToDelete = e.target.dataset.id;
                    //     if (confirm(`Anda yakin ingin menghapus data ini?`)) {
                    //         deleteOrder(idToDelete);
                    //     }
                    // });
                    // --- HINGGA SINI ---
                }
            });

            // Periksa jika tidak ada pesanan 'menunggu' yang ditampilkan
            if (!hasPendingOrders) {
                // Sesuaikan colspan menjadi 9
                orderTableBody.innerHTML = '<tr><td colspan="9" class="text-center">Tidak ada pemesanan yang menunggu.</td></tr>';
            }

        } else {
            // Sesuaikan colspan menjadi 9
            orderTableBody.innerHTML = '<tr><td colspan="9" class="text-center">Belum ada pemesanan.</td></tr>';
        }
    }, (error) => {
        console.error("Error fetching orders: ", error);
        // Sesuaikan colspan menjadi 9
        orderTableBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Gagal memuat data pemesanan. Mohon periksa koneksi internet Anda.</td></tr>';
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

    // --- HAPUS FUNGSI deleteOrder KARENA TIDAK DIGUNAKAN DI SINI LAGI ---
    // function deleteOrder(orderId) {
    //     const orderRef = ref(database, `Pelanggan/${orderId}`);
    //     remove(orderRef)
    //         .then(() => {
    //             console.log(`Data pesanan ${orderId} berhasil dihapus.`);
    //         })
    //         .catch((error) => {
    //             console.error("Error menghapus data: ", error);
    //             alert(`Gagal menghapus data pesanan ${orderId}. Mohon coba lagi.`);
    //         });
    // }
    // --- HINGGA SINI ---
});