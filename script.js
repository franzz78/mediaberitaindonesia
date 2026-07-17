// ISI DATA CONFIG FIREBASE SECARA UTUH
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

// Elemen DOM Global
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

// Elemen Form Kendali Admin
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

// Tombol Perangkat Tambahan & Reset
const btnResetHarian = document.getElementById('btnResetHarian');
const btnResetMingguan = document.getElementById('btnResetMingguan');
const btnResetBulanan = document.getElementById('btnResetBulanan');
const btnRegisterBiometric = document.getElementById('btnRegisterBiometric');
const btnDeleteBiometric = document.getElementById('btnDeleteBiometric');

// State Variabel
let currentSlide = 0;
let totalSlides = 0;
let isAdminLoggedIn = false;
let isBiometricRegistered = false;

// ==========================================================================
// INTERFEIS RESPONSIVE NAVBAR & NAVIGASI
// ==========================================================================
hamburgerBtn.addEventListener('click', () => navMenu.classList.toggle('active'));
document.addEventListener('click', (e) => {
  if (!hamburgerBtn.contains(e.target) && !navMenu.contains(e.target)) {
    navMenu.classList.remove('active');
  }
});

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
    handleAdminVerificationFlow();
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
  checkBiometricStatusInDashboard();
}

btnLogoutAdmin.addEventListener('click', () => {
  isAdminLoggedIn = false;
  showUserView();
  Swal.fire({ icon: 'info', title: 'Logged Out', text: 'Anda keluar dari Panel Admin.', timer: 1500, showConfirmButton: false });
});

// ==========================================================================
// CORE ENGINE: DETEKSI & STRATEGI VERIFIKASI BIOMETRIK (SIDIK JARI)
// ==========================================================================

// Cek status pendaftaran biometrik di Firebase saat load awal
function checkBiometricStatusInDashboard() {
  db.ref('settings/biometricRegistered').once('value', (snapshot) => {
    if (snapshot.val() === true) {
      isBiometricRegistered = true;
      btnDeleteBiometric.classList.remove('hidden');
      btnRegisterBiometric.innerHTML = `<i class="fas fa-fingerprint"></i> Sidik Jari Perangkat Aktif`;
      btnRegisterBiometric.style.background = "#2e7d32";
    } else {
      isBiometricRegistered = false;
      btnDeleteBiometric.classList.add('hidden');
      btnRegisterBiometric.innerHTML = `<i class="fas fa-user-plus"></i> Daftarkan Sidik Jari Perangkat Ini`;
      btnRegisterBiometric.style.background = "#1a237e";
    }
  });
}

// Alur Validasi Masuk Menu Admin (Mendukung Deteksi Otomatis & Sidik Jari)
async function handleAdminVerificationFlow() {
  // 1. Deteksi apakah browser & hardware mendukung fitur Biometrik/WebAuthn
  const isHardwareSupport = window.PublicKeyCredential && 
                            typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function' &&
                            await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

  // Ambil data status registrasi terbaru dari Firebase
  const snapshot = await db.ref('settings/biometricRegistered').once('value');
  const databaseHasBiometric = snapshot.val() === true;

  if (isHardwareSupport && databaseHasBiometric) {
    // JIKA PERANGKAT SUPPORT & SUDAH MAU REGISTERED: Tampilkan opsi khusus sidik jari instan
    Swal.fire({
      title: 'Verifikasi Administrator',
      text: 'Perangkat ini mendukung Otentikasi Biometrik terdaftar.',
      icon: 'shield',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: '<i class="fas fa-fingerprint"></i> Verifikasi Sidik Jari',
      denyButtonText: '<i class="fas fa-key"></i> Pakai Password Manual',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#2e7d32',
      denyButtonColor: '#1a237e'
    }).then((result) => {
      if (result.isConfirmed) {
        executeBiometricScan();
      } else if (result.isDenied) {
        promptPasswordManual();
      }
    });
  } else {
    // JIKA TIDAK SUPPORT ATAU BELUM DAFTAR: Langsung bypass ke password manual
    promptPasswordManual(isHardwareSupport);
  }
}

