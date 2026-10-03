/*
 * SIAP PIDUM Kejaksaan Negeri Muna
 * Frontend statis untuk Vercel + backend Google Apps Script.
 */
(() => {
  "use strict";

  // Bila index.html lama masih memuat app.js dua kali, salinan kedua berhenti di sini.
  // (Salinan kedua dulu menimpa window.openAiSidebar dengan state kosong → error
  //  "Cannot read properties of undefined (reading 'classList')" saat Analisa AI.)
  if (window.__SIAP_PIDUM_LOADED__) return;
  window.__SIAP_PIDUM_LOADED__ = true;

  const CONFIG = window.APP_CONFIG;
  const ADMIN_FORM_SCHEMAS = window.SIAP_ADMIN_FORM_SCHEMAS || {};
  const STORAGE_KEY = "siap_pidum_session_v1";
  const STATUS = Object.freeze({
    SPDP_DITERIMA: { label: "SPDP Diterima", tone: "blue" },
    VERIFIKASI_SPDP: { label: "Verifikasi SPDP", tone: "amber" },
    P16_DITERBITKAN: { label: "P-16 Diterbitkan", tone: "blue" },
    KOORDINASI: { label: "Koordinasi", tone: "amber" },
    MENUNGGU_BERKAS_TAHAP_I: { label: "Menunggu Berkas Tahap I", tone: "amber" },
    BERKAS_TAHAP_I_DITERIMA: { label: "Berkas Tahap I Diterima", tone: "blue" },
    PENELITIAN_BERKAS: { label: "Penelitian Berkas", tone: "blue" },
    P19_PENGEMBALIAN_BERKAS: { label: "P-19 / Berkas Dikembalikan", tone: "red" },
    PENYIDIKAN_TAMBAHAN: { label: "Penyidikan Tambahan", tone: "amber" },
    P21_LENGKAP: { label: "P-21 / Lengkap", tone: "green" },
    MENUNGGU_TAHAP_II: { label: "Menunggu Tahap II", tone: "amber" },
    TAHAP_II: { label: "Tahap II", tone: "green" },
    PENUNTUTAN: { label: "Penuntutan", tone: "blue" },
    DILIMPAHKAN_KE_PN: { label: "Dilimpahkan ke PN", tone: "green" },
    SIDANG: { label: "Persidangan", tone: "blue" },
    SELESAI: { label: "Selesai", tone: "green" },
    SPDP_DIKEMBALIKAN: { label: "SPDP Dikembalikan", tone: "red" },
    DIHENTIKAN: { label: "Dihentikan", tone: "gray" }
  });

  /*
   * Tahapan dashboard diselaraskan dengan Lampiran Surat JAM-Pidum
   * Nomor B-310/E/Ejp/01/2026 (Alur Kerja & Daftar Formulir Pola Koordinasi).
   * phase: "pra" = Prapenuntutan, "tut" = Penuntutan.
   */
  const DASHBOARD_STAGES = Object.freeze([
    { key: "spdp", label: "SPDP & verifikasi", short: "SPDP", phase: "pra", statuses: ["SPDP_DITERIMA", "VERIFIKASI_SPDP"] },
    { key: "p16", label: "Penunjukan PU (P-16)", short: "P-16", phase: "pra", statuses: ["P16_DITERBITKAN"] },
    { key: "koordinasi", label: "Koordinasi & pemantauan", short: "Koordinasi", phase: "pra", statuses: ["KOORDINASI", "MENUNGGU_BERKAS_TAHAP_I"] },
    { key: "tahap1", label: "Tahap I · penelitian berkas", short: "Tahap I", phase: "pra", statuses: ["BERKAS_TAHAP_I_DITERIMA", "PENELITIAN_BERKAS"] },
    { key: "p19", label: "P-19 · penyidikan tambahan", short: "P-19", phase: "pra", statuses: ["P19_PENGEMBALIAN_BERKAS", "PENYIDIKAN_TAMBAHAN"] },
    { key: "p21", label: "P-21 · berkas lengkap", short: "P-21", phase: "pra", statuses: ["P21_LENGKAP", "MENUNGGU_TAHAP_II"] },
    { key: "tahap2", label: "Tahap II", short: "Tahap II", phase: "tut", statuses: ["TAHAP_II"] },
    { key: "dakwaan", label: "Penuntutan · dakwaan (P-29)", short: "Dakwaan", phase: "tut", statuses: ["PENUNTUTAN"] },
    { key: "sidang", label: "Pelimpahan & persidangan", short: "Sidang", phase: "tut", statuses: ["DILIMPAHKAN_KE_PN", "SIDANG", "SELESAI"] }
  ]);

  /* Langkah berikutnya yang disarankan per status (berdasarkan B-310). */
  const NEXT_STEP_BY_STATUS = Object.freeze({
    SPDP_DITERIMA: { code: "P-16", text: "Verifikasi SPDP (≤7 hari & kesetaraan) lalu terbitkan P-16" },
    VERIFIKASI_SPDP: { code: "P-16", text: "Terbitkan P-16 atau SOP FORM-1A/1 bila SPDP cacat formil" },
    P16_DITERBITKAN: { code: "SOP FORM-6", text: "Koordinasi dengan penyidik ≤3 hari sejak SPDP" },
    KOORDINASI: { code: "P-1B", text: "Pantau berkas Tahap I (30 hari) · isi check list SOP FORM-5" },
    MENUNGGU_BERKAS_TAHAP_I: { code: "P-17", text: "Bila 30 hari berkas belum masuk: SOP FORM-1B → P-17 → SOP FORM-2" },
    BERKAS_TAHAP_I_DITERIMA: { code: "P-24", text: "Teliti berkas (SOP FORM-5), ekspose (SOP FORM-5A), buat P-24" },
    PENELITIAN_BERKAS: { code: "P-19/P-21", text: "Tetapkan sikap: P-19 (belum lengkap) atau P-21 (lengkap)" },
    P19_PENGEMBALIAN_BERKAS: { code: "P-18 · P-1C", text: "Kirim petunjuk P-19 dengan P-18 & P-1C · pantau 14 hari" },
    PENYIDIKAN_TAMBAHAN: { code: "P-1B", text: "Terima berkas susulan (P-1B) atau P-20 bila >14 hari" },
    P21_LENGKAP: { code: "Tahap II", text: "Penyerahan tersangka & barang bukti ≤14 hari" },
    MENUNGGU_TAHAP_II: { code: "BA-4 · BA-5", text: "Siapkan Tahap II: BA-4, BA-4A, BA-5, BA-5A" },
    TAHAP_II: { code: "P-29", text: "Sempurnakan surat dakwaan (P-29) untuk pelimpahan" },
    PENUNTUTAN: { code: "PN", text: "Limpahkan perkara ke Pengadilan Negeri" },
    DILIMPAHKAN_KE_PN: { code: "Sidang", text: "Catat nomor perkara PN & jadwal sidang" },
    SIDANG: { code: "Sidang", text: "Ikuti agenda sidang hingga putusan" },
    SELESAI: { code: "Selesai", text: "Perkara selesai" },
    SPDP_DIKEMBALIKAN: { code: "Arsip", text: "SPDP dikembalikan · tunggu SPDP/Sprindik baru" },
    DIHENTIKAN: { code: "Arsip", text: "Perkara dihentikan" }
  });

  /*
   * Alur kerja lengkap Prapenuntutan → Penuntutan sesuai Lampiran B-310/E/Ejp/01/2026.
   * no = nomor butir pada lampiran; tone: main | branch | optional.
   */
  const B310_FLOW = Object.freeze([
    {
      id: "spdp", phase: "pra", title: "Penerimaan & verifikasi SPDP", range: "Butir 1–5",
      summary: "SPDP diterima PTSP, diverifikasi tenggat 7 hari sejak Sprindik dan kesetaraan instansi penyidik.",
      deadline: "SPDP ≤ 7 hari sejak Sprindik",
      steps: [
        { no: "1", code: "SOP FORM-6A", title: "BA Konsultasi Penyelidik dan Jaksa", detail: "Opsional, sebelum SPDP dikirim.", tone: "optional" },
        { no: "2", code: "P-1A", title: "Tanda Terima Penerimaan SPDP", detail: "Oleh Kabag TU/Kasubbag Bin/Kaur Bin; catat selisih hari Sprindik–SPDP.", tone: "main" },
        { no: "3", code: "SOP FORM-1A", title: "Nota Pendapat Pengembalian SPDP", detail: "Bila SPDP > 7 hari atau penyidik tidak setara.", tone: "branch" },
        { no: "4", code: "SOP FORM-1", title: "Surat Pengembalian SPDP kepada Penyidik", detail: "Tindak lanjut nota pendapat pengembalian.", tone: "branch" },
        { no: "5", code: "SK", title: "Pengangkatan Jaksa Sementara", detail: "Untuk SPDP di Jampidum/Kejati (menunggu Kepja pendelegasian).", tone: "optional" }
      ]
    },
    {
      id: "p16", phase: "pra", title: "Penunjukan Penuntut Umum", range: "Butir 6–7",
      summary: "Pimpinan menerbitkan Surat Perintah Penunjukan Jaksa dan P-16 untuk mengikuti perkembangan penyidikan.",
      deadline: "Segera setelah SPDP terverifikasi",
      steps: [
        { no: "6", code: "Sprint", title: "Surat Perintah Penunjukan Jaksa selaku PU", detail: "Komposisi tim sesuai tempat SPDP diterima (Kejari: Kajari, Kasi, Jaksa).", tone: "main" },
        { no: "7", code: "P-16", title: "Surat Perintah Mengikuti Perkembangan Penyidikan", detail: "Dasar tim PU untuk koordinasi & penelitian berkas.", tone: "main" }
      ]
    },
    {
      id: "koordinasi", phase: "pra", title: "Koordinasi & pemantauan penyidikan", range: "Butir 8–29",
      summary: "PU berkoordinasi dengan penyidik, mengisi check list sejak awal, menangani perpanjangan penahanan, dan menagih berkas.",
      deadline: "Koordinasi ≤ 3 hari · berkas Tahap I ≤ 30 hari",
      steps: [
        { no: "8–10", code: "SOP FORM-6", title: "BA Koordinasi Penyidik dan PU", detail: "Penetapan tersangka, upaya paksa, alat bukti, keadilan restoratif, pemeriksaan lapangan.", tone: "main" },
        { no: "9", code: "SOP FORM-5", title: "Check List Penelitian Hasil Penyidikan", detail: "Diisi sejak SPDP diterima untuk aspek formil & materil.", tone: "main" },
        { no: "11", code: "SOP FORM-1B", title: "Laporan PU bila tidak ada koordinasi 3 hari", detail: "Dilaporkan kepada pimpinan.", tone: "branch" },
        { no: "12", code: "SOP FORM-1C", title: "Pemberitahuan Kewajiban Koordinasi", detail: "Pimpinan memberitahu atasan penyidik.", tone: "branch" },
        { no: "13", code: "SOP FORM-4", title: "Nota Pendapat Perpanjangan Penahanan", detail: "Atas permintaan perpanjangan penahanan penyidik.", tone: "branch" },
        { no: "14", code: "T-4", title: "Surat Perpanjangan Penahanan", detail: "Bila permintaan disetujui.", tone: "branch" },
        { no: "15", code: "T-5", title: "Penolakan Perpanjangan Penahanan", detail: "Bila permintaan ditolak, disertai alasan.", tone: "branch" },
        { no: "16–22", code: "SM-2 s.d. SM-6", title: "Penetapan Saksi Mahkota", detail: "Koordinasi, nota pendapat, surat tugas, panggilan, kesepakatan, permohonan & pemberitahuan penetapan.", tone: "optional" },
        { no: "23", code: "SOP FORM-6", title: "Koordinasi pengakuan bersalah tersangka", detail: "Bila penyidik akan menerima pengakuan bersalah.", tone: "optional" },
        { no: "24–25", code: "SOP FORM-1B · P-17", title: "Permintaan Perkembangan Penyidikan Pertama", detail: "30 hari sejak SPDP berkas belum dikirim.", tone: "branch" },
        { no: "26", code: "SOP FORM-2", title: "Permintaan Perkembangan Penyidikan Kedua", detail: "30 hari sejak P-17 berkas belum dikirim.", tone: "branch" },
        { no: "27–28", code: "SOP FORM-3", title: "Pengembalian SPDP karena hasil penyidikan belum diterima", detail: "30 hari sejak SOP FORM-2; bundel administrasi diarsipkan.", tone: "branch" },
        { no: "29", code: "P-16", title: "P-16 baru bila SPDP dikirim kembali", detail: "Komposisi tim sedapat mungkin sama.", tone: "optional" },
        { no: "32–43", code: "PRAPID-1 s.d. 7A", title: "Praperadilan pada tahap penyidikan", detail: "Bila PU menjadi turut termohon atau perlu derden verzet.", tone: "optional" }
      ]
    },
    {
      id: "tahap1", phase: "pra", title: "Tahap I · penelitian berkas perkara", range: "Butir 30–31, 44–49",
      summary: "Berkas hasil penyidikan diterima, diteliti melalui check list dan ekspose, lalu dituangkan dalam P-24.",
      deadline: "Sikap PU dituangkan dalam P-24",
      steps: [
        { no: "30", code: "P-1B", title: "Tanda Terima Berkas Perkara oleh PU", detail: "Penelitian dilanjutkan dengan SOP FORM-5.", tone: "main" },
        { no: "31", code: "SOP FORM-5A", title: "BA Pelaksanaan Ekspose", detail: "Masukan konstruktif sebelum P-24.", tone: "main" },
        { no: "44", code: "P-24", title: "Berita Acara Pendapat Hasil Penelitian Berkas", detail: "Melampirkan SOP FORM-6 dan SOP FORM-5.", tone: "main" },
        { no: "45–46", code: "P-29 · P-30 (Rencana)", title: "Rencana Surat Dakwaan / Catatan PU", detail: "Dilampirkan bila berkas dinilai lengkap (P-30 untuk APS).", tone: "main" },
        { no: "48–49", code: "Pernyataan Pendapat", title: "Untuk berkas yang diteliti Jampidum/Kejati", detail: "Disertai surat pengantar ke Kejari.", tone: "optional" }
      ]
    },
    {
      id: "p19", phase: "pra", title: "Berkas belum lengkap · penyidikan tambahan", range: "Butir 50–68",
      summary: "PU memberi petunjuk P-19 dan mengembalikan berkas; penyidikan tambahan dipantau 14 hari hingga gelar perkara bersama bila perlu.",
      deadline: "Penyidikan tambahan ≤ 14 hari",
      steps: [
        { no: "50", code: "P-19", title: "Petunjuk hal yang harus dilengkapi", detail: "Konsisten dengan koordinasi, check list, dan P-24.", tone: "main" },
        { no: "51", code: "P-18", title: "Pengantar pengembalian berkas disertai petunjuk", detail: "Dikirim pimpinan kepada penyidik.", tone: "main" },
        { no: "52", code: "P-1C", title: "Keterangan penyerahan berkas untuk dilengkapi", detail: "Bukti pengembalian berkas.", tone: "main" },
        { no: "53–54", code: "SOP FORM-1B · P-20", title: "Pengembalian SPDP (penyidikan tambahan > 14 hari)", detail: "Bundel administrasi diarsipkan; P-16 baru bila dikirim kembali.", tone: "branch" },
        { no: "55–57", code: "P-1B · SOP FORM-5 · P-24", title: "Penelitian berkas hasil penyidikan tambahan", detail: "Berkas susulan diterima & diteliti ulang.", tone: "main" },
        { no: "58", code: "SOP FORM-6", title: "Koordinasi bila petunjuk belum dipenuhi", detail: "Berkas dikembalikan dengan berita acara koordinasi.", tone: "branch" },
        { no: "59–61", code: "SOP FORM-5A · 5B · 6E", title: "Ekspose & Gelar Perkara Bersama", detail: "Dapat menghadirkan korban, tersangka, pengawas PU, atau ahli.", tone: "branch" },
        { no: "62–64", code: "P-1B · P-24 · P-21", title: "Berkas lengkap hasil gelar perkara bersama", detail: "Dilampiri BA gelar & rencana dakwaan.", tone: "branch" },
        { no: "65–68", code: "SOP FORM-5A · 8", title: "Perbedaan sikap: dapat/tidaknya penyerahan tersangka & BB", detail: "Ditentukan ekspose bersama pimpinan.", tone: "branch" }
      ]
    },
    {
      id: "p21", phase: "pra", title: "Berkas lengkap (P-21)", range: "Butir 47, 68–72",
      summary: "Kajari menerbitkan P-21 dan meminta penyerahan tersangka serta barang bukti dalam 14 hari (dapat dua tahap).",
      deadline: "Tahap II ≤ 14 hari sejak P-21",
      steps: [
        { no: "47", code: "P-21", title: "Pemberitahuan hasil penyidikan sudah lengkap", detail: "Penyerahan dapat dibagi: penelitian barang bukti, lalu tersangka.", tone: "main" },
        { no: "68", code: "SOP FORM-1B", title: "Laporan bila 14 hari Tahap II tidak dilaksanakan", detail: "Pimpinan mengembalikan berkas & SPDP.", tone: "branch" },
        { no: "69", code: "SOP FORM-7", title: "Pengembalian SPDP dan Berkas Perkara", detail: "Setelah dibuat salinan arsip.", tone: "branch" },
        { no: "70–72", code: "P-16 · P-24B · SOP FORM-8A", title: "Pengiriman ulang SPDP & berkas", detail: "Cukup verifikasi (P-24B) lalu minta penyerahan tersangka & BB.", tone: "branch" }
      ]
    },
    {
      id: "tahap2", phase: "tut", title: "Tahap II · tersangka & barang bukti", range: "Butir 73–77",
      summary: "Tanggung jawab tersangka dan barang bukti beralih dari penyidik ke Penuntut Umum.",
      deadline: "Saat penyerahan",
      steps: [
        { no: "73", code: "BA-5", title: "Penerimaan & penelitian benda sitaan/barang bukti", detail: "Audit fisik barang bukti secara komprehensif.", tone: "main" },
        { no: "74", code: "BA-4", title: "Penerimaan & penelitian tersangka", detail: "Pemeriksaan tersangka pada Tahap II.", tone: "main" },
        { no: "75", code: "BA-4A", title: "Pemenuhan hak bantuan hukum", detail: "Penunjukan advokat/pemberi bantuan hukum.", tone: "main" },
        { no: "76", code: "BA-5A", title: "Nota pendapat hasil penyerahan tersangka & BB", detail: "Dapat/tidaknya pelimpahan tanggung jawab diterima.", tone: "main" },
        { no: "77", code: "BA-5C", title: "Serah terima pengelolaan fisik barang bukti", detail: "Ke bagian Pemulihan Aset bila dititipkan/dilelang/dimusnahkan.", tone: "optional" }
      ]
    },
    {
      id: "dakwaan", phase: "tut", title: "Penuntutan · surat dakwaan", range: "Lanjutan Tahap II",
      summary: "Rencana dakwaan disempurnakan menjadi P-29 (atau catatan PU P-30 untuk APS) sebagai dasar pelimpahan.",
      deadline: "Sebelum pelimpahan",
      steps: [
        { no: "—", code: "P-29", title: "Surat Dakwaan", detail: "Cermat, jelas, lengkap; memuat tempus, locus, dan unsur pasal.", tone: "main" },
        { no: "—", code: "P-30", title: "Catatan Penuntut Umum (APS)", detail: "Untuk perkara acara pemeriksaan singkat.", tone: "optional" }
      ]
    },
    {
      id: "sidang", phase: "tut", title: "Pelimpahan & persidangan", range: "Lanjutan",
      summary: "Perkara dilimpahkan ke Pengadilan Negeri; catat nomor perkara PN, agenda sidang, tuntutan, dan putusan.",
      deadline: "Mengikuti penetapan hari sidang",
      steps: [
        { no: "—", code: "Pelimpahan", title: "Pelimpahan perkara ke Pengadilan Negeri", detail: "Nomor perkara PN dicatat di detail perkara.", tone: "main" },
        { no: "—", code: "Sidang", title: "Persidangan hingga putusan", detail: "Agenda: dakwaan, saksi, tuntutan, pledoi, putusan.", tone: "main" }
      ]
    }
  ]);

  const ADMINISTRATION_STAGES = Object.freeze([
    {
      code: "P-16",
      title: "Penunjukan Penuntut Umum",
      detail: "Mencatat surat perintah penunjukan Penuntut Umum.",
      status: "P16_DITERBITKAN",
      prerequisites: []
    },
    {
      code: "P-17",
      title: "Permintaan perkembangan hasil penyidikan",
      detail: "Penagihan hasil penyidikan setelah 30 hari.",
      status: "MENUNGGU_BERKAS_TAHAP_I",
      prerequisites: []
    },
    {
      code: "P-24",
      title: "Nota pendapat hasil penelitian",
      detail: "Mencatat hasil penelitian formil dan materil berkas perkara.",
      status: "PENELITIAN_BERKAS",
      prerequisites: []
    },
    {
      code: "P-19",
      title: "Berkas belum lengkap",
      detail: "Mencatat petunjuk yang harus dilengkapi oleh penyidik.",
      status: "P19_PENGEMBALIAN_BERKAS",
      prerequisites: []
    },
    {
      code: "P-21",
      title: "Berkas lengkap",
      detail: "Mencatat pemberitahuan bahwa hasil penyidikan sudah lengkap.",
      status: "P21_LENGKAP",
      prerequisites: []
    },
    {
      code: "P-29",
      title: "Surat dakwaan",
      detail: "Mencatat surat dakwaan setelah berkas dinyatakan lengkap.",
      status: "PENUNTUTAN",
      prerequisites: []
    },
    {
      code: "T-4",
      title: "Surat Perpanjangan Penahanan",
      detail: "Mencatat perpanjangan penahanan tersangka dari penyidik.",
      status: "PENELITIAN_BERKAS",
      prerequisites: []
    },
    {
      code: "SOP FORM 1",
      title: "SOP Form 1",
      detail: "Mencatat kelengkapan administrasi untuk SOP Form 1.",
      status: "MENUNGGU_BERKAS_TAHAP_I", 
      prerequisites: [] 
    },
    {
      code: "SOP FORM 2",
      title: "SOP Form 2",
      detail: "Mencatat kelengkapan administrasi untuk SOP Form 2.",
      status: "MENUNGGU_BERKAS_TAHAP_I",
      prerequisites: []
    },
    {
      code: "SOP FORM 3",
      title: "SOP Form 3",
      detail: "Mencatat kelengkapan administrasi untuk SOP Form 3.",
      status: "SPDP_DIKEMBALIKAN",
      prerequisites: []
    }
  ]);

  const REMINDER_ADMIN_TYPES = Object.freeze([
    { code: "P-16", label: "P-16 — Penunjukan Penuntut Umum", defaultDays: 7, base: "received" },
    { code: "P-17", label: "P-17 — Permintaan perkembangan hasil penyidikan", defaultDays: null, base: "received" },
    { code: "P-18", label: "P-18 — Pengantar pengembalian berkas", defaultDays: null, base: "received" },
    { code: "P-19", label: "P-19 — Petunjuk berkas belum lengkap", defaultDays: 7, base: "received" },
    { code: "P-21", label: "P-21 — Berkas lengkap", defaultDays: 7, base: "received" },
    { code: "TAHAP 2", label: "Tahap 2 — Penyerahan tersangka dan barang bukti", defaultDays: null, base: "received" },
    { code: "P-29", label: "P-29 — Surat dakwaan", defaultDays: null, base: "received" },
    { code: "SOP FORM 1", label: "SOP Form 1", defaultDays: null, base: "received" },
    { code: "SOP FORM 2", label: "SOP Form 2", defaultDays: null, base: "received" },
    { code: "SOP FORM 3", label: "SOP Form 3", defaultDays: null, base: "received" },
    { code: "SOP FORM 4", label: "SOP Form 4", defaultDays: null, base: "received" },
    { code: "SOP FORM 5", label: "SOP Form 5", defaultDays: null, base: "received" },
    { code: "SOP FORM 6", label: "SOP Form 6", defaultDays: null, base: "received" }
  ]);

  const REMINDER_PROGRESS_STAGES = Object.freeze([
    { code: "P-16", label: "Penunjukan Penuntut Umum" },
    { code: "P-17", label: "Permintaan perkembangan hasil penyidikan" },
    { code: "P-18", label: "Pengantar pengembalian berkas" },
    { code: "P-19", label: "Petunjuk berkas belum lengkap" },
    { code: "P-21", label: "Pemberitahuan berkas lengkap" },
    { code: "TAHAP 2", label: "Penyerahan tersangka dan barang bukti" },
    { code: "P-29", label: "Surat dakwaan" },
    { code: "SOP FORM 1", label: "SOP Form 1" },
    { code: "SOP FORM 2", label: "SOP Form 2" },
    { code: "SOP FORM 3", label: "SOP Form 3" },
    { code: "SOP FORM 4", label: "SOP Form 4" },
    { code: "SOP FORM 5", label: "SOP Form 5" },
    { code: "SOP FORM 6", label: "SOP Form 6" }
  ]);

  const state = {
    session: null,
    cases: [],
    activePage: "dashboard",
    selectedFile: null,
    selectedAdministrationFile: null,
    connected: false,
    search: "",
    statusFilter: "ALL",
    deadlineFilter: "ALL",
    stageFilter: "ALL",
    administrationBuilder: { caseId: "", type: "" },
    reminders: [],
    reminderProgress: [],
    prosecutors: [],
    reminderMeta: { fonnteConfigured: false, triggerInstalled: false, triggerHour: 8, timezone: "Asia/Makassar" },
    remindersLoaded: false,
    reminderBuilder: { caseId: "", type: "P-16", reminderId: "" },
    reminderFilter: "ALL",
    tikReminders: [],
    tikMeta: { intelijenCount: 0, validPhoneCount: 0, fonnteConfigured: false },
    tikLoaded: false,
    tikSelectedFiles: [],
    caseModalTab: "ringkasan",
    lastLoadedAt: null,
    prosecutorsLoadedAt: 0
  };

  const els = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    if (window.__SIAP_PIDUM_BOOTED__) return; // cegah inisialisasi ganda bila skrip termuat dua kali
    window.__SIAP_PIDUM_BOOTED__ = true;
    cacheElements();
    bindGlobalEvents();
    bindPageDelegation();
    installGlobalSafetyNet();
    setCurrentDate();
    restoreSession();
  }

  /* Tangkap error tak terduga agar aplikasi tidak "crash" diam-diam. */
  function installGlobalSafetyNet() {
    let lastErrorAt = 0;
    const report = (message) => {
      console.error(message);
      const now = Date.now();
      if (now - lastErrorAt < 4000) return; // hindari banjir toast
      lastErrorAt = now;
      toast("error", "Terjadi kendala", "Sebagian tampilan gagal dimuat. Data Anda aman — coba segarkan halaman bila berlanjut.");
    };
    window.addEventListener("error", (event) => {
      if (!event.error) return; // abaikan error pemuatan gambar/font
      report(event.error);
    });
    window.addEventListener("unhandledrejection", (event) => {
      const reason = event.reason;
      if (reason && reason.name === "AbortError") return;
      report(reason);
    });
  }

  function cacheElements() {
    els.loginView = document.getElementById("login-view");
    els.appView = document.getElementById("app-view");
    els.loginForm = document.getElementById("login-form");
    els.loginSubmit = document.getElementById("login-submit");
    els.togglePassword = document.getElementById("toggle-password");
    els.loginPassword = document.getElementById("login-password");
    els.sidebar = document.getElementById("sidebar");
    els.sidebarMenu = document.getElementById("sidebar-menu");
    els.sidebarName = document.getElementById("sidebar-user-name");
    els.sidebarRole = document.getElementById("sidebar-user-role");
    els.sidebarAvatar = document.getElementById("sidebar-avatar");
    els.logoutButton = document.getElementById("logout-button");
    els.pageTitle = document.getElementById("page-title");
    els.pageEyebrow = document.getElementById("page-eyebrow");
    els.pageContent = document.getElementById("page-content");
    els.currentDate = document.getElementById("current-date");
    els.connectionIndicator = document.getElementById("connection-indicator");
    els.mobileMenuButton = document.getElementById("mobile-menu-button");
    els.topbarName = document.getElementById("topbar-user-name");
    els.topbarRole = document.getElementById("topbar-user-role");
    els.topbarAvatar = document.getElementById("topbar-avatar");
    els.toastRoot = document.getElementById("toast-root");
    els.modalRoot = document.getElementById("modal-root");
  }

  function bindGlobalEvents() {
    document.querySelectorAll('input[name="role"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        document.querySelectorAll(".role-option").forEach((item) => item.classList.remove("active"));
        radio.closest(".role-option").classList.add("active");
      });
    });

    els.togglePassword.addEventListener("click", () => {
      const isPassword = els.loginPassword.type === "password";
      els.loginPassword.type = isPassword ? "text" : "password";
      els.togglePassword.setAttribute("aria-label", isPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi");
    });

    els.loginForm.addEventListener("submit", handleLogin);
    els.logoutButton.addEventListener("click", logout);
    els.mobileMenuButton.addEventListener("click", () => els.sidebar.classList.toggle("open"));

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (isAiSidebarOpen()) { closeAiSidebar(); return; }
      if (els.modalRoot.querySelector(".modal-backdrop")) { closeModal(); return; }
      if (els.sidebar.classList.contains("open")) els.sidebar.classList.remove("open");
    });

    document.addEventListener("click", (event) => {
      if (window.innerWidth <= 920 && els.sidebar.classList.contains("open")) {
        const clickedInsideSidebar = els.sidebar.contains(event.target);
        const clickedMenuButton = els.mobileMenuButton.contains(event.target);
        if (!clickedInsideSidebar && !clickedMenuButton) els.sidebar.classList.remove("open");
      }
    });
  }

  async function restoreSession() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      showLogin();
      checkConnection();
      return;
    }

    try {
      state.session = JSON.parse(raw);
      if (!state.session?.token || !state.session?.user) throw new Error("Sesi tidak lengkap");
      const result = await gasRequest("me", {}, { silent: true });
      state.session.user = result.user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.session));
      await enterApp();
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
      state.session = null;
      showLogin();
      checkConnection();
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    const form = new FormData(els.loginForm);
    const username = String(form.get("username") || "").trim();
    const password = String(form.get("password") || "");
    const role = String(form.get("role") || "");

    if (!username || !password || !role) {
      toast("warning", "Data belum lengkap", "Masukkan peran, nama pengguna, dan kata sandi.");
      return;
    }

    setButtonLoading(els.loginSubmit, true);
    try {
      const result = await gasRequest("login", { username, password, role });
      state.session = { token: result.token, user: result.user };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.session));
      els.loginForm.reset();
      document.querySelector('input[name="role"][value="jaksa"]').checked = true;
      document.querySelectorAll(".role-option").forEach((item) => item.classList.toggle("active", item.dataset.roleCard === "jaksa"));
      await enterApp();
      toast("success", "Berhasil masuk", `Selamat datang, ${result.user.fullName}.`);
    } catch (error) {
      toast("error", "Gagal masuk", error.message || "Nama pengguna atau kata sandi tidak sesuai.");
    } finally {
      setButtonLoading(els.loginSubmit, false);
    }
  }

  async function enterApp() {
    els.loginView.hidden = true;
    els.appView.hidden = false;
    hydrateUserPanel();
    renderSidebar();
    setConnection(true);

    if (state.session.user.role === "jaksa") {
      state.activePage = "dashboard";
      await loadCases();
    } else {
      state.activePage = "submit-spdp";
      renderActivePage();
    }
  }

  function showLogin() {
    els.appView.hidden = true;
    els.loginView.hidden = false;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    state.session = null;
    state.cases = [];
    state.selectedFile = null;
    state.selectedAdministrationFile = null;
    state.reminders = [];
    state.reminderProgress = [];
    state.prosecutors = [];
    state.remindersLoaded = false;
    state.reminderBuilder = { caseId: "", type: "P-16", reminderId: "" };
    state.tikReminders = [];
    state.tikMeta = { intelijenCount: 0, validPhoneCount: 0, fonnteConfigured: false };
    state.tikLoaded = false;
    state.tikSelectedFiles = [];
    els.modalRoot.innerHTML = "";
    document.body.classList.remove("modal-open");
    closeAiSidebar();
    showLogin();
    toast("info", "Sesi diakhiri", "Anda telah keluar dari aplikasi.");
  }

  let sessionExpiredShown = false;
  function handleSessionExpired() {
    if (sessionExpiredShown) return;
    sessionExpiredShown = true;
    setTimeout(() => {
      logout();
      toast("warning", "Sesi berakhir", "Silakan masuk kembali untuk melanjutkan.");
      sessionExpiredShown = false;
    }, 300);
  }

  function hydrateUserPanel() {
    const user = state.session.user;
    const displayName = user.fullName || user.username;
    const avatarText = initials(displayName);
    els.sidebarName.textContent = displayName;
    els.sidebarRole.textContent = user.role;
    els.sidebarAvatar.textContent = avatarText;
    if (els.topbarName) els.topbarName.textContent = displayName;
    if (els.topbarRole) els.topbarRole.textContent = user.role === "jaksa" ? "Jaksa / Administrator" : "Penyidik";
    if (els.topbarAvatar) els.topbarAvatar.textContent = avatarText;
  }

  function renderSidebar() {
    const isJaksa = state.session.user.role === "jaksa";
    const urgentCount = isJaksa ? state.cases.filter((item) => ["warning", "overdue"].includes(getDeadlineState(item).state)).length : 0;
    const reminderUrgentCount = isJaksa ? state.reminders.filter((item) => {
      const deadline = getReminderDeadlineState(item);
      return String(item.status || "ACTIVE") === "ACTIVE" && ["warning", "overdue"].includes(deadline.state);
    }).length : 0;

    const items = isJaksa
      ? [
          { section: "UTAMA" },
          { id: "dashboard", icon: "▦", label: "Dashboard" },
          { id: "cases", icon: "▤", label: "Daftar Perkara" },
          { id: "deadlines", icon: "◷", label: "Tenggat Waktu", badge: urgentCount || "" },
          { section: "ADMINISTRASI" },
          { id: "reminders", icon: "♢", label: "Reminder WhatsApp", badge: reminderUrgentCount || "" },
          { id: "tik-reminders", icon: "▥", label: "Kartu TIK" },
          { id: "administration-builder", icon: "▣", label: "Buat Administrasi" },
          { id: "documents", icon: "▧", label: "Dokumen SPDP" },
          { id: "investigators", icon: "♙", label: "Penyidik" },
          { id: "workflow", icon: "↳", label: "Alur Perkara" },
          { id: "settings", icon: "⚙", label: "Pengaturan" }
        ]
      : [
          { section: "PENGIRIMAN" },
          { id: "submit-spdp", icon: "＋", label: "Form SPDP" }
        ];

    els.sidebarMenu.innerHTML = items.map((item) => {
      if (item.section) return `<div class="sidebar-section-label">${escapeHtml(item.section)}</div>`;
      return `
        <button type="button" class="sidebar-item ${state.activePage === item.id ? "active" : ""}" data-page="${item.id}">
          <span class="sidebar-item-icon">${item.icon}</span>
          <span>${escapeHtml(item.label)}</span>
          ${item.badge !== undefined && item.badge !== "" ? `<span class="sidebar-badge">${item.badge}</span>` : ""}
        </button>`;
    }).join("");

    els.sidebarMenu.querySelectorAll("[data-page]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activePage = button.dataset.page;
        renderSidebar();
        renderActivePage();
        els.sidebar.classList.remove("open");
      });
    });
  }

  let casesInFlight = null;
  async function loadCases({ quiet = false, button = null } = {}) {
    if (casesInFlight) return casesInFlight; // cegah permintaan ganda saat tombol ditekan berulang
    if (!quiet || !state.cases.length) renderLoadingPage("Memuat data perkara");
    button?.classList.add("is-spinning");
    if (button) button.disabled = true;
    casesInFlight = (async () => {
      try {
        const result = await gasRequest("listCases", {}, { retries: 1 });
        state.cases = Array.isArray(result.cases) ? result.cases : [];
        state.lastLoadedAt = new Date();
        setConnection(true);
        renderSidebar();
        renderActivePage();
        if (quiet) toast("success", "Data diperbarui", `${state.cases.length} perkara dimuat.`);
      } catch (error) {
        setConnection(false);
        if (quiet && state.cases.length) toast("error", "Gagal menyegarkan", error.message);
        else renderErrorPage("Data perkara tidak dapat dimuat", error.message);
      } finally {
        casesInFlight = null;
        if (button && document.body.contains(button)) {
          button.classList.remove("is-spinning");
          button.disabled = false;
        }
      }
    })();
    return casesInFlight;
  }

  function renderActivePage() {
    const page = state.activePage;
    const pages = {
      dashboard: ["Dashboard", "RINGKASAN", renderDashboard],
      cases: ["Daftar Perkara", "PENGELOLAAN", renderCasesPage],
      deadlines: ["Tenggat Waktu", "PENGAWASAN", renderDeadlinesPage],
      documents: ["Dokumen SPDP", "ARSIP DIGITAL", renderDocumentsPage],
      investigators: ["Data Penyidik", "MITRA KERJA", renderInvestigatorsPage],
      workflow: ["Alur Perkara B-310", "PEDOMAN KERJA", renderWorkflowPage],
      reminders: ["Reminder WhatsApp", "PENGAWASAN ADMINISTRASI", renderRemindersPage],
      "tik-reminders": ["Kartu TIK", "REMINDER INTELIJEN", renderTikReminderPage],
      "administration-builder": ["Buat Administrasi", "FORM OTOMATIS", renderAdministrationBuilderPage],
      settings: ["Pengaturan", "KONFIGURASI", renderSettingsPage],
      "submit-spdp": ["Pengiriman SPDP", "FORM PENYIDIK", renderInvestigatorForm]
    };

    const current = pages[page] || pages.dashboard;
    els.pageTitle.textContent = current[0];
    els.pageEyebrow.textContent = current[1];
    const changedPage = els.pageContent.dataset.page !== page;
    els.pageContent.dataset.page = page;
    try {
      current[2]();
    } catch (error) {
      console.error(error);
      renderErrorPage("Halaman gagal ditampilkan", error.message);
      return;
    }
    if (changedPage) {
      els.pageContent.classList.remove("page-enter");
      void els.pageContent.offsetWidth; // restart animasi
      els.pageContent.classList.add("page-enter");
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }

  function renderLoadingPage(label) {
    els.pageTitle.textContent = label;
    els.pageContent.innerHTML = `
      <div class="panel loading-panel">
        <div class="skeleton loading-line w40"></div>
        <div class="skeleton loading-line w90"></div>
        <div class="skeleton loading-line w65"></div>
        <div class="skeleton" style="height:130px"></div>
      </div>`;
  }

  function renderErrorPage(title, message) {
    els.pageContent.innerHTML = `
      <div class="panel">
        <div class="empty-state">
          <div class="empty-state-icon">!</div>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(message || "Terjadi kesalahan.")}</p>
          <button id="retry-load" class="primary-button" style="margin-top:18px" type="button">Coba lagi</button>
        </div>
      </div>`;
    document.getElementById("retry-load")?.addEventListener("click", () => loadCases());
  }

  function renderDashboard() {
    renderPidumDashboard({ showKpi: true, page: "dashboard" });
  }

  function renderCasesPage() {
    renderPidumDashboard({ showKpi: false, page: "cases" });
  }

  function renderPidumDashboard({ showKpi = true, page = "dashboard" } = {}) {
    const activeCases = state.cases.filter((item) => !["SELESAI", "DIHENTIKAN", "SPDP_DIKEMBALIKAN"].includes(item.status));
    const overdue = state.cases.filter((item) => getDeadlineState(item).state === "overdue").length;
    const dueSoon = state.cases.filter((item) => getDeadlineState(item).state === "warning").length;
    const tahapIPlus = state.cases.filter((item) => dashboardStageIndex(item.status) >= 3).length;

    els.pageContent.innerHTML = `
      <section class="pidum-dashboard-reference page-enter">
        ${showKpi ? `
          <div class="pidum-kpi-grid">
            ${renderPidumKpiCard("clipboard", "Perkara aktif", activeCases.length, "berjalan saat ini")}
            ${renderPidumKpiCard("alert", "Lewat tenggat", overdue, overdue ? "perlu tindakan segera" : "tidak ada yang terlambat", overdue ? "danger" : "")}
            ${renderPidumKpiCard("clock", "Jatuh tempo ≤3 hari", dueSoon, "pantau minggu ini", dueSoon ? "warning" : "")}
            ${renderPidumKpiCard("gavel", "Tahap I ke atas", tahapIPlus, "sudah masuk proses pemberkasan")}
          </div>
          ${renderPhasePipeline()}` : ""}

        <div class="pidum-dashboard-toolbar">
          <label class="pidum-dashboard-search" for="dashboard-case-search">
            ${dashboardIcon("search")}
            <input id="dashboard-case-search" type="search" autocomplete="off" value="${escapeAttr(state.search)}" placeholder="Cari register, tersangka, SPDP, penyidik" />
          </label>

          <select id="dashboard-stage-filter" class="pidum-dashboard-select" aria-label="Filter tahapan perkara">
            <option value="ALL" ${state.stageFilter === "ALL" ? "selected" : ""}>Semua tahap</option>
            <optgroup label="Prapenuntutan">
              ${DASHBOARD_STAGES.map((stage, index) => stage.phase === "pra" ? `<option value="${index}" ${String(state.stageFilter) === String(index) ? "selected" : ""}>${escapeHtml(stage.label)}</option>` : "").join("")}
            </optgroup>
            <optgroup label="Penuntutan">
              ${DASHBOARD_STAGES.map((stage, index) => stage.phase === "tut" ? `<option value="${index}" ${String(state.stageFilter) === String(index) ? "selected" : ""}>${escapeHtml(stage.label)}</option>` : "").join("")}
            </optgroup>
          </select>

          <button id="dashboard-create-administration" class="pidum-dashboard-primary" type="button">
            ${dashboardIcon("plus")}
            <span>Buat administrasi</span>
          </button>

          <button id="dashboard-refresh" class="pidum-dashboard-refresh" type="button" aria-label="Segarkan data" title="Segarkan data">
            ${dashboardIcon("refresh")}
          </button>
        </div>

        <div class="pidum-case-list-card">
          <div class="pidum-case-list-summary">
            <div>
              <h2>Daftar perkara</h2>
              <p id="dashboard-case-count"></p>
            </div>
            <span class="pidum-case-list-updated">${state.lastLoadedAt ? `Diperbarui ${formatTime(state.lastLoadedAt)} · ` : ""}Google Spreadsheet</span>
          </div>
          <div id="dashboard-case-list"></div>
        </div>

        <div class="pidum-dashboard-footnote">
          ${dashboardIcon("file")}
          <span>Tahapan mengikuti Lampiran Surat JAM-Pidum B-310/E/Ejp/01/2026. Status & tenggat diperbarui otomatis dari administrasi yang tersimpan.</span>
        </div>
      </section>`;

    const updateList = () => {
      const filtered = filterDashboardCases(state.cases);
      const listRoot = document.getElementById("dashboard-case-list");
      const countRoot = document.getElementById("dashboard-case-count");
      if (listRoot) listRoot.innerHTML = renderDashboardCaseList(filtered);
      if (countRoot) countRoot.textContent = `${filtered.length} dari ${state.cases.length} perkara ditampilkan.`;
      els.pageContent.querySelectorAll("[data-pipeline-stage]").forEach((chip) => {
        chip.classList.toggle("active", String(state.stageFilter) === chip.dataset.pipelineStage);
      });
    };
    updateList();

    // Pencarian hanya memperbarui daftar (input tidak kehilangan fokus)
    document.getElementById("dashboard-case-search")?.addEventListener("input", debounce((event) => {
      state.search = event.target.value;
      updateList();
    }, 160));
    document.getElementById("dashboard-stage-filter")?.addEventListener("change", (event) => {
      state.stageFilter = event.target.value;
      updateList();
    });
    els.pageContent.querySelectorAll("[data-pipeline-stage]").forEach((chip) => {
      chip.addEventListener("click", () => {
        const value = chip.dataset.pipelineStage;
        state.stageFilter = String(state.stageFilter) === value ? "ALL" : value;
        const select = document.getElementById("dashboard-stage-filter");
        if (select) select.value = state.stageFilter;
        updateList();
      });
    });
    document.getElementById("dashboard-create-administration")?.addEventListener("click", () => navigate("administration-builder"));
    document.getElementById("dashboard-refresh")?.addEventListener("click", () => loadCases({ quiet: true, button: document.getElementById("dashboard-refresh") }));
  }

  function renderPhasePipeline() {
    const counts = DASHBOARD_STAGES.map(() => 0);
    state.cases.forEach((item) => {
      if (["DIHENTIKAN", "SPDP_DIKEMBALIKAN"].includes(item.status)) return;
      counts[dashboardStageIndex(item.status)] += 1;
    });
    const total = counts.reduce((sum, value) => sum + value, 0) || 1;
    const pra = DASHBOARD_STAGES.map((stage, index) => ({ stage, index })).filter((entry) => entry.stage.phase === "pra");
    const tut = DASHBOARD_STAGES.map((stage, index) => ({ stage, index })).filter((entry) => entry.stage.phase === "tut");
    const praTotal = pra.reduce((sum, entry) => sum + counts[entry.index], 0);
    const tutTotal = tut.reduce((sum, entry) => sum + counts[entry.index], 0);
    const chip = ({ stage, index }) => `
      <button type="button" class="pipeline-chip ${counts[index] ? "has-cases" : ""}" data-pipeline-stage="${index}" title="${escapeAttr(stage.label)}">
        <span class="pipeline-chip-count">${counts[index]}</span>
        <span class="pipeline-chip-label">${escapeHtml(stage.short)}</span>
        <i style="--fill:${Math.round((counts[index] / total) * 100)}%"></i>
      </button>`;
    return `
      <section class="pipeline-card" aria-label="Sebaran perkara per tahapan">
        <div class="pipeline-group">
          <div class="pipeline-group-head"><span>Prapenuntutan</span><b>${praTotal}</b></div>
          <div class="pipeline-chips">${pra.map(chip).join("")}</div>
        </div>
        <div class="pipeline-group tut">
          <div class="pipeline-group-head"><span>Penuntutan</span><b>${tutTotal}</b></div>
          <div class="pipeline-chips">${tut.map(chip).join("")}</div>
        </div>
      </section>`;
  }

  function filterDashboardCases(cases) {
    const query = state.search.trim().toLowerCase();
    return [...cases]
      .filter((item) => {
        const haystack = [
          item.courtCaseNumber,
          item.caseId,
          item.suspectName,
          item.allegedArticle,
          item.spdpNumber,
          item.investigatorName,
          item.investigatorInstitution,
          item.prosecutorName
        ].join(" ").toLowerCase();
        const matchesQuery = !query || haystack.includes(query);
        const matchesStage = state.stageFilter === "ALL" || String(dashboardStageIndex(item.status)) === String(state.stageFilter);
        return matchesQuery && matchesStage;
      })
      .sort(sortByUpdatedDesc);
  }

  function dashboardStageIndex(status) {
    const index = DASHBOARD_STAGES.findIndex((stage) => stage.statuses.includes(String(status || "")));
    return index < 0 ? 0 : index;
  }

  function getNextStep(item) {
    return NEXT_STEP_BY_STATUS[item?.status] || NEXT_STEP_BY_STATUS.SPDP_DITERIMA;
  }

  function renderDashboardStagePips(status) {
    const current = dashboardStageIndex(status);
    const stage = DASHBOARD_STAGES[current];
    const closed = ["SPDP_DIKEMBALIKAN", "DIHENTIKAN"].includes(String(status || ""));
    return `
      <div class="pidum-stage-pips ${closed ? "closed" : ""}" role="img" aria-label="Tahap ${current + 1} dari ${DASHBOARD_STAGES.length}: ${escapeAttr(stage.label)}">
        ${DASHBOARD_STAGES.map((entry, index) => `${index === 6 ? '<em class="pip-divider" aria-hidden="true"></em>' : ""}<span title="${escapeAttr(entry.label)}" class="${index <= current ? "complete" : ""} ${index === current ? "current" : ""} ${entry.phase}"></span>`).join("")}
      </div>
      <span class="pidum-stage-label"><b class="phase-tag ${stage.phase}">${stage.phase === "pra" ? "Prapenuntutan" : "Penuntutan"}</b> ${escapeHtml(closed ? getStatus(status).label : stage.label)}</span>`;
  }

  function describeDeadline(item) {
    const deadline = getDeadlineState(item);
    const type = item.deadlineType || "Tenggat";
    if (!item.deadlineDate) return { deadline: { ...deadline, state: "none" }, icon: "clock", text: "Belum ditentukan", type };
    const icon = deadline.state === "overdue" ? "alert" : deadline.state === "warning" ? "clock" : "check";
    const text = deadline.state === "overdue" ? `Lewat ${Math.abs(deadline.days)} hari` : deadline.label;
    return { deadline, icon, text, type };
  }

  function renderDashboardCaseList(cases) {
    if (!cases.length) {
      return `<div class="pidum-case-empty">${dashboardIcon("file")}<strong>Tidak ada perkara yang cocok</strong><span>Ubah kata pencarian atau filter tahapan.</span></div>`;
    }

    return `
      <div class="pidum-case-grid pidum-case-grid-head" role="row">
        <span>Register</span>
        <span>Tersangka &amp; pasal</span>
        <span>Tahapan alur</span>
        <span>Jaksa &amp; penyidik</span>
        <span>Tenggat waktu</span>
        <span class="sr-only">Aksi</span>
      </div>
      <div class="pidum-case-grid-body" role="rowgroup">
        ${cases.map((item) => {
          const info = describeDeadline(item);
          const next = getNextStep(item);
          const prosecutor = item.prosecutorName || "Belum ditunjuk";
          return `
            <article class="pidum-case-grid pidum-case-grid-row" role="row" data-row-case="${escapeAttr(item.caseId)}">
              <div class="pidum-case-register" data-label="Register">
                <strong>${escapeHtml(item.courtCaseNumber || item.caseId || "-")}</strong>
                <span>SPDP ${escapeHtml(item.spdpNumber || "-")}</span>
              </div>
              <div class="pidum-case-suspect" data-label="Tersangka">
                <strong>${escapeHtml(item.suspectName || "-")}</strong>
                <span class="clamp-3">${escapeHtml(item.allegedArticle || "Pasal belum diisi")}</span>
              </div>
              <div class="pidum-case-stage" data-label="Tahapan">
                ${renderDashboardStagePips(item.status)}
                <span class="pidum-next-step" title="Langkah berikutnya menurut B-310">→ <b>${escapeHtml(next.code)}</b> ${escapeHtml(next.text)}</span>
              </div>
              <div class="pidum-case-officers" data-label="Jaksa & penyidik">
                <strong class="${item.prosecutorName ? "" : "muted"}">${escapeHtml(prosecutor)}</strong>
                <span>${dashboardIcon("users")} ${escapeHtml(item.investigatorInstitution || item.investigatorName || "Penyidik belum diisi")}</span>
              </div>
              <div class="pidum-case-deadline" data-label="Tenggat">
                <span class="pidum-deadline-pill ${escapeAttr(info.deadline.state)}" title="${escapeAttr(info.type)}">
                  ${dashboardIcon(info.icon)}
                  <span class="pill-copy"><b>${escapeHtml(info.type)}</b><em>${escapeHtml(info.text)}</em></span>
                </span>
                ${item.deadlineDate ? `<small>${formatDate(item.deadlineDate)}</small>` : ""}
              </div>
              <div class="pidum-case-action">
                <button class="pidum-ai-button" data-action="ai" data-case="${escapeAttr(item.caseId)}" type="button" title="Analisa AI perkara ini">
                  <span aria-hidden="true">✦</span><span class="btn-text">Analisa AI</span>
                </button>
                <button class="pidum-detail-button" data-action="detail" data-case="${escapeAttr(item.caseId)}" type="button">Detail</button>
              </div>
            </article>`;
        }).join("")}
      </div>`;
  }

  function renderPidumKpiCard(icon, label, value, sub, tone = "") {
    return `
      <article class="pidum-kpi-card ${tone}">
        <div class="pidum-kpi-card-top"><span>${escapeHtml(label)}</span>${dashboardIcon(icon)}</div>
        <strong>${Number(value || 0).toLocaleString("id-ID")}</strong>
        <small>${escapeHtml(sub || "")}</small>
      </article>`;
  }

  function dashboardIcon(name) {
    const paths = {
      search: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>',
      plus: '<path d="M12 5v14M5 12h14"></path>',
      refresh: '<path d="M20 6v5h-5"></path><path d="M4 18v-5h5"></path><path d="M18.5 9A7 7 0 0 0 6.2 6.2L4 11"></path><path d="M5.5 15A7 7 0 0 0 17.8 17.8L20 13"></path>',
      users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>',
      clipboard: '<rect x="5" y="4" width="14" height="17" rx="2"></rect><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4"></path>',
      alert: '<path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z"></path><path d="M12 9v4M12 17h.01"></path>',
      clock: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
      gavel: '<path d="m14 13-5-5M16 11l4-4-3-3-4 4M8 9l-4 4 3 3 4-4M6 20h12"></path>',
      check: '<circle cx="12" cy="12" r="9"></circle><path d="m8 12 2.5 2.5L16 9"></path>',
      file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"></path><path d="M14 2v6h6M8 13h8M8 17h6"></path>'
    };
    return `<svg class="pidum-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.file}</svg>`;
  }

  function renderDeadlinesPage() {
    const items = [...state.cases].sort(compareDeadlinePriority);
    const withDeadline = items.filter((item) => Boolean(item.deadlineDate));
    const withoutDeadline = items.filter((item) => !item.deadlineDate).length;

    els.pageContent.innerHTML = `
      <div class="stats-grid">
        ${statCard("!", withDeadline.filter((item) => getDeadlineState(item).state === "overdue").length, "Terlambat", "danger")}
        ${statCard("◷", withDeadline.filter((item) => getDeadlineState(item).state === "warning").length, "≤ 3 hari", "warning")}
        ${statCard("✓", withDeadline.filter((item) => getDeadlineState(item).state === "safe").length, "Masih aman", "")}
        ${statCard("▤", items.length, "Semua perkara aktif", "blue")}
      </div>
      <div class="panel">
        <div class="panel-header">
          <div>
            <h3>Prioritas tindak lanjut</h3>
            <p>Perkara terlambat dan mendekati tenggat ditempatkan paling atas.${withoutDeadline ? ` ${withoutDeadline} perkara belum memiliki tanggal tenggat tetapi tetap ditampilkan.` : ""}</p>
          </div>
          <button id="deadline-refresh" class="table-action" type="button">Segarkan</button>
        </div>
        ${renderCaseTable(items)}
      </div>`;

    document.getElementById("deadline-refresh")?.addEventListener("click", () => loadCases());
    bindCaseTableActions();
  }

  function compareDeadlinePriority(a, b) {
    const priority = { overdue: 0, warning: 1, safe: 2, none: 3 };
    const aState = a.deadlineDate ? getDeadlineState(a).state : "none";
    const bState = b.deadlineDate ? getDeadlineState(b).state : "none";
    const rankDiff = priority[aState] - priority[bState];
    if (rankDiff !== 0) return rankDiff;

    if (a.deadlineDate && b.deadlineDate) {
      const dateDiff = dateValue(a.deadlineDate) - dateValue(b.deadlineDate);
      if (dateDiff !== 0) return dateDiff;
    }
    return dateValue(b.updatedAt || b.createdAt) - dateValue(a.updatedAt || a.createdAt);
  }

  function renderDocumentsPage() {
    const documents = state.cases
      .filter((item) => item.spdpFileUrl)
      .sort(sortByUpdatedDesc);

    els.pageContent.innerHTML = `
      <div class="panel">
        <div class="panel-header"><div><h3>Arsip dokumen SPDP</h3><p>Dokumen yang diunggah penyidik dan tersimpan di Google Drive.</p></div></div>
        <div class="panel-body">
          ${documents.length ? `<div class="document-grid">${documents.map((item) => `
            <article class="document-card">
              <div class="document-icon">PDF</div>
              <div>
                <strong>${escapeHtml(item.spdpFileName || `SPDP ${item.caseId}`)}</strong>
                <small>${escapeHtml(item.caseId)} · ${escapeHtml(item.suspectName || "Tanpa nama tersangka")}<br />Diunggah ${formatDateTime(item.createdAt)}</small>
                <a class="document-link" href="${escapeAttr(item.spdpFileUrl)}" target="_blank" rel="noopener noreferrer">Buka di Google Drive →</a>
              </div>
            </article>`).join("")}</div>` : emptyState("▧", "Belum ada dokumen", "Dokumen SPDP akan tampil setelah penyidik mengirimkan form.")}
        </div>
      </div>`;
  }

  function renderInvestigatorsPage() {
    const map = new Map();
    state.cases.forEach((item) => {
      const key = item.investigatorNipNrp || item.investigatorName || "unknown";
      if (!map.has(key)) {
        map.set(key, {
          name: item.investigatorName || "Tidak diketahui",
          nip: item.investigatorNipNrp || "-",
          rank: item.investigatorRank || "-",
          position: item.investigatorPosition || "-",
          institution: item.investigatorInstitution || "-",
          count: 0,
          lastSubmit: item.createdAt
        });
      }
      const record = map.get(key);
      record.count += 1;
      if (dateValue(item.createdAt) > dateValue(record.lastSubmit)) record.lastSubmit = item.createdAt;
    });
    const investigators = [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "id"));

    els.pageContent.innerHTML = `
      <div class="panel">
        <div class="panel-header"><div><h3>Penyidik pengirim SPDP</h3><p>Rekap otomatis dari data perkara yang masuk.</p></div></div>
        <div class="panel-body">
          ${investigators.length ? `<div class="investigator-grid">${investigators.map((item) => `
            <article class="investigator-card">
              <div class="investigator-card-top">
                <div class="avatar">${escapeHtml(initials(item.name))}</div>
                <div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.institution)}</small></div>
              </div>
              <div style="margin-top:13px;color:var(--gray-600);font-size:12px;line-height:1.65">
                ${escapeHtml(item.rank)} · ${escapeHtml(item.nip)}<br />${escapeHtml(item.position)}
              </div>
              <div class="investigator-stats"><span>${item.count} perkara</span><span>${formatDate(item.lastSubmit)}</span></div>
            </article>`).join("")}</div>` : emptyState("♙", "Belum ada data penyidik", "Data akan terbentuk dari form SPDP yang dikirim.")}
        </div>
      </div>`;
  }

  function renderWorkflowPage() {
    const counts = {};
    state.cases.forEach((item) => {
      const key = DASHBOARD_STAGES[dashboardStageIndex(item.status)].key;
      counts[key] = (counts[key] || 0) + 1;
    });
    const openId = state.workflowOpen || "spdp";
    const phaseBlock = (phase, title, subtitle) => {
      const items = B310_FLOW.filter((entry) => entry.phase === phase);
      return `
        <section class="flow-phase ${phase}">
          <header class="flow-phase-head">
            <span class="flow-phase-tag">${phase === "pra" ? "I" : "II"}</span>
            <div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(subtitle)}</p></div>
          </header>
          <div class="flow-stage-list">
            ${items.map((entry) => {
              const stageIndex = DASHBOARD_STAGES.findIndex((stage) => stage.key === entry.id);
              const count = counts[entry.id] || 0;
              const open = entry.id === openId;
              return `
                <article class="flow-stage ${open ? "open" : ""}" data-flow-stage="${entry.id}">
                  <button type="button" class="flow-stage-toggle" aria-expanded="${open}">
                    <span class="flow-stage-index">${stageIndex + 1}</span>
                    <span class="flow-stage-copy">
                      <strong>${escapeHtml(entry.title)}</strong>
                      <small>${escapeHtml(entry.range)} · ${escapeHtml(entry.deadline)}</small>
                    </span>
                    <span class="flow-stage-count ${count ? "has" : ""}" title="Perkara pada tahap ini">${count} perkara</span>
                    <span class="flow-stage-chevron" aria-hidden="true">⌄</span>
                  </button>
                  <div class="flow-stage-body">
                    <div class="flow-stage-inner">
                      <p class="flow-stage-summary">${escapeHtml(entry.summary)}</p>
                      <ol class="flow-steps">
                        ${entry.steps.map((step) => `
                          <li class="flow-step ${step.tone}">
                            <span class="flow-step-no">${escapeHtml(step.no)}</span>
                            <span class="flow-step-code">${escapeHtml(step.code)}</span>
                            <span class="flow-step-copy"><strong>${escapeHtml(step.title)}</strong><small>${escapeHtml(step.detail)}</small></span>
                            ${step.tone !== "main" ? `<span class="flow-step-tag">${step.tone === "branch" ? "Cabang" : "Opsional"}</span>` : ""}
                          </li>`).join("")}
                      </ol>
                      ${count ? `<button type="button" class="case-ghost-button small" data-flow-filter="${stageIndex}">Lihat ${count} perkara di tahap ini →</button>` : ""}
                    </div>
                  </div>
                </article>`;
            }).join("")}
          </div>
        </section>`;
    };

    els.pageContent.innerHTML = `
      <section class="flow-page">
        <header class="flow-hero">
          <div>
            <p class="case-eyebrow">Pedoman alur kerja</p>
            <h2>Prapenuntutan hingga Penuntutan</h2>
            <p>Disusun dari Lampiran Surat JAM-Pidum Nomor B-310/E/Ejp/01/2026 tanggal 23 Januari 2026 tentang Alur Kerja dan Daftar Formulir Administrasi Pola Koordinasi Penanganan Perkara Tindak Pidana Umum.</p>
          </div>
          <div class="flow-legend">
            <span><i class="main"></i>Alur utama</span>
            <span><i class="branch"></i>Cabang / kondisi tertentu</span>
            <span><i class="optional"></i>Opsional</span>
          </div>
        </header>

        <ol class="flow-rail" aria-label="Ringkasan tahapan">
          ${DASHBOARD_STAGES.map((stage, index) => `
            ${index === 6 ? '<li class="flow-rail-divider" aria-hidden="true"><span>Penuntutan</span></li>' : ""}
            <li class="${stage.phase}"><button type="button" data-flow-jump="${stage.key}"><span>${index + 1}</span><small>${escapeHtml(stage.short)}</small>${counts[stage.key] ? `<b>${counts[stage.key]}</b>` : ""}</button></li>`).join("")}
        </ol>

        <div class="flow-deadlines">
          <div><strong>≤ 7 hari</strong><span>Sprindik → SPDP diterima</span></div>
          <div><strong>≤ 3 hari</strong><span>Koordinasi sejak SPDP</span></div>
          <div><strong>30 hari</strong><span>Berkas Tahap I → P-17 → SOP FORM-2 → SOP FORM-3</span></div>
          <div><strong>14 hari</strong><span>Penyidikan tambahan setelah P-19 (lewat: P-20)</span></div>
          <div><strong>14 hari</strong><span>Tahap II setelah P-21 (lewat: SOP FORM-7)</span></div>
        </div>

        ${phaseBlock("pra", "Prapenuntutan", "Dari penerimaan SPDP sampai berkas dinyatakan lengkap (P-21).")}
        ${phaseBlock("tut", "Penuntutan", "Penyerahan tersangka & barang bukti (Tahap II), dakwaan, hingga persidangan.")}
      </section>`;

    els.pageContent.querySelectorAll(".flow-stage-toggle").forEach((toggle) => {
      toggle.addEventListener("click", () => {
        const article = toggle.closest(".flow-stage");
        const willOpen = !article.classList.contains("open");
        article.classList.toggle("open", willOpen);
        toggle.setAttribute("aria-expanded", String(willOpen));
        if (willOpen) state.workflowOpen = article.dataset.flowStage;
      });
    });
    els.pageContent.querySelectorAll("[data-flow-jump]").forEach((button) => {
      button.addEventListener("click", () => {
        const article = els.pageContent.querySelector(`[data-flow-stage="${button.dataset.flowJump}"]`);
        if (!article) return;
        article.classList.add("open");
        article.querySelector(".flow-stage-toggle")?.setAttribute("aria-expanded", "true");
        state.workflowOpen = button.dataset.flowJump;
        article.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    els.pageContent.querySelectorAll("[data-flow-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.stageFilter = button.dataset.flowFilter;
        state.search = "";
        navigate("cases");
      });
    });
  }

  function renderSettingsPage() {
    els.pageContent.innerHTML = `
      <div class="settings-grid">
        <section class="settings-card">
          <h3>Google Apps Script</h3>
          <p>Backend untuk autentikasi, penyimpanan data perkara, log aktivitas, dan unggah dokumen.</p>
          <a class="integration-link" href="${escapeAttr(CONFIG.APPS_SCRIPT_URL)}" target="_blank" rel="noopener noreferrer">${escapeHtml(CONFIG.APPS_SCRIPT_URL)}</a>
        </section>
        <section class="settings-card">
          <h3>Google Spreadsheet</h3>
          <p>Basis data operasional sederhana yang berisi tabel Users, Cases, Documents, dan ActivityLog.</p>
          <a class="integration-link" href="${escapeAttr(CONFIG.SHEET_URL)}" target="_blank" rel="noopener noreferrer">Buka Google Spreadsheet</a>
        </section>
        <section class="settings-card">
          <h3>Google Drive</h3>
          <p>Folder induk arsip SPDP. Backend membuat subfolder berdasarkan ID perkara.</p>
          <a class="integration-link" href="${escapeAttr(CONFIG.DRIVE_FOLDER_URL)}" target="_blank" rel="noopener noreferrer">Buka folder Google Drive</a>
        </section>
        <section class="settings-card">
          <h3>Keamanan akun</h3>
          <p>Akun dibaca dari sheet <code>akses</code>. Batasi akses Spreadsheet karena kata sandi tersimpan di sheet tersebut; ubah akun melalui <code>addUser()</code> atau <code>resetPassword()</code> di Apps Script.</p>
          <button id="settings-logout" class="danger-button" type="button">Keluar dari aplikasi</button>
        </section>
      </div>`;
    document.getElementById("settings-logout")?.addEventListener("click", logout);
  }

  function renderInvestigatorForm() {
    els.pageContent.innerHTML = `
      <div class="form-shell">
        <div class="form-intro">
          <h2>Form pengiriman SPDP</h2>
          <p>Isi data penyidik, data perkara, identitas tersangka, barang bukti, lalu unggah dokumen SPDP dalam format PDF atau DOCX.</p>
        </div>

        <form id="spdp-form" novalidate>
          ${formSection("01", "Identitas Penyidik", "Data petugas yang menyampaikan SPDP.", `
            <div class="form-grid">
              ${field("Nama", "investigatorName", "text", true, state.session.user.fullName || "")}
              ${field("Pangkat/Gol", "investigatorRank", "text", true)}
              ${field("NIP/NRP", "investigatorNipNrp", "text", true)}
              ${field("Jabatan", "investigatorPosition", "text", true)}
              ${field("Instansi/Unit Penyidik", "investigatorInstitution", "text", true, "", "Contoh: Polres Muna / Satreskrim")}
              ${field("Nomor kontak", "investigatorPhone", "tel", false)}
            </div>`)}

          ${formSection("02", "Data SPDP dan Perkara", "Data dasar untuk verifikasi penerimaan.", `
            <div class="form-grid three">
              ${field("Nomor SPDP", "spdpNumber", "text", true)}
              ${field("Tanggal SPDP", "spdpDate", "date", true)}
              ${field("Tanggal diterima Kejaksaan", "receivedDate", "date", true, todayISO())}
              ${field("Nomor Sprindik", "sprindikNumber", "text", true)}
              ${field("Tanggal Sprindik", "sprindikDate", "date", true)}
              ${field("Pasal yang disangkakan", "allegedArticle", "text", true)}
              <div class="form-field full-span">
                <label for="caseSummary">Uraian singkat perkara <span class="required">*</span></label>
                <textarea id="caseSummary" name="caseSummary" required placeholder="Tuliskan kronologis singkat, waktu, tempat, dan dugaan tindak pidana."></textarea>
              </div>
            </div>`)}

          ${formSection("03", "Identitas Tersangka", "Identitas sesuai dokumen penyidikan.", `
            <div class="form-grid three">
              ${field("Nama lengkap", "suspectName", "text", true)}
              ${field("Nomor Identitas", "suspectIdentityNumber", "text", true)}
              ${field("Tempat lahir", "birthPlace", "text", true)}
              ${field("Tanggal lahir", "birthDate", "date", true)}
              ${field("Umur", "age", "number", false, "", "Tahun")}
              ${selectField("Jenis Kelamin", "gender", ["Laki-laki", "Perempuan"], true)}
              ${field("Kebangsaan/Kewarganegaraan", "nationality", "text", true, "Indonesia")}
              ${field("Agama", "religion", "text", true)}
              ${field("Pekerjaan", "occupation", "text", true)}
              ${field("Pendidikan", "education", "text", true)}
              <div class="form-field full-span">
                <label for="address">Tempat tinggal <span class="required">*</span></label>
                <textarea id="address" name="address" required placeholder="Alamat lengkap tersangka."></textarea>
              </div>
            </div>`)}

          ${formSection("04", "Barang Bukti", "Daftar awal barang bukti yang berkaitan dengan perkara.", `
            <div class="form-grid">
              <div class="form-field full-span">
                <label for="evidence">Barang Bukti <span class="required">*</span></label>
                <textarea id="evidence" name="evidence" required placeholder="Contoh: 1 unit sepeda motor..., 1 buah telepon seluler..., dokumen..., dan seterusnya."></textarea>
              </div>
            </div>`)}

          ${formSection("05", "Unggah Dokumen SPDP", "Dokumen disimpan pada folder Google Drive perkara.", `
            <div id="upload-zone" class="upload-zone">
              <input id="spdp-file" name="spdpFile" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
              <div class="upload-icon">⇧</div>
              <h4>Pilih atau tarik dokumen SPDP ke sini</h4>
              <p>Format yang diterima: PDF atau DOCX. Antarmuka tidak menetapkan batas ukuran, tetapi unggahan tetap tunduk pada kuota dan batas eksekusi Google Apps Script/Google Drive.</p>
              <button id="choose-file-button" class="secondary-button" type="button" style="margin-top:14px">Pilih dokumen</button>
              <div id="selected-file-card"></div>
              <div class="progress-bar"><span id="file-progress"></span></div>
            </div>`)}

          <div class="form-submit-row">
            <button id="reset-spdp-form" class="ghost-button" type="reset">Kosongkan form</button>
            <button id="submit-spdp-form" class="primary-button" type="submit">
              <span class="button-label">Kirim SPDP</span>
              <span class="button-spinner" hidden></span>
            </button>
          </div>
        </form>
      </div>`;

    bindInvestigatorForm();
  }

  function bindInvestigatorForm() {
    const form = document.getElementById("spdp-form");
    const fileInput = document.getElementById("spdp-file");
    const uploadZone = document.getElementById("upload-zone");
    const chooseButton = document.getElementById("choose-file-button");
    const birthDate = document.getElementById("birthDate");
    const age = document.getElementById("age");

    chooseButton.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => setSelectedFile(fileInput.files?.[0] || null));
    birthDate.addEventListener("change", () => {
      const calculated = calculateAge(birthDate.value);
      if (calculated >= 0) age.value = calculated;
    });

    ["dragenter", "dragover"].forEach((name) => uploadZone.addEventListener(name, (event) => {
      event.preventDefault();
      uploadZone.classList.add("dragover");
    }));
    ["dragleave", "drop"].forEach((name) => uploadZone.addEventListener(name, (event) => {
      event.preventDefault();
      uploadZone.classList.remove("dragover");
    }));
    uploadZone.addEventListener("drop", (event) => {
      const file = event.dataTransfer.files?.[0];
      if (file) setSelectedFile(file);
    });

    form.addEventListener("reset", () => {
      state.selectedFile = null;
      setTimeout(() => {
        document.getElementById("selected-file-card").innerHTML = "";
        document.getElementById("file-progress").style.width = "0";
      }, 0);
    });
    form.addEventListener("submit", handleSpdpSubmit);
  }

  function setSelectedFile(file) {
    if (!file) {
      state.selectedFile = null;
      document.getElementById("selected-file-card").innerHTML = "";
      return;
    }
    const extension = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "docx"].includes(extension)) {
      toast("warning", "Format tidak didukung", "Gunakan dokumen PDF atau DOCX.");
      return;
    }
    state.selectedFile = file;
    document.getElementById("selected-file-card").innerHTML = `
      <div class="upload-file-card">
        <div class="upload-file-meta"><strong>${escapeHtml(file.name)}</strong><small>${formatBytes(file.size)} · ${escapeHtml(file.type || extension.toUpperCase())}</small></div>
        <button id="remove-selected-file" class="table-action" type="button">Hapus</button>
      </div>`;
    document.getElementById("remove-selected-file").addEventListener("click", () => {
      state.selectedFile = null;
      document.getElementById("spdp-file").value = "";
      document.getElementById("selected-file-card").innerHTML = "";
      document.getElementById("file-progress").style.width = "0";
    });
  }

  async function handleSpdpSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    if (!state.selectedFile) {
      toast("warning", "Dokumen SPDP belum dipilih", "Unggah satu dokumen PDF atau DOCX.");
      return;
    }

    const submitButton = document.getElementById("submit-spdp-form");
    setButtonLoading(submitButton, true);
    try {
      const fileData = await readFileBase64(state.selectedFile, (progress) => {
        document.getElementById("file-progress").style.width = `${Math.min(progress, 70)}%`;
      });
      document.getElementById("file-progress").style.width = "80%";

      const formData = new FormData(form);
      const payload = {};
      formData.forEach((value, key) => {
        if (key !== "spdpFile") payload[key] = typeof value === "string" ? value.trim() : value;
      });
      payload.spdpFile = {
        name: state.selectedFile.name,
        mimeType: state.selectedFile.type || mimeFromName(state.selectedFile.name),
        dataBase64: fileData
      };

      const result = await gasRequest("submitCase", payload);
      document.getElementById("file-progress").style.width = "100%";
      toast("success", "SPDP berhasil dikirim", `Nomor register perkara: ${result.caseId}.`);
      form.reset();
      state.selectedFile = null;
      setTimeout(() => { document.getElementById("file-progress").style.width = "0"; }, 700);
      showSubmissionReceipt(result);
    } catch (error) {
      document.getElementById("file-progress").style.width = "0";
      toast("error", "Pengiriman gagal", error.message || "Data belum berhasil disimpan.");
    } finally {
      setButtonLoading(submitButton, false);
    }
  }

  function showSubmissionReceipt(result) {
    openModal(`
      <div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="Bukti pengiriman">
        <div class="modal-card" style="max-width:560px">
          <div class="modal-header"><h2>SPDP berhasil diterima</h2><button class="modal-close" data-close-modal type="button">×</button></div>
          <div class="modal-body">
            <div class="empty-state" style="padding:20px 10px">
              <div class="empty-state-icon" style="background:var(--green-100);color:var(--green-800)">✓</div>
              <h3>${escapeHtml(result.caseId)}</h3>
              <p>Simpan nomor register perkara ini sebagai referensi administrasi.</p>
            </div>
            ${result.fileUrl ? `<a class="integration-link" href="${escapeAttr(result.fileUrl)}" target="_blank" rel="noopener noreferrer">Buka dokumen SPDP di Google Drive</a>` : ""}
          </div>
          <div class="modal-footer"><button class="primary-button" data-close-modal type="button">Tutup</button></div>
        </div>
      </div>`);
  }

  function renderCaseTable(cases) {
    if (!cases.length) return `<div class="panel-body">${emptyState("▤", "Belum ada perkara", "Data perkara belum tersedia atau tidak sesuai filter.")}</div>`;
    return `
      <div class="table-wrap">
        <table class="case-table">
          <thead><tr><th>Nomor register perkara</th><th>Tersangka</th><th>Penyidik</th><th>Status</th><th>Tenggat</th><th>Pembaruan</th><th><span class="sr-only">Aksi</span></th></tr></thead>
          <tbody>
            ${cases.map((item) => {
              const status = getStatus(item.status);
              const deadline = getDeadlineState(item);
              return `<tr>
                <td data-label="Register"><div class="case-primary">${escapeHtml(item.courtCaseNumber || item.caseId)}</div><div class="case-secondary">SPDP ${escapeHtml(item.spdpNumber || "-")}</div></td>
                <td data-label="Tersangka"><div class="case-primary">${escapeHtml(item.suspectName || "-")}</div><div class="case-secondary clamp-2">${escapeHtml(item.allegedArticle || "Pasal belum diisi")}</div></td>
                <td data-label="Penyidik"><div>${escapeHtml(item.investigatorName || "-")}</div><div class="case-secondary">${escapeHtml(item.investigatorInstitution || "-")}</div></td>
                <td data-label="Status"><span class="status-badge ${status.tone}">${escapeHtml(status.label)}</span></td>
                <td data-label="Tenggat">${item.deadlineDate ? `<span class="deadline-badge ${deadline.state}">${escapeHtml(deadline.label)}</span><div class="case-secondary">${formatDate(item.deadlineDate)}</div>` : `<span class="case-secondary">Belum ditentukan</span>`}</td>
                <td data-label="Pembaruan">${formatDateTime(item.updatedAt || item.createdAt)}</td>
                <td class="case-table-actions">
                  <div class="row-actions">
                    <button class="pidum-ai-button" data-action="ai" data-case="${escapeAttr(item.caseId)}" type="button"><span aria-hidden="true">✦</span><span class="btn-text">Analisa AI</span></button>
                    <button class="pidum-detail-button" data-action="detail" data-case="${escapeAttr(item.caseId)}" type="button">Detail</button>
                  </div>
                </td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>`;
  }

  /* Tombol aksi pada halaman memakai event delegation (lihat bindPageDelegation). */
  function bindCaseTableActions() { /* dipertahankan untuk kompatibilitas */ }

  function bindPageDelegation() {
    els.pageContent.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-action]");
      if (actionButton && els.pageContent.contains(actionButton)) {
        const caseId = actionButton.dataset.case;
        if (actionButton.dataset.action === "detail") openCaseModal(caseId);
        if (actionButton.dataset.action === "ai") window.openAiSidebar(caseId);
        return;
      }
      const opener = event.target.closest("[data-open-case]");
      if (opener && els.pageContent.contains(opener)) openCaseModal(opener.dataset.openCase);
    });
  }

  /* ===================== DETAIL PERKARA (V4) ===================== */
  const CASE_MODAL_TABS = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "penyidik", label: "Penyidik & SPDP" },
    { id: "tersangka", label: "Tersangka" },
    { id: "alur", label: "Alur & administrasi" },
    { id: "ai", label: "Analisa AI" }
  ];

  function openCaseModal(caseId, options = {}) {
    const item = state.cases.find((entry) => entry.caseId === caseId);
    if (!item) {
      toast("warning", "Perkara tidak ditemukan", "Segarkan data lalu coba lagi.");
      return;
    }
    const activeTab = options.tab || state.caseModalTab || "ringkasan";
    state.caseModalTab = activeTab;
    state.selectedAdministrationFile = null;

    const status = getStatus(item.status);
    const stageIndex = dashboardStageIndex(item.status);
    const stage = DASHBOARD_STAGES[stageIndex];
    const lateFlag = String(item.spdpLate).toLowerCase() === "true" || Number(item.spdpDelayDays) > 7;
    const isRegEdited = Boolean(item.courtCaseNumber && item.courtCaseNumber !== item.caseId);
    const displayReg = isRegEdited ? item.courtCaseNumber : item.caseId;
    const info = describeDeadline(item);
    const next = getNextStep(item);
    const admins = Array.isArray(item.administrations) ? item.administrations : [];
    const p24 = [...admins].reverse().find((record) => String(record.type || "").toUpperCase() === "P-24");
    const dossierNumber = item.nomorBerkas || p24?.formData?.dossierNumber || "";
    const dossierDate = item.tanggalBerkas || p24?.formData?.dossierDate || "";

    const html = `
      <div class="modal-backdrop case-modal-backdrop" role="presentation">
        <div class="modal-card case-modal" role="dialog" aria-modal="true" aria-labelledby="case-modal-title">
          <header class="case-modal-head">
            <div class="case-modal-topline">
              <span class="case-eyebrow">Nomor register perkara</span>
              <button class="case-modal-close" data-close-modal type="button" aria-label="Tutup">×</button>
            </div>

            <div class="case-reg-row" id="case-reg-view">
              <h2 id="case-modal-title">${escapeHtml(displayReg)}</h2>
              <button id="edit-reg-btn" class="case-ghost-button" type="button" title="Sesuaikan dengan nomor register CMS">✎ Edit nomor</button>
            </div>
            <form id="case-reg-form" class="case-reg-form" hidden>
              <input id="case-reg-input" type="text" value="${escapeAttr(item.courtCaseNumber || "")}" placeholder="Nomor register sesuai CMS" required />
              <button class="case-primary-button" type="submit"><span class="button-label">Simpan</span><span class="button-spinner" hidden></span></button>
              <button class="case-ghost-button" type="button" id="case-reg-cancel">Batal</button>
            </form>
            ${isRegEdited ? `<p class="case-reg-sub">Nomor sementara sistem: ${escapeHtml(item.caseId)}</p>` : `<p class="case-reg-warning">Nomor register masih sementara — sesuaikan dengan nomor register perkara pada CMS.</p>`}

            <div class="case-identity">
              <div class="case-identity-avatar" aria-hidden="true">${escapeHtml(initials(item.suspectName || "?"))}</div>
              <div>
                <strong>${escapeHtml(item.suspectName || "Tersangka belum diisi")}</strong>
                <span>${escapeHtml(item.allegedArticle || "Pasal belum diisi")}</span>
              </div>
            </div>

            <div class="case-chip-row">
              <span class="case-chip tone-${status.tone}">${escapeHtml(status.label)}</span>
              <span class="case-chip phase-${stage.phase}">${stage.phase === "pra" ? "Prapenuntutan" : "Penuntutan"} · ${escapeHtml(stage.short)}</span>
              <span class="case-chip ${lateFlag ? "tone-red" : "tone-green"}">${lateFlag ? `SPDP ${escapeHtml(String(item.spdpDelayDays ?? "?"))} hari (> 7)` : "SPDP tepat waktu"}</span>
              ${item.deadlineDate ? `<span class="case-chip deadline-${info.deadline.state}">${escapeHtml(info.text)} · ${formatDate(item.deadlineDate)}</span>` : ""}
            </div>

            <ol class="case-mini-track" aria-label="Posisi tahapan perkara">
              ${DASHBOARD_STAGES.map((entry, index) => `
                <li class="${index < stageIndex ? "done" : ""} ${index === stageIndex ? "current" : ""} ${entry.phase}" title="${escapeAttr(entry.label)}">
                  <span></span><small>${escapeHtml(entry.short)}</small>
                </li>`).join("")}
            </ol>

            <nav class="case-tabs" role="tablist" aria-label="Bagian detail perkara">
              ${CASE_MODAL_TABS.map((tab) => `<button type="button" role="tab" class="case-tab ${tab.id === activeTab ? "active" : ""}" data-case-tab="${tab.id}" aria-selected="${tab.id === activeTab}">${escapeHtml(tab.label)}${tab.id === "alur" ? `<i>${admins.length}</i>` : ""}</button>`).join("")}
            </nav>
          </header>

          <div class="case-modal-body">
            <section class="case-panel" data-case-panel="ringkasan" ${activeTab === "ringkasan" ? "" : "hidden"}>
              <div class="case-next-card">
                <span>Langkah berikutnya · B-310</span>
                <strong><b>${escapeHtml(next.code)}</b> ${escapeHtml(next.text)}</strong>
                ${item.deadlineDate ? `<small>${escapeHtml(info.type)} — ${formatDate(item.deadlineDate)} (${escapeHtml(info.text.toLowerCase())})</small>` : ""}
              </div>

              ${renderAdministrationOverview(item)}

              <h3 class="case-section-title">Data pokok perkara</h3>
              <div class="case-facts">
                ${fact("Nomor SPDP", item.spdpNumber, { mono: true })}
                ${fact("Tanggal SPDP", formatDate(item.spdpDate))}
                ${fact("SPDP diterima", formatDate(item.receivedDate))}
                ${fact("Instansi penyidik", item.investigatorInstitution)}
                ${fact("Penyidik", item.investigatorName, { sub: [item.investigatorRank, item.investigatorNipNrp].filter(Boolean).join(" · ") })}
                ${fact("Jaksa / Penuntut Umum", item.prosecutorName || "Belum ditunjuk", { muted: !item.prosecutorName })}
                ${fact("Sprindik", item.sprindikNumber, { sub: item.sprindikDate ? formatDate(item.sprindikDate) : "" })}
                ${fact("Nomor berkas perkara", dossierNumber || "Belum ada", { muted: !dossierNumber, sub: dossierDate ? formatDate(dossierDate) : "" })}
                ${fact("Nomor perkara PN", item.courtCaseNumber && item.courtCaseNumber !== displayReg ? item.courtCaseNumber : "-")}
              </div>

              <div class="case-prose">
                <h4>Uraian singkat perkara</h4>
                <p>${escapeHtml(item.caseSummary || "Belum ada uraian.")}</p>
              </div>
              <div class="case-prose">
                <h4>Barang bukti</h4>
                <p>${escapeHtml(item.evidence || "Belum ada data barang bukti.")}</p>
              </div>
              ${item.notes ? `<div class="case-prose note"><h4>Catatan sistem</h4><p>${escapeHtml(item.notes)}</p></div>` : ""}
            </section>

            <section class="case-panel" data-case-panel="penyidik" ${activeTab === "penyidik" ? "" : "hidden"}>
              <div class="case-split">
                <article class="case-card">
                  <header><span class="case-card-icon">${dashboardIcon("users")}</span><div><h4>Penyidik</h4><small>Pengirim SPDP</small></div></header>
                  <div class="case-person">
                    <div class="case-person-avatar">${escapeHtml(initials(item.investigatorName || "?"))}</div>
                    <div><strong>${escapeHtml(item.investigatorName || "-")}</strong><span>${escapeHtml(item.investigatorPosition || "Jabatan belum diisi")}</span></div>
                  </div>
                  <dl class="case-dl">
                    ${dl("Pangkat / Gol", item.investigatorRank)}
                    ${dl("NIP / NRP", item.investigatorNipNrp)}
                    ${dl("Jabatan", item.investigatorPosition)}
                    ${dl("Instansi / unit", item.investigatorInstitution)}
                    ${dl("Nomor kontak", item.investigatorPhone ? `<a href="tel:${escapeAttr(item.investigatorPhone)}">${escapeHtml(item.investigatorPhone)}</a>${waLink(item.investigatorPhone)}` : "", true)}
                    ${dl("Akun pengirim", item.submittedByName)}
                    ${dl("Dikirim pada", formatDateTime(item.createdAt))}
                  </dl>
                </article>

                <article class="case-card">
                  <header><span class="case-card-icon">${dashboardIcon("file")}</span><div><h4>SPDP &amp; Sprindik</h4><small>Dasar penyidikan</small></div></header>
                  <dl class="case-dl">
                    ${dl("Nomor SPDP", item.spdpNumber)}
                    ${dl("Tanggal SPDP", formatDate(item.spdpDate))}
                    ${dl("Diterima Kejaksaan", formatDate(item.receivedDate))}
                    ${dl("Nomor Sprindik", item.sprindikNumber)}
                    ${dl("Tanggal Sprindik", formatDate(item.sprindikDate))}
                    ${dl("Selisih Sprindik → SPDP", `<span class="case-inline-badge ${lateFlag ? "red" : "green"}">${escapeHtml(String(item.spdpDelayDays ?? "-"))} hari · ${lateFlag ? "> 7 hari" : "≤ 7 hari"}</span>`, true)}
                    ${dl("Pasal disangkakan", item.allegedArticle)}
                  </dl>
                  <div class="case-links">
                    ${item.spdpFileUrl ? `<a class="case-link" href="${escapeAttr(item.spdpFileUrl)}" target="_blank" rel="noopener noreferrer">${dashboardIcon("file")} ${escapeHtml(item.spdpFileName || "Dokumen SPDP")}</a>` : `<span class="case-link disabled">Dokumen SPDP belum ada</span>`}
                    ${item.caseFolderUrl ? `<a class="case-link" href="${escapeAttr(item.caseFolderUrl)}" target="_blank" rel="noopener noreferrer">${dashboardIcon("clipboard")} Folder perkara di Drive</a>` : ""}
                  </div>
                </article>
              </div>
            </section>

            <section class="case-panel" data-case-panel="tersangka" ${activeTab === "tersangka" ? "" : "hidden"}>
              <article class="case-card">
                <header><span class="case-card-icon">${dashboardIcon("users")}</span><div><h4>Identitas tersangka</h4><small>Sesuai dokumen penyidikan</small></div></header>
                <dl class="case-dl two-col">
                  ${dl("Nama lengkap", item.suspectName)}
                  ${dl("Nomor identitas", item.suspectIdentityNumber)}
                  ${dl("Tempat lahir", item.birthPlace)}
                  ${dl("Tanggal lahir", formatDate(item.birthDate))}
                  ${dl("Umur", item.age ? `${item.age} tahun` : "")}
                  ${dl("Jenis kelamin", item.gender)}
                  ${dl("Kewarganegaraan", item.nationality)}
                  ${dl("Agama", item.religion)}
                  ${dl("Pekerjaan", item.occupation)}
                  ${dl("Pendidikan", item.education)}
                  ${dl("Alamat", item.address)}
                </dl>
              </article>
            </section>

            <section class="case-panel" data-case-panel="alur" ${activeTab === "alur" ? "" : "hidden"}>
              ${renderCaseFlowTimeline(item)}
              ${renderCaseStageEditor(item)}
              <h3 class="case-section-title">Administrasi perkara</h3>
              ${renderAdministrationPanel(item)}
            </section>

            <section class="case-panel" data-case-panel="ai" ${activeTab === "ai" ? "" : "hidden"}>
              <div class="case-ai-head">
                <div><h4>Analisa AI</h4><p>Draf pendukung prapenuntutan — keputusan tetap pada Jaksa Peneliti.</p></div>
                <button id="ai-analyze-btn" class="case-primary-button" type="button">✦ Jalankan analisa</button>
              </div>
              <div id="ai-analysis-result" class="case-ai-result"><p class="case-muted">Memuat riwayat analisa…</p></div>
            </section>
          </div>

          <footer class="case-modal-foot">
            <button class="case-ghost-button" type="button" id="case-open-ai-sidebar">✦ Chat AI</button>
            <button class="case-ghost-button" type="button" id="case-create-admin">＋ Buat administrasi</button>
            <button class="case-primary-button" data-close-modal type="button">Tutup</button>
          </footer>
        </div>
      </div>`;

    openModal(html);
    bindCaseModal(item);
  }

  function fact(label, value, options = {}) {
    const display = value === undefined || value === null || String(value).trim() === "" ? "-" : String(value);
    return `<div class="case-fact ${options.muted ? "muted" : ""}"><span>${escapeHtml(label)}</span><strong class="${options.mono ? "mono" : ""}">${escapeHtml(display)}</strong>${options.sub ? `<small>${escapeHtml(options.sub)}</small>` : ""}</div>`;
  }

  function dl(label, value, raw = false) {
    const empty = value === undefined || value === null || String(value).trim() === "" || value === "-";
    return `<div><dt>${escapeHtml(label)}</dt><dd class="${empty ? "empty" : ""}">${empty ? "—" : raw ? value : escapeHtml(value)}</dd></div>`;
  }

  function waLink(phone) {
    let number = String(phone || "").replace(/[^0-9]/g, "");
    if (!number) return "";
    if (number.startsWith("0")) number = `62${number.slice(1)}`;
    return ` <a class="case-wa" href="https://wa.me/${escapeAttr(number)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`;
  }

  /* Daftar administrasi pada tab Ringkasan: file yang sudah dibuat + tombol buat yang belum. */
  function renderAdministrationOverview(item) {
    const administrations = (Array.isArray(item.administrations) ? item.administrations : [])
      .slice()
      .sort((a, b) => dateValue(b.createdAt) - dateValue(a.createdAt));
    const byType = new Map();
    administrations.forEach((record) => {
      const key = String(record.type || "").toUpperCase();
      if (!byType.has(key)) byType.set(key, []);
      byType.get(key).push(record);
    });
    const knownCodes = new Set(ADMINISTRATION_STAGES.map((stage) => stage.code));
    const done = [];
    const pending = [];
    ADMINISTRATION_STAGES.forEach((stage) => (byType.has(stage.code) ? done : pending).push(stage));
    // Jenis administrasi lain yang tersimpan tetapi tidak ada di daftar tahapan
    byType.forEach((records, code) => {
      if (!knownCodes.has(code)) done.push({ code, title: records[0].title || code, detail: "" });
    });

    const fileLink = (record, label) => record.fileUrl
      ? `<a class="adm-file" href="${escapeAttr(record.fileUrl)}" target="_blank" rel="noopener noreferrer" title="${escapeAttr(record.fileName || "Buka file")}">${dashboardIcon("file")}<span>${escapeHtml(label)}</span></a>`
      : `<span class="adm-file none">Tanpa file</span>`;

    const doneCards = done.map((stage) => {
      const records = byType.get(stage.code) || [];
      const latest = records[0];
      const older = records.slice(1);
      return `
        <article class="adm-card done">
          <div class="adm-card-top">
            <span class="adm-code">${escapeHtml(stage.code)}</span>
            <span class="adm-status">✓ Dibuat${records.length > 1 ? ` · ${records.length} versi` : ""}</span>
          </div>
          <strong>${escapeHtml(stage.title)}</strong>
          <small>${latest.documentNumber ? `No. ${escapeHtml(latest.documentNumber)} · ` : ""}${formatDate(latest.documentDate || latest.createdAt)}${latest.responsibleOfficer ? ` · ${escapeHtml(latest.responsibleOfficer)}` : ""}</small>
          <div class="adm-card-actions">
            ${fileLink(latest, latest.fileUrl ? "Buka dokumen" : "")}
            <button type="button" class="case-ghost-button small" data-create-administration="${escapeAttr(stage.code)}">Buat ulang</button>
          </div>
          ${older.length ? `
            <details class="adm-history">
              <summary>Versi sebelumnya (${older.length})</summary>
              <ul>${older.map((record) => `<li><span>${formatDateTime(record.createdAt)}${record.documentNumber ? ` · ${escapeHtml(record.documentNumber)}` : ""}</span>${record.fileUrl ? `<a href="${escapeAttr(record.fileUrl)}" target="_blank" rel="noopener noreferrer">Buka</a>` : ""}</li>`).join("")}</ul>
            </details>` : ""}
        </article>`;
    }).join("");

    const pendingRows = pending.map((stage) => `
      <li class="adm-pending">
        <span class="adm-code muted">${escapeHtml(stage.code)}</span>
        <span class="adm-pending-copy"><strong>${escapeHtml(stage.title)}</strong><small>${escapeHtml(stage.detail)}</small></span>
        <button type="button" class="case-primary-button small" data-create-administration="${escapeAttr(stage.code)}">＋ Buat</button>
      </li>`).join("");

    const total = ADMINISTRATION_STAGES.length;
    const doneKnown = ADMINISTRATION_STAGES.filter((stage) => byType.has(stage.code)).length;
    const pct = Math.round((doneKnown / total) * 100);
    const folder = item.caseFolderUrl
      ? `<a class="case-ghost-button small" href="${escapeAttr(item.caseFolderUrl)}" target="_blank" rel="noopener noreferrer">Folder Drive</a>` : "";

    return `
      <section class="adm-overview">
        <header class="adm-overview-head">
          <div>
            <h3 class="case-section-title" style="margin:0">Administrasi perkara</h3>
            <p>${doneKnown} dari ${total} jenis dibuat · ${administrations.length} file tersimpan</p>
          </div>
          <div class="adm-overview-meta">${folder}<span class="adm-pct">${pct}%</span></div>
        </header>
        <div class="administration-progress"><span style="width:${pct}%"></span></div>

        <div class="adm-group-label">Sudah dibuat <b>${done.length}</b></div>
        ${done.length ? `<div class="adm-grid">${doneCards}</div>` : `<p class="case-muted adm-empty">Belum ada administrasi yang dibuat untuk perkara ini.</p>`}

        <div class="adm-group-label">Belum dibuat <b>${pending.length}</b></div>
        ${pending.length ? `<ul class="adm-pending-list">${pendingRows}</ul>` : `<p class="case-muted adm-empty">Semua jenis administrasi telah dibuat.</p>`}
      </section>`;
  }

  function renderCaseFlowTimeline(item) {
    const current = dashboardStageIndex(item.status);
    const flowStage = B310_FLOW.find((entry) => entry.id === DASHBOARD_STAGES[current].key) || B310_FLOW[0];
    const doneCodes = new Set((item.administrations || []).map((record) => String(record.type || "").toUpperCase().replace("SOP FORM ", "SOP FORM-")));
    return `
      <div class="case-flow">
        <div class="case-flow-head">
          <div><span class="case-eyebrow">Posisi saat ini · ${escapeHtml(flowStage.range)}</span><h4>${escapeHtml(flowStage.title)}</h4><p>${escapeHtml(flowStage.summary)}</p></div>
          <span class="case-flow-deadline">${dashboardIcon("clock")} ${escapeHtml(flowStage.deadline)}</span>
        </div>
        <ul class="case-flow-steps">
          ${flowStage.steps.map((step) => {
            const codes = step.code.split(/\s*·\s*/).map((code) => code.toUpperCase());
            const done = codes.some((code) => doneCodes.has(code));
            return `<li class="${step.tone} ${done ? "done" : ""}"><b>${escapeHtml(step.code)}</b><span>${escapeHtml(step.title)}${step.tone === "branch" ? ' <em>cabang</em>' : step.tone === "optional" ? ' <em>opsional</em>' : ""}</span>${done ? '<i aria-label="Sudah dibuat">✓</i>' : ""}</li>`;
          }).join("")}
        </ul>
      </div>`;
  }

  function bindCaseModal(item) {
    const caseId = item.caseId;
    const root = els.modalRoot;

    root.querySelectorAll("[data-case-tab]").forEach((tab) => {
      tab.addEventListener("click", () => {
        const id = tab.dataset.caseTab;
        state.caseModalTab = id;
        root.querySelectorAll("[data-case-tab]").forEach((button) => {
          const active = button.dataset.caseTab === id;
          button.classList.toggle("active", active);
          button.setAttribute("aria-selected", String(active));
        });
        root.querySelectorAll("[data-case-panel]").forEach((panel) => { panel.hidden = panel.dataset.casePanel !== id; });
        root.querySelector(".case-modal-body")?.scrollTo({ top: 0, behavior: "smooth" });
        if (id === "ai") loadExistingAiAnalyses(caseId);
      });
    });

    root.querySelectorAll("[data-create-administration]").forEach((button) => {
      button.addEventListener("click", () => openAdministrationModal(caseId, button.dataset.createAdministration));
    });
    bindCaseStageEditor(caseId);

    const regView = document.getElementById("case-reg-view");
    const regForm = document.getElementById("case-reg-form");
    const regInput = document.getElementById("case-reg-input");
    document.getElementById("edit-reg-btn")?.addEventListener("click", () => {
      regView.hidden = true;
      regForm.hidden = false;
      regInput.focus();
      regInput.select();
    });
    document.getElementById("case-reg-cancel")?.addEventListener("click", () => {
      regForm.hidden = true;
      regView.hidden = false;
    });
    regForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const value = regInput.value.trim();
      if (!value) return;
      if (value === item.caseId) {
        toast("warning", "Nomor tidak valid", "Masukkan nomor yang berbeda dari nomor sementara sistem.");
        return;
      }
      const button = regForm.querySelector("button[type=submit]");
      setButtonLoading(button, true);
      try {
        const result = await gasRequest("updateCase", { caseId, updates: { courtCaseNumber: value } });
        replaceCase(result.case || { ...item, courtCaseNumber: value });
        toast("success", "Nomor register diperbarui", "Nomor telah disesuaikan dengan CMS.");
        refreshCurrentPage();
        openCaseModal(caseId, { keepScroll: true });
      } catch (error) {
        toast("error", "Gagal menyimpan", error.message);
        setButtonLoading(button, false);
      }
    });

    document.getElementById("ai-analyze-btn")?.addEventListener("click", () => runAiAnalysis(caseId));
    document.getElementById("case-open-ai-sidebar")?.addEventListener("click", () => window.openAiSidebar(caseId));
    document.getElementById("case-create-admin")?.addEventListener("click", () => {
      closeModal();
      state.administrationBuilder = { caseId, type: "" };
      navigate("administration-builder");
    });
    if (state.caseModalTab === "ai") loadExistingAiAnalyses(caseId);
  }

  function replaceCase(updated) {
    if (!updated || !updated.caseId) return;
    const index = state.cases.findIndex((entry) => entry.caseId === updated.caseId);
    if (index >= 0) state.cases[index] = { ...state.cases[index], ...updated };
    else state.cases.unshift(updated);
  }

  function refreshCurrentPage() {
    renderSidebar();
    if (["dashboard", "cases", "deadlines", "workflow"].includes(state.activePage)) renderActivePage();
  }

  function renderCaseStageEditor(item) {
    const groupedStatuses = new Set(DASHBOARD_STAGES.flatMap((stage) => stage.statuses));
    const otherStatuses = Object.keys(STATUS).filter((key) => !groupedStatuses.has(key));
    const groupOptions = DASHBOARD_STAGES.map((stage) => {
      const opts = stage.statuses.map((statusKey) => `<option value="${escapeAttr(statusKey)}" ${item.status === statusKey ? "selected" : ""}>${escapeHtml(STATUS[statusKey]?.label || statusKey)}</option>`).join("");
      return `<optgroup label="${escapeAttr((stage.phase === "pra" ? "Prapenuntutan · " : "Penuntutan · ") + stage.label)}">${opts}</optgroup>`;
    }).join("");
    const otherOptions = otherStatuses.length
      ? `<optgroup label="Status lainnya">${otherStatuses.map((key) => `<option value="${escapeAttr(key)}" ${item.status === key ? "selected" : ""}>${escapeHtml(STATUS[key].label)}</option>`).join("")}</optgroup>`
      : "";

    return `
      <section class="case-stage-editor">
        <label for="modal-status-select">Ubah tahapan secara manual</label>
        <div class="case-stage-editor-row">
          <select id="modal-status-select" name="modal-status-select">${groupOptions}${otherOptions}</select>
          <button type="button" id="save-case-status" class="case-primary-button"><span class="button-label">Simpan</span><span class="button-spinner" hidden></span></button>
        </div>
        <small>Tenggat dihitung ulang otomatis bila tahapan berubah.</small>
      </section>`;
  }

  function bindCaseStageEditor(caseId) {
    const button = document.getElementById("save-case-status");
    if (!button) return;
    button.addEventListener("click", async () => {
      const select = document.getElementById("modal-status-select");
      const newStatus = select?.value;
      const current = state.cases.find((entry) => entry.caseId === caseId);
      if (!newStatus || current?.status === newStatus) {
        toast("info", "Tidak ada perubahan", "Pilih tahapan yang berbeda untuk menyimpan.");
        return;
      }
      setButtonLoading(button, true);
      try {
        const result = await gasRequest("updateCase", { caseId, updates: { status: newStatus } });
        replaceCase(result.case || { ...current, status: newStatus });
        toast("success", "Tahapan diperbarui", `Status perkara menjadi ${getStatus(newStatus).label}.`);
        refreshCurrentPage();
        openCaseModal(caseId, { tab: "alur" });
      } catch (error) {
        toast("error", "Gagal memperbarui tahapan", error.message);
        setButtonLoading(button, false);
      }
    });
  }

  function renderAdministrationPanel(item) {
    const administrations = Array.isArray(item.administrations) ? item.administrations : [];
    const latestByType = new Map();
    administrations.forEach((record) => {
      const key = String(record.type || "").toUpperCase();
      const previous = latestByType.get(key);
      if (!previous || dateValue(record.createdAt) >= dateValue(previous.createdAt)) latestByType.set(key, record);
    });
    const resolvedCount = ADMINISTRATION_STAGES.filter((stage) => latestByType.has(stage.code)).length;
    const percentage = Math.round((resolvedCount / ADMINISTRATION_STAGES.length) * 100);

    return `
      <section class="administration-panel v4">
        <div class="administration-summary">
          <div>
            <strong>${resolvedCount} dari ${ADMINISTRATION_STAGES.length} jenis administrasi dibuat</strong>
            <small>Status perkara diperbarui otomatis setelah administrasi disimpan.</small>
          </div>
          <span>${percentage}%</span>
        </div>
        <div class="administration-progress" aria-label="Progres administrasi ${percentage}%"><span style="width:${percentage}%"></span></div>
        <div class="admin-rows">
          ${ADMINISTRATION_STAGES.map((stage) => {
            const record = latestByType.get(stage.code);
            return `
              <article class="admin-row ${record ? "done" : ""}">
                <span class="admin-row-code">${escapeHtml(stage.code)}</span>
                <div class="admin-row-copy">
                  <strong>${escapeHtml(stage.title)}</strong>
                  ${record
                    ? `<small>${record.documentNumber ? `No. ${escapeHtml(record.documentNumber)} · ` : ""}${formatDate(record.documentDate)} · ${escapeHtml(record.responsibleOfficer || "-")}</small>`
                    : `<small>${escapeHtml(stage.detail)}</small>`}
                </div>
                <div class="admin-row-actions">
                  ${record?.fileUrl ? `<a class="case-ghost-button small" href="${escapeAttr(record.fileUrl)}" target="_blank" rel="noopener noreferrer">Buka</a>` : ""}
                  <button type="button" class="${record ? "case-ghost-button" : "case-primary-button"} small" data-create-administration="${escapeAttr(stage.code)}">${record ? "Buat ulang" : "Buat"}</button>
                </div>
              </article>`;
          }).join("")}
        </div>
      </section>`;
  }

  function openAdministrationModal(caseId, type) {
    const item = state.cases.find((entry) => entry.caseId === caseId);
    const stage = ADMINISTRATION_STAGES.find((entry) => entry.code === type);
    if (!item || !stage) return;

    closeModal();
    state.administrationBuilder.caseId = caseId;
    state.administrationBuilder.type = type;
    navigate("administration-builder");
  }

  function renderAdministrationBuilderPage() {
    const selectedCaseId = state.administrationBuilder.caseId;
    const isManual = selectedCaseId === "__NEW_ADMIN__";
    
    const selectedCase = isManual 
      ? { caseId: "__NEW_ADMIN__", suspectName: "Administrasi Manual (Tanpa Perkara)", spdpNumber: "-", status: "", administrations: [] }
      : state.cases.find((item) => item.caseId === selectedCaseId) || null;

    const selectedStage = ADMINISTRATION_STAGES.find((stage) => stage.code === state.administrationBuilder.type) || null;
    const selectedSchema = selectedStage ? ADMIN_FORM_SCHEMAS[selectedStage.code] : null;

    els.pageContent.innerHTML = `
      <section class="administration-builder-shell">
        <div class="panel builder-controls-panel">
          <div class="panel-header">
            <div>
              <h3>Pembuatan Administrasi Otomatis</h3>
              <p>Pilih nama tersangka. Data perkara dan administrasi sebelumnya akan dimasukkan ke form secara otomatis.</p>
            </div>
          </div>
          <div class="builder-controls">
            <div class="form-field">
              <label for="builder-case-select">Nama tersangka <span class="required">*</span></label>
              <select id="builder-case-select">
                <option value="">Pilih nama tersangka...</option>
                <option value="__NEW_ADMIN__" ${isManual ? "selected" : ""} style="font-weight: 600; color: var(--blue-700);">＋ Buat administrasi baru (Tanpa Perkara)</option>
                ${[...state.cases].sort((a, b) => String(a.suspectName || "").localeCompare(String(b.suspectName || ""), "id")).map((item) => `
                  <option value="${escapeAttr(item.caseId)}" ${selectedCase?.caseId === item.caseId && !isManual ? "selected" : ""}>
                    ${escapeHtml(item.suspectName || "Nama belum tersedia")} — ${escapeHtml(item.courtCaseNumber || item.caseId)}
                  </option>`).join("")}
              </select>
              <small class="form-hint">Nomor register ditampilkan untuk membedakan tersangka dengan nama yang sama.</small>
            </div>
            <div class="form-field">
              <label for="builder-type-select">Jenis administrasi <span class="required">*</span></label>
              <select id="builder-type-select" ${selectedCase ? "" : "disabled"}>
                <option value="">Pilih administrasi...</option>
                ${selectedCase ? renderAdministrationTypeOptions(selectedCase, selectedStage?.code || "") : ""}
              </select>
              <small class="form-hint">Tahapan yang belum memenuhi prasyarat akan terkunci.</small>
            </div>
          </div>
        </div>

        ${selectedCase ? renderBuilderCaseSnapshot(selectedCase) : `
          <div class="panel builder-placeholder">${emptyState("⌄", "Pilih nama tersangka", "Form akan ditampilkan setelah perkara dipilih dari dropdown.")}</div>`}

        ${selectedCase && selectedStage ? (
          selectedSchema
            ? renderDynamicAdministrationForm(selectedCase, selectedStage, selectedSchema)
            : `<div class="panel">${emptyState("!", "Skema form tidak tersedia", `Skema ${selectedStage.code} belum ditemukan pada administration-forms.js.`)}</div>`
        ) : ""}
      </section>`;

    document.getElementById("builder-case-select")?.addEventListener("change", (event) => {
      state.administrationBuilder.caseId = event.target.value;
      state.administrationBuilder.type = "";
      state.selectedAdministrationFile = null;
      renderAdministrationBuilderPage();
    });

    document.getElementById("builder-type-select")?.addEventListener("change", (event) => {
      state.administrationBuilder.type = event.target.value;
      state.selectedAdministrationFile = null;
      renderAdministrationBuilderPage();
    });

    bindDynamicAdministrationForm(selectedCase, selectedStage);

    if (selectedCase && selectedStage && selectedCase.caseId !== "__NEW_ADMIN__") {
      autoFillHistoricalData(selectedCase, selectedStage.code);
    }
  }

  function renderAdministrationTypeOptions(item, selectedType) {
    return ADMINISTRATION_STAGES.map((stage) => {
      const availability = getAdministrationAvailability(item, stage);
      const suffix = availability.completed
        ? " — (Buat ulang)"
        : availability.locked
          ? ` — terkunci: ${availability.message}`
          : " — siap dibuat";
      return `<option value="${escapeAttr(stage.code)}" ${selectedType === stage.code ? "selected" : ""} ${availability.locked ? "disabled" : ""}>${escapeHtml(stage.code + " — " + stage.title + suffix)}</option>`;
    }).join("");
  }

  function getAdministrationAvailability(item, stage) {
    if (item.caseId === "__NEW_ADMIN__") {
      return { completed: false, locked: false, message: "Siap dibuat secara manual" };
    }
    const administrations = Array.isArray(item.administrations) ? item.administrations : [];
    const completed = new Set(administrations.map((record) => String(record.type || "").toUpperCase()));
    
    if (completed.has(stage.code)) return { completed: true, locked: false, message: "Telah dibuat (Akan menimpa file lama)" };
    
    return {
      completed: false,
      locked: false,
      message: "Siap dibuat"
    };
  }

  function renderBuilderCaseSnapshot(item) {
    if (item.caseId === "__NEW_ADMIN__") {
      return `
        <div class="panel builder-case-card" style="border-left: 4px solid var(--gray-400);">
          <div class="builder-case-heading">
            <div>
              <span class="case-secondary">Mode Manual</span>
              <h3>Pembuatan Administrasi Tanpa Perkara</h3>
              <p>Isi seluruh data form secara manual. Dokumen akan dibuat namun tidak ditautkan ke riwayat data perkara tertentu.</p>
            </div>
            <span class="status-badge gray">Manual</span>
          </div>
        </div>`;
    }

    const administrations = Array.isArray(item.administrations) ? item.administrations : [];
    const completedCodes = administrations.map((record) => String(record.type || "").toUpperCase());
    const p19ResolvedByP21 = completedCodes.includes("P-21") && !completedCodes.includes("P-19");
    const resolved = completedCodes.length + (p19ResolvedByP21 ? 1 : 0);
    const percentage = Math.min(100, Math.round((resolved / ADMINISTRATION_STAGES.length) * 100));

    return `
      <div class="panel builder-case-card">
        <div class="builder-case-heading">
          <div>
            <span class="case-secondary">Perkara terpilih</span>
            <h3>${escapeHtml(item.suspectName || "Nama tersangka belum tersedia")}</h3>
            <p>${escapeHtml(item.caseId)} · SPDP ${escapeHtml(item.spdpNumber || "-")}</p>
          </div>
          <span class="status-badge ${getStatus(item.status).tone}">${escapeHtml(getStatus(item.status).label)}</span>
        </div>
        <div class="detail-grid builder-case-details">
          ${detail("Penyidik", item.investigatorName)}
          ${detail("Instansi", item.investigatorInstitution)}
          ${detail("Pasal disangkakan", item.allegedArticle, true)}
        </div>
        <div class="administration-summary compact">
          <div><strong>${resolved} dari ${ADMINISTRATION_STAGES.length} tahapan selesai</strong><small>Data form lama tetap dapat dipakai sebagai sumber isian otomatis.</small></div>
          <span>${percentage}%</span>
        </div>
        <div class="administration-progress"><span style="width:${percentage}%"></span></div>
      </div>`;
  }

  function renderDynamicAdministrationForm(item, stage, schema) {
    const availability = getAdministrationAvailability(item, stage);
    if (availability.locked) {
      return `<div class="panel">${emptyState("!", `${stage.code} belum dapat dibuat`, availability.message || "Pilih administrasi lain.")}</div>`;
    }

    let sortOrder = 0;
    const sections = schema.sections.map((section, sectionIndex) => `
      <section class="admin-form-section">
        <div class="admin-form-section-heading">
          <span>${sectionIndex + 1}</span>
          <div><h3>${escapeHtml(section.title)}</h3>${section.description ? `<p>${escapeHtml(section.description)}</p>` : ""}</div>
        </div>
        <div class="form-grid admin-dynamic-grid">
          ${section.fields.map((definition) => {
            sortOrder += 1;
            return renderAdministrationField(definition, item, sortOrder);
          }).join("")}
        </div>
      </section>`).join("");

    return `
      <div class="panel builder-form-panel">
        <div class="administration-form-intro builder-form-intro">
          <span class="administration-code">${escapeHtml(stage.code)}</span>
          <div>
            <strong>${escapeHtml(schema.title || stage.title)}</strong>
            <p>${escapeHtml(schema.subtitle || stage.detail)} · Acuan format: ${escapeHtml(schema.referencePages || "Lampiran B-310")}. Setelah disimpan, status menjadi ${escapeHtml(getStatus(stage.status).label)}.</p>
          </div>
        </div>
        <form id="administration-create-form" class="builder-form" novalidate>
          <input type="hidden" name="caseId" value="${escapeAttr(item.caseId)}" />
          <input type="hidden" name="type" value="${escapeAttr(stage.code)}" />
          ${sections}
          <section class="admin-form-section">
            <div class="admin-form-section-heading"><span>${schema.sections.length + 1}</span><div><h3>Lampiran dan catatan sistem</h3><p>Lampiran bersifat opsional. Seluruh isian form disimpan sebagai data terstruktur di Google Spreadsheet.</p></div></div>
            <div class="form-grid admin-dynamic-grid">
              <div class="form-field full-span">
                <label for="administration-system-notes">Catatan internal <span class="optional-label">(opsional)</span></label>
                <textarea id="administration-system-notes" name="systemNotes" placeholder="Catatan internal yang tidak dicetak pada format administrasi."></textarea>
              </div>
              <div class="form-field full-span">
                <label for="administration-file">Lampiran PDF/DOCX <span class="optional-label">(opsional)</span></label>
                <div class="administration-file-box">
                  <input id="administration-file" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                  <button id="choose-administration-file" class="secondary-button" type="button">Pilih lampiran</button>
                  <div id="administration-file-name" class="case-secondary">Belum ada lampiran dipilih.</div>
                </div>
              </div>
            </div>
          </section>
          <div class="builder-form-actions">
            <button id="builder-reset-form" class="ghost-button" type="button">Muat ulang data otomatis</button>
            <button id="save-administration" class="primary-button" type="submit">
              <span class="button-label">Simpan ${escapeHtml(stage.code)} dan perbarui status</span>
              <span class="button-spinner" hidden></span>
            </button>
          </div>
        </form>
      </div>`;
  }

