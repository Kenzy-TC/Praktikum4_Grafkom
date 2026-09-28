# Rotating 3D Cube Camera Playground

## Identitas

| Informasi | Keterangan |
| :--- | :--- |
| **Mata Kuliah** | EF234504 Grafika Komputer |
| **Praktikum** | Pertemuan 4 — Interactive Camera, Projection & 3D |
| **Anggota 1** | Mario Napitupulu (5025241085) |
| **Anggota 2** | Nathanael Oliver (5025241109) |

---

## Deskripsi Aplikasi

Aplikasi ini merupakan implementasi praktikum Pertemuan 4 dengan fokus pada visualisasi 3D menggunakan cube, camera, View Matrix, Perspective Projection, Orthographic Projection, Depth Test, serta kontrol interaktif.

### Pipeline Utama

```text
Local Vertex
    ↓ Model Matrix
World Position
    ↓ View Matrix
View Position
    ↓ Projection Matrix
Clip Position
    ↓ Perspective Divide
NDC (Normalized Device Coordinates)
    ↓ Viewport
Screen
```

### Pada Vertex Shader

OpenGL Shading Language:

```glsl
gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
```

---

## Struktur Project

```text
praktikum-camera-04/
├── index.html
├── style.css
├── main.js
├── math3d.js
└── README.md
```

---

## Fitur Utama

- **WebGL2 dan Cube 3D:** Project menggunakan WebGL2. Cube dibuat dari 6 face × 2 triangle per face = 12 triangle = 36 vertex. Position dikirim sebagai `vec3`, sedangkan transformasi 3D menggunakan matrix 4×4.
- **Model Matrix:** Cube dianimasikan pada sumbu X dan Y dengan rotasi otomatis:

  ```text
  rotationX += 25°/s
  rotationY += 40°/s
  ```

- **Camera dan View Matrix:** Camera diinisialisasi dengan parameter berikut:

  ```text
  Position = (0.0, 1.5, 4.0)
  Target   = (0.0, 0.0, 0.0)
  Up       = (0.0, 1.0, 0.0)
  ```

  View Matrix dibangun dengan konsep `lookAt` menggunakan *forward*, *right*, dan *corrected up vector*.

- **Projection:** Menyediakan *Perspective Projection* (FOV default 60°) dan *Orthographic Projection* (aspect ratio mengikuti canvas). Terdapat fitur Projection Toggle, FOV interaktif (30°–110°), FOV Preset (35°/60°/90°), Near/Far preset, dan Split Mode (Perspective ‖ Orthographic berdampingan).

- **Depth Test:** Dapat diaktifkan/dimatikan menggunakan tombol `D`. Depth buffer dibersihkan setiap frame bersamaan dengan color buffer:

  ```javascript
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  ```

- **Multi-Cube Mode:** Menampilkan 3 cube pada kedalaman (*depth*) berbeda untuk mengamati pengaruh algoritma *Z-Buffer* secara langsung.

---

## Interaksi & Kontrol

### Kontrol Keyboard

| **Tombol** | **Fungsi** |
| :--- | :--- |
| **Arrow Kiri / Kanan** | Geser Camera sumbu X |
| **W / S** | Geser Camera sumbu Z (Maju / Mundur) |
| **Q / E** | Geser Camera sumbu Y (Naik / Turun ketinggian) |
| **J / L** | Geser Target fokus sumbu X |
| **I / K** | Geser Target fokus sumbu Y |
| **O** | Projection Toggle (Perspective ↔ Orthographic) |
| **[ / ]** | Field of View (FOV) - / + |
| **1 / 2 / 3** | FOV Preset (35° / 60° / 90°) |
| **N** | Near / Far Preset Cycle |
| **D** | Depth Test ON / OFF |
| **B** | Orbit Camera ON / OFF |
| **X** | Split Comparison Mode ON / OFF |
| **M** | Multi-Cube Mode ON / OFF |
| **R** | Reset Scene ke kondisi default |