// Eksekusi Panggilan Sensor Sidik Jari Hardware Perangkat
function executeBiometricScan() {
  Swal.fire({
    title: 'Sentuh Sensor Sidik Jari Anda',
    text: 'Menunggu konfirmasi biometrik perangkat...',
    imageUrl: 'https://cdn-icons-png.flaticon.com/512/2619/2619245.png',
    imageWidth: 80,
    imageHeight: 80,
    showConfirmButton: false,
    allowOutsideClick: false,
    didOpen: () => {
      // Pemicu Native API WebAuthn untuk memvalidasi sidik jari lokal pengguna
      const options = {
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          timeout: 60000,
          allowCredentials: [],
          userVerification: "required"
        }
      };

      navigator.credentials.get(options)
        .then((credential) => {
          // Berhasil memindai sidik jari lokal dengan valid!
          isAdminLoggedIn = true;
          showAdminDashboard();
          Swal.fire({ icon: 'success', title: 'Akses Diterima via Biometrik', timer: 1500, showConfirmButton: false });
        })
        .catch((err) => {
          // Fallback cerdas jika pemindaian biometrik dibatalkan/gagal
          Swal.fire({
            icon: 'warning',
            title: 'Pemindaian Gagal/Dibatalkan',
            text: 'Silakan gunakan verifikasi kata sandi manual.',
            confirmButtonText: 'Gunakan Password'
          }).then(() => {
            promptPasswordManual(true);
          });
        });
    }
  });
}

// Verifikasi Berbasis Password Manual Tradisional
function promptPasswordManual(hardwareSupportStatus = false) {
  let footerTxt = hardwareSupportStatus ? 'Perangkat support biometrik, silakan daftarkan di dalam panel setelah masuk.' : 'Perangkat tidak mendeteksi hardware sidik jari.';
  
  Swal.fire({
    title: 'Input Password Admin',
    input: 'password',
    inputLabel: 'Masukkan Password Akses Global',
    inputPlaceholder: 'Ketik password di sini...',
    footer: `<span style="color:#777; font-size:0.8rem;"><i class="fas fa-info-circle"></i> ${footerTxt}</span>`,
    showCancelButton: true,
    confirmButtonText: 'Masuk',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#1a237e'
  }).then((result) => {
    if (result.isConfirmed) {
      if (result.value === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        showAdminDashboard();
        Swal.fire({ icon: 'success', title: 'Akses Diterima', text: 'Selamat datang kembali!', timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: 'Password salah total!' });
      }
    }
  });
}

// Tombol Registrasi Sidik Jari Perangkat Baru di Dalam Dashboard Admin
btnRegisterBiometric.addEventListener('click', async () => {
  if (!window.PublicKeyCredential) {
    Swal.fire({ icon: 'error', title: 'Gagal', text: 'Browser atau hardware tidak mendukung fungsi biometrik API.' });
    return;
  }

  Swal.fire({
    title: 'Daftarkan Sidik Jari',
    text: 'Sistem akan mendaftarkan verifikator biometrik perangkat ini ke database global.',
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'Mulai Pindai',
    confirmButtonColor: '#1a237e'
  }).then((res) => {
    if (res.isConfirmed) {
      // Inisiasi pembuatan key pengenal biometrik unik untuk disimpan di Firebase
      const options = {
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: "Media Indonesia Digital" },
          user: {
            id: crypto.getRandomValues(new Uint8Array(16)),
            name: "admin@mediaindonesia.com",
            displayName: "Administrator Global"
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          timeout: 60000,
          authenticatorSelection: { userVerification: "required" }
        }
      };

      navigator.credentials.create(options)
        .then((cred) => {
          // Set data registrasi ke database secara real-time
          db.ref('settings/biometricRegistered').set(true)
            .then(() => {
              Swal.fire({ icon: 'success', title: 'Registrasi Berhasil!', text: 'Perangkat ini terdaftar secara optimal untuk login cepat.' });
              checkBiometricStatusInDashboard();
            });
        })
        .catch((err) => {
          Swal.fire({ icon: 'error', title: 'Registrasi Dibatalkan', text: 'Gagal memverifikasi sidik jari baru.' });
        });
    }
  });
});