function detectTeamRoleFromLabel(label) {
    const text = String(label || "").trim().toLowerCase();
    if (!text.startsWith("nama")) return null;
    const memberMatch = text.match(/anggota\s*(\d+)/);
    if (memberMatch) return "anggota " + memberMatch[1];
    if (text.includes("ketua")) return "ketua";
    
    if (text.includes("penandatangan")) return "penandatangan";
    if (text.includes("penuntut umum")) return "penuntut umum";
    
    return null;
  }

  function autofillTeamMemberFields(selectEl, { onlyEmpty = false } = {}) {
    const role = selectEl?.dataset?.teamRole;
    if (!role) return;

    const option = selectEl.selectedOptions && selectEl.selectedOptions[0];
    if (onlyEmpty && (!option || !option.dataset.pangkat && !option.dataset.nip)) return;
    const pangkat = option ? (option.dataset.pangkat || "") : "";
    const nip = option ? (option.dataset.nip || "") : "";
    const jabatan = option ? (option.dataset.jabatan || "") : "";
    autofillTeamMemberFields.onlyEmpty = onlyEmpty;

    const section = selectEl.closest(".admin-form-section") || document.getElementById("administration-create-form");
    if (!section) return;

    if (role === "ketua") {
      setAdministrationFieldByLabel(section, ["pangkat", "ketua"], pangkat);
      setAdministrationFieldByLabel(section, ["nip", "ketua"], nip);
      setAdministrationFieldByLabel(section, ["jabatan", "ketua"], jabatan);
    } 
    else if (role === "penandatangan") {
      setAdministrationFieldByLabel(section, ["pangkat"], pangkat);
      setAdministrationFieldByLabel(section, ["nip"], nip); 
    } 
    else if (role === "penuntut umum") {
      setAdministrationFieldByLabel(section, ["pangkat", "penuntut umum"], pangkat);
      setAdministrationFieldByLabel(section, ["nip", "penuntut umum"], nip);
    }
    else {
      const combined = pangkat && nip ? `${pangkat} / ${nip}` : (pangkat || nip);
      setAdministrationFieldByLabel(section, ["pangkat", role], combined);
      setAdministrationFieldByLabel(section, ["jabatan", role], jabatan);
    }
  }

  function setAdministrationFieldByLabel(container, keywords, value) {
    const labels = container.querySelectorAll(".form-field label");
    for (const label of labels) {
      const text = label.textContent.toLowerCase();
      if (keywords.every((keyword) => text.includes(keyword))) {
        const targetId = label.getAttribute("for");
        const target = targetId ? document.getElementById(targetId) : null;
        if (target && !target.matches("select")) {
          if (autofillTeamMemberFields.onlyEmpty && String(target.value || "").trim()) return true;
          if (!value && String(target.value || "").trim()) return true; // jangan hapus isian manual
          target.value = value || "";
          target.dispatchEvent(new Event("input", { bubbles: true }));
        }
        return true;
      }
    }
    return false;
  }

  function renderAdministrationField(definition, item, sortOrder) {
    const { value, source } = resolveAdministrationFieldValue(definition, item);
    const isRequired = definition.required ? "required" : "";
    const reqStar = definition.required ? ' <span class="required">*</span>' : "";
    const isReadOnly = definition.readOnly ? "readonly" : "";
    const fullClass = definition.full ? "full-span" : "";
    const placeholder = definition.placeholder || "";
    
    let control = "";
    const teamRole = detectTeamRoleFromLabel(definition.label);

    if (
      definition.key === "responsibleOfficer" || 
      definition.key === "prosecutorName" || 
      definition.label === "Nama Penuntut Umum penandatangan" ||
      teamRole
    ) {
      const dropdownClass = teamRole ? "prosecutor-dropdown team-member-dropdown" : "prosecutor-dropdown";
      const teamRoleAttr = teamRole ? ` data-team-role="${escapeAttr(teamRole)}"` : "";
      control = `<select id="admin-field-${escapeAttr(definition.key)}" name="${escapeAttr(definition.key)}" data-admin-field data-field-key="${escapeAttr(definition.key)}" data-field-label="${escapeAttr(definition.label)}" data-field-source="${escapeAttr(source)}" data-sort-order="${sortOrder}" data-initial-value="${escapeAttr(value)}" class="${dropdownClass}"${teamRoleAttr} ${isRequired}>
        <option value="${escapeAttr(value)}">${value ? escapeHtml(value) : "Memuat daftar Jaksa…"}</option>
      </select>`;
    } 
    else if (definition.type === "textarea") {
      control = `<textarea id="admin-field-${escapeAttr(definition.key)}" name="${escapeAttr(definition.key)}" data-admin-field data-field-key="${escapeAttr(definition.key)}" data-field-label="${escapeAttr(definition.label)}" data-field-source="${escapeAttr(source)}" data-sort-order="${sortOrder}" placeholder="${escapeAttr(placeholder)}" ${isRequired} ${isReadOnly} rows="3">${escapeHtml(value)}</textarea>`;
    } else if (definition.type === "select") {
      const options = (definition.options || []).map((opt) => {
        const optVal = typeof opt === "string" ? opt : opt.value;
        const optLbl = typeof opt === "string" ? opt : opt.label;
        return `<option value="${escapeAttr(optVal)}" ${String(value) === String(optVal) ? "selected" : ""}>${escapeHtml(optLbl)}</option>`;
      }).join("");
      control = `<select id="admin-field-${escapeAttr(definition.key)}" name="${escapeAttr(definition.key)}" data-admin-field data-field-key="${escapeAttr(definition.key)}" data-field-label="${escapeAttr(definition.label)}" data-field-source="${escapeAttr(source)}" data-sort-order="${sortOrder}" ${isRequired} ${isReadOnly}>
        <option value="">Pilih...</option>
        ${options}
      </select>`;
    } else {
      control = `<input id="admin-field-${escapeAttr(definition.key)}" type="${escapeAttr(definition.type || "text")}" name="${escapeAttr(definition.key)}" data-admin-field data-field-key="${escapeAttr(definition.key)}" data-field-label="${escapeAttr(definition.label)}" data-field-source="${escapeAttr(source)}" data-sort-order="${sortOrder}" value="${escapeAttr(definition.type === 'date' ? toDateInputValue(value) : value)}" placeholder="${escapeAttr(placeholder)}" ${isRequired} ${isReadOnly} />`;
    }

    const autoBadge = source && source !== "manual" && String(value || "").trim() !== ""
      ? '<span class="field-source-badge auto" title="Terisi otomatis dari data perkara/administrasi sebelumnya">AUTO</span>'
      : definition.source ? '<span class="field-source-badge empty" title="Sumber otomatis belum memiliki data — lengkapi manual">KOSONG</span>' : "";
    return `
      <div class="form-field ${fullClass}">
        <label for="admin-field-${escapeAttr(definition.key)}">${escapeHtml(definition.label)}${reqStar} ${autoBadge}</label>
        ${control}
        ${definition.sourceLabel ? `<small class="form-hint">Sumber: ${escapeHtml(definition.sourceLabel)}</small>` : ""}
      </div>
    `;
  }

  function resolveAdministrationFieldValue(definition, item) {
    if (!definition.source) return { value: definition.defaultValue || "", source: "manual" };
    const sources = String(definition.source).split("|").map((source) => source.trim()).filter(Boolean);
    for (const source of sources) {
      const value = resolveAdministrationSource(source, item);
      if (value !== undefined && value !== null && String(value).trim() !== "") return { value, source };
    }
    return { value: definition.defaultValue || "", source: sources[0] || "manual" };
  }

  function resolveAdministrationSource(source, item) {
    if (source === "today") return todayISO();
    if (source === "user:fullName") return state.session?.user?.fullName || state.session?.user?.username || "";
    if (source.startsWith("case:")) return getNestedValue(item, source.slice(5));
    if (source.startsWith("computed:")) return resolveComputedAdministrationValue(source.slice(9), item);
    
    if (source.startsWith("admin:")) {
      const parts = source.split(":");
      const type = parts[1];
      const record = (Array.isArray(item.administrations) ? item.administrations : []).find((administration) => String(administration.type || "").toUpperCase() === type.toUpperCase());
      
      if (!record) return "";
      
      if (parts[2] === "field") {
        let formData = record.formData;
        if (typeof formData === "string") {
          try {
            formData = JSON.parse(formData);
          } catch (e) {
            formData = {};
            console.error("Gagal membaca format JSON dari formData:", e);
          }
        }
        return formData?.[parts.slice(3).join(":")] || "";
      }
      return record[parts.slice(2).join(":")] || "";
    }
    
    return "";
  }

  function resolveComputedAdministrationValue(key, item) {
    const values = {
      investigatorRankNrp: [item.investigatorRank, item.investigatorNipNrp].filter(Boolean).join(" / "),
      delayCategory: Number(item.spdpDelayDays || 0) > 7 ? "> 7 Hari" : "< 7 Hari",
      suspectIdentity: [item.suspectName, item.suspectIdentityNumber].filter(Boolean).join(" / "),
      investigatorRecipient: [item.investigatorPosition, item.investigatorName, item.investigatorInstitution].filter(Boolean).join(" — ")
    };
    return values[key] || "";
  }

  function getNestedValue(object, path) {
    return String(path || "").split(".").reduce((value, key) => value == null ? "" : value[key], object);
  }

  function toDateInputValue(value) {
    if (!value) return "";
    const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  async function getProsecutorList() {
    const fresh = Date.now() - state.prosecutorsLoadedAt < 5 * 60 * 1000;
    if (state.prosecutors.length && fresh) return state.prosecutors;
    const res = await gasRequest("listProsecutors", {}, { silent: true });
    const list = Array.isArray(res) ? res : (res && Array.isArray(res.prosecutors) ? res.prosecutors : []);
    state.prosecutors = list;
    state.prosecutorsLoadedAt = Date.now();
    return list;
  }

  function populateProsecutorSelect(select, jaksaList) {
    const isTeamField = select.classList.contains("team-member-dropdown");
    const initial = String(select.dataset.initialValue || select.value || "").trim();
    const normalizedInitial = initial.toLowerCase();
    select.innerHTML = `<option value="">— ${isTeamField ? "Pilih nama Jaksa" : "Pilih Jaksa"} —</option>`;
    let matched = false;
    jaksaList.forEach((jaksa) => {
      const option = document.createElement("option");
      if (typeof jaksa === "string") {
        option.value = jaksa;
        option.textContent = jaksa;
      } else if (jaksa && typeof jaksa === "object") {
        // Nilai = NAMA (bukan ID) agar data tersimpan & dokumen konsisten.
        option.value = jaksa.name || "";
        option.textContent = [jaksa.name || "Tanpa nama", jaksa.pangkat].filter(Boolean).join(" — ");
        option.dataset.id = jaksa.id || "";
        option.dataset.nip = jaksa.nip || "";
        option.dataset.pangkat = jaksa.pangkat || jaksa.kolomF || "";
        option.dataset.jabatan = jaksa.jabatan || "";
      }
      const isMatch = normalizedInitial && (
        option.value.toLowerCase() === normalizedInitial ||
        String(option.dataset.id || "").toLowerCase() === normalizedInitial
      );
      if (isMatch && !matched) { option.selected = true; matched = true; }
      select.appendChild(option);
    });
    // Nilai lama yang tidak ada di List Jaksa tetap dipertahankan (sebelumnya hilang → validasi gagal)
    if (initial && !matched) {
      const keep = document.createElement("option");
      keep.value = initial;
      keep.textContent = `${initial} (data tersimpan)`;
      keep.selected = true;
      select.insertBefore(keep, select.options[1] || null);
    }
  }

  function bindDynamicAdministrationForm(item, stage) {
    if (!item || !stage || !document.getElementById("administration-create-form")) return;

    const selects = [...document.querySelectorAll(".prosecutor-dropdown")];
    if (selects.length) {
      getProsecutorList().then((jaksaList) => {
        selects.forEach((select) => {
          if (!document.body.contains(select)) return;
          if (!jaksaList.length) {
            const value = select.dataset.initialValue || "";
            select.innerHTML = `<option value="${escapeAttr(value)}">${escapeHtml(value || "Daftar Jaksa kosong — isi sheet List Jaksa")}</option>`;
            return;
          }
          populateProsecutorSelect(select, jaksaList);
          if (select.classList.contains("team-member-dropdown")) {
            select.addEventListener("change", () => autofillTeamMemberFields(select));
            if (select.value) autofillTeamMemberFields(select, { onlyEmpty: true });
          }
        });
      }).catch((error) => {
        console.error("Gagal memuat jaksa:", error);
        selects.forEach((select) => {
          const value = select.dataset.initialValue || "";
          select.innerHTML = `<option value="${escapeAttr(value)}">${escapeHtml(value || "Gagal memuat daftar Jaksa")}</option>`;
        });
        toast("warning", "Daftar Jaksa gagal dimuat", "Periksa sheet List Jaksa, lalu muat ulang form.");
      });
    }

    document.getElementById("choose-administration-file")?.addEventListener("click", () => document.getElementById("administration-file")?.click());
    document.getElementById("administration-file")?.addEventListener("change", (event) => setAdministrationFile(event.target.files?.[0] || null));
    document.getElementById("builder-reset-form")?.addEventListener("click", () => {
      state.selectedAdministrationFile = null;
      renderAdministrationBuilderPage();
      toast("info", "Data dimuat ulang", "Isian otomatis dikembalikan ke data perkara terbaru.");
    });
    const form = document.getElementById("administration-create-form");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      createAdministrationFromBuilder(item.caseId, stage.code);
    });
    // Tandai field yang diubah manual
    form?.addEventListener("input", (event) => {
      event.target.closest?.(".form-field")?.classList.add("touched");
    });
  }

  /*
   * Isi field kosong dari administrasi sebelumnya.
   * Versi lama menggabungkan SEMUA form lama ke semua input bernama sama, sehingga
   * mis. "investigatorInstitution" pada T-4 (berisi nomor surat) tertukar dengan nama instansi.
   * Kini: (1) dari administrasi jenis yang sama (buat ulang) untuk semua field kosong;
   *       (2) dari jenis lain hanya untuk field tim/penandatangan yang aman dibagikan.
   */
  const SHARED_HISTORY_KEYS = new Set([
    "teamLeaderName", "teamLeaderRank", "teamLeaderNip", "teamLeaderPosition",
    "member1Name", "member1RankNip", "member1Position", "member2Name", "member2RankNip", "member2Position",
    "prosecutor1Name", "prosecutor1Rank", "prosecutor1Nip", "prosecutor2Name", "prosecutor2RankNip",
    "prosecutorRank", "prosecutorNip", "signatoryName", "signatoryRank", "signatoryTitle",
    "evidenceHandoverPlace", "suspectHandoverPlace", "destination", "copies"
  ]);

  function autoFillHistoricalData(currentCase, type) {
    const form = document.getElementById("administration-create-form");
    if (!form || !currentCase || !Array.isArray(currentCase.administrations)) return;
    const sorted = [...currentCase.administrations].sort((a, b) => dateValue(a.createdAt) - dateValue(b.createdAt));
    const sameType = {};
    const shared = {};
    sorted.forEach((admin) => {
      let data = admin.formData;
      if (typeof data === "string") { try { data = JSON.parse(data); } catch { data = {}; } }
      if (!data || typeof data !== "object") return;
      const isSame = String(admin.type || "").toUpperCase() === String(type || "").toUpperCase();
      Object.keys(data).forEach((key) => {
        const value = data[key];
        if (value === undefined || value === null || String(value).trim() === "") return;
        if (isSame) sameType[key] = value;
        else if (SHARED_HISTORY_KEYS.has(key)) shared[key] = value;
      });
    });
    const merged = { ...shared, ...sameType };
    let filled = 0;
    form.querySelectorAll("[data-admin-field]").forEach((element) => {
      const key = element.dataset.fieldKey;
      if (!(key in merged)) return;
      if (element.matches("select.prosecutor-dropdown")) {
        if (!element.dataset.initialValue) element.dataset.initialValue = merged[key];
        return;
      }
      if (String(element.value || "").trim() !== "") return;
      element.value = element.type === "date" ? toDateInputValue(merged[key]) : merged[key];
      element.closest(".form-field")?.classList.add("history-filled");
      filled += 1;
    });
    if (filled) toast("info", "Isian riwayat dipakai", `${filled} kolom diisi dari administrasi sebelumnya. Periksa kembali sebelum menyimpan.`);
  }

  function setAdministrationFile(file) {
    const label = document.getElementById("administration-file-name");
    if (!file) {
      state.selectedAdministrationFile = null;
      if (label) label.textContent = "Belum ada lampiran dipilih.";
      return;
    }
    const extension = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "docx"].includes(extension)) {
      state.selectedAdministrationFile = null;
      const input = document.getElementById("administration-file");
      if (input) input.value = "";
      if (label) label.textContent = "Belum ada lampiran dipilih.";
      toast("warning", "Format tidak didukung", "Lampiran administrasi harus PDF atau DOCX.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      state.selectedAdministrationFile = null;
      const input = document.getElementById("administration-file");
      if (input) input.value = "";
      toast("warning", "Lampiran terlalu besar", "Ukuran lampiran maksimal 10 MB.");
      return;
    }
    state.selectedAdministrationFile = file;
    if (label) label.textContent = `${file.name} · ${formatBytes(file.size)}`;
  }

  async function createAdministrationFromBuilder(caseId, type) {
    const form = document.getElementById("administration-create-form");
    const button = document.getElementById("save-administration");
    if (!form || button?.disabled) return;
    if (!form.checkValidity()) {
      form.reportValidity();
      const firstInvalid = form.querySelector(":invalid");
      firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast("warning", "Form belum lengkap", "Lengkapi seluruh kolom bertanda wajib sebelum menyimpan.");
      return;
    }

    const schema = ADMIN_FORM_SCHEMAS[type] || {};
    const fields = [...form.querySelectorAll("[data-admin-field]")].map((element) => ({
      key: element.dataset.fieldKey,
      label: element.dataset.fieldLabel,
      value: String(element.value || "").trim(),
      source: element.closest(".form-field")?.classList.contains("touched") ? "manual" : (element.dataset.fieldSource || "manual"),
      sortOrder: Number(element.dataset.sortOrder || 0)
    }));
    const formData = Object.fromEntries(fields.map((fieldItem) => [fieldItem.key, fieldItem.value]));

    // Nomor & tanggal dokumen sesuai skema (SOP FORM memakai sop1Date, P-17 memakai p17Date, dst.)
    const numberKey = schema.documentNumberKey || "documentNumber";
    const dateKey = schema.documentDateKey || "documentDate";
    const firstDateField = fields.find((fieldItem) => /date$/i.test(fieldItem.key) && /^\d{4}-\d{2}-\d{2}$/.test(fieldItem.value));
    const signatory = formData.responsibleOfficer || formData.prosecutorName || formData.signatoryName || formData.teamLeaderName;

    const payload = {
      caseId,
      type,
      documentNumber: formData[numberKey] || formData.documentNumber || "",
      documentDate: formData[dateKey] || formData.documentDate || firstDateField?.value || todayISO(),
      responsibleOfficer: signatory || state.session.user.fullName || state.session.user.username,
      notes: String(form.elements.systemNotes?.value || "").trim(),
      formFields: fields
    };

    setButtonLoading(button, true);
    const progress = showBuilderProgress("Menyimpan data & membuat dokumen…");
    try {
      if (state.selectedAdministrationFile) {
        const fileData = await readFileBase64(state.selectedAdministrationFile);
        payload.administrationFile = {
          name: state.selectedAdministrationFile.name,
          mimeType: state.selectedAdministrationFile.type || mimeFromName(state.selectedAdministrationFile.name),
          dataBase64: fileData
        };
      }

      const result = await gasRequest("createAdministration", payload, { timeout: 180000 });
      if (result.case) replaceCase(result.case);
      renderSidebar();

      const statusNote = result.case
        ? (result.statusApplied === false
          ? `Status perkara tetap ${getStatus(result.case.status).label} (tidak dimundurkan).`
          : `Status perkara menjadi ${getStatus(result.case.status).label}.`)
        : "Administrasi manual tersimpan.";
      toast("success", `${type} berhasil dibuat`, statusNote);
      progress.done();
      renderBuilderSuccess({ type, result, statusNote });
    } catch (error) {
      progress.fail();
      toast("error", "Administrasi gagal dibuat", error.message || "Data administrasi belum berhasil disimpan.");
    } finally {
      setButtonLoading(button, false);
    }
  }

  function showBuilderProgress(label) {
    const host = document.querySelector(".builder-form-actions");
    if (!host) return { done() {}, fail() {} };
    host.querySelector(".builder-progress")?.remove();
    host.insertAdjacentHTML("afterbegin", `<div class="builder-progress"><span></span><small>${escapeHtml(label)}</small></div>`);
    const node = host.querySelector(".builder-progress");
    return {
      done() { node?.classList.add("done"); setTimeout(() => node?.remove(), 600); },
      fail() { node?.remove(); }
    };
  }

  function renderBuilderSuccess({ type, result, statusNote }) {
    const panel = document.querySelector(".builder-form-panel");
    if (!panel) return;
    const folderUrl = result.folderUrl || result.case?.caseFolderUrl || "";
    panel.insertAdjacentHTML("beforebegin", `
      <section class="builder-success" role="status">
        <div class="builder-success-icon">✓</div>
        <div class="builder-success-copy">
          <strong>${escapeHtml(type)} tersimpan</strong>
          <p>${escapeHtml(statusNote)}${result.administration?.documentNumber ? ` Nomor: ${escapeHtml(result.administration.documentNumber)}.` : ""}</p>
        </div>
        <div class="builder-success-actions">
          ${result.fileUrl ? `<a class="case-primary-button" href="${escapeAttr(result.fileUrl)}" target="_blank" rel="noopener noreferrer">Buka dokumen</a>` : ""}
          ${folderUrl ? `<a class="case-ghost-button" href="${escapeAttr(folderUrl)}" target="_blank" rel="noopener noreferrer">Folder Drive</a>` : ""}
          ${result.case ? `<button type="button" class="case-ghost-button" id="builder-open-case">Lihat perkara</button>` : ""}
          <button type="button" class="case-ghost-button" id="builder-new-form">Buat administrasi lain</button>
        </div>
      </section>`);
    panel.classList.add("is-saved");
    document.querySelector(".builder-success")?.scrollIntoView({ behavior: "smooth", block: "center" });
    document.getElementById("builder-new-form")?.addEventListener("click", () => {
      state.administrationBuilder.type = "";
      renderAdministrationBuilderPage();
    });
    document.getElementById("builder-open-case")?.addEventListener("click", () => openCaseModal(result.case.caseId, { tab: "alur" }));
  }

  async function renderTikReminderPage() {
    if (!state.tikLoaded) {
      els.pageContent.innerHTML = `
        <div class="panel loading-panel">
          <div class="skeleton loading-line w40"></div>
          <div class="skeleton loading-line w90"></div>
          <div class="skeleton loading-line w65"></div>
          <div class="skeleton" style="height:180px"></div>
        </div>`;
      try {
        await loadTikReminderData();
        return renderTikReminderPage();
      } catch (error) {
        els.pageContent.innerHTML = `
          <div class="panel">
            <div class="empty-state">
              <div class="empty-state-icon">!</div>
              <h3>Modul Kartu TIK belum siap</h3>
              <p>${escapeHtml(error?.message || "Data Kartu TIK tidak dapat dimuat.")}</p>
              <button id="retry-tik-load" class="primary-button" style="margin-top:18px" type="button">Coba lagi</button>
            </div>
          </div>`;
        document.getElementById("retry-tik-load")?.addEventListener("click", () => {
          state.tikLoaded = false;
          renderTikReminderPage();
        });
        return;
      }
    }

    const sentCount = state.tikReminders.filter((item) => String(item.status || "").toUpperCase() === "SENT").length;
    const partialCount = state.tikReminders.filter((item) => String(item.status || "").toUpperCase() === "PARTIAL").length;

    els.pageContent.innerHTML = `
      <section class="reminder-shell">
        <div class="reminder-hero">
          <div>
            <p class="eyebrow green">KARTU TIK</p>
            <h2>Reminder Kartu TIK ke Agen Intelijen</h2>
            <p>Masukkan nama tersangka dan unggah seluruh file identitas. Setelah dikirim, sistem meneruskan informasi nama tersangka beserta tautan download file ke seluruh anggota Intelijen aktif pada sheet <strong>List Intelijen</strong>.</p>
          </div>
          <div class="reminder-system-status">
            <span class="${state.tikMeta.fonnteConfigured && state.tikMeta.validPhoneCount > 0 ? "online" : "offline"}"></span>
            <div>
              <strong>${state.tikMeta.fonnteConfigured ? "Fonnte siap" : "Token Fonnte belum diatur"}</strong>
              <small>${state.tikMeta.validPhoneCount} nomor WhatsApp valid dari ${state.tikMeta.intelijenCount} anggota Intelijen aktif</small>
            </div>
          </div>
        </div>

        <div class="stats-grid reminder-stats-grid">
          ${statCard("♙", state.tikMeta.intelijenCount, "Intelijen aktif", "blue")}
          ${statCard("☎", state.tikMeta.validPhoneCount, "Nomor WA valid", "")}
          ${statCard("✓", sentCount, "Reminder terkirim", "")}
          ${statCard("!", partialCount, "Terkirim sebagian", "warning")}
        </div>

        <section class="panel reminder-form-panel">
          <div class="panel-header">
            <div>
              <h3>Kirim Reminder Kartu TIK</h3>
              <p>Jumlah file yang dapat dipilih tidak dibatasi oleh antarmuka. Setiap file diunggah satu per satu agar lebih stabil.</p>
            </div>
          </div>
          <div class="panel-body">
            <form id="tik-reminder-form" novalidate>
              <div class="form-grid">
                <div class="form-field full-span">
                  <label for="tik-suspect-name">Nama Tersangka <span class="required">*</span></label>
                  <input id="tik-suspect-name" name="suspectName" type="text" maxlength="250" required placeholder="Masukkan nama lengkap tersangka" />
                </div>

                <div class="form-field full-span">
                  <label>File Identitas Tersangka <span class="required">*</span></label>
                  <div id="tik-upload-zone" class="upload-zone">
                    <input id="tik-identity-files" name="identityFiles" type="file" multiple />
                    <div class="upload-icon">⇧</div>
                    <h4>Pilih atau tarik file identitas ke sini</h4>
                    <p>Anda dapat memilih banyak file sekaligus dan dapat menambahkan file lagi setelah pemilihan pertama. Format file tidak dibatasi oleh frontend; batas teknis tetap mengikuti Google Apps Script dan Google Drive.</p>
                    <button id="tik-choose-files" class="secondary-button" type="button" style="margin-top:14px">Pilih file</button>
                    <div id="tik-selected-files"></div>
                    <div class="progress-bar"><span id="tik-upload-progress"></span></div>
                    <p id="tik-upload-status" style="margin-top:8px"></p>
                  </div>
                </div>
              </div>

              <div class="form-submit-row">
                <button id="tik-reset-form" class="ghost-button" type="button">Kosongkan form</button>
                <button id="tik-send-reminder" class="primary-button" type="submit">
                  <span class="button-label">Kirim Reminder Kartu TIK</span>
                  <span class="button-spinner" hidden></span>
                </button>
              </div>
            </form>
          </div>
        </section>

        <section class="panel reminder-list-panel">
          <div class="panel-header">
            <div>
              <h3>Riwayat Kartu TIK</h3>
              <p>Daftar reminder Kartu TIK terakhir beserta hasil pengiriman WhatsApp.</p>
            </div>
            <button id="tik-refresh" class="table-action" type="button">Segarkan</button>
          </div>
          ${renderTikReminderHistory()}
        </section>
      </section>`;

    bindTikReminderPage();
    renderTikSelectedFiles();
  }

  async function loadTikReminderData() {
    const result = await gasRequest("listTikReminders");
    state.tikReminders = Array.isArray(result.reminders) ? result.reminders : [];
    state.tikMeta = {
      intelijenCount: Number(result.intelijenCount || 0),
      validPhoneCount: Number(result.validPhoneCount || 0),
      fonnteConfigured: Boolean(result.fonnteConfigured)
    };
    state.tikLoaded = true;
    setConnection(true);
  }

  function bindTikReminderPage() {
    const form = document.getElementById("tik-reminder-form");
    const fileInput = document.getElementById("tik-identity-files");
    const uploadZone = document.getElementById("tik-upload-zone");
    const chooseButton = document.getElementById("tik-choose-files");

    chooseButton?.addEventListener("click", () => fileInput?.click());
    fileInput?.addEventListener("change", () => {
      appendTikFiles(fileInput.files);
      fileInput.value = "";
    });

    ["dragenter", "dragover"].forEach((name) => uploadZone?.addEventListener(name, (event) => {
      event.preventDefault();
      uploadZone.classList.add("dragover");
    }));
    ["dragleave", "drop"].forEach((name) => uploadZone?.addEventListener(name, (event) => {
      event.preventDefault();
      uploadZone.classList.remove("dragover");
    }));
    uploadZone?.addEventListener("drop", (event) => {
      appendTikFiles(event.dataTransfer?.files);
    });

    form?.addEventListener("submit", submitTikReminder);
    document.getElementById("tik-reset-form")?.addEventListener("click", resetTikReminderForm);
    document.getElementById("tik-refresh")?.addEventListener("click", async () => {
      const button = document.getElementById("tik-refresh");
      if (button) button.disabled = true;
      try {
        state.tikLoaded = false;
        await loadTikReminderData();
        renderTikReminderPage();
      } catch (error) {
        toast("error", "Gagal menyegarkan", error.message || "Data Kartu TIK belum dapat dimuat.");
      } finally {
        if (button) button.disabled = false;
      }
    });
  }

  function appendTikFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    state.tikSelectedFiles.push(...files);
    renderTikSelectedFiles();
  }

  function renderTikSelectedFiles() {
    const root = document.getElementById("tik-selected-files");
    if (!root) return;
    if (!state.tikSelectedFiles.length) {
      root.innerHTML = `<div style="margin-top:12px;color:var(--gray-500);font-size:12px">Belum ada file dipilih.</div>`;
      return;
    }

    const totalBytes = state.tikSelectedFiles.reduce((sum, file) => sum + Number(file.size || 0), 0);
    root.innerHTML = `
      <div style="margin-top:12px;text-align:left">
        <small style="display:block;margin-bottom:8px;color:var(--gray-600)">${state.tikSelectedFiles.length} file dipilih · total ${formatBytes(totalBytes)}</small>
        ${state.tikSelectedFiles.map((file, index) => `
          <div class="upload-file-card">
            <div class="upload-file-meta">
              <strong>${escapeHtml(file.name)}</strong>
              <small>${formatBytes(file.size)} · ${escapeHtml(file.type || "Tipe file tidak terdeteksi")}</small>
            </div>
            <button class="table-action" data-remove-tik-file="${index}" type="button">Hapus</button>
          </div>`).join("")}
      </div>`;

    root.querySelectorAll("[data-remove-tik-file]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.removeTikFile);
        if (!Number.isInteger(index) || index < 0 || index >= state.tikSelectedFiles.length) return;
        state.tikSelectedFiles.splice(index, 1);
        renderTikSelectedFiles();
      });
    });
  }

  function resetTikReminderForm() {
    state.tikSelectedFiles = [];
    const form = document.getElementById("tik-reminder-form");
    form?.reset();
    const progress = document.getElementById("tik-upload-progress");
    const status = document.getElementById("tik-upload-status");
    if (progress) progress.style.width = "0";
    if (status) status.textContent = "";
    renderTikSelectedFiles();
  }

  async function submitTikReminder(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form?.reportValidity()) return;

    const suspectName = String(new FormData(form).get("suspectName") || "").trim();
    if (!suspectName) {
      toast("warning", "Nama tersangka belum diisi", "Masukkan nama tersangka terlebih dahulu.");
      return;
    }
    if (!state.tikSelectedFiles.length) {
      toast("warning", "File identitas belum dipilih", "Pilih minimal satu file identitas tersangka.");
      return;
    }
    if (!state.tikMeta.fonnteConfigured) {
      toast("warning", "Fonnte belum siap", "Token FONNTE_TOKEN belum dikonfigurasi pada Script Properties.");
      return;
    }
    if (state.tikMeta.validPhoneCount < 1) {
      toast("warning", "Tujuan WhatsApp belum tersedia", "Isi minimal satu Nama Intelijen dan Nomor WhatsApp aktif pada sheet List Intelijen.");
      return;
    }

    const button = document.getElementById("tik-send-reminder");
    const progressBar = document.getElementById("tik-upload-progress");
    const statusText = document.getElementById("tik-upload-status");
    const selectedFiles = [...state.tikSelectedFiles];
    let reminderId = "";

    setButtonLoading(button, true);
    if (progressBar) progressBar.style.width = "2%";
    if (statusText) statusText.textContent = "Membuat folder Kartu TIK...";

    try {
      const draft = await gasRequest("createTikReminderDraft", { suspectName }, { timeout: 120000 });
      reminderId = String(draft.reminderId || "");
      if (!reminderId) throw new Error("Backend tidak mengembalikan ID Reminder Kartu TIK.");

      for (let index = 0; index < selectedFiles.length; index += 1) {
        const file = selectedFiles[index];
        const baseProgress = (index / selectedFiles.length) * 82;
        if (statusText) statusText.textContent = `Mengunggah ${index + 1}/${selectedFiles.length}: ${file.name}`;
        const dataBase64 = await readFileBase64(file, (readProgress) => {
          if (!progressBar) return;
          const fileShare = 82 / selectedFiles.length;
          const fraction = Math.min(100, Number(readProgress || 0)) / 100;
          progressBar.style.width = `${Math.min(84, 2 + baseProgress + (fileShare * fraction))}%`;
        });

        await gasRequest("uploadTikIdentityFile", {
          reminderId,
          file: {
            name: file.name,
            mimeType: file.type || "application/octet-stream",
            dataBase64
          }
        }, { timeout: 240000 });

        if (progressBar) progressBar.style.width = `${Math.min(86, 4 + ((index + 1) / selectedFiles.length) * 82)}%`;
      }

      if (statusText) statusText.textContent = `Mengirim reminder ke ${state.tikMeta.validPhoneCount} nomor WhatsApp Intelijen...`;
      if (progressBar) progressBar.style.width = "90%";
      const result = await gasRequest("sendTikReminder", { reminderId }, { timeout: 360000 });
      if (progressBar) progressBar.style.width = "100%";

      const successCount = Number(result.successCount || 0);
      const failedCount = Number(result.failedCount || 0);
      const status = String(result.status || "").toUpperCase();
      if (status === "SENT") {
        toast("success", "Reminder Kartu TIK terkirim", `${successCount} agen Intelijen berhasil menerima reminder untuk ${suspectName}.`);
      } else if (status === "PARTIAL") {
        toast("warning", "Reminder terkirim sebagian", `${successCount} berhasil dan ${failedCount} gagal. Periksa log pengiriman pada backend.`);
      } else {
        toast("error", "Pengiriman gagal", `${failedCount || state.tikMeta.validPhoneCount} tujuan gagal menerima reminder.`);
      }

      state.tikSelectedFiles = [];
      state.tikLoaded = false;
      await loadTikReminderData();
      renderTikReminderPage();
    } catch (error) {
      if (progressBar) progressBar.style.width = "0";
      if (statusText) statusText.textContent = "";

      if (reminderId) {
        try {
          await gasRequest("deleteTikReminderDraft", { reminderId }, { silent: true, timeout: 120000 });
        } catch {
        }
      }
      toast("error", "Reminder Kartu TIK gagal", error.message || "Proses upload atau pengiriman belum berhasil.");
    } finally {
      setButtonLoading(button, false);
    }
  }

  function renderTikReminderHistory() {
    if (!state.tikReminders.length) {
      return `<div class="panel-body">${emptyState("▥", "Belum ada riwayat Kartu TIK", "Kirim reminder pertama untuk mulai membuat riwayat.")}</div>`;
    }

    return `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nama Tersangka</th>
              <th>File</th>
              <th>Penerima</th>
              <th>Berhasil</th>
              <th>Gagal</th>
              <th>Status</th>
              <th>Dibuat</th>
              <th>Dikirim</th>
              <th>Folder</th>
            </tr>
          </thead>
          <tbody>
            ${state.tikReminders.map((item) => `
              <tr>
                <td><strong>${escapeHtml(item.suspectName || "-")}</strong><br><small>${escapeHtml(item.reminderId || "")}</small></td>
                <td>${Number(item.fileCount || 0)}</td>
                <td>${Number(item.recipientCount || 0)}</td>
                <td>${Number(item.successCount || 0)}</td>
                <td>${Number(item.failedCount || 0)}</td>
                <td>${renderTikStatusBadge(item.status)}</td>
                <td>${formatDateTime(item.createdAt)}</td>
                <td>${item.sentAt ? formatDateTime(item.sentAt) : "-"}</td>
                <td>${item.folderUrl ? `<a class="document-link" href="${escapeAttr(item.folderUrl)}" target="_blank" rel="noopener noreferrer">Buka Drive →</a>` : "-"}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
  }

  function renderTikStatusBadge(status) {
    const normalized = String(status || "DRAFT").toUpperCase();
    const map = {
      DRAFT: { label: "Draft", tone: "gray" },
      SENT: { label: "Terkirim", tone: "green" },
      PARTIAL: { label: "Sebagian", tone: "amber" },
      FAILED: { label: "Gagal", tone: "red" }
    };
    const value = map[normalized] || { label: normalized || "-", tone: "gray" };
    return `<span class="status-badge ${value.tone}">${escapeHtml(value.label)}</span>`;
  }

  async function renderRemindersPage() {
    if (!state.remindersLoaded) {
      els.pageContent.innerHTML = `
        <div class="panel loading-panel">
          <div class="skeleton loading-line w40"></div>
          <div class="skeleton loading-line w90"></div>
          <div class="skeleton" style="height:210px"></div>
        </div>`;
      try {
        await loadReminderData();
        renderSidebar();
        return renderRemindersPage();
      } catch (error) {
        return renderReminderLoadError(error);
      }
    }

    const editingReminder = state.reminderBuilder.reminderId
      ? state.reminders.find((item) => String(item.reminderId) === String(state.reminderBuilder.reminderId))
      : null;
    const selectedCaseId = editingReminder?.caseId || state.reminderBuilder.caseId;
    const selectedType = state.reminderBuilder.type || editingReminder?.administrationType || "P-16";
    const selectedCase = findReminderCaseSource(selectedCaseId);
    const existing = editingReminder || (selectedCase ? findReminderForSelection(selectedCase.caseId, selectedType) : null);
    state.reminderBuilder = {
      caseId: selectedCaseId || "",
      type: selectedType,
      reminderId: existing?.reminderId || ""
    };

    const active = state.reminders.filter((item) => String(item.status || "ACTIVE") === "ACTIVE");
    const dueSoon = active.filter((item) => getReminderDeadlineState(item).state === "warning").length;
    const overdue = active.filter((item) => getReminderDeadlineState(item).state === "overdue").length;
    const completedKeys = new Set();
    state.reminders.filter((item) => String(item.status) === "COMPLETED").forEach((item) => completedKeys.add(`${item.caseId}|${item.administrationType}`));
    state.reminderProgress.filter((item) => Boolean(item.completed)).forEach((item) => completedKeys.add(`${item.caseId}|${item.administrationType}`));
    const completed = completedKeys.size;

    els.pageContent.innerHTML = `
      <section class="reminder-shell">
        <div class="reminder-hero">
          <div>
            <p class="eyebrow green">NOTIFIKASI WHATSAPP</p>
            <h2>Reminder administrasi perkara</h2>
            <p>Pilih SPDP yang sudah masuk atau pilih SPDP baru untuk mengisi data secara manual. Sistem mengirim WhatsApp otomatis pada H-3, H-1, dan Hari H.</p>
          </div>
          <div class="reminder-system-status">
            <span class="${state.reminderMeta.fonnteConfigured ? "online" : "offline"}"></span>
            <div>
              <strong>${state.reminderMeta.fonnteConfigured ? "Fonnte siap" : "Token Fonnte belum diatur"}</strong>
              <small>${state.reminderMeta.triggerInstalled ? `Trigger harian aktif sekitar pukul ${String(state.reminderMeta.triggerHour || 8).padStart(2, "0")}.00 WITA` : "Trigger otomatis belum terpasang"}</small>
            </div>
          </div>
        </div>

        <div class="stats-grid reminder-stats-grid">
          ${statCard("♢", active.length, "Reminder aktif", "blue")}
          ${statCard("◷", dueSoon, "Jatuh tempo ≤ 3 hari", "warning")}
          ${statCard("!", overdue, "Lewat deadline", "danger")}
          ${statCard("✓", completed, "Administrasi selesai", "")}
        </div>

        <div class="reminder-layout">
          <section class="panel reminder-form-panel">
            <div class="panel-header">
              <div>
                <h3>${existing ? `Edit reminder ${escapeHtml(selectedType)}` : "Tambah reminder baru"}</h3>
                <p>Memilih perkara dan jenis administrasi yang sudah pernah disimpan akan membuka data untuk diedit.</p>
              </div>
              ${existing ? `<span class="status-badge blue">Mode edit</span>` : ""}
            </div>
            <div class="panel-body">
              ${renderReminderForm(selectedCase, selectedType, existing)}
            </div>
          </section>

          <section class="panel reminder-progress-panel">
            <div class="panel-header">
              <div><h3>Progres administrasi</h3><p>Pantauan administrasi P-16, P-17, SOP Form, Tahap 2, dan tahapan terkait untuk perkara yang dipilih.</p></div>
            </div>
            <div class="panel-body">
              ${renderReminderProgress(selectedCase)}
            </div>
          </section>
        </div>

        <section class="panel reminder-list-panel">
          <div class="panel-header">
            <div>
              <h3>Daftar reminder</h3>
              <p>Riwayat pengaturan reminder dan status pengiriman WhatsApp.</p>
            </div>
            <div class="panel-actions reminder-list-actions">
              <select id="reminder-list-filter" class="compact-select">
                <option value="ALL" ${state.reminderFilter === "ALL" ? "selected" : ""}>Semua status</option>
                <option value="ACTIVE" ${state.reminderFilter === "ACTIVE" ? "selected" : ""}>Aktif</option>
                <option value="DUE" ${state.reminderFilter === "DUE" ? "selected" : ""}>Mendekati/lewat deadline</option>
                <option value="COMPLETED" ${state.reminderFilter === "COMPLETED" ? "selected" : ""}>Selesai</option>
              </select>
              <button id="reminder-refresh" class="table-action" type="button">Segarkan</button>
            </div>
          </div>
          ${renderReminderTable()}
        </section>
      </section>`;

    bindReminderPage(selectedCase, selectedType, existing);
  }

  async function loadReminderData() {
    const [reminderResult, prosecutorResult] = await Promise.all([
      gasRequest("listReminders"),
      gasRequest("listProsecutors")
    ]);
    const supportedReminderTypes = new Set(REMINDER_ADMIN_TYPES.map((item) => item.code));
    state.reminders = (Array.isArray(reminderResult.reminders) ? reminderResult.reminders : [])
      .filter((item) => supportedReminderTypes.has(String(item.administrationType || "").toUpperCase()));
    state.reminderProgress = (Array.isArray(reminderResult.progress) ? reminderResult.progress : [])
      .filter((item) => supportedReminderTypes.has(String(item.administrationType || "").toUpperCase()));
    state.prosecutors = Array.isArray(prosecutorResult.prosecutors) ? prosecutorResult.prosecutors : [];
    state.reminderMeta = {
      fonnteConfigured: Boolean(reminderResult.fonnteConfigured),
      triggerInstalled: Boolean(reminderResult.triggerInstalled),
      triggerHour: Number(reminderResult.triggerHour || 8),
      timezone: reminderResult.timezone || "Asia/Makassar"
    };
    state.remindersLoaded = true;
    setConnection(true);
  }

  function renderReminderLoadError(error) {
    els.pageContent.innerHTML = `
      <div class="panel">
        <div class="empty-state">
          <div class="empty-state-icon">!</div>
          <h3>Modul reminder belum siap</h3>
          <p>${escapeHtml(error?.message || "Data reminder tidak dapat dimuat.")}</p>
          <button id="retry-reminder-load" class="primary-button" style="margin-top:18px" type="button">Coba lagi</button>
        </div>
      </div>`;
    document.getElementById("retry-reminder-load")?.addEventListener("click", () => {
      state.remindersLoaded = false;
      renderRemindersPage();
    });
  }

  function renderReminderForm(selectedCase, selectedType, existing) {
    const sources = getReminderCaseSources();
    const caseOptions = sources.map((item) => `
      <option value="${escapeAttr(item.caseId)}" ${selectedCase?.caseId === item.caseId ? "selected" : ""}>
        ${escapeHtml(item.spdpNumber || item.caseId)} — ${escapeHtml(item.suspectName || "Tanpa nama")}${item.reminderOnly ? " (reminder)" : ` (${escapeHtml(item.caseId)})`}
      </option>`).join("");
    const typeOptions = REMINDER_ADMIN_TYPES.map((item) => `
      <option value="${escapeAttr(item.code)}" ${selectedType === item.code ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("");

    if (!selectedCase) {
      return `
        <div class="form-field">
          <label for="reminder-case-select">Pilih SPDP/perkara <span class="required">*</span></label>
          <select id="reminder-case-select" required>
            <option value="">Pilih SPDP/perkara...</option>
            <option value="__NEW_SPDP__">＋ SPDP baru — isi data secara manual</option>
            ${caseOptions}
          </select>
          <small class="form-hint">Pilih SPDP baru untuk membuat reminder sebelum data perkara tersedia pada sheet Cases.</small>
        </div>
        <div class="reminder-form-placeholder">
          <span>♢</span><strong>Pilih perkara atau SPDP baru</strong><p>Data perkara lama terisi otomatis. Untuk SPDP baru, field dasar dapat diisi manual.</p>
        </div>`;
    }

    const rule = REMINDER_ADMIN_TYPES.find((item) => item.code === selectedType) || REMINDER_ADMIN_TYPES[0];
    const isNewSpdp = selectedCase.caseId === "__NEW_SPDP__";
    const source = existing || (isNewSpdp ? {} : selectedCase);
    const typeChanged = Boolean(existing && String(existing.administrationType || "") !== String(selectedType || ""));
    const deadlineDays = existing && !typeChanged
      ? String(existing.deadlineDays ?? "")
      : rule.defaultDays === null ? "" : String(rule.defaultDays);
    const preview = calculateReminderDeadlinePreview(
      normalizeDateInput(source.receivedDate || selectedCase.receivedDate),
      deadlineDays
    );

    const prosecutorOptions = state.prosecutors.map((item) => {
      const selected = String(existing?.prosecutorId || "") === String(item.id);
      return `<option value="${escapeAttr(item.id)}" ${selected ? "selected" : ""} ${item.phoneValid ? "" : "disabled"}>${escapeHtml(item.name)}</option>`;
    }).join("");

    return `
      <form id="reminder-form" novalidate>
        <input type="hidden" name="reminderId" value="${escapeAttr(existing?.reminderId || "")}" />
        <input type="hidden" name="caseId" value="${escapeAttr(isNewSpdp ? "" : selectedCase.caseId)}" />
        <input type="hidden" name="isNewSpdp" value="${isNewSpdp ? "1" : "0"}" />
        <input type="hidden" name="originalAdministrationType" value="${escapeAttr(existing?.administrationType || "")}" />

        <div class="reminder-selector-grid">
          <div class="form-field">
            <label for="reminder-case-select">Pilih SPDP/perkara <span class="required">*</span></label>
            <select id="reminder-case-select" required ${existing ? "disabled" : ""}>
              <option value="">Pilih SPDP/perkara...</option>
              <option value="__NEW_SPDP__" ${isNewSpdp ? "selected" : ""}>＋ SPDP baru — isi data secara manual</option>
              ${caseOptions}
            </select>
            ${existing ? '<small class="form-hint">Perkara dikunci selama mode edit agar reminder yang sama diperbarui.</small>' : ""}
          </div>
          <div class="form-field">
            <label for="reminder-administration-type">Jenis Administrasi <span class="required">*</span></label>
            <select id="reminder-administration-type" name="administrationType" required>${typeOptions}</select>
            <small class="form-hint">${existing ? "Jenis administrasi dapat diubah. Sistem tetap memperbarui reminder yang sedang diedit." : "Pilih administrasi yang sama untuk membuka dan mengedit reminder lama."}</small>
          </div>
        </div>

        <div class="reminder-form-grid">
          ${reminderInput("Nomor SPDP", "spdpNumber", "text", source.spdpNumber || selectedCase.spdpNumber, true)}
          ${reminderInput("Tanggal SPDP", "spdpDate", "date", normalizeDateInput(source.spdpDate || selectedCase.spdpDate), true)}
          ${reminderInput("Nomor Sprindik", "sprindikNumber", "text", source.sprindikNumber || selectedCase.sprindikNumber, true)}
          ${reminderInput("Tanggal Sprindik", "sprindikDate", "date", normalizeDateInput(source.sprindikDate || selectedCase.sprindikDate), true)}
          ${reminderInput("Tanggal SPDP diterima Kejaksaan", "receivedDate", "date", normalizeDateInput(source.receivedDate || selectedCase.receivedDate), true)}
          ${reminderInput("Nama Tersangka", "suspectName", "text", source.suspectName || selectedCase.suspectName, true)}
          <div class="form-field">
            <label for="reminder-deadline-days">Deadline (hari setelah SPDP diterima) <span class="required">*</span></label>
            <input id="reminder-deadline-days" name="deadlineDays" type="number" min="0" max="3650" step="1" value="${escapeAttr(deadlineDays)}" required />
            <small class="form-hint">P-16, P-19, dan P-21 otomatis diisi 7 hari. P-17, P-18, SOP Form 1–3, Tahap 2, dan P-29 diisi sesuai kebutuhan agar sistem tidak menetapkan batas waktu yang belum Anda tentukan.</small>
          </div>
          <div class="form-field">
            <label for="reminder-prosecutor">Jaksa Penanggung Jawab <span class="required">*</span></label>
            <select id="reminder-prosecutor" name="prosecutorId" required>
              <option value="">Pilih Jaksa </option>
              ${prosecutorOptions}
            </select>
            <small class="form-hint">Dropdown hanya menampilkan nama. Nomor WhatsApp tetap dibaca dari sheet List Jaksa.</small>
          </div>
          <div class="form-field full-span">
            <label for="reminder-notes">Catatan reminder</label>
            <textarea id="reminder-notes" name="notes" placeholder="Tambahkan catatan tindak lanjut bila diperlukan.">${escapeHtml(existing?.notes || "")}</textarea>
          </div>
        </div>

        <div id="reminder-deadline-preview" class="reminder-deadline-preview ${preview ? "ready" : ""}">
          <span>◷</span>
          <div><strong>${preview ? `Deadline: ${escapeHtml(formatDate(preview))}` : "Deadline belum dapat dihitung"}</strong><small>WhatsApp otomatis dikirim pada H-3, H-1, dan Hari H selama status reminder masih aktif.</small></div>
        </div>

        <div class="reminder-form-actions">
          <button id="reminder-reset-builder" class="ghost-button" type="button">Buat reminder lain</button>
          <button id="reminder-save-button" class="primary-button" type="submit">
            <span class="button-label">${existing ? "Perbarui reminder" : "Simpan reminder"}</span>
            <span class="button-spinner" hidden></span>
          </button>
        </div>
      </form>`;
  }

  function reminderInput(label, name, type, value, required, hint = "") {
    return `<div class="form-field ${name === "suspectName" ? "full-span" : ""}">
      <label for="reminder-${escapeAttr(name)}">${escapeHtml(label)} ${required ? '<span class="required">*</span>' : ""}</label>
      <input id="reminder-${escapeAttr(name)}" name="${escapeAttr(name)}" type="${escapeAttr(type)}" value="${escapeAttr(value || "")}" ${required ? "required" : ""} />
      ${hint ? `<small class="form-hint">${escapeHtml(hint)}</small>` : ""}
    </div>`;
  }

  function getReminderCaseSources() {
    const sources = new Map();
    [...state.cases].sort(sortByUpdatedDesc).forEach((item) => {
      if (item?.caseId) sources.set(String(item.caseId), item);
    });

    [...state.reminders]
      .sort((a, b) => dateValue(b.updatedAt || b.createdAt) - dateValue(a.updatedAt || a.createdAt))
      .forEach((item) => {
        const id = String(item.caseId || "");
        if (!id || sources.has(id)) return;
        sources.set(id, {
          caseId: id,
          spdpNumber: item.spdpNumber || "",
          spdpDate: item.spdpDate || "",
          sprindikNumber: item.sprindikNumber || "",
          sprindikDate: item.sprindikDate || "",
          receivedDate: item.receivedDate || "",
          detentionEndDate: item.detentionEndDate || "",
          suspectName: item.suspectName || "",
          administrations: [],
          reminderOnly: true,
          updatedAt: item.updatedAt || item.createdAt || ""
        });
      });

    return [...sources.values()].sort((a, b) => dateValue(b.updatedAt || b.createdAt) - dateValue(a.updatedAt || a.createdAt));
  }

  function findReminderCaseSource(caseId) {
    if (!caseId) return null;
    if (caseId === "__NEW_SPDP__") {
      return {
        caseId: "__NEW_SPDP__",
        spdpNumber: "",
        spdpDate: "",
        sprindikNumber: "",
        sprindikDate: "",
        receivedDate: "",
        detentionEndDate: "",
        suspectName: "",
        administrations: [],
        reminderOnly: true,
        isNewSpdp: true
      };
    }
    return getReminderCaseSources().find((item) => String(item.caseId) === String(caseId)) || null;
  }

  function getReminderProgressStates(selectedCaseOrId) {
    const selectedCase = typeof selectedCaseOrId === "string"
      ? findReminderCaseSource(selectedCaseOrId)
      : selectedCaseOrId;
    if (!selectedCase || selectedCase.caseId === "__NEW_SPDP__") return [];

    const caseId = String(selectedCase.caseId);
    const caseReminders = state.reminders.filter((item) => String(item.caseId) === caseId);
    const savedProgress = state.reminderProgress.filter((item) => String(item.caseId) === caseId);
    const completedDocuments = new Set((selectedCase.administrations || []).map((item) => String(item.type || "").toUpperCase()));

    return REMINDER_PROGRESS_STAGES.map((stage) => {
      const reminder = caseReminders.find((item) => String(item.administrationType) === stage.code);
      const progress = savedProgress.find((item) => String(item.administrationType) === stage.code);
      const completedByDocument = completedDocuments.has(stage.code);
      const done = completedByDocument || Boolean(progress?.completed) || reminder?.status === "COMPLETED";
      const active = !done && reminder?.status === "ACTIVE";
      return { ...stage, reminder, progress, done, active, completedByDocument };
    });
  }

  function renderReminderFlowPips(statuses, compact = false) {
    const firstPending = statuses.findIndex((item) => !item.done);
    return `<div class="reminder-flow ${compact ? "compact" : ""}" aria-label="Progres administrasi">
      <div class="reminder-flow-pips">
        ${statuses.map((item, index) => `<span class="${item.done ? "complete" : ""} ${index === firstPending ? "current" : ""}" title="${escapeAttr(item.code + " — " + item.label)}"></span>`).join("")}
      </div>
      ${compact ? "" : `<div class="reminder-flow-labels">${statuses.map((item) => `<small class="${item.done ? "complete" : ""}">${escapeHtml(item.code)}</small>`).join("")}</div>`}
    </div>`;
  }

  function renderReminderProgress(selectedCase) {
    if (!selectedCase || selectedCase.caseId === "__NEW_SPDP__") {
      return `<div class="reminder-progress-empty"><span>↳</span><strong>${selectedCase ? "SPDP baru belum disimpan" : "Belum ada perkara dipilih"}</strong><small>${selectedCase ? "Progres akan terbentuk setelah reminder pertama disimpan." : "Progres akan muncul setelah memilih SPDP."}</small></div>`;
    }

    const statuses = getReminderProgressStates(selectedCase);
    const completedCount = statuses.filter((item) => item.done).length;
    const percentage = Math.round((completedCount / REMINDER_PROGRESS_STAGES.length) * 100);

    return `
      <div class="reminder-progress-summary">
        <div><strong>${escapeHtml(selectedCase.suspectName || selectedCase.caseId)}</strong><small>SPDP ${escapeHtml(selectedCase.spdpNumber || "-")}</small></div>
        <span>${completedCount}/${REMINDER_PROGRESS_STAGES.length}</span>
      </div>
      ${renderReminderFlowPips(statuses)}
      <div class="administration-progress"><span style="width:${percentage}%"></span></div>
      <div class="reminder-progress-checklist">
        ${statuses.map((item) => {
          const statusText = item.completedByDocument
            ? "Selesai otomatis dari administrasi"
            : item.done
              ? `Selesai${item.progress?.completedBy ? ` · ${item.progress.completedBy}` : ""}`
              : item.active
                ? `Reminder aktif · ${formatDate(item.reminder.deadlineDate)}`
                : "Belum selesai";
          return `<label class="reminder-progress-check ${item.done ? "complete" : ""} ${item.active ? "active" : ""}">
            <input type="checkbox"
              data-reminder-progress-toggle
              data-case-id="${escapeAttr(selectedCase.caseId)}"
              data-administration-type="${escapeAttr(item.code)}"
              ${item.done ? "checked" : ""}
              ${item.completedByDocument ? "disabled" : ""} />
            <span class="reminder-check-box">${item.done ? "✓" : ""}</span>
            <span class="reminder-check-copy"><strong>${escapeHtml(item.code)} — ${escapeHtml(item.label)}</strong><small>${escapeHtml(statusText)}</small></span>
          </label>`;
        }).join("")}
      </div>
      <p class="reminder-progress-note">Checklist dapat diperbarui administrator. Tahap yang sudah dibuat melalui menu administrasi dikunci sebagai selesai agar data progres tetap konsisten.</p>`;
  }

  function renderReminderTableProgress(caseId) {
    const statuses = getReminderProgressStates(caseId);
    if (!statuses.length) return '<span class="case-secondary">Belum tersedia</span>';
    const completed = statuses.filter((item) => item.done).length;
    const next = statuses.find((item) => !item.done);
    return `<div class="reminder-table-progress">
      ${renderReminderFlowPips(statuses, true)}
      <small>${completed}/${statuses.length} selesai${next ? ` · berikutnya ${escapeHtml(next.code)}` : " · seluruh tahap selesai"}</small>
    </div>`;
  }

  function renderReminderTable() {
    let items = [...state.reminders];
    if (state.reminderFilter === "ACTIVE") items = items.filter((item) => item.status === "ACTIVE");
    if (state.reminderFilter === "COMPLETED") items = items.filter((item) => item.status === "COMPLETED");
    if (state.reminderFilter === "DUE") items = items.filter((item) => item.status === "ACTIVE" && ["warning", "overdue"].includes(getReminderDeadlineState(item).state));
    items.sort((a, b) => dateValue(a.deadlineDate) - dateValue(b.deadlineDate));

    if (!items.length) return emptyState("♢", "Belum ada reminder", "Simpan reminder baru untuk mulai mengirim notifikasi WhatsApp.");

    return `<div class="table-wrap"><table class="reminder-table">
      <thead><tr><th>SPDP / Tersangka</th><th>Administrasi</th><th>Jaksa</th><th>Deadline</th><th>Progres administrasi</th><th>Pengiriman</th><th>Status</th><th>Aksi</th></tr></thead>
      <tbody>${items.map((item) => {
        const deadline = getReminderDeadlineState(item);
        const statusTone = item.status === "COMPLETED" ? "green" : item.status === "CANCELLED" ? "gray" : deadline.state === "overdue" ? "red" : deadline.state === "warning" ? "amber" : "blue";
        const typeLabel = item.administrationType;
        const stageProgress = getReminderProgressStates(item.caseId).find((stage) => stage.code === item.administrationType);
        const lockedByAdministration = Boolean(stageProgress?.completedByDocument);
        return `<tr>
          <td><div class="case-primary">${escapeHtml(item.spdpNumber || item.caseId)}</div><div class="case-secondary">${escapeHtml(item.suspectName || "-")} · ${escapeHtml(item.caseId || "-")}</div></td>
          <td><span class="status-badge blue">${escapeHtml(typeLabel)}</span><div class="case-secondary">${Number(item.deadlineDays || 0)} hari</div></td>
          <td><div class="case-primary">${escapeHtml(item.prosecutorName || "-")}</div><div class="case-secondary">${maskPhone(item.prosecutorPhone)}</div></td>
          <td><span class="deadline-badge ${deadline.state}">${escapeHtml(deadline.label)}</span><div class="case-secondary">${formatDate(item.deadlineDate)}</div></td>
          <td>${renderReminderTableProgress(item.caseId)}</td>
          <td>${renderReminderSendPills(item)}<div class="case-secondary">${escapeHtml(reminderLastSendLabel(item.lastSendStatus))}</div></td>
          <td><span class="status-badge ${statusTone}">${escapeHtml(reminderStatusLabel(item.status))}</span></td>
          <td><div class="reminder-row-actions">
            <button class="table-action" data-reminder-edit="${escapeAttr(item.reminderId)}" type="button">Edit</button>
            <button class="table-action" data-reminder-send="${escapeAttr(item.reminderId)}" type="button">Kirim sekarang</button>
            ${lockedByAdministration
              ? '<button class="table-action" type="button" disabled title="Tahap sudah selesai dari menu administrasi">Selesai dari administrasi</button>'
              : `<button class="table-action" data-reminder-status="${escapeAttr(item.reminderId)}" data-next-status="${item.status === "COMPLETED" ? "ACTIVE" : "COMPLETED"}" type="button">${item.status === "COMPLETED" ? "Aktifkan" : "Tandai selesai"}</button>`}
            <button class="table-action reminder-delete-action" data-reminder-delete="${escapeAttr(item.reminderId)}" type="button">Hapus</button>
          </div></td>
        </tr>`;
      }).join("")}</tbody>
    </table></div>`;
  }

  function renderReminderSendPills(item) {
    return `<div class="reminder-send-pills">
      <span class="${item.sentH3At ? "sent" : ""}" title="${item.sentH3At ? formatDateTime(item.sentH3At) : "Belum dikirim"}">H-3</span>
      <span class="${item.sentH1At ? "sent" : ""}" title="${item.sentH1At ? formatDateTime(item.sentH1At) : "Belum dikirim"}">H-1</span>
      <span class="${item.sentH0At ? "sent" : ""}" title="${item.sentH0At ? formatDateTime(item.sentH0At) : "Belum dikirim"}">H</span>
    </div>`;
  }

  function bindReminderPage(selectedCase, selectedType, existing) {
    document.getElementById("reminder-case-select")?.addEventListener("change", (event) => {
      state.reminderBuilder.caseId = event.target.value;
      state.reminderBuilder.reminderId = "";
      renderRemindersPage();
    });
    document.getElementById("reminder-administration-type")?.addEventListener("change", (event) => {
      const nextType = event.target.value;

      const duplicate = selectedCase
        ? state.reminders.find((item) =>
            String(item.caseId) === String(selectedCase.caseId) &&
            String(item.administrationType) === String(nextType) &&
            String(item.reminderId) !== String(existing?.reminderId || "")
          )
        : null;

      if (duplicate) {
        toast("warning", "Jenis administrasi sudah digunakan", `${nextType} sudah memiliki reminder untuk perkara ini. Edit reminder tersebut atau pilih jenis lain.`);
        event.target.value = selectedType;
        return;
      }

      state.reminderBuilder.type = nextType;

      if (!existing) state.reminderBuilder.reminderId = "";

      renderRemindersPage();
    });
    document.getElementById("reminder-form")?.addEventListener("submit", handleReminderSubmit);
    document.getElementById("reminder-reset-builder")?.addEventListener("click", () => {
      state.reminderBuilder = { caseId: "", type: "P-16", reminderId: "" };
      renderRemindersPage();
    });
    ["reminder-receivedDate", "reminder-detentionEndDate", "reminder-deadline-days"].forEach((id) => {
      document.getElementById(id)?.addEventListener("input", updateReminderDeadlinePreview);
      document.getElementById(id)?.addEventListener("change", updateReminderDeadlinePreview);
    });
    document.getElementById("reminder-list-filter")?.addEventListener("change", (event) => {
      state.reminderFilter = event.target.value;
      renderRemindersPage();
    });
    document.getElementById("reminder-refresh")?.addEventListener("click", async () => {
      state.remindersLoaded = false;
      await renderRemindersPage();
    });

    document.querySelectorAll("[data-reminder-edit]").forEach((button) => button.addEventListener("click", () => {
      const reminder = state.reminders.find((item) => item.reminderId === button.dataset.reminderEdit);
      if (!reminder) return;
      state.reminderBuilder = { caseId: reminder.caseId, type: reminder.administrationType, reminderId: reminder.reminderId };
      window.scrollTo({ top: 0, behavior: "smooth" });
      renderRemindersPage();
    }));

    document.querySelectorAll("[data-reminder-progress-toggle]").forEach((checkbox) => checkbox.addEventListener("change", async () => {
      const completed = checkbox.checked;
      checkbox.disabled = true;
      try {
        await gasRequest("updateReminderProgress", {
          caseId: checkbox.dataset.caseId,
          administrationType: checkbox.dataset.administrationType,
          completed,
          spdpNumber: selectedCase?.spdpNumber || "",
          suspectName: selectedCase?.suspectName || ""
        });
        toast("success", "Progres diperbarui", `${checkbox.dataset.administrationType} ${completed ? "ditandai selesai" : "dikembalikan menjadi belum selesai"}.`);
        await loadReminderData();
        renderSidebar();
        renderRemindersPage();
      } catch (error) {
        checkbox.checked = !completed;
        toast("error", "Progres gagal diperbarui", error.message || "Perubahan checklist belum tersimpan.");
      } finally {
        checkbox.disabled = false;
      }
    }));

    document.querySelectorAll("[data-reminder-send]").forEach((button) => button.addEventListener("click", async () => {
      const reminder = state.reminders.find((item) => item.reminderId === button.dataset.reminderSend);
      if (!reminder) return;
      if (!window.confirm(`Kirim reminder ${reminder.administrationType} sekarang kepada ${reminder.prosecutorName}?`)) return;
      button.disabled = true;
      try {
        await gasRequest("sendReminderNow", { reminderId: reminder.reminderId });
        toast("success", "WhatsApp masuk antrean", `Reminder dikirim kepada ${reminder.prosecutorName}.`);
        await loadReminderData();
        renderSidebar();
        renderRemindersPage();
      } catch (error) {
        toast("error", "Pengiriman gagal", error.message);
      } finally {
        button.disabled = false;
      }
    }));

    document.querySelectorAll("[data-reminder-status]").forEach((button) => button.addEventListener("click", async () => {
      const nextStatus = button.dataset.nextStatus;
      button.disabled = true;
      try {
        await gasRequest("updateReminderStatus", { reminderId: button.dataset.reminderStatus, status: nextStatus });
        toast("success", "Status diperbarui", nextStatus === "COMPLETED" ? "Administrasi ditandai selesai." : "Reminder diaktifkan kembali.");
        await loadReminderData();
        renderSidebar();
        renderRemindersPage();
      } catch (error) {
        toast("error", "Status gagal diperbarui", error.message);
      } finally {
        button.disabled = false;
      }
    }));


    document.querySelectorAll("[data-reminder-delete]").forEach((button) => button.addEventListener("click", async () => {
      const reminder = state.reminders.find((item) => item.reminderId === button.dataset.reminderDelete);
      if (!reminder) return;

      const confirmed = window.confirm(
        `Hapus reminder ${reminder.administrationType} untuk ${reminder.suspectName || reminder.spdpNumber}?

` +
        "Reminder tidak akan lagi dikirim otomatis. Progres administrasi dan log pengiriman tetap disimpan sebagai riwayat audit."
      );
      if (!confirmed) return;

      button.disabled = true;
      try {
        await gasRequest("deleteReminder", { reminderId: reminder.reminderId });

        if (String(state.reminderBuilder.reminderId || "") === String(reminder.reminderId)) {
          state.reminderBuilder = { caseId: "", type: "P-16", reminderId: "" };
        }

        toast("success", "Reminder dihapus", `${reminder.administrationType} untuk ${reminder.suspectName || reminder.spdpNumber} telah dihapus.`);
        await loadReminderData();
        renderSidebar();
        renderRemindersPage();
      } catch (error) {
        toast("error", "Reminder gagal dihapus", error.message || "Data reminder belum berhasil dihapus.");
      } finally {
        button.disabled = false;
      }
    }));
  }

  async function handleReminderSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const button = document.getElementById("reminder-save-button");
    setButtonLoading(button, true);
    try {
      const data = new FormData(form);
      const payload = {};
      data.forEach((value, key) => { payload[key] = String(value || "").trim(); });
      const isEdit = Boolean(payload.reminderId);
      const action = isEdit ? "updateReminder" : "createReminder";
      const result = await gasRequest(action, payload);
      state.reminderBuilder = {
        caseId: result.reminder.caseId,
        type: result.reminder.administrationType,
        reminderId: result.reminder.reminderId
      };
      toast(
        "success",
        isEdit ? "Reminder diperbarui" : "Reminder dibuat",
        `${result.reminder.administrationType} · deadline ${formatDate(result.reminder.deadlineDate)}.`
      );
      await loadReminderData();
      renderSidebar();
      renderRemindersPage();
    } catch (error) {
      toast("error", "Reminder gagal disimpan", error.message || "Periksa kembali data reminder.");
    } finally {
      setButtonLoading(button, false);
    }
  }

  function updateReminderDeadlinePreview() {
    const received = document.getElementById("reminder-receivedDate")?.value || "";
    const days = document.getElementById("reminder-deadline-days")?.value || "";
    const date = calculateReminderDeadlinePreview(received, days);
    const node = document.getElementById("reminder-deadline-preview");
    if (!node) return;
    node.classList.toggle("ready", Boolean(date));
    node.querySelector("strong").textContent = date ? `Deadline: ${formatDate(date)}` : "Deadline belum dapat dihitung";
  }

  function calculateReminderDeadlinePreview(receivedDate, daysValue) {
    if (daysValue === "" || daysValue === null || daysValue === undefined) return "";
    const days = Number(daysValue);
    if (!Number.isInteger(days) || days < 0 || !receivedDate) return "";
    return addDays(receivedDate, days);
  }

  function findReminderForSelection(caseId, type) {
    return state.reminders.find((item) => item.caseId === caseId && item.administrationType === type) || null;
  }

  function getReminderDeadlineState(item) {
    const days = Number.isFinite(Number(item.daysRemaining))
      ? Number(item.daysRemaining)
      : item.deadlineDate ? Math.ceil((parseLocalDate(item.deadlineDate) - startOfDay(new Date())) / 86400000) : null;
    if (days === null) return { state: "safe", label: "Belum ditentukan", days: null };
    if (days < 0) return { state: "overdue", label: `Lewat ${Math.abs(days)} hari`, days };
    if (days <= 3) return { state: "warning", label: days === 0 ? "Hari ini" : `${days} hari lagi`, days };
    return { state: "safe", label: `${days} hari lagi`, days };
  }

  function reminderStatusLabel(status) {
    return status === "COMPLETED" ? "Selesai" : status === "CANCELLED" ? "Dibatalkan" : "Aktif";
  }

  function reminderLastSendLabel(status) {
    const labels = {
      H3_SUCCESS: "H-3 berhasil dikirim",
      H1_SUCCESS: "H-1 berhasil dikirim",
      H0_SUCCESS: "Hari H berhasil dikirim",
      MANUAL_SUCCESS: "Pengiriman manual berhasil",
      H3_FAILED: "Pengiriman H-3 gagal",
      H1_FAILED: "Pengiriman H-1 gagal",
      H0_FAILED: "Pengiriman Hari H gagal",
      ADMINISTRATION_CREATED: "Selesai otomatis dari administrasi"
    };
    return labels[status] || "Belum ada pengiriman";
  }

  function maskPhone(value) {
    const number = String(value || "");
    if (number.length < 7) return number || "-";
    return `${number.slice(0, 4)}••••${number.slice(-3)}`;
  }

  function renderDeadlineList(cases) {
    if (!cases.length) return emptyState("◷", "Belum ada tenggat", "Tentukan tanggal tenggat pada detail perkara.");
    return `<div class="deadline-list">${cases.map((item) => {
      const deadline = getDeadlineState(item);
      return `<button type="button" class="deadline-item ${deadline.state}" data-open-case="${escapeAttr(item.caseId)}" style="width:100%;background:white;text-align:left">
        <span class="deadline-dot"></span>
        <span><strong>${escapeHtml(item.suspectName || item.caseId)}</strong><small>${escapeHtml(getStatus(item.status).label)} · ${formatDate(item.deadlineDate)} · ${escapeHtml(deadline.label)}</small></span>
      </button>`;
    }).join("")}</div>`;
  }

  /* ---------- Modal manager (animasi halus, ESC, kunci scroll) ---------- */
  let modalCloseTimer = null;

  function openModal(html) {
    clearTimeout(modalCloseTimer);
    const previousBody = els.modalRoot.querySelector(".case-modal-body");
    const hadModal = Boolean(els.modalRoot.querySelector(".modal-backdrop.is-visible"));
    const previousScroll = previousBody ? previousBody.scrollTop : 0;
    els.modalRoot.innerHTML = html;
    bindModalClose({ instant: hadModal });
    if (hadModal && previousScroll) {
      const body = els.modalRoot.querySelector(".case-modal-body");
      if (body) body.scrollTop = previousScroll;
    }
  }

  function bindModalClose({ instant = false } = {}) {
    clearTimeout(modalCloseTimer);
    document.body.classList.add("modal-open");
    const backdrop = els.modalRoot.querySelector(".modal-backdrop");
    if (backdrop) {
      if (instant) backdrop.classList.add("is-visible", "no-anim");
      else requestAnimationFrame(() => backdrop.classList.add("is-visible"));
      backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop) closeModal();
      });
    }
    els.modalRoot.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModal));
  }

  function closeModal() {
    state.selectedAdministrationFile = null;
    document.body.classList.remove("modal-open");
    const backdrop = els.modalRoot.querySelector(".modal-backdrop");
    if (!backdrop) { els.modalRoot.innerHTML = ""; return; }
    backdrop.classList.remove("is-visible", "no-anim");
    backdrop.classList.add("is-closing");
    clearTimeout(modalCloseTimer);
    modalCloseTimer = setTimeout(() => { els.modalRoot.innerHTML = ""; }, 190);
  }

  function navigate(page) {
    state.activePage = page;
    renderSidebar();
    renderActivePage();
  }

  async function checkConnection() {
    try {
      await gasRequest("health", {}, { auth: false, silent: true, timeout: 20000 });
      setConnection(true);
    } catch {
      setConnection(false);
    }
  }

  function setConnection(online) {
    state.connected = online;
    const indicator = els.connectionIndicator || document.getElementById("connection-indicator");
    if (!indicator) return;
    indicator.classList.toggle("online", online);
    indicator.classList.toggle("offline", !online);
    const label = indicator.querySelector("small");
    if (label) label.textContent = online ? "Backend terhubung" : "Backend tidak terhubung";
  }

  const READ_ONLY_ACTIONS = new Set(["health", "me", "listCases", "getCase", "listAdministrations", "listProsecutors", "listReminders", "listTikReminders", "listCaseAnalyses"]);

  async function gasRequest(action, payload = {}, options = {}) {
    const retries = READ_ONLY_ACTIONS.has(action) ? Number(options.retries ?? 1) : 0;
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await gasRequestOnce(action, payload, options);
      } catch (error) {
        const transient = error && (error.transient || error.name === "TypeError");
        if (attempt >= retries || !transient) throw error;
        await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
      }
    }
  }

  async function gasRequestOnce(action, payload = {}, options = {}) {
    if (CONFIG.DEMO_MODE) return demoRequest(action, payload);
    if (!CONFIG.APPS_SCRIPT_URL || !CONFIG.APPS_SCRIPT_URL.startsWith("https://script.google.com/")) {
      throw new Error("URL Google Apps Script belum dikonfigurasi.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeout || CONFIG.REQUEST_TIMEOUT_MS || 120000);
    const body = {
      action,
      payload,
      token: options.auth === false ? "" : (state.session?.token || "")
    };

    try {
      const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); }
      catch {
        const invalid = new Error("Respons backend tidak valid. Pastikan deployment Apps Script menggunakan versi kode terbaru.");
        invalid.transient = response.status >= 500;
        throw invalid;
      }
      if (!response.ok || !data.success) {
        const backendError = new Error(data.message || `Permintaan gagal (${response.status}).`);
        backendError.backend = true;
        throw backendError;
      }
      return data.data || {};
    } catch (error) {
      if (error.backend) {
        setConnection(true); // server menjawab — hanya permintaannya yang ditolak
        if (/sesi|token|login ulang|kedaluwarsa/i.test(error.message) && action !== "login" && state.session && !options.silent) {
          handleSessionExpired();
        }
        throw error;
      }
      if (error.name === "AbortError") throw new Error("Permintaan terlalu lama. Periksa koneksi atau ukuran dokumen.");
      if (error.name === "TypeError") {
        const network = new Error("Koneksi ke server terputus. Periksa jaringan internet Anda.");
        network.transient = true;
        network.name = "TypeError";
        if (!options.silent) setConnection(false);
        throw network;
      }
      if (!options.silent) setConnection(false);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  function demoRequest(action, payload) {
    const demoCases = JSON.parse(localStorage.getItem("siap_pidum_demo_cases") || "[]");
    if (action === "health") return Promise.resolve({ status: "ok" });
    if (action === "login") {
      const valid = (payload.role === "jaksa" && payload.username === "jaksa" && payload.password === "Jaksa@123") ||
        (payload.role === "penyidik" && payload.username === "penyidik" && payload.password === "Penyidik@123");
      if (!valid) return Promise.reject(new Error("Akun demo tidak sesuai."));
      return Promise.resolve({ token: "demo-token", user: { username: payload.username, role: payload.role, fullName: payload.role === "jaksa" ? "Jaksa Demo" : "Penyidik Demo" } });
    }
    if (action === "me") return Promise.resolve({ user: state.session.user });
    if (action === "listTikReminders") {
      const tikReminders = JSON.parse(localStorage.getItem("siap_pidum_demo_tik_reminders") || "[]");
      return Promise.resolve({ reminders: tikReminders, intelijenCount: 3, validPhoneCount: 3, fonnteConfigured: true });
    }
    if (action === "createTikReminderDraft") {
      const tikReminders = JSON.parse(localStorage.getItem("siap_pidum_demo_tik_reminders") || "[]");
      const record = {
        reminderId: `TIK-DEMO-${Date.now()}`,
        suspectName: payload.suspectName,
        folderUrl: "",
        fileCount: 0,
        recipientCount: 0,
        successCount: 0,
        failedCount: 0,
        status: "DRAFT",
        createdAt: new Date().toISOString(),
        sentAt: ""
      };
      tikReminders.unshift(record);
      localStorage.setItem("siap_pidum_demo_tik_reminders", JSON.stringify(tikReminders));
      return Promise.resolve(record);
    }
    if (action === "uploadTikIdentityFile") {
      const tikReminders = JSON.parse(localStorage.getItem("siap_pidum_demo_tik_reminders") || "[]");
      const record = tikReminders.find((item) => item.reminderId === payload.reminderId);
      if (!record) return Promise.reject(new Error("Draft Kartu TIK demo tidak ditemukan."));
      record.fileCount = Number(record.fileCount || 0) + 1;
      localStorage.setItem("siap_pidum_demo_tik_reminders", JSON.stringify(tikReminders));
      return Promise.resolve({ reminderId: record.reminderId, fileCount: record.fileCount, file: { fileName: payload.file?.name || "file" } });
    }
    if (action === "sendTikReminder") {
      const tikReminders = JSON.parse(localStorage.getItem("siap_pidum_demo_tik_reminders") || "[]");
      const record = tikReminders.find((item) => item.reminderId === payload.reminderId);
      if (!record) return Promise.reject(new Error("Reminder Kartu TIK demo tidak ditemukan."));
      record.recipientCount = 3;
      record.successCount = 3;
      record.failedCount = 0;
      record.status = "SENT";
      record.sentAt = new Date().toISOString();
      localStorage.setItem("siap_pidum_demo_tik_reminders", JSON.stringify(tikReminders));
      return Promise.resolve({ ...record });
    }
    if (action === "deleteTikReminderDraft") {
      const tikReminders = JSON.parse(localStorage.getItem("siap_pidum_demo_tik_reminders") || "[]");
      const filtered = tikReminders.filter((item) => item.reminderId !== payload.reminderId || item.status !== "DRAFT");
      localStorage.setItem("siap_pidum_demo_tik_reminders", JSON.stringify(filtered));
      return Promise.resolve({ deleted: filtered.length !== tikReminders.length, reminderId: payload.reminderId });
    }
    if (action === "listCases") return Promise.resolve({
      cases: demoCases.map((item) => ({
        ...item,
        administrations: Array.isArray(item.administrations) ? item.administrations : [],
        administrationProgress: {
          completed: Array.isArray(item.administrations) ? item.administrations.length : 0,
          total: ADMINISTRATION_STAGES.length
        }
      }))
    });
    if (action === "submitCase") {
      const now = new Date().toISOString();
      const item = {
        ...payload,
        spdpFile: undefined,
        caseId: `DEMO-${Date.now()}`,
        status: "SPDP_DITERIMA",
        createdAt: now,
        updatedAt: now,
        deadlineDate: addDays(payload.receivedDate, 3),
        administrations: [],
        administrationProgress: { completed: 0, total: ADMINISTRATION_STAGES.length }
      };
      demoCases.push(item);
      localStorage.setItem("siap_pidum_demo_cases", JSON.stringify(demoCases));
      return Promise.resolve({ caseId: item.caseId });
    }
    if (action === "createAdministration") {
      const index = demoCases.findIndex((item) => item.caseId === payload.caseId);
      if (index < 0) return Promise.reject(new Error("Perkara tidak ditemukan."));

      const stage = ADMINISTRATION_STAGES.find((item) => item.code === payload.type);
      if (!stage) return Promise.reject(new Error("Jenis administrasi tidak valid."));

      const administrations = Array.isArray(demoCases[index].administrations) ? demoCases[index].administrations : [];
      if (administrations.some((item) => item.type === payload.type)) {
        return Promise.reject(new Error(`${payload.type} sudah dibuat untuk perkara ini.`));
      }

      const completed = new Set(administrations.map((item) => item.type));
      const missing = stage.prerequisites.filter((code) => !completed.has(code));
      if (missing.length) return Promise.reject(new Error(`Administrasi ${missing.join(", ")} harus dibuat terlebih dahulu.`));
      if (payload.type === "P-19" && completed.has("P-21")) {
        return Promise.reject(new Error("P-19 tidak dapat dibuat karena P-21 sudah diterbitkan."));
      }

      const now = new Date().toISOString();
      const record = {
        administrationId: `ADM-${Date.now()}`,
        caseId: payload.caseId,
        type: payload.type,
        title: stage.title,
        documentNumber: payload.documentNumber,
        documentDate: payload.documentDate,
        responsibleOfficer: payload.responsibleOfficer,
        notes: payload.notes || "",
        suspectName: demoCases[index].suspectName || "",
        schemaVersion: "B310-2026-v1",
        fieldCount: Array.isArray(payload.formFields) ? payload.formFields.length : 0,
        formFields: Array.isArray(payload.formFields) ? payload.formFields : [],
        formData: Object.fromEntries((Array.isArray(payload.formFields) ? payload.formFields : []).map((fieldItem) => [fieldItem.key, fieldItem.value])),
        fileName: payload.administrationFile?.name || "",
        fileUrl: "",
        createdBy: state.session.user.username,
        createdByName: state.session.user.fullName,
        createdAt: now,
        updatedAt: now
      };
      administrations.push(record);

      let deadlineDate = "";
      let deadlineType = "";
      if (payload.type === "P-1A") {
        deadlineDate = demoCases[index].deadlineDate || addDays(payload.documentDate, 3);
        deadlineType = demoCases[index].deadlineType || "Koordinasi awal paling lama 3 hari";
      } else if (payload.type === "P-16") {
        deadlineDate = addDays(payload.documentDate, 3);
        deadlineType = "Koordinasi awal paling lama 3 hari";
      } else if (payload.type === "P-19") {
        deadlineDate = addDays(payload.documentDate, 14);
        deadlineType = "Penyidikan tambahan setelah P-19";
      } else if (payload.type === "P-21") {
        deadlineDate = addDays(payload.documentDate, 14);
        deadlineType = "Penyerahan tersangka dan barang bukti";
      }

      demoCases[index] = {
        ...demoCases[index],
        status: stage.status,
        statusUpdatedAt: now,
        updatedAt: now,
        prosecutorName: payload.type === "P-16" || !demoCases[index].prosecutorName
          ? payload.responsibleOfficer
          : demoCases[index].prosecutorName,
        deadlineDate,
        deadlineType,
        administrations,
        administrationProgress: { completed: administrations.length, total: ADMINISTRATION_STAGES.length }
      };

      localStorage.setItem("siap_pidum_demo_cases", JSON.stringify(demoCases));
      return Promise.resolve({ case: demoCases[index], administration: record });
    }
    if (action === "listProsecutors") return Promise.resolve({ prosecutors: [
      { id: "JAKSA-001", name: "Indra Thimoty, S.H., M.H.", nip: "198701012010011001", pangkat: "Jaksa Muda", jabatan: "Kasi Pidum" },
      { id: "JAKSA-002", name: "Daniel Marbun, S.H.", nip: "199002022015031002", pangkat: "Ajun Jaksa", jabatan: "Jaksa Fungsional" }
    ] });
    if (action === "listCaseAnalyses") return Promise.resolve({ analyses: [] });
    if (action === "analyzeCase") return new Promise((resolve) => setTimeout(() => resolve({
      analysis: { model: "demo", createdAt: new Date().toISOString() },
      parsed: {
        kesimpulan: "Contoh hasil analisa mode demo. Unsur pokok tampak terpenuhi namun nilai kerugian perlu didalami.",
        jenisKasus: { kategori: "pidana", referensiUU: "UU 1/2023", penjelasan: "Perbuatan mengambil barang milik orang lain dengan kekerasan." },
        identifikasiKorban: { status: "dewasa", penjelasan: "Korban berusia dewasa menurut uraian." },
        unsurFormil: [{ unsur: "SPDP & Sprindik", status: "terpenuhi", keterangan: "Dokumen lengkap." }],
        unsurMateril: [{ unsur: "Mengambil barang", status: "terpenuhi", keterangan: "Didukung keterangan saksi." }, { unsur: "Dengan kekerasan", status: "perlu pendalaman", keterangan: "Visum belum dilampirkan." }],
        asasDilanggar: [{ asas: "Asas legalitas", penjelasan: "Perbuatan diatur dalam KUHP Nasional." }],
        pasalDisarankan: [{ pasal: "Pasal 479", undangUndang: "UU 1/2023", alasan: "Pencurian dengan kekerasan." }]
      }
    }), 600));
    if (action === "chatAi") return new Promise((resolve) => setTimeout(() => resolve({ reply: "**Mode demo** — jawaban contoh untuk: " + payload.message }), 500));
    if (action === "updateCase") {
      const index = demoCases.findIndex((item) => item.caseId === payload.caseId);
      if (index < 0) return Promise.reject(new Error("Perkara tidak ditemukan."));
      demoCases[index] = { ...demoCases[index], ...payload.updates, updatedAt: new Date().toISOString() };
      localStorage.setItem("siap_pidum_demo_cases", JSON.stringify(demoCases));
      return Promise.resolve({ case: demoCases[index] });
    }
    return Promise.reject(new Error("Aksi demo tidak tersedia."));
  }

  function filterCases(cases) {
    const q = state.search.trim().toLowerCase();
    return cases.filter((item) => {
      const haystack = [item.caseId, item.suspectName, item.investigatorName, item.investigatorInstitution, item.spdpNumber, item.allegedArticle].join(" ").toLowerCase();
      const matchesSearch = !q || haystack.includes(q);
      const matchesStatus = state.statusFilter === "ALL" || item.status === state.statusFilter;
      const matchesDeadline = state.deadlineFilter === "ALL" || getDeadlineState(item).state === state.deadlineFilter;
      return matchesSearch && matchesStatus && matchesDeadline;
    });
  }

  function getStatus(value) { return STATUS[value] || { label: value || "Belum ditentukan", tone: "gray" }; }

  function getDeadlineState(item) {
    if (!item.deadlineDate) return { state: "safe", label: "Belum ditentukan", days: null };
    const deadline = parseLocalDate(item.deadlineDate);
    const today = startOfDay(new Date());
    const diff = Math.ceil((deadline - today) / 86400000);
    if (diff < 0) return { state: "overdue", label: `${Math.abs(diff)} hari terlambat`, days: diff };
    if (diff <= 3) return { state: "warning", label: diff === 0 ? "Hari ini" : `${diff} hari lagi`, days: diff };
    return { state: "safe", label: `${diff} hari lagi`, days: diff };
  }

  function formSection(number, title, description, body) {
    return `<section class="form-section"><div class="form-section-header"><span class="form-section-number">${number}</span><div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(description)}</p></div></div><div class="form-section-body">${body}</div></section>`;
  }

  function field(label, name, type = "text", required = false, value = "", hint = "") {
    return `<div class="form-field"><label for="${escapeAttr(name)}">${escapeHtml(label)} ${required ? '<span class="required">*</span>' : ""}</label><input id="${escapeAttr(name)}" name="${escapeAttr(name)}" type="${escapeAttr(type)}" value="${escapeAttr(value || "")}" ${required ? "required" : ""} />${hint ? `<small class="form-hint">${escapeHtml(hint)}</small>` : ""}</div>`;
  }

  function selectField(label, name, options, required = false, selected = "") {
    const normalized = options.map((item) => typeof item === "string" ? { value: item, label: item } : item);
    return `<div class="form-field"><label for="${escapeAttr(name)}">${escapeHtml(label)} ${required ? '<span class="required">*</span>' : ""}</label><select id="${escapeAttr(name)}" name="${escapeAttr(name)}" ${required ? "required" : ""}><option value="">Pilih...</option>${normalized.map((item) => `<option value="${escapeAttr(item.value)}" ${String(selected) === String(item.value) ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></div>`;
  }

  function detail(label, value, full = false) {
    return `<div class="detail-item ${full ? "full-span" : ""}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "-")}</strong></div>`;
  }

  function statCard(icon, value, label, tone) {
    return `<article class="stat-card ${tone}"><div class="stat-card-top"><div class="stat-icon">${icon}</div></div><div class="stat-value">${Number(value || 0).toLocaleString("id-ID")}</div><div class="stat-label">${escapeHtml(label)}</div></article>`;
  }

  function emptyState(icon, title, message) {
    return `<div class="empty-state"><div class="empty-state-icon">${icon}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(message)}</p></div>`;
  }

  function setButtonLoading(button, loading) {
    if (!button) return;
    button.disabled = loading;
    const label = button.querySelector(".button-label");
    const spinner = button.querySelector(".button-spinner");
    if (spinner) spinner.hidden = !loading;
    if (label) label.style.opacity = loading ? ".7" : "1";
  }

  function readFileBase64(file, onProgress) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Dokumen gagal dibaca."));
      reader.onprogress = (event) => {
        if (event.lengthComputable && onProgress) onProgress(Math.round((event.loaded / event.total) * 70));
      };
      reader.onload = () => {
        const result = String(reader.result || "");
        resolve(result.includes(",") ? result.split(",")[1] : result);
      };
      reader.readAsDataURL(file);
    });
  }

  function toast(type, title, message) {
    const node = document.createElement("div");
    node.className = `toast ${type}`;
    node.innerHTML = `<span>${type === "success" ? "✓" : type === "error" ? "!" : "◆"}</span><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(message || "")}</p></div>`;
    els.toastRoot.appendChild(node);
    setTimeout(() => {
      node.style.opacity = "0";
      node.style.transform = "translateY(-6px)";
      setTimeout(() => node.remove(), 220);
    }, 4400);
  }

  function setCurrentDate() {
    els.currentDate.textContent = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date());
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));
  }
  function escapeAttr(value) { return escapeHtml(value); }
  function initials(value) { return String(value || "U").trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase(); }
  function firstName(value) { return String(value || "Pengguna").trim().split(/\s+/)[0]; }
  function todayISO() { return `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`; }
  function parseLocalDate(value) {
    if (!value) return new Date(0);
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return new Date(value);
  }
  function dateValue(value) { const date = value ? new Date(value) : new Date(0); return Number.isNaN(date.getTime()) ? 0 : date.getTime(); }
  function startOfDay(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
  function formatDate(value) {
    if (!value) return "-";
    const date = parseLocalDate(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric" }).format(date);
  }
  function formatTime(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(date);
  }
  function formatDateTime(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
  }
  function normalizeDateInput(value) {
    if (!value) return "";
    const match = String(value).match(/\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : "";
  }
  function normalizeDateTimeInput(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  function calculateAge(dateString) {
    if (!dateString) return -1;
    const birth = parseLocalDate(dateString);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1;
    return age;
  }
  function addDays(dateString, days) {
    const date = parseLocalDate(dateString);
    date.setDate(date.getDate() + days);
    const pad = (number) => String(number).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  function formatBytes(bytes) {
    if (!Number(bytes)) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return `${(bytes / (1024 ** index)).toFixed(index ? 2 : 0)} ${units[index]}`;
  }
  function mimeFromName(name) {
    return String(name).toLowerCase().endsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  function sortByUpdatedDesc(a, b) { return dateValue(b.updatedAt || b.createdAt) - dateValue(a.updatedAt || a.createdAt); }
  function debounce(fn, wait) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); };
  }

  // ---- Analisa AI (Gemini) — panel kanan (drawer) V4 ----
  // Tidak lagi mendorong layout (padding-right) sehingga animasi ringan & tidak patah-patah.
  let aiRequestToken = 0;

  function ensureAiSidebar() {
    let sidebar = document.getElementById("ai-right-sidebar");
    if (sidebar) return sidebar;
    document.body.insertAdjacentHTML("beforeend", `
      <div id="ai-scrim" class="ai-scrim" hidden></div>
      <aside id="ai-right-sidebar" class="ai-drawer" aria-hidden="true" aria-label="Panel analisa AI">
        <header class="ai-drawer-head">
          <div>
            <span class="case-eyebrow">Analisa AI · Gemini</span>
            <strong id="ai-drawer-title">Perkara</strong>
            <small id="ai-drawer-sub"></small>
          </div>
          <div class="ai-drawer-head-actions">
            <button type="button" id="ai-rerun" class="case-ghost-button small" title="Jalankan ulang analisa">↻ Ulang</button>
            <button type="button" id="ai-close" class="case-modal-close" aria-label="Tutup panel AI">×</button>
          </div>
        </header>
        <div id="ai-scroll-container" class="ai-drawer-body">
          <div id="ai-sidebar-result"></div>
          <hr id="ai-chat-divider" class="ai-divider" hidden />
          <div id="ai-chat-history" class="ai-chat-history"></div>
        </div>
        <form id="ai-chat-form" class="ai-chat-form">
          <input type="text" id="ai-chat-input" autocomplete="off" placeholder="Tanyakan lebih lanjut soal berkas ini…" />
          <button id="ai-chat-btn" class="case-primary-button" type="submit">Kirim</button>
        </form>
      </aside>`);
    sidebar = document.getElementById("ai-right-sidebar");
    document.getElementById("ai-close").addEventListener("click", closeAiSidebar);
    document.getElementById("ai-scrim").addEventListener("click", closeAiSidebar);
    document.getElementById("ai-rerun").addEventListener("click", () => {
      const caseId = sidebar.dataset.caseId;
      if (caseId) runSidebarAnalysis(caseId, { force: true });
    });
    document.getElementById("ai-chat-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const caseId = sidebar.dataset.caseId;
      if (caseId) window.sendAiChat(caseId);
    });
    return sidebar;
  }

  function closeAiSidebar() {
    const sidebar = document.getElementById("ai-right-sidebar");
    const scrim = document.getElementById("ai-scrim");
    if (!sidebar) return;
    sidebar.classList.remove("open");
    sidebar.setAttribute("aria-hidden", "true");
    if (scrim) {
      scrim.classList.remove("open");
      setTimeout(() => { if (!sidebar.classList.contains("open")) scrim.hidden = true; }, 220);
    }
    document.body.classList.remove("ai-open");
  }

  function isAiSidebarOpen() {
    return Boolean(document.getElementById("ai-right-sidebar")?.classList.contains("open"));
  }

  window.openAiSidebar = function (caseId) {
    if (!state.session?.token) {
      toast("warning", "Sesi belum siap", "Silakan masuk kembali, lalu ulangi Analisa AI.");
      return;
    }
    const item = state.cases.find((entry) => entry.caseId === caseId);
    const sidebar = ensureAiSidebar();
    const scrim = document.getElementById("ai-scrim");
    const sameCase = sidebar.dataset.caseId === caseId;
    sidebar.dataset.caseId = caseId;

    document.getElementById("ai-drawer-title").textContent = item?.suspectName || caseId;
    document.getElementById("ai-drawer-sub").textContent = `${item?.courtCaseNumber || caseId}${item?.allegedArticle ? " · " + item.allegedArticle.slice(0, 80) : ""}`;

    scrim.hidden = false;
    requestAnimationFrame(() => {
      scrim.classList.add("open");
      sidebar.classList.add("open");
    });
    sidebar.setAttribute("aria-hidden", "false");
    document.body.classList.add("ai-open");

    if (sameCase && document.getElementById("ai-sidebar-result").childElementCount) return; // percakapan tetap
    document.getElementById("ai-chat-history").innerHTML = "";
    document.getElementById("ai-chat-divider").hidden = true;
    document.getElementById("ai-chat-input").value = "";
    runSidebarAnalysis(caseId, { force: false });
  };

  async function runSidebarAnalysis(caseId, { force }) {
    const token = ++aiRequestToken;
    const resultBox = document.getElementById("ai-sidebar-result");
    const rerun = document.getElementById("ai-rerun");
    resultBox.innerHTML = `
      <div class="ai-loading">
        <div class="skeleton" style="height:18px;width:60%"></div>
        <div class="skeleton" style="height:12px;width:92%"></div>
        <div class="skeleton" style="height:12px;width:80%"></div>
        <div class="skeleton" style="height:120px"></div>
        <p>${force ? "Menjalankan analisa baru" : "Memuat analisa"} untuk ${escapeHtml(caseId)}…</p>
      </div>`;
    if (rerun) rerun.disabled = true;
    try {
      let parsed = null;
      let meta = null;
      if (!force) {
        const history = await gasRequest("listCaseAnalyses", { caseId }, { silent: true, timeout: 30000 }).catch(() => ({ analyses: [] }));
        const latest = (history.analyses || [])[0];
        if (latest) { parsed = latest; meta = latest; }
      }
      if (!parsed) {
        const data = await gasRequest("analyzeCase", { caseId }, { timeout: 120000 });
        parsed = data.parsed;
        meta = data.analysis;
      }
      if (token !== aiRequestToken) return; // pengguna sudah membuka perkara lain
      renderAiAnalysisResult(parsed, meta, "ai-sidebar-result");
      document.getElementById("ai-chat-divider").hidden = false;
    } catch (error) {
      if (token !== aiRequestToken) return;
      resultBox.innerHTML = `<div class="ai-error"><strong>Analisa gagal</strong><p>${escapeHtml(error.message || String(error))}</p></div>`;
    } finally {
      if (rerun && token === aiRequestToken) rerun.disabled = false;
    }
  }

  async function runAiAnalysis(caseId) {
    const resultBox = document.getElementById("ai-analysis-result");
    const button = document.getElementById("ai-analyze-btn");
    if (!resultBox) return;
    if (button) { button.disabled = true; button.textContent = "Menganalisa…"; }
    resultBox.innerHTML = `<div class="ai-loading"><div class="skeleton" style="height:14px;width:70%"></div><div class="skeleton" style="height:90px"></div><p>Menghubungi AI, mohon tunggu…</p></div>`;
    try {
      const data = await gasRequest("analyzeCase", { caseId }, { timeout: 120000 });
      renderAiAnalysisResult(data.parsed, data.analysis);
    } catch (error) {
      resultBox.innerHTML = `<div class="ai-error"><strong>Analisa gagal</strong><p>${escapeHtml(error.message || String(error))}</p></div>`;
    } finally {
      if (button) { button.disabled = false; button.textContent = "✦ Jalankan analisa"; }
    }
  }

  async function loadExistingAiAnalyses(caseId) {
    const resultBox = document.getElementById("ai-analysis-result");
    if (!resultBox || resultBox.dataset.loadedFor === caseId) return;
    resultBox.dataset.loadedFor = caseId;
    try {
      const data = await gasRequest("listCaseAnalyses", { caseId }, { silent: true, timeout: 30000 });
      const latest = (data.analyses || [])[0];
      if (!document.body.contains(resultBox)) return;
      if (latest) {
        renderAiAnalysisResult(latest, latest);
        resultBox.insertAdjacentHTML("afterbegin", `<p class="case-muted">Hasil analisa terakhir · ${formatDateTime(latest.createdAt)}</p>`);
      } else {
        resultBox.innerHTML = `<p class="case-muted">Belum ada analisa untuk perkara ini. Tekan “Jalankan analisa”.</p>`;
      }
    } catch (error) {
      if (document.body.contains(resultBox)) resultBox.innerHTML = `<p class="case-muted">Riwayat analisa tidak dapat dimuat.</p>`;
    }
  }

  function renderAiAnalysisResult(parsed, meta, targetId = "ai-analysis-result") {
    const resultBox = document.getElementById(targetId);
    if (!resultBox || !parsed) return;

    const statusTone = (status) => {
      const value = String(status || "").toLowerCase();
      if (value.includes("belum")) return "red";
      if (value.includes("pendalaman")) return "amber";
      return "green";
    };
    const unsurList = (items) => (items || []).map((u) => `
      <li class="ai-unsur ${statusTone(u.status)}">
        <div><strong>${escapeHtml(u.unsur || "-")}</strong><span class="case-inline-badge ${statusTone(u.status)}">${escapeHtml(u.status || "-")}</span></div>
        ${u.keterangan ? `<p>${escapeHtml(u.keterangan)}</p>` : ""}
      </li>`).join("");
    const asasList = (items) => (items || []).map((a) => `<li><strong>${escapeHtml(a.asas || "-")}</strong> — ${escapeHtml(a.penjelasan || "")}</li>`).join("");
    const pasalList = (items) => (items || []).map((p) => `<li><strong>${escapeHtml(p.pasal || "-")}</strong> <span class="case-muted">(${escapeHtml(p.undangUndang || "-")})</span><br>${escapeHtml(p.alasan || "")}</li>`).join("");
    const jenis = parsed.jenisKasus && typeof parsed.jenisKasus === "object" ? parsed.jenisKasus : null;
    const korban = parsed.identifikasiKorban && typeof parsed.identifikasiKorban === "object" ? parsed.identifikasiKorban : null;

    resultBox.innerHTML = `
      <article class="ai-result">
        <div class="ai-summary">
          <span class="case-eyebrow">Kesimpulan</span>
          <p>${escapeHtml(parsed.kesimpulan || "-")}</p>
          <div class="ai-tags">
            ${jenis?.kategori ? `<span class="case-chip">Jenis: ${escapeHtml(jenis.kategori)}</span>` : ""}
            ${korban?.status ? `<span class="case-chip">Korban: ${escapeHtml(korban.status)}</span>` : ""}
          </div>
        </div>
        ${jenis?.penjelasan ? `<details class="ai-block" open><summary>Kualifikasi perkara</summary><p>${escapeHtml(jenis.penjelasan)}${jenis.referensiUU ? `<br><span class="case-muted">Rujukan: ${escapeHtml(jenis.referensiUU)}</span>` : ""}</p></details>` : ""}
        <details class="ai-block" open><summary>Unsur formil</summary><ul class="ai-unsur-list">${unsurList(parsed.unsurFormil) || "<li>-</li>"}</ul></details>
        <details class="ai-block" open><summary>Unsur materil</summary><ul class="ai-unsur-list">${unsurList(parsed.unsurMateril) || "<li>-</li>"}</ul></details>
        <details class="ai-block"><summary>Asas hukum relevan</summary><ul>${asasList(parsed.asasDilanggar) || "<li>-</li>"}</ul></details>
        <details class="ai-block"><summary>Pasal yang disarankan didalami</summary><ul>${pasalList(parsed.pasalDisarankan) || "<li>-</li>"}</ul></details>
        ${korban?.penjelasan ? `<details class="ai-block"><summary>Identifikasi korban</summary><p>${escapeHtml(korban.penjelasan)}</p></details>` : ""}
        <p class="ai-disclaimer">⚠ ${escapeHtml(parsed.catatanKehatihatian || "Hasil ini adalah draf pendukung prapenuntutan, bukan pengganti keputusan hukum Jaksa Peneliti.")}</p>
        ${meta && meta.model ? `<p class="case-muted small">Model ${escapeHtml(meta.model)}${meta.createdAt ? ` · ${formatDateTime(meta.createdAt)}` : ""}</p>` : ""}
      </article>`;
  }

  // --- CHAT BOX AI ---
  window.sendAiChat = async function (caseId) {
    const inputField = document.getElementById("ai-chat-input");
    const sendBtn = document.getElementById("ai-chat-btn");
    const chatHistory = document.getElementById("ai-chat-history");
    const scrollContainer = document.getElementById("ai-scroll-container");
    const message = inputField.value.trim();
    if (!message || sendBtn.disabled) return;

    inputField.value = "";
    sendBtn.disabled = true;
    sendBtn.textContent = "…";

    const formatMarkdown = (str) => {
      let html = escapeHtml(str);
      html = html.replace(/^###\s?(.*)$/gm, "<strong class=\"ai-h\">$1</strong>");
      html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      html = html.replace(/(^|[^*])\*(?!\s)(.+?)\*/g, "$1<em>$2</em>");
      html = html.replace(/^\s*[-•]\s+/gm, "• ");
      return html.replace(/\n/g, "<br>");
    };
    const scrollDown = () => scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: "smooth" });

    chatHistory.insertAdjacentHTML("beforeend", `<div class="ai-bubble user"><b>Anda</b><span>${formatMarkdown(message)}</span></div>`);
    const loadingId = `ai-loading-${Date.now()}`;
    chatHistory.insertAdjacentHTML("beforeend", `<div id="${loadingId}" class="ai-bubble bot typing"><span class="typing-dots"><i></i><i></i><i></i></span></div>`);
    scrollDown();

    try {
      const response = await gasRequest("chatAi", { caseId, message }, { timeout: 90000 });
      document.getElementById(loadingId)?.remove();
      if (document.getElementById("ai-right-sidebar")?.dataset.caseId !== caseId) return;
      chatHistory.insertAdjacentHTML("beforeend", `<div class="ai-bubble bot"><b>AI</b><span>${formatMarkdown(response.reply || "-")}</span></div>`);
    } catch (error) {
      document.getElementById(loadingId)?.remove();
      chatHistory.insertAdjacentHTML("beforeend", `<div class="ai-error"><strong>Sistem gagal</strong><p>${escapeHtml(error.message)}</p></div>`);
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = "Kirim";
      inputField.focus({ preventScroll: true });
      scrollDown();
    }
  };

})(); // === PENUTUP BLOK UTAMA APLIKASI (IIFE) HARUS BERADA DI SINI ===

