window.APP_CONFIG = Object.freeze({
  APP_NAME: "SIAP PIDUM Kejari Muna",
  APP_SUBTITLE: "Sistem Informasi Alur Administrasi Pidana Umum",
  OFFICE_NAME: "Kejaksaan Negeri Muna",
  // V7: browser hanya memanggil proxy di domain sendiri. URL Apps Script, ID Spreadsheet,
  // dan ID folder Drive TIDAK lagi dicantumkan di sini (disimpan di Environment Variables Vercel).
  API_ENDPOINT: "/api/gas",
  REQUEST_TIMEOUT_MS: 120000,
  // Alamat aplikasi SIKORDA (publik)
  SIKORDA_APP_URL: "https://sikordakejaksaan.vercel.app",
  DEMO_MODE: false
});
