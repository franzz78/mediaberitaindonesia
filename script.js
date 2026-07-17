// ISI DATA CONFIG FIREBASE SESUAI PERMINTAAN KLIENSec SECURE & UTUH
const firebaseConfig = {
  apiKey: "AIzaSyD9BmV4XKXuMWa4PZHpb7Bbt-rHs61m3lE",
  databaseURL: "https://absensi-polri-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "absensi-polri",
  storageBucket: "absensi-polri.firebasestorage.app",
  messagingSenderId: "19006760644",
  appId: "1:19006760644:web:b980f54aea123e92ed4b91"
};

// Inisialisasi Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// Password Administrator Konstan
const ADMIN_PASSWORD = "AdministratorMedia##2026";

// Elemen DOM
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navMenu = document.getElementById('navMenu');
const menuHome = document.getElementById('menuHome');
const menuAdminLogin = document.getElementById('menuAdminLogin');
const userView = document.getElementById('userView');
const sliderSection = document.getElementById('sliderSection');
const adminDashboard = document.getElementById('adminDashboard');
const btnLogoutAdmin = document.getElementById('btnLogoutAdmin');
const newsForm = document.getElementById('newsForm');
const newsGrid = document.getElementById('newsGrid');
const adminNewsTableBody = document.getElementById('adminNewsTableBody');
const breakingNewsTxt = document.getElementById('breakingNewsTxt');
const sliderContainer = document.getElementById('sliderContainer');
const slidePrev = document.getElementById('slidePrev');
const slideNext = document.getElementById('slideNext');

// Elemen Form & Kontrol
const editKeyInput = document.getElementById('editKey');
const newsTitleInput = document.getElementById('newsTitle');
const newsImgUrlInput = document.getElementById('newsImgUrl');
const newsTagInput = document.getElementById('newsTag');
const newsContentInput = document.getElementById('newsContent');
const formTitle = document.getElementById('formTitle');
const btnSubmitForm = document.getElementById('btnSubmitForm');
const btnCancelEdit = document.getElementById('btnCancelEdit');
const bgUrlInput = document.getElementById('bgUrlInput');
const btnUpdateBg = document.getElementById('btnUpdateBg');

// Tombol Reset
const btnResetHarian = document.getElementById('btnResetHarian');
const btnResetMingguan = document.getElementById('btnResetMingguan');
const btnResetBulanan = document.getElementById('btnResetBulanan');

// State Aplikasi Global
let currentSlide = 0;
let totalSlides = 0;
let isAdminLoggedIn = false;

// 1. FUNGSI UTAMA: MENGATUR RESPONSIVITAS NAVBAR HAMBURGER
hamburgerBtn.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// Menutup menu jika klik di area luar
document.addEventListener('click', (e) => {
  if (!hamburgerBtn.contains(e.target) && !navMenu.contains(e.target)) {
    navMenu.classList.remove('active');
  }
});

// Navigation routing sederhana
menuHome.addEventListener('click', (e) => {
  e.preventDefault();
  showUserView();
  navMenu.classList.remove('active');
});

menuAdminLogin.addEventListener('click', (e) => {
  e.preventDefault();
  navMenu.classList.remove('active');
  if (isAdminLoggedIn) {
    showAdminDashboard();
  } else {
    promptAdminLogin();
  }
});

function showUserView() {
  userView.classList.remove('hidden');
  sliderSection.classList.remove('hidden');
  adminDashboard.classList.add('hidden');
}

function showAdminDashboard() {
  userView.classList.add('hidden');
  sliderSection.classList.add('hidden');
  adminDashboard.classList.remove('hidden');
}

// 2. SISTEM OTENTIKASI ADMINISTRATOR MENGGUNAKAN SWEETALERT2
function promptAdminLogin() {
  Swal.fire({
    title: 'Autentikasi Administrator',
    input: 'password',
    inputLabel: 'Masukkan Password Akses Global',
    inputPlaceholder: 'Ketik password disini...',
    inputAttributes: {
      autocapitalize: 'off',
      autocorrect: 'off'
    },
    showCancelButton: true,
    confirmButtonText: 'Masuk',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#1a237e'
  }).then((result) => {
    if (result.isConfirmed) {
      if (result.value === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        showAdminDashboard();
        Swal.fire({
          icon: 'success',
          title: 'Akses Diterima',
          text: 'Selamat datang kembali, Admin!',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Akses Ditolak',
          text: 'Password yang Anda masukkan salah total!'
        });
      }
    }
  });
}

btnLogoutAdmin.addEventListener('click', () => {
  isAdminLoggedIn = false;
  showUserView();
  Swal.fire({
    icon: 'info',
    title: 'Logged Out',
    text: 'Anda berhasil keluar dari panel admin.',
    timer: 1500,
    showConfirmButton: false
  });
});