> 💡 **Catatan:** Seluruh parameter di atas juga dapat dikendalikan secara visual melalui panel **Parameter Control** di sisi kanan antarmuka.

### Parameter Control (Panel UI)

| **Slider** | **Rentang** | **Fungsi** |
| :--- | :--- | :--- |
| **FOV perspective** | 30° – 110° | Mengubah radius sudut pandang vertikal kamera |
| **Camera height** | -3.0 – 5.0 | Mengubah elevasi / posisi Y kamera secara presisi |
| **Target X** | -2.0 – 2.0 | Menggeser titik pandang horizontal |
| **Target Y** | -2.0 – 2.0 | Menggeser titik pandang vertikal |

---

## Challenge yang Dikerjakan

### Challenge A — Orbit Camera

Kamera bergerak melingkar mengelilingi target menggunakan fungsi trigonometri. Tekan **B** untuk mengaktifkan/menonaktifkan orbit.

```text
cameraX = targetX + cos(angle) × radius
cameraZ = targetZ + sin(angle) × radius
cameraY = konstan (mengikuti tinggi saat orbit diaktifkan)
```

### Challenge B — Camera Height Control

Tombol **Q** dan **E** digunakan untuk menaikkan atau menurunkan posisi Y kamera secara interaktif, yang juga otomatis memperbarui UI slider *Camera height*.

### Challenge C — Target Control

Posisi kamera dipertahankan sementara titik pandang (*target*) diubah. Kontrol **J/L** (Target X) dan **I/K** (Target Y) mengubah orientasi target sehingga kalkulasi arah pandang dan View Matrix ikut berotasi.

### Challenge D — Projection Comparison Split Mode

Tekan **X** untuk membagi satu canvas menjadi dua viewport menggunakan `gl.viewport` dan `gl.scissor`:

- **Kiri:** Perspective Projection
- **Kanan:** Orthographic Projection

Keduanya di-*render* menggunakan kamera dan *Model Matrix* yang identik pada frame yang sama, memungkinkan perbandingan langsung bagaimana kedalaman mendistorsi skala objek.

### Challenge E — Multiple Cube Depth Test

Tekan **M** untuk menampilkan 3 objek kubus yang berjejer pada sumbu Z:

- **Cube Depan:** Z offset = `+1.5`
- **Cube Tengah:** Z offset = `0.0`
- **Cube Belakang:** Z offset = `-1.5`

Tekan **D** untuk mematikan *Depth Test*. Saat *Z-Buffer* mati, kubus yang diproses paling akhir pada *draw call* akan digambar menimpa kubus di depannya secara paksa, membuktikan bahwa urutan menggambar saja tidak cukup untuk merepresentasikan realitas 3D.

### Challenge F — FOV & Near/Far Presets

Implementasi preset matriks visual dengan *shortcut* cepat:

- **1 / 2 / 3:** Langsung memuat FOV 35°, 60°, atau 90°.
- **N:** Melakukan siklus pada rentang pemotongan objek (*Clipping Planes*):
  - `0.1 / 100` — Standar luas
  - `1.0 / 20` — Jarak menengah
  - `2.5 / 8` — Jarak pendek, memotong objek di belakang/depan

---

## Arsitektur Input

- **State-Based Input:** Diperiksa setiap frame via *Delta-Time*. Menangani pergerakan kontinu yang mulus untuk translasi Camera X/Y/Z, Target X/Y, dan transisi FOV (`[ / ]`).
- **Event-Based Input:** Sekali picu via *EventListener*. Menangani sistem *toggle switch* dan state boolean seperti penggantian Projection, Split-screen, Depth-test, aktivasi Orbit, dan Reset. Mengabaikan *key repeat* agar state tidak saling berkedip (*flicker*) saat ditahan.

---

## Cara Menjalankan

Project menggunakan ES6 Module, sehingga **wajib** dijalankan melalui *local development server* untuk menghindari *CORS error* (tidak bisa langsung double-click `index.html`).

