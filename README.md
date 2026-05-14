# 🧠 Cognistra - Autonomous STEM Learning Agent

Cognistra adalah platform pembelajaran STEM interaktif yang menggunakan AI untuk memberikan pengalaman belajar yang dipersonalisasi. Dengan dukungan text-to-speech, sistem poin, dan mode pembelajaran yang fleksibel, Cognistra membantu siswa menguasai konsep sains dengan lebih efektif.

## ✨ Fitur Utama

### 📚 Empat Subjek Pembelajaran
- **Fisika** (⚛️) - Mekanika, gaya, dan hukum dasar
- **Kimia** (🧪) - Reaksi kimia dan ikatan molekul
- **Matematika** (📐) - Diskrit, aljabar, dan kalkulus
- **Biologi** (🧬) - Anatomi, genetika, dan bioteknologi

### 🎯 Dua Mode Pembelajaran
- **Vocational** - Fokus pada aplikasi praktis untuk RPL (Rekayasa Perangkat Lunak)
- **Foundation** - Fokus pada teori dan kalkulasi murni

### 🔊 Fitur Audio
- Text-to-speech terintegrasi dalam bahasa Indonesia
- Tombol "Dengarkan Audio" untuk setiap respons assistant
- Kontrol playback otomatis

### 🏆 Sistem Skill & XP
- Tracking progress untuk setiap subjek (0-100%)
- Sistem XP gain untuk validasi jawaban
- Real-time progress visualization

### 💬 Multi-Room Chat Architecture
- Isolasi chat history per subjek dan mode
- Seamless switching antar mata pelajaran
- Persistent chat memory

## 🛠️ Tech Stack

- **Frontend Framework**: React 18+ dengan Vite
- **Styling**: Tailwind CSS + PostCSS
- **UI Icons**: Lucide React
- **Markdown Rendering**: React Markdown
- **AI Backend**: n8n Webhook Integration
- **Text-to-Speech**: Web Speech API (Bahasa Indonesia)
- **Linting**: ESLint

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm atau yarn

### Installation

```bash
git clone https://github.com/fadlanth/Cognistra.git
cd Cognistra
npm install
npm run dev
```

## 🔧 Konfigurasi

Update `N8N_WEBHOOK_URL` di `src/App.jsx` dengan endpoint n8n Anda.

## 👨‍💻 Author

**Fadlan** - [@fadlanth](https://github.com/fadlanth)

---

Made with ❤️ for STEM learners