// 3. RETRIEVE DATA REAL-TIME DARI FIREBASE DATABASE
db.ref('berita').on('value', (snapshot) => {
  const data = snapshot.val();
  renderUserContent(data);
  renderAdminTable(data);
  renderMarqueeAndSlider(data);
});

// Mendengarkan perubahan background global secara real-time
db.ref('settings/globalBg').on('value', (snapshot) => {
  const bgUrl = snapshot.val();
  if (bgUrl) {
    document.documentElement.style.setProperty('--global-bg-image', `url('${bgUrl}')`);
    bgUrlInput.value = bgUrl;
  } else {
    document.documentElement.style.setProperty('--global-bg-image', 'none');
    bgUrlInput.value = '';
  }
});

// 4. RENDER TAMPILAN BERITA USER
function renderUserContent(data) {
  newsGrid.innerHTML = '';
  if (!data) {
    newsGrid.innerHTML = '<p style="text-align:center; width:100%;">Belum ada berita yang disiarkan saat ini.</p>';
    return;
  }

  // Mengubah object menjadi array dan membalikkan agar berita terbaru di atas
  const keys = Object.keys(data).reverse();
  keys.forEach(key => {
    const item = data[key];
    const tagHtml = item.tag ? `<span class="news-tag">${item.tag}</span>` : '';
    
    const card = document.createElement('div');
    card.className = 'news-card';
    card.innerHTML = `
      <div class="news-img-box">
        <img src="${item.foto}" alt="${item.judul}" onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=500'">
        ${tagHtml}
      </div>
      <div class="news-body">
        <h3>${item.judul}</h3>
        <p>${item.isi}</p>
      </div>
    `;
    newsGrid.appendChild(card);
  });
}

// 5. RENDER TEKS BERJALAN & SLIDER FOTO DINAMIS
function renderMarqueeAndSlider(data) {
  breakingNewsTxt.innerHTML = '';
  sliderContainer.innerHTML = '';
  
  if (!data) {
    breakingNewsTxt.innerText = "Tidak ada siaran berita terbaru.";
    sliderSection.classList.add('hidden');
    return;
  }

  const keys = Object.keys(data).reverse();
  
  // Rangkai teks berjalan dari seluruh judul berita terbaru
  let titlesArray = [];
  keys.forEach(key => titlesArray.push(data[key].judul));
  breakingNewsTxt.innerText = titlesArray.join('   ||   ') + '   ||   ';

  // Bangun komponen slider
  let slideCount = 0;
  keys.forEach(key => {
    const item = data[key];
    // Masukkan ke dalam slider (maksimalkan hingga beberapa postingan terakhir)
    if(slideCount < 5) { 
      const slide = document.createElement('div');
      slide.className = 'slide-item';
      slide.innerHTML = `
        <img src="${item.foto}" alt="${item.judul}" onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200'">
        <div class="slide-caption">
          <h3>${item.judul}</h3>
          <p>${item.isi.substring(0, 100)}...</p>
        </div>
      `;
      sliderContainer.appendChild(slide);
      slideCount++;
    }
  });

  totalSlides = slideCount;
  currentSlide = 0;
  updateSliderPosition();
  
  if(totalSlides > 0) {
    sliderSection.classList.remove('hidden');
  } else {
    sliderSection.classList.add('hidden');
  }
}

// Kontrol Navigasi Gambar Slider
function updateSliderPosition() {
  sliderContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
}

slideNext.addEventListener('click', () => {
  if (totalSlides === 0) return;
  currentSlide = (currentSlide + 1) % totalSlides;
  updateSliderPosition();
});

slidePrev.addEventListener('click', () => {
  if (totalSlides === 0) return;
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  updateSliderPosition();
});

// Auto-slide setiap 5 detik
setInterval(() => {
  if (totalSlides > 1 && !adminDashboard.classList.contains('hidden')) {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSliderPosition();
  }
}, 5000);


// 6. RENDER DATA MANAGEMENT TABEL ADMINISTRATOR
function renderAdminTable(data) {
  adminNewsTableBody.innerHTML = '';
  if (!data) {
    adminNewsTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Tidak ada data operasional berita.</td></tr>';
    return;
  }

  Object.keys(data).forEach(key => {
    const item = data[key];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${item.foto}" alt="thumb" onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=100'"></td>
      <td>
        <strong>${item.judul}</strong><br>
        <small style="background:#e0e0e0; padding:2px 5px; border-radius:3px;">Tag: ${item.tag || '-'}</small>
      </td>
      <td>${item.isi.substring(0, 80)}...</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-primary btn-small" onclick="editNews('${key}', '${escapeHtml(item.judul)}', '${escapeHtml(item.foto)}', '${escapeHtml(item.tag || '')}', '${escapeHtml(item.isi)}')"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn btn-danger btn-small" onclick="deleteNews('${key}')"><i class="fas fa-trash"></i> Hapus</button>
        </div>
      </td>
    `;
    adminNewsTableBody.appendChild(tr);
  });
}

function escapeHtml(text) {
  if(!text) return '';
  return text
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

// 7. OPERASI SIMPAN & EDIT BERITA
newsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const key = editKeyInput.value;
  const title = newsTitleInput.value;
  const imgUrl = newsImgUrlInput.value;
  const tag = newsTagInput.value;
  const content = newsContentInput.value;

  const newsData = {
    judul: title,
    foto: imgUrl,
    tag: tag,
    isi: content,
    timestamp: Date.now()
  };

  if (key) {
    // Jalankan Edit Update Data
    db.ref('berita/' + key).update(newsData)
      .then(() => {
        Swal.fire({ icon: 'success', title: 'Berita Diperbarui', timer: 1500, showConfirmButton: false });
        clearForm();
      });
  } else {
    // Jalankan Tambah Data Baru
    db.ref('berita').push(newsData)
      .then(() => {
        Swal.fire({ icon: 'success', title: 'Berita Disiarkan Global!', timer: 1500, showConfirmButton: false });
        clearForm();
      });
  }
});

window.editNews = function(key, judul, foto, tag, isi) {
  editKeyInput.value = key;
  newsTitleInput.value = judul;
  newsImgUrlInput.value = foto;
  newsTagInput.value = tag;
  newsContentInput.value = isi;

  formTitle.innerText = "Edit Berita Pilihan";
  btnSubmitForm.innerText = "Simpan Perubahan";
  btnCancelEdit.classList.remove('hidden');
  
  // Otomatis gulung layar kembali ke area pengisian form
  document.getElementById('newsForm').scrollIntoView({ behavior: 'smooth' });
};

btnCancelEdit.addEventListener('click', clearForm);

function clearForm() {
  editKeyInput.value = '';
  newsTitleInput.value = '';
  newsImgUrlInput.value = '';
  newsTagInput.value = '';
  newsContentInput.value = '';
  
  formTitle.innerText = "Tambah Berita Baru";
  btnSubmitForm.innerText = "Siarkan Berita";
  btnCancelEdit.classList.add('hidden');
}

// 8. OPERASI HAPUS DATA BERITA
window.deleteNews = function(key) {
  Swal.fire({
    title: 'Apakah Anda yakin?',
    text: "Berita yang dihapus akan hilang permanen dari database global!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#c62828',
    cancelButtonColor: '#757575',
    confirmButtonText: 'Ya, Hapus Sekarang!'
  }).then((result) => {
    if (result.isConfirmed) {
      db.ref('berita/' + key).remove()
        .then(() => {
          Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Berita sukses diturunkan.', timer: 1200, showConfirmButton: false });
        });
    }
  });
};

// 9. UPDATE BACKGROUND GLOBAL SECARA GLOBAL
btnUpdateBg.addEventListener('click', () => {
  const url = bgUrlInput.value.trim();
  db.ref('settings/globalBg').set(url)
    .then(() => {
      Swal.fire({ icon: 'success', title: 'Background Terganti Global!', timer: 1500, showConfirmButton: false });
    });
});

// 10. FITUR RESET PERIODIK (HARIAN, MINGGUAN, BULANAN)
function executeDataReset(type) {
  Swal.fire({
    title: `Konfirmasi ${type}`,
    text: `Apakah Anda benar-benar ingin mengosongkan seluruh siaran berita secara ${type.toLowerCase()}?`,
    icon: 'critical',
    showCancelButton: true,
    confirmButtonColor: '#ef6c00',
    confirmButtonText: 'Ya, Kosongkan Data!'
  }).then((result) => {
    if (result.isConfirmed) {
      db.ref('berita').remove()
        .then(() => {
          Swal.fire({ icon: 'success', title: `Reset ${type} Sukses`, text: 'Seluruh arsip berita dibersihkan.', timer: 1500, showConfirmButton: false });
        });
    }
  });
}

btnResetHarian.addEventListener('click', () => executeDataReset('Reset Harian'));
btnResetMingguan.addEventListener('click', () => executeDataReset('Reset Mingguan'));
btnResetBulanan.addEventListener('click', () => executeDataReset('Reset Bulanan'));

// 11. REGISTRASI SERVICE WORKER PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('Service Worker terdaftar secara aman:', reg.scope))
      .catch(err => console.error('Pendaftaran Service Worker gagal:', err));
  });
}
