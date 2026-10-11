require('dotenv').config();

async function cekModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  console.log("Mengecek daftar model ke server Google...\n");
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      console.log("Error dari Google:", data.error.message);
      return;
    }

    console.log("✅ Model yang TERSEDIA untuk API Key Anda:");
    data.models.forEach(model => {
      // Hanya menampilkan model yang mendukung fitur generateContent (Chat)
      if (model.supportedGenerationMethods.includes("generateContent")) {
         console.log("- " + model.name.replace("models/", ""));
      }
    });
  } catch (error) {
    console.error("Gagal terhubung:", error);
  }
}

cekModel();