### Menggunakan Python

```bash
cd praktikum-camera-04
python -m http.server 8000
```

Kemudian buka browser:

```text
http://localhost:8000
```

### Menggunakan VS Code

Gunakan ekstensi **Live Server**:

1. Buka `index.html`.
2. Klik kanan pada file.
3. Pilih **Open with Live Server**.

---

## Tabel Pengujian

| **No.** | **Pengujian** | **Hasil yang Diharapkan** |
| :---: | :--- | :--- |
| 1 | Load awal aplikasi | Kubus muncul di tengah dan berputar otomatis 60 FPS |
| 2 | Tekan W/A/S/D/Q/E | Kamera bergerak bebas (X, Y, Z translation) |
| 3 | Tekan I/J/K/L | Titik fokus (Target) kamera bergeser |
| 4 | Tekan O | Proyeksi berganti antara Perspective & Orthographic |
| 5 | Tekan [ / ] | Rentang FOV membesar/mengecil secara real-time |
| 6 | Tekan 1/2/3 | Sudut pandang langsung melompat ke 35°, 60°, 90° |
| 7 | Tekan N | Nilai Near/Far di HUD berganti dan meng-*clip* batas ruang visual |
| 8 | Tekan D (Depth Test) | Objek belakang bisa bocor ke depan bila Depth dimatikan |
| 9 | Tekan B (Orbit) | Kamera mulai memutari target secara otomatis |
| 10 | Tekan X (Split) | Kanvas terbelah menjadi 2 viewport berdampingan |
| 11 | Tekan M (Multi-Cube) | 2 kubus tambahan muncul di sumbu Z |
| 12 | Tekan R (Reset) | Semua matriks, UI, dan toggle kembali ke posisi 0 awal |
| 13 | Panel Slider / UI | Memutar slider UI ikut memengaruhi variabel *state* internal |
| 14 | Inspeksi Console | Tidak ada *warning* atau *fatal error* pada siklus WebGL |

---

## Catatan Debugging Internal

- `gl.useProgram(program)` harus dieksekusi sebelum `drawArrays()`, jika tidak WebGL akan melempar error `INVALID_OPERATION: no valid shader program in use`.
- Data **Position** menggunakan `vec3` (ukuran 3) sehingga `vertexAttribPointer` harus diparameterisasi dengan `size=3`.
- Aturan **Perspective Projection** di WebGL2 valid **hanya jika** batas `near > 0` dan `far > near`.
- Jika orientasi kamera terbalik *(gimbal lock)*, lakukan verifikasi ulang pada urutan *cross product* fungsi `lookAt`: vektor *forward*, *right*, lalu *corrected up*.
- Array matriks di JavaScript merupakan basis linear, gunakan flag `false` pada instruksi `gl.uniformMatrix4fv` karena format standar bawaan OpenGL adalah matriks *Column-Major*.
- Membelah layer (*Split Mode*) menggunakan kombinasi `gl.viewport` (area render) dan `gl.scissor` (area penghapusan buffer) agar `gl.clear()` tidak merusak bagian viewport di sebelahnya.

---

## Refleksi Praktikum

Praktikum ini membuktikan bahwa representasi visual dalam dimensi 3D mutlak membutuhkan keberadaan sebuah **"Kamera" virtual** untuk menentukan sudut pandang (*View Matrix*). Dunia (*World Space*) harus diputar, digeser, dan dihitung relatif terhadap posisi lensa kamera sebelum direntangkan oleh distorsi matriks *Projection*.

*Perspective* mereplikasi sifat biologis mata manusia (memperkecil rasio objek saat menjauh untuk kedalaman ruang), sedangkan *Orthographic* meniadakan distorsi konvergensi untuk kegunaan rekayasa linear (CAD / arsitektur). Eksekusi **Z-Buffer (Depth Testing)** pada level *fragment* juga krusial agar GPU dapat mendeduksi objek mana yang terlihat tanpa bergantung pada urutan CPU memanggil *draw-call*.
