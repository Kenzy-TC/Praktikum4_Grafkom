# Rotating 3D Cube Camera Playground

## Identitas
- **Nama:** Mario Napitupulu
- **NRP:** 5025241085 
- **Nama:** Nathanael Oliver
- **NRP:** 5025241109 
- **Mata Kuliah:** EF234504 Grafika Komputer
- **Praktikum:** Pertemuan 4 — Interactive Camera, Projection & 3D

---

## Deskripsi Aplikasi
Aplikasi ini merupakan implementasi praktikum Pertemuan 4 dengan fokus pada visualisasi 3D menggunakan cube, camera, View Matrix, Perspective Projection, Orthographic Projection, Depth Test, serta kontrol interaktif.

**Pipeline Utama:**
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

**Pada Vertex Shader:**
```glsl
P * V * M * localPosition
```

### Struktur Project
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
- **Model Matrix:** Cube dianimasikan pada sumbu X dan Y dengan *automatic rotation*:
  ```text
  rotationX += 25°/s
  rotationY += 40°/s
  ```
- **Camera dan View Matrix:** Camera menggunakan parameter berikut:
  ```text
  Position = (0, 1.5, 4)
  Target   = (0, 0, 0)
  Up       = (0, 1, 0)
  ```
  View Matrix dibuat dengan konsep `lookAt` menggunakan *forward*, *right*, dan *corrected up vector*.
- **Projection:** Menyediakan *Perspective Projection* (FOV default 60°) dan *Orthographic Projection* (aspect ratio mengikuti canvas). Terdapat fitur Projection Toggle, FOV interaktif (30°–110°), FOV Preset (35°/60°/90°), Near/Far preset, dan Split Mode (Perspective ‖ Orthographic berdampingan).
- **Depth Test:** Dapat diaktifkan/dimatikan menggunakan tombol `D`. Depth buffer dibersihkan setiap frame:
  ```javascript
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  ```
- **Multi-Cube Mode:** Mode opsional yang menampilkan 3 cube pada depth berbeda untuk mengamati pengaruh Depth Test secara langsung.

---

## Interaksi & Kontrol

### Kontrol Keyboard
| Tombol | Fungsi |
| :--- | :--- |
| **Arrow Keys** | Camera X / Y |
| **W / S** | Camera Z |
| **PageUp / PageDown** | Camera Height |
| **I / K** | Target Y + / - |
| **J / L** | Target X - / + |
| **O** | Projection Toggle (Perspective ↔ Orthographic) |
| **[ / ]** | FOV - / + |
| **1 / 2 / 3** | FOV Preset 35° / 60° / 90° |
| **N** | Near / Far Preset Cycle |
| **D** | Depth Test ON / OFF |
| **B** | Orbit Camera ON / OFF |
| **X** | Split Comparison Mode ON / OFF |
| **M** | Multi-Cube Mode ON / OFF |
| **R** | Reset Scene |

> 💡 **Catatan:** Semua tombol di atas juga tersedia sebagai *button* pada panel **Parameter Control** di sisi kanan canvas.

### Parameter Control (Panel UI)
| Slider | Rentang | Fungsi |
| :--- | :--- | :--- |
| **FOV perspective** | 30° – 110° | Mengubah Field of View |
| **Camera height** | -3 – 5 | Mengubah posisi Y camera |
| **Target X** | -2 – 2 | Menggeser target horizontal |
| **Target Y** | -2 – 2 | Menggeser target vertikal |

---

## Challenge yang Dikerjakan

### Challenge A — Orbit Camera
Camera bergerak melingkar terhadap target. Tekan **B** untuk mengaktifkan/menonaktifkan orbit.
```text
cameraX = targetX + cos(angle) × radius
cameraZ = targetZ + sin(angle) × radius
cameraY = konstan (mengikuti tinggi saat orbit diaktifkan)
```

### Challenge B — Camera Height Control
**PageUp** dan **PageDown** digunakan untuk menaikkan atau menurunkan posisi Y camera. Nilai juga dapat diubah melalui slider *Camera height*.

### Challenge C — Target Control
Camera position dipertahankan sementara target diubah. Kontrol **I/K/J/L** (dan slider Target X/Y) mengubah posisi target sehingga arah pandang dan View Matrix ikut berubah.
```text
Camera Position tetap + Target berubah = View Direction berubah
```

### Challenge D — Projection Comparison Split Mode
Tekan **X** untuk membagi canvas menjadi dua viewport:
- **Kiri:** Perspective
- **Kanan:** Orthographic

Keduanya menggunakan camera state dan Model Matrix yang sama, sehingga perbedaan projection dapat diamati langsung. Label *Perspective* dan *Orthographic* muncul di bagian atas masing-masing viewport.

