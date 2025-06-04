import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.6.11/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "API_KEY_ANDA",
  authDomain: "jagodinamodata.firebaseapp.com",
  databaseURL: "https://jagodinamodata-default-rtdb.firebaseio.com",
  projectId: "jagodinamodata",
  storageBucket: "jagodinamodata.appspot.com",
  messagingSenderId: "SENDER_ID_ANDA",
  appId: "APP_ID_ANDA"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const tableBody = document.querySelector("tbody");

onValue(ref(database, "pemesanan"), (snapshot) => {
  tableBody.innerHTML = ""; // Clear table

  snapshot.forEach((child) => {
    const data = child.val();
    const key = child.key;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.nama}</td>
      <td>${data.telepon}</td>
      <td>${data.alamat}</td>
      <td>${data.kerusakan || "-"}</td>
      <td>${data.kendaraan || "-"}</td>
      <td>${data.deskripsi}</td>
      <td>
        <select class="form-select" data-key="${key}">
          <option value="disetujui" ${data.status === "disetujui" ? "selected" : ""}>Disetujui</option>
          <option value="tidak" ${data.status === "tidak" ? "selected" : ""}>Tidak Disetujui</option>
          <option value="menunggu" ${data.status === "menunggu" ? "selected" : ""}>Menunggu Disetujui</option>
        </select>
      </td>
    `;

    tableBody.appendChild(row);
  });

  // Tambahkan event listener ke semua dropdown status
  document.querySelectorAll("select.form-select").forEach(select => {
    select.addEventListener("change", function () {
      const key = this.dataset.key;
      const newStatus = this.value;
      update(ref(database, "pemesanan/" + key), { status: newStatus });
    });
  });
});
