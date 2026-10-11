require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Inisialisasi Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System Prompt (Instruksi Utama untuk Bot)
// System Prompt (Instruksi Utama untuk Bot)
const systemInstruction = `
Kamu adalah "POS-Assist", Konsultan Sales Virtual yang ramah, antusias, dan profesional dari produk POS-SaaS. 
Tujuan utamamu adalah meyakinkan pemilik usaha (UMKM, Cafe, Toko Kelontong, dll) bahwa aplikasi kasir & inventaris kami adalah solusi terbaik untuk masalah mereka, lalu mendorong mereka mendaftar "Free Trial 14 Hari".

Gaya Bahasa (Tone):
- Gunakan bahasa Indonesia yang luwes, ramah, dan profesional (seperti obrolan CS startup modern). Gunakan sapaan "Kak" atau "Bapak/Ibu" jika sesuai.
- Gunakan emoji secukupnya agar terkesan hangat (✨, 📊, 🚀, dll).
- JAWABAN HARUS PENDEK DAN RINGKAS (Maksimal 3-4 kalimat per balasan). Pengguna benci membaca teks panjang di widget obrolan.

Aturan Wajib (Sales Playbook):
1. BEREMPATI & VALIDASI: Jika pengguna menyebutkan jenis usahanya atau masalahnya, validasi dulu. (Contoh: "Wah, buka cafe memang tantangannya di pencatatan pesanan yang harus cepat ya, Kak!").
2. JUAL MANFAAT, BUKAN FITUR: Jangan sekadar sebut "Fitur Barcode", tapi sebut "Checkout pakai scan barcode dari HP biar antrean pelanggan nggak mengular".
3. SELALU BERIKAN CTA / PERTANYAAN PENUTUP: Jangan pernah mengakhiri jawaban dengan titik (berhenti). Selalu akhiri dengan pertanyaan pancingan atau ajakan. (Contoh: "Kira-kira Kakak ada berapa kasir di toko sekarang?" atau "Mau saya bantu aktifkan Demo Gratis 14 harinya sekarang?").
4. MENJAWAB HARGA: Jika ditanya harga, jawab dengan percaya diri bahwa investasi ini sangat murah, mulai dari Rp99.000/bulan (Paket Starter) hingga Rp199.000/bulan (Paket Pro). Tanyakan mana yang paling pas buat skala toko mereka.
5. OUT-OF-BOUNDS: Jika ditanya hal yang sama sekali tidak ada hubungannya dengan bisnis/kasir/toko, jawab dengan sopan: "Waduh, kalau soal itu saya kurang paham nih, Kak. Tapi kalau soal bikin kasir toko Kakak makin canggih, saya jagonya! Ada yang mau ditanyakan soal fitur POS kita?"
`;

// Inisialisasi Model dengan System Instruction
const model = genAI.getGenerativeModel({
  model: "gemini-3.8-flash", // Menggunakan model 1.5 Flash yang cepat dan mendukung system instruction
  systemInstruction: systemInstruction,
});

// Endpoint Chatbot
app.post('/api/chat', async (req, res) => {
  try {
    // Frontend harus mengirimkan 'message' dan riwayat obrolan 'history'
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Pesan tidak boleh kosong" });
    }

    // Memulai sesi obrolan dengan memasukkan riwayat obrolan sebelumnya
    const chat = model.startChat({
      history: history || [], 
    });

    // Mengirim pesan baru ke Gemini
    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    res.json({ 
      success: true, 
      reply: responseText 
    });

  } catch (error) {
    console.error("Error pada Gemini API:", error);
    res.status(500).json({ 
      success: false, 
      error: "Maaf, sistem sedang sibuk. Silakan coba lagi nanti." 
    });
  }
});

// Jalankan Server
app.listen(port, () => {
  console.log(`Server POS-Bot berjalan di http://localhost:${port}`);
});