### Challenge E — Multiple Cube Depth Test
Tekan **M** untuk menampilkan 3 cube pada depth berbeda:
- **Cube A:** offset z = +1.5 (paling dekat)
- **Cube B:** offset z = 0.0 (tengah)
- **Cube C:** offset z = -1.5 (paling jauh)

Tekan **D** untuk membandingkan visibility saat Depth Test ON vs OFF. Saat OFF, cube yang digambar paling akhir menimpa cube di depannya — membuktikan bahwa draw order saja tidak cukup untuk menentukan visibility object 3D.

### Challenge F — FOV & Near/Far Presets
Gunakan **1** (35°), **2** (60°), **3** (90°), atau tekan tombol FOV Preset di panel untuk siklus. Nilai FOV aktif ditampilkan pada HUD.
Tersedia tiga preset Near/Far (tekan **N** untuk berpindah preset):
- `0.1 / 100`
- `1.0 / 20`
- `2.5 / 8`

---

## State-Based dan Event-Based Input

**State-based** digunakan untuk aksi kontinu (diperiksa setiap frame):
- Camera movement (Arrow, W/S, PageUp/PageDown)
- FOV adjustment (`[` / `]`)
- Target movement (I/J/K/L)
- Camera height (PageUp/PageDown)

**Event-based** digunakan untuk aksi sekali per penekanan:
- Projection toggle (O)
- Depth Test toggle (D)
- Near/Far preset (N)
- Orbit toggle (B)
- Split mode toggle (X)
- Multi-cube toggle (M)
- FOV preset (1/2/3)
- Reset (R)

---

## Cara Menjalankan

Project menggunakan ES Module sehingga wajib dijalankan melalui local development server (tidak bisa double-click `index.html`).

**Menggunakan Python:**
```bash
cd praktikum-camera-04
python -m http.server 8000
```
Lalu buka browser ke: `http://localhost:8000`

**Atau menggunakan VS Code:**
Gunakan ekstensi **Live Server**: klik kanan `index.html` → *Open with Live Server*.

---

## Pengujian

| No. | Pengujian | Hasil yang Diharapkan |
| :---: | :--- | :--- |
| 1 | Load aplikasi | Cube tampil & berputar otomatis |
| 2 | Arrow Keys | Camera X/Y berubah |
| 3 | W/S | Camera Z berubah |
| 4 | PageUp/PageDown | Camera height berubah |
| 5 | I/J/K/L | Target berubah |
| 6 | O | Projection berganti |
| 7 | [ / ] | FOV berubah |
| 8 | 1/2/3 | FOV 35°/60°/90° aktif |
| 9 | N | Near/Far preset berganti |
| 10 | D | Depth Test ON/OFF |
| 11 | B | Orbit Camera ON/OFF |
| 12 | X | Split comparison muncul/hilang |
| 13 | M | Multi-cube muncul/hilang |
| 14 | R | State kembali ke awal |
| 15 | HUD | Nilai sesuai state |
| 16 | Slider panel | Semua slider mengubah state |
| 17 | Console | Tidak ada error saat penggunaan normal |

---

## Catatan Debugging

*   `gl.useProgram(program)` harus dipanggil sebelum `drawArrays`, kalau tidak cube tidak akan muncul dan Console akan menampilkan `INVALID_OPERATION: no valid shader program in use`.
*   `a_position` menggunakan ukuran 3 karena vertex berupa `(x, y, z)`.
*   View Matrix bergantung pada camera position, target, dan up vector.
*   Perspective Projection menggunakan FOV dalam radian dan aspect ratio yang sesuai viewport.
*   Projection valid jika `near > 0` dan `far > near`.
*   Depth buffer dibersihkan setiap frame.
*   Jika orientasi camera aneh, periksa *forward*, *right*, *corrected up*, dan urutan *cross product*.
*   Matrix dan `gl.uniformMatrix4fv(..., false, matrix)` harus menggunakan *convention column-major* yang konsisten.
*   Saat Split Mode aktif, kedua viewport memakai camera state dan geometry yang sama, tetapi masing-masing menghitung aspect ratio berdasarkan lebar viewport-nya.
*   Saat Multi-Cube + Depth OFF, urutan `gl.drawArrays` menentukan cube mana yang tampak di depan.

---

## Refleksi Singkat
Praktikum ini memperlihatkan bahwa scene 3D membutuhkan camera untuk menentukan sudut pandang terhadap object. View Matrix digunakan untuk mengubah world space berdasarkan posisi, target, dan up vector camera, sedangkan Projection Matrix menentukan bagaimana scene dipetakan ke clip space. Perspective memberi efek depth karena object yang lebih jauh tampak lebih kecil, sedangkan Orthographic mempertahankan ukuran relatif terhadap depth. FOV mengubah lebar area pandang, sedangkan near dan far menentukan batas clipping. Depth Test penting untuk menentukan fragment berdasarkan kedalaman sehingga object 3D dapat ditampilkan dengan visibility yang sesuai.