// --- Kalkulasi otomatis tanggal akhir perpanjangan penahanan (T-4) ---
if (!window.__SIAP_T4_LISTENER__) window.__SIAP_T4_LISTENER__ = true, document.addEventListener('input', function(e) {
    const targetKey = e.target?.dataset?.fieldKey || e.target?.name || e.target?.id;

    if (targetKey === 'penahananDays' || targetKey === 'penahananStartDate') {
        const daysInput = document.querySelector('[data-field-key="penahananDays"], [name="penahananDays"], #penahananDays');
        const startDateInput = document.querySelector('[data-field-key="penahananStartDate"], [name="penahananStartDate"], #penahananStartDate');
        const endDateInput = document.querySelector('[data-field-key="penahananEndDate"], [name="penahananEndDate"], #penahananEndDate');

        if (daysInput && startDateInput && endDateInput) {
            const days = parseInt(daysInput.value, 10);
            const startDateVal = startDateInput.value;

            if (!isNaN(days) && startDateVal) {
                let startDate;
                
                const matchId = startDateVal.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
                if (matchId) {
                    startDate = new Date(matchId[3], matchId[2] - 1, matchId[1]);
                } else {
                    startDate = new Date(startDateVal);
                }
                
                if (!isNaN(startDate.getTime())) {
                    startDate.setDate(startDate.getDate() + (days - 1));

                    const year = startDate.getFullYear();
                    const month = String(startDate.getMonth() + 1).padStart(2, '0');
                    const day = String(startDate.getDate()).padStart(2, '0');

                    endDateInput.value = `${year}-${month}-${day}`;
                    
                    endDateInput.dispatchEvent(new Event('input', { bubbles: true }));
                    endDateInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        }
    }
});
