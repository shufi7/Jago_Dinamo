import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";
import { getDatabase, ref, onValue, update, set } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

document.addEventListener('DOMContentLoaded', () => {
    // Firebase Configuration (dipindahkan dari HTML)
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

    // Initialize Firebase (dipindahkan dari HTML)
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app); 
    const database = getDatabase(app); // database sekarang diinisialisasi di sini

    // Elemen UI Dashboard
    const totalRevenueMonthElement = document.getElementById('totalRevenueMonth');
    const grossRevenueElement = document.getElementById('grossRevenue');
    const netRevenueElement = document.getElementById('netRevenue');
    const usedItemsTableBody = document.getElementById('usedItemsTableBody');

    // Tombol Reset
    const resetMonthRevenueButton = document.getElementById('resetMonthRevenue');
    const resetGrossRevenueButton = document.getElementById('resetGrossRevenue');
    const resetNetRevenueButton = document.getElementById('resetNetRevenue');
    const resetUsedItemsButton = document.getElementById('resetUsedItems');

    // Elemen Toast (untuk notifikasi)
    const liveToastElement = document.getElementById('liveToast');
    const toastMessageElement = document.getElementById('toastMessage');
    let liveToast;

    // Inisialisasi Toast
    if (liveToastElement) {
        liveToast = new bootstrap.Toast(liveToastElement, { autohide: true, delay: 3000 });
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

    // Database sudah terhubung karena diinisialisasi di awal modul ini
    // Referensi ke node ringkasan admin di Firebase
    const adminSummaryRef = ref(database, 'admin_summary');
    const completedOrdersRef = ref(database, 'Pelanggan'); // Mengambil data pesanan selesai dari sini

    // Fungsi untuk memformat angka menjadi format mata uang Rupiah
    function formatRupiah(angka) {
        return `Rp ${new Intl.NumberFormat('id-ID').format(angka)}`;
    }

    // --- Mendengarkan Perubahan Data di Firebase ---
    onValue(adminSummaryRef, (snapshot) => {
        const summary = snapshot.val() || {}; // Ambil data atau objek kosong jika belum ada
        
        // Data Keuangan
        const totalRevenueMonth = summary.total_revenue_month || 0;
        const grossRevenue = summary.gross_revenue || 0;
        const netRevenue = summary.net_revenue || 0;

        totalRevenueMonthElement.textContent = formatRupiah(totalRevenueMonth);
        grossRevenueElement.textContent = formatRupiah(grossRevenue);
        netRevenueElement.textContent = formatRupiah(netRevenue);

        // Data Barang Digunakan
        const usedItemsTotal = summary.used_items_total || {};
        usedItemsTableBody.innerHTML = ''; // Bersihkan tabel
        
        if (Object.keys(usedItemsTotal).length > 0) {
            for (const itemName in usedItemsTotal) {
                const row = usedItemsTableBody.insertRow();
                row.insertCell().textContent = itemName;
                row.insertCell().textContent = usedItemsTotal[itemName];
            }
        } else {
            usedItemsTableBody.innerHTML = '<tr><td colspan="2" class="text-center">Belum ada barang terpakai.</td></tr>';
        }
    }, (error) => {
        console.error("Error fetching admin summary:", error);
        showToast('Gagal memuat ringkasan admin.', 'error');
    });

    // --- Fungsi Reset ---
    async function resetMetric(metricName) {
        try {
            const updates = {};
            // Hapus nilai metrik yang spesifik
            if (metricName === 'total_revenue_month') {
                updates[metricName] = 0; // Reset ke 0
            } else if (metricName === 'gross_revenue') {
                updates[metricName] = 0;
            } else if (metricName === 'net_revenue') {
                updates[metricName] = 0;
            } else if (metricName === 'used_items_total') {
                updates[metricName] = null; // Hapus node atau set ke objek kosong
            }

            await update(adminSummaryRef, updates); // Update Firebase
            showToast(`${metricName.replace(/_/g, ' ')} berhasil direset!`, 'success');
        } catch (error) {
            console.error(`Error mereset ${metricName}:`, error);
            showToast(`Gagal mereset ${metricName}.`, 'error');
        }
    }

    // --- Event Listener Tombol Reset ---
    if (resetMonthRevenueButton) {
        resetMonthRevenueButton.addEventListener('click', () => {
            if (confirm('Anda yakin ingin mereset total pendapatan bulan ini?')) {
                resetMetric('total_revenue_month');
            }
        });
    }
    if (resetGrossRevenueButton) {
        resetGrossRevenueButton.addEventListener('click', () => {
            if (confirm('Anda yakin ingin mereset penghasilan kotor?')) {
                resetMetric('gross_revenue');
            }
        });
    }
    if (resetNetRevenueButton) {
        resetNetRevenueButton.addEventListener('click', () => {
            if (confirm('Anda yakin ingin mereset penghasilan bersih?')) {
                resetMetric('net_revenue');
            }
        });
    }
    if (resetUsedItemsButton) {
        resetUsedItemsButton.addEventListener('click', () => {
            if (confirm('Anda yakin ingin mereset daftar barang terpakai?')) {
                resetMetric('used_items_total');
            }
        });
    }

    // Catatan: Logika pembaruan admin_summary dari keuangan.js akan diimplementasikan di keuangan.js
    // dan TIDAK di sini. homeadmin.js hanya membaca dan mereset.
});
