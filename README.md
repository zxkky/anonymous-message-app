# NGL.js

Clone sederhana dari NGL (kirim pesan anonim) yang dibangun dengan Express.js, MySQL, dan EJS. Setiap user punya link pribadi (`/username`) yang bisa dibagikan supaya orang lain bisa mengirim pesan anonim ke mereka.

## ✨ Fitur

- **Autentikasi user** — Register & login dengan password yang di-hash pakai `bcrypt`
- **Session berbasis cookie** — Login state disimpan di cookie (`httpOnly`, berlaku 30 hari)
- **Link pesan anonim** — Setiap user punya halaman kirim pesan sendiri di `/username`
- **Dashboard (Beranda)** — Menampilkan daftar pesan anonim yang masuk, diurutkan dari yang terbaru
- **Halaman profil** — Menampilkan total pesan yang sudah diterima
- **UI modern** — Tampilan dibangun dengan Tailwind CSS

## 🛠️ Tech Stack

| Kategori   | Teknologi |
|------------|-----------|
| Backend    | Node.js, Express.js |
| Database   | MySQL |
| View Engine| EJS |
| Styling    | Tailwind CSS (CDN) |
| Auth       | bcrypt, cookie-parser |

## 📁 Struktur Proyek

```
ngljs/
├── index.js          # Entry point + semua routes
├── public/            # Static assets
├── views/
│   ├── home.ejs        # Landing page
│   ├── login.ejs        # Halaman login
│   ├── register.ejs      # Halaman register
│   ├── beranda.ejs        # Dashboard (pesan masuk)
│   ├── profile.ejs         # Halaman profil user
│   ├── send.ejs              # Halaman kirim pesan anonim (/username)
│   └── partials/
│       └── nav.ejs
└── package.json
```

## 🚀 Instalasi & Menjalankan

### 1. Clone repo

```bash
git clone https://github.com/username/ngljs.git
cd ngljs
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup database

Buat database MySQL bernama `telsanonim`, lalu buat dua tabel berikut:

```sql
CREATE DATABASE telsanonim;

USE telsanonim;

CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    gender VARCHAR(50)
);

CREATE TABLE chat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    date DATE NOT NULL
);
```

### 4. Konfigurasi koneksi database

Sesuaikan kredensial database di `index.js` (host, user, password) sesuai environment lokal kamu:

```js
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'telsanonim'
});
```

> 💡 Untuk penggunaan production, sebaiknya pindahkan kredensial ini ke environment variables (`.env`) alih-alih hardcode di kode.

### 5. Jalankan server

```bash
node index.js
```

Server akan berjalan di `http://localhost:3000`.

## 🔀 Routes

| Method | Path         | Deskripsi |
|--------|--------------|-----------|
| GET    | `/`          | Redirect ke `/beranda` jika sudah login, atau tampilkan landing page |
| GET    | `/login`     | Halaman login |
| POST   | `/login`     | Proses login |
| GET    | `/register`  | Halaman register |
| POST   | `/register`  | Proses register |
| POST   | `/logout`    | Logout & clear session |
| GET    | `/beranda`   | Dashboard — daftar pesan masuk (butuh login) |
| GET    | `/profile`   | Halaman profil user (butuh login) |
| GET    | `/:username` | Halaman kirim pesan anonim ke user tersebut |
| POST   | `/:username` | Kirim pesan anonim |

## 📄 Lisensi

Bebas digunakan untuk keperluan belajar.
