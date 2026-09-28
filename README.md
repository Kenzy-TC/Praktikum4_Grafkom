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
