import { ref, onValue, update } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    const orderTableBody = document.getElementById('orderTableBody');
    const database = window.firebaseDatabase;

    if (!database) {
        console.error("Firebase Realtime Database belum diinisialisasi.");
        orderTableBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Terjadi kesalahan saat menghubungkan ke database. Mohon coba lagi.</td></tr>';
        return;
    }

    const ordersRef = ref(database, 'Pelanggan');

    onValue(ordersRef, (snapshot) => {
        const orders = snapshot.val();
        orderTableBody.innerHTML = ''; 

        if (orders) {
            let hasPendingOrders = false; 

            Object.keys(orders).forEach(orderId => {
                const order = orders[orderId];

                if (order.status !== 'Disetujui' && order.status !== 'Tidak Disetujui') {
                    hasPendingOrders = true; 
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
            });

            if (!hasPendingOrders) {
                orderTableBody.innerHTML = '<tr><td colspan="9" class="text-center">Tidak ada pemesanan yang menunggu.</td></tr>';
            }

        } else {
            orderTableBody.innerHTML = '<tr><td colspan="9" class="text-center">Belum ada pemesanan.</td></tr>';
        }
    }, (error) => {
        console.error("Error fetching orders: ", error);
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
});