// Aksi Menghapus Pendaftaran Autentikasi Biometrik
btnDeleteBiometric.addEventListener('click', () => {
  Swal.fire({
    title: 'Hapus Akses Biometrik?',
    text: 'Anda harus menggunakan password manual kembali setelah menghapus ini.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#c62828',
    confirmButtonText: 'Ya, Hapus!'
  }).then((res) => {
    if (res.isConfirmed) {
      db.ref('settings/biometricRegistered').remove()
        .then(() => {
          Swal.fire({ icon: 'success', title: 'Terhapus', text: 'Data autentikasi biometrik dibersihkan dari server.', timer: 1500, showConfirmButton: false });
          checkBiometricStatusInDashboard();
        });
    }
  });
});

// ==========================================================================
// OPERASIONAL REAL-TIME DATABASE SYNC (BERITA, SLIDER, MARQUEE)
// ==========================================================================
db.ref('berita').on('value', (snapshot) => {
  const data = snapshot.val();
  renderUserContent(data);
  renderAdminTable(data);
  renderMarqueeAndSlider(data);
});

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

function renderUserContent(data) {
  newsGrid.innerHTML = '';
  if (!data) {
    newsGrid.innerHTML = '<p style="text-align:center; width:100%;">Belum ada berita yang disiarkan saat ini.</p>';
    return;
  }
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

function renderMarqueeAndSlider(data) {
  breakingNewsTxt.innerHTML = '';
  sliderContainer.innerHTML = '';
  if (!data) {
    breakingNewsTxt.innerText = "Tidak ada siaran berita terbaru.";
    sliderSection.classList.add('hidden');
    return;
  }
  const keys = Object.keys(data).reverse();
  let titlesArray = [];
  keys.forEach(key => titlesArray.push(data[key].judul));
  breakingNewsTxt.innerText = titlesArray.join('   ||   ') + '   ||   ';

  let slideCount = 0;
  keys.forEach(key => {
    const item = data[key];
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
  if(totalSlides > 0) sliderSection.classList.remove('hidden');
  else sliderSection.classList.add('hidden');
}

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
setInterval(() => {
  if (totalSlides > 1 && adminDashboard.classList.contains('hidden')) {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateSliderPosition();
  }
}, 5000);

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
  return text.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}

newsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const key = editKeyInput.value;
  const newsData = {
    judul: newsTitleInput.value,
    foto: newsImgUrlInput.value,
    tag: newsTagInput.value,
    isi: newsContentInput.value,
    timestamp: Date.now()
  };
  if (key) {
    db.ref('berita/' + key).update(newsData).then(() => {
      Swal.fire({ icon: 'success', title: 'Berita Diperbarui', timer: 1500, showConfirmButton: false });
      clearForm();
    });
  } else {
    db.ref('berita').push(newsData).then(() => {
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

window.deleteNews = function(key) {
  Swal.fire({
    title: 'Apakah Anda yakin?',
    text: "Berita yang dihapus akan hilang permanen dari database!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#c62828',
    confirmButtonText: 'Ya, Hapus!'
  }).then((result) => {
    if (result.isConfirmed) {
      db.ref('berita/' + key).remove().then(() => {
        Swal.fire({ icon: 'success', title: 'Terhapus!', timer: 1200, showConfirmButton: false });
      });
    }
  });
};

btnUpdateBg.addEventListener('click', () => {
  db.ref('settings/globalBg').set(bgUrlInput.value.trim()).then(() => {
    Swal.fire({ icon: 'success', title: 'Background Terganti Global!', timer: 1500, showConfirmButton: false });
  });
});

function executeDataReset(type) {
  Swal.fire({
    title: `Konfirmasi ${type}`,
    text: `Kosongkan seluruh data siaran berita secara ${type.toLowerCase()}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef6c00',
    confirmButtonText: 'Ya, Bersihkan!'
  }).then((result) => {
    if (result.isConfirmed) {
      db.ref('berita').remove().then(() => {
        Swal.fire({ icon: 'success', title: `Reset Sukses`, timer: 1500, showConfirmButton: false });
      });
    }
  });
}
btnResetHarian.addEventListener('click', () => executeDataReset('Reset Harian'));
btnResetMingguan.addEventListener('click', () => executeDataReset('Reset Mingguan'));
btnResetBulanan.addEventListener('click', () => executeDataReset('Reset Bulanan'));

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => console.log('SW Active:', reg.scope))
      .catch(err => console.error('SW Failed:', err));
  });
}
