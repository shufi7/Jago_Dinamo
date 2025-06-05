import { ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    const orderTableBody = document.getElementById('orderTableBody');
    const database = window.firebaseDatabase;

    const liveToastElement = document.getElementById('liveToast');
    const toastMessageElement = document.getElementById('toastMessage');
    let liveToast;

    if (liveToastElement) {
        liveToast = new bootstrap.Toast(liveToastElement, {
            autohide: true,
            delay: 3000 
        });
    }

    
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
        orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Terjadi kesalahan saat menghubungkan ke database. Mohon coba lagi.</td></tr>';
        return;
    }

    const ordersRef = ref(database, 'Pelanggan');

    onValue(ordersRef, (snapshot) => {
        const orders = snapshot.val();
        orderTableBody.innerHTML = ''; 

        if (orders) {
            Object.keys(orders).forEach(orderId => {
                const order = orders[orderId];

                if (order.status === 'Disetujui') {
                    const newRow = orderTableBody.insertRow();
                    newRow.setAttribute('data-id', orderId);

                    newRow.insertCell().textContent = order.nama;
                    newRow.insertCell().textContent = order.telepon;
                    newRow.insertCell().textContent = order.alamat;
                    newRow.insertCell().textContent = order.mobil || '-';
                    newRow.insertCell().textContent = order.deskripsi;
                    newRow.insertCell().textContent = order.kerusakan || '-';
                    newRow.insertCell().textContent = order.tanggalKunjungan || '-';
                    newRow.insertCell().textContent = order.waktuKunjungan || '-';

                    const progresCell = newRow.insertCell();
                    const progresInput = document.createElement('input');
                    progresInput.type = 'text';
                    progresInput.classList.add('form-control', 'form-control-sm');
                    progresInput.value = order.progres || 'Belum ada progres';
                    progresInput.setAttribute('data-field', 'progres');
                    progresCell.appendChild(progresInput);

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
                        const newProgres = progresInput.value;
                        updateOrderProgres(orderId, newProgres);
                    });

                    deleteButton.addEventListener('click', (e) => {
                        const idToDelete = e.target.dataset.id;
                        if (confirm(`Anda yakin ingin menghapus data ini?`)) {
                            deleteOrder(idToDelete);
                        }
                    });
                }
            });

            if (orderTableBody.children.length === 0) {
                orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center">Belum ada pemesanan yang disetujui.</td></tr>';
            }

        } else {
            orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center">Belum ada pemesanan.</td></tr>';
        }
    }, (error) => {
        console.error("Error fetching orders: ", error);
        orderTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-danger">Gagal memuat data pemesanan. Mohon periksa koneksi internet Anda.</td></tr>';
        showToast('Gagal memuat data pemesanan.','error'); 
    });

    function updateOrderProgres(orderId, newProgres) {
        const orderRef = ref(database, `Pelanggan/${orderId}`);
        update(orderRef, { progres: newProgres })
            .then(() => {
                showToast(`Progres pesanan ${orderId} berhasil diperbarui.`); 
            })
            .catch((error) => {
                console.error("Error memperbarui progres: ", error);
                showToast(`Gagal mengubah progres pesanan ${orderId}. Mohon coba lagi.`, 'error'); 
            });
    }

    function deleteOrder(orderId) {
        const orderRef = ref(database, `Pelanggan/${orderId}`);
        remove(orderRef)
            .then(() => {
                showToast(`Data pesanan ${orderId} berhasil dihapus.`); 
            })
            .catch((error) => {
                console.error("Error menghapus data: ", error);
                showToast(`Gagal menghapus data pesanan ${orderId}. Mohon coba lagi.`, 'error'); 
            });
    }
});