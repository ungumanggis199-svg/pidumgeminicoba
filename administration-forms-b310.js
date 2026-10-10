/*
 * SIAP PIDUM — skema form administrasi format B-310 (dibangkitkan otomatis dari template).
 * File ini dimuat SETELAH administration-forms.js dan SEBELUM app.js.
 * - Menambah skema form untuk jenis administrasi baru (tanpa mengubah skema lama).
 * - Menambah field tambahan untuk P-24 dan P-29 (varian anak/korporasi).
 * - window.SIAP_B310_STAGES   : daftar jenis administrasi tambahan (dikelompokkan per tahap).
 * - window.SIAP_B310_SHARED_KEYS : field yang boleh diisi otomatis dari administrasi lain pada perkara yang sama.
 */
(() => {
  "use strict";
  const base = window.SIAP_ADMIN_FORM_SCHEMAS || {};
  const extraSchemas = {
 "BA-4": {
  "title": "Berita Acara Penerimaan dan Penelitian Tersangka",
  "subtitle": "Format B-310 · Tahap II (tersangka & barang bukti)",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "birthPlace",
      "label": "Tempat lahir",
      "type": "text",
      "source": "case:birthPlace",
      "editableAuto": true
     },
     {
      "key": "birthDate",
      "label": "Tanggal lahir",
      "type": "date",
      "source": "case:birthDate",
      "editableAuto": true
     },
     {
      "key": "age",
      "label": "Umur",
      "type": "text",
      "source": "case:age",
      "editableAuto": true
     },
     {
      "key": "gender",
      "label": "Jenis kelamin",
      "type": "text",
      "source": "case:gender",
      "editableAuto": true
     },
     {
      "key": "nationality",
      "label": "Kebangsaan",
      "type": "text",
      "source": "case:nationality",
      "editableAuto": true
     },
     {
      "key": "address",
      "label": "Tempat tinggal",
      "type": "textarea",
      "source": "case:address",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "religion",
      "label": "Agama",
      "type": "text",
      "source": "case:religion",
      "editableAuto": true
     },
     {
      "key": "occupation",
      "label": "Pekerjaan",
      "type": "text",
      "source": "case:occupation",
      "editableAuto": true
     },
     {
      "key": "education",
      "label": "Pendidikan",
      "type": "text",
      "source": "case:education",
      "editableAuto": true
     },
     {
      "key": "suspectIdentityNumber",
      "label": "Nomor identitas (NIK)",
      "type": "text",
      "source": "case:suspectIdentityNumber",
      "editableAuto": true
     },
     {
      "key": "detentionStartDate",
      "label": "Penahanan mulai",
      "type": "date"
     },
     {
      "key": "detentionEndDate",
      "label": "Penahanan berakhir",
      "type": "date"
     },
     {
      "key": "extensionStartDate",
      "label": "Perpanjangan mulai",
      "type": "date"
     },
     {
      "key": "extensionEndDate",
      "label": "Perpanjangan berakhir",
      "type": "date"
     },
     {
      "key": "allegedArticle",
      "label": "Pasal yang disangkakan",
      "type": "textarea",
      "source": "case:allegedArticle",
      "editableAuto": true,
      "full": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "p16Number",
      "label": "Nomor P-16",
      "type": "text",
      "source": "admin:P-16:documentNumber|case:p16Number",
      "editableAuto": true
     },
     {
      "key": "p16Date",
      "label": "Tanggal P-16",
      "type": "date",
      "source": "admin:P-16:documentDate|case:p16Date",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian BA-4",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "hasAdvocate",
      "label": "Tersangka didampingi Advokat/Pemberi Bantuan Hukum",
      "type": "select",
      "options": [
       "Ya",
       "Tidak"
      ]
     },
     {
      "key": "investigatorLetterNumber",
      "label": "Nomor surat pengantar pengiriman tersangka dan barang bukti dari penyidik",
      "type": "text"
     },
     {
      "key": "investigatorLetterDate",
      "label": "Tanggal surat pengantar pengiriman tersangka dan barang bukti",
      "type": "date"
     },
     {
      "key": "advocateName",
      "label": "Nama Advokat",
      "type": "text"
     },
     {
      "key": "lawFirm",
      "label": "Kantor hukum Advokat",
      "type": "text"
     },
     {
      "key": "powerOfAttorneyNumber",
      "label": "Nomor Surat Kuasa Khusus",
      "type": "text"
     },
     {
      "key": "powerOfAttorneyDate",
      "label": "Tanggal Surat Kuasa Khusus",
      "type": "date"
     },
     {
      "key": "advocateRank",
      "label": "Keterangan Advokat (organisasi/kantor)",
      "type": "text"
     },
     {
      "key": "advocateNip",
      "label": "Nomor KTA/identitas Advokat",
      "type": "text"
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     }
    ]
   }
  ]
 },
 "BA-4A": {
  "title": "Berita Acara Pemenuhan Hak Bantuan Hukum pada Tahap Penuntutan",
  "subtitle": "Format B-310 · Tahap II (tersangka & barang bukti)",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "birthPlace",
      "label": "Tempat lahir",
      "type": "text",
      "source": "case:birthPlace",
      "editableAuto": true
     },
     {
      "key": "birthDate",
      "label": "Tanggal lahir",
      "type": "date",
      "source": "case:birthDate",
      "editableAuto": true
     },
     {
      "key": "gender",
      "label": "Jenis kelamin",
      "type": "text",
      "source": "case:gender",
      "editableAuto": true
     },
     {
      "key": "religion",
      "label": "Agama",
      "type": "text",
      "source": "case:religion",
      "editableAuto": true
     },
     {
      "key": "occupation",
      "label": "Pekerjaan",
      "type": "text",
      "source": "case:occupation",
      "editableAuto": true
     },
     {
      "key": "address",
      "label": "Tempat tinggal",
      "type": "textarea",
      "source": "case:address",
      "editableAuto": true,
      "full": true
     }
    ]
   },
   {
    "title": "Isian BA-4A",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "legalAidOption",
      "label": "Sikap tersangka (Opsi 1: menunjuk sendiri Advokat; Opsi 2: ditunjuk Penuntut Umum; Opsi 3: menolak didampingi)",
      "type": "select",
      "options": [
       "Opsi 1",
       "Opsi 2",
       "Opsi 3"
      ]
     },
     {
      "key": "advocateName",
      "label": "Nama Advokat",
      "type": "text"
     },
     {
      "key": "advocateOfficeAddress",
      "label": "Alamat kantor Advokat",
      "type": "text"
     },
     {
      "key": "legalAidOrganization",
      "label": "Asal LBH/Organisasi Advokat",
      "type": "text"
     },
     {
      "key": "refusalReason",
      "label": "Alasan penolakan didampingi Advokat",
      "type": "textarea",
      "full": true
     },
     {
      "key": "advocateRank",
      "label": "Keterangan Advokat (organisasi/kantor)",
      "type": "text"
     },
     {
      "key": "advocateNip",
      "label": "Nomor KTA/identitas Advokat",
      "type": "text"
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     }
    ]
   }
  ]
 },
 "BA-5": {
  "title": "Berita Acara Penerimaan dan Penelitian Benda Sitaan/Barang Bukti",
  "subtitle": "Format B-310 · Tahap II (tersangka & barang bukti)",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "allegedArticle",
      "label": "Pasal yang disangkakan",
      "type": "textarea",
      "source": "case:allegedArticle",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "evidence",
      "label": "Barang bukti",
      "type": "textarea",
      "source": "case:evidence",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "registerNumber",
      "label": "Nomor register perkara",
      "type": "text"
     },
     {
      "key": "investigatorName",
      "label": "Nama penyidik",
      "type": "text",
      "source": "case:investigatorName",
      "editableAuto": true
     },
     {
      "key": "investigatorRank",
      "label": "Pangkat penyidik",
      "type": "text",
      "source": "case:investigatorRank",
      "editableAuto": true
     },
     {
      "key": "investigatorNipNrp",
      "label": "NRP/NIP penyidik",
      "type": "text",
      "source": "case:investigatorNipNrp",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "p16Number",
      "label": "Nomor P-16",
      "type": "text",
      "source": "admin:P-16:documentNumber|case:p16Number",
      "editableAuto": true
     },
     {
      "key": "p16Date",
      "label": "Tanggal P-16",
      "type": "date",
      "source": "admin:P-16:documentDate|case:p16Date",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian BA-5",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "investigatorLetterNumber",
      "label": "Nomor surat pengantar pengiriman tersangka dan barang bukti dari penyidik",
      "type": "text"
     },
     {
      "key": "investigatorLetterDate",
      "label": "Tanggal surat pengantar pengiriman tersangka dan barang bukti",
      "type": "date"
     },
     {
      "key": "evidenceCheckResult",
      "label": "Hasil pencocokan barang bukti",
      "type": "select",
      "options": [
       "SESUAI",
       "TIDAK SESUAI",
       "KURANG"
      ]
     },
     {
      "key": "seizedItemRegisterNumber",
      "label": "No. register benda sitaan",
      "type": "text"
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "member1Name",
      "label": "Anggota tim 1",
      "type": "text",
      "source": "admin:P-16:field:member1Name",
      "editableAuto": true
     },
     {
      "key": "witness1Name",
      "label": "Witness1 name",
      "type": "text"
     },
     {
      "key": "witness2Name",
      "label": "Witness2 name",
      "type": "text"
     }
    ]
   }
  ]
 },
 "BA-5A": {
  "title": "Nota Pendapat Hasil Penyerahan Tersangka dan Barang Bukti",
  "subtitle": "Format B-310 · Tahap II (tersangka & barang bukti)",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "investigatorInstitution",
      "label": "Instansi penyidik",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     },
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "allegedArticle",
      "label": "Pasal yang disangkakan",
      "type": "textarea",
      "source": "case:allegedArticle",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "detentionType",
      "label": "Jenis penahanan",
      "type": "select",
      "options": [
       "Rutan",
       "Rumah",
       "Kota"
      ]
     },
     {
      "key": "detentionPlace",
      "label": "Tempat penahanan",
      "type": "text"
     },
     {
      "key": "detentionStartDate",
      "label": "Penahanan mulai",
      "type": "date"
     },
     {
      "key": "detentionEndDate",
      "label": "Penahanan berakhir",
      "type": "date"
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "p16Number",
      "label": "Nomor P-16",
      "type": "text",
      "source": "admin:P-16:documentNumber|case:p16Number",
      "editableAuto": true
     },
     {
      "key": "p16Date",
      "label": "Tanggal P-16",
      "type": "date",
      "source": "admin:P-16:documentDate|case:p16Date",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian BA-5A",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "personalAssessmentNeeded",
      "label": "Perlu Penilaian Personal (disabilitas)",
      "type": "select",
      "options": [
       "Ya",
       "Tidak"
      ]
     },
     {
      "key": "detentionNeeded",
      "label": "Pendapat penahanan tahap penuntutan",
      "type": "select",
      "options": [
       "PERLU",
       "TIDAK PERLU"
      ]
     },
     {
      "key": "identityMatch",
      "label": "Identitas tersangka sesuai berkas & kartu identitas",
      "type": "select",
      "options": [
       "SESUAI",
       "TIDAK SESUAI"
      ]
     },
     {
      "key": "suspectHealth",
      "label": "Kondisi kesehatan tersangka",
      "type": "select",
      "options": [
       "SEHAT",
       "SAKIT"
      ]
     },
     {
      "key": "suspectAdmission",
      "label": "Sikap tersangka atas perbuatannya",
      "type": "select",
      "options": [
       "MENGAKUI",
       "TIDAK MENGAKUI"
      ]
     },
     {
      "key": "statementMatch",
      "label": "Keterangan tersangka sesuai BAP Penyidik",
      "type": "select",
      "options": [
       "SESUAI",
       "TIDAK SESUAI"
      ]
     },
     {
      "key": "statementNotes",
      "label": "Catatan jika keterangan tidak sesuai",
      "type": "textarea",
      "full": true
     },
     {
      "key": "personalAssessmentReason",
      "label": "Alasan perlu/tidak perlu Penilaian Personal",
      "type": "textarea",
      "full": true
     },
     {
      "key": "personalAssessor",
      "label": "Penilaian Personal dilakukan oleh",
      "type": "select",
      "options": [
       "Dokter",
       "Tenaga Kesehatan Lainnya",
       "Psikolog",
       "Psikiater",
       "Lainnya"
      ]
     },
     {
      "key": "objectiveGround",
      "label": "Syarat objektif penahanan",
      "type": "select",
      "options": [
       "Tindak pidana yang disangkakan diancam dengan pidana penjara 5 (lima) tahun atau lebih.",
       "Tindak pidana yang disangkakan termasuk dalam pasal-pasal tertentu yang diatur dalam Pasal 100 ayat (2) UU No. 20 Tahun 2025 (seperti tindak pidana keimigrasian, perjudian, penganiayaan, dll), meskipun ancamannya kurang dari 5 tahun."
      ]
     },
     {
      "key": "evidenceMatch",
      "label": "Barang bukti sesuai daftar penyitaan",
      "type": "select",
      "options": [
       "SESUAI",
       "TIDAK SESUAI"
      ]
     },
     {
      "key": "evidenceCondition",
      "label": "Kondisi barang bukti",
      "type": "select",
      "options": [
       "BAIK",
       "RUSAK SEBAGIAN",
       "RUSAK KESELURUHAN"
      ]
     },
     {
      "key": "evidenceConditionNotes",
      "label": "Catatan kondisi barang bukti (jika tidak baik)",
      "type": "textarea",
      "full": true
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     }
    ]
   }
  ]
 },
 "BA-5C": {
  "title": "Berita Acara Serah Terima Pengelolaan Fisik Benda Sitaan/Barang Bukti",
  "subtitle": "Format B-310 · Tahap II (tersangka & barang bukti)",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "p16Number",
      "label": "Nomor P-16",
      "type": "text",
      "source": "admin:P-16:documentNumber|case:p16Number",
      "editableAuto": true
     },
     {
      "key": "p16Date",
      "label": "Tanggal P-16",
      "type": "date",
      "source": "admin:P-16:documentDate|case:p16Date",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian BA-5C",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "ba5Date",
      "label": "Tanggal BA-5 (Penerimaan dan Penelitian Barang Bukti)",
      "type": "date"
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "receiverName",
      "label": "Receiver name",
      "type": "text"
     },
     {
      "key": "receiverRank",
      "label": "Receiver rank",
      "type": "text"
     },
     {
      "key": "receiverNip",
      "label": "Receiver nip",
      "type": "text"
     }
    ]
   }
  ]
 },
 "P-18": {
  "title": "Surat Pengantar Pengembalian Berkas Perkara untuk Dilengkapi",
  "subtitle": "Format B-310 · Penelitian berkas & gelar perkara",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     },
     {
      "key": "recipientTitle",
      "label": "Pejabat yang dituju (Yth.)",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     },
     {
      "key": "recipientPlace",
      "label": "Tempat tujuan (Di –)",
      "type": "text"
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian P-18",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "attentionOf",
      "label": "U.p.",
      "type": "select",
      "options": [
       "Penyidik",
       "Atasan Penyidik"
      ]
     }
    ]
   }
  ]
 },
 "P-1A": {
  "title": "Tanda Terima Penerimaan SPDP",
  "subtitle": "Format B-310 · Penerimaan SPDP",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     },
     {
      "key": "documentTime",
      "label": "Jam (contoh: 10.00)",
      "type": "text"
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "investigatorInstitution",
      "label": "Instansi penyidik",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     },
     {
      "key": "spdpNumber",
      "label": "Nomor SPDP",
      "type": "text",
      "source": "case:spdpNumber",
      "editableAuto": true
     },
     {
      "key": "spdpDate",
      "label": "Tanggal SPDP",
      "type": "date",
      "source": "case:spdpDate",
      "editableAuto": true
     },
     {
      "key": "sprindikNumber",
      "label": "Nomor Sprindik",
      "type": "text",
      "source": "case:sprindikNumber",
      "editableAuto": true
     },
     {
      "key": "sprindikDate",
      "label": "Tanggal Sprindik",
      "type": "date",
      "source": "case:sprindikDate",
      "editableAuto": true
     },
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "allegedArticle",
      "label": "Pasal yang disangkakan",
      "type": "textarea",
      "source": "case:allegedArticle",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "investigatorName",
      "label": "Nama penyidik",
      "type": "text",
      "source": "case:investigatorName",
      "editableAuto": true
     },
     {
      "key": "investigatorRank",
      "label": "Pangkat penyidik",
      "type": "text",
      "source": "case:investigatorRank",
      "editableAuto": true
     },
     {
      "key": "investigatorNipNrp",
      "label": "NRP/NIP penyidik",
      "type": "text",
      "source": "case:investigatorNipNrp",
      "editableAuto": true
     },
     {
      "key": "receivedDate",
      "label": "Tanggal SPDP diterima",
      "type": "date",
      "source": "case:receivedDate",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian P-1A",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "receiverPosition",
      "label": "Jabatan penerima",
      "type": "select",
      "options": [
       "Kabag TU",
       "Kasubbag Bin",
       "Kaur Bin"
      ]
     },
     {
      "key": "suspectStatus",
      "label": "Status",
      "type": "select",
      "options": [
       "Tersangka",
       "Terlapor"
      ]
     },
     {
      "key": "dayDifference",
      "label": "Selisih hari Sprindik ke penerimaan SPDP",
      "type": "number"
     },
     {
      "key": "timelinessStatus",
      "label": "Ketepatan waktu",
      "type": "select",
      "options": [
       "< 7 Hari",
       "> 7 Hari"
      ]
     },
     {
      "key": "equivalenceCompliant",
      "label": "Sesuai dengan kesetaraan",
      "type": "select",
      "options": [
       "Ya",
       "Tidak"
      ]
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "receiverName",
      "label": "Receiver name",
      "type": "text"
     },
     {
      "key": "receiverRank",
      "label": "Receiver rank",
      "type": "text"
     },
     {
      "key": "receiverNip",
      "label": "Receiver nip",
      "type": "text"
     }
    ]
   }
  ]
 },
 "P-1B": {
  "title": "Tanda Terima Penerimaan Berkas Perkara",
  "subtitle": "Format B-310 · Penerimaan berkas (Tahap I)",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     },
     {
      "key": "documentTime",
      "label": "Jam (contoh: 10.00)",
      "type": "text"
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "investigatorInstitution",
      "label": "Instansi penyidik",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     },
     {
      "key": "investigatorName",
      "label": "Nama penyidik",
      "type": "text",
      "source": "case:investigatorName",
      "editableAuto": true
     },
     {
      "key": "investigatorRank",
      "label": "Pangkat penyidik",
      "type": "text",
      "source": "case:investigatorRank",
      "editableAuto": true
     },
     {
      "key": "investigatorNipNrp",
      "label": "NRP/NIP penyidik",
      "type": "text",
      "source": "case:investigatorNipNrp",
      "editableAuto": true
     },
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "allegedArticle",
      "label": "Pasal yang disangkakan",
      "type": "textarea",
      "source": "case:allegedArticle",
      "editableAuto": true,
      "full": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "dossierNumber",
      "label": "Nomor berkas perkara",
      "type": "text",
      "source": "case:nomorBerkas",
      "editableAuto": true
     },
     {
      "key": "dossierDate",
      "label": "Tanggal berkas perkara",
      "type": "date",
      "source": "case:tanggalBerkas",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian P-1B",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "dossierKind",
      "label": "Jenis berkas perkara",
      "type": "select",
      "options": [
       "Hasil Penyidikan",
       "Hasil Penyidikan Tambahan",
       "Sebagai Tindak Lanjut Hasil Gelar Perkara Bersama"
      ]
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "receiverName",
      "label": "Receiver name",
      "type": "text"
     },
     {
      "key": "receiverRank",
      "label": "Receiver rank",
      "type": "text"
     },
     {
      "key": "receiverNip",
      "label": "Receiver nip",
      "type": "text"
     }
    ]
   }
  ]
 },
 "P-1C": {
  "title": "Tanda Terima Penyerahan Berkas Perkara untuk Dilengkapi",
  "subtitle": "Format B-310 · Penelitian berkas & gelar perkara",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     },
     {
      "key": "documentTime",
      "label": "Jam (contoh: 10.00)",
      "type": "text"
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "investigatorInstitution",
      "label": "Instansi penyidik",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     },
     {
      "key": "investigatorName",
      "label": "Nama penyidik",
      "type": "text",
      "source": "case:investigatorName",
      "editableAuto": true
     },
     {
      "key": "investigatorRank",
      "label": "Pangkat penyidik",
      "type": "text",
      "source": "case:investigatorRank",
      "editableAuto": true
     },
     {
      "key": "investigatorNipNrp",
      "label": "NRP/NIP penyidik",
      "type": "text",
      "source": "case:investigatorNipNrp",
      "editableAuto": true
     },
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "allegedArticle",
      "label": "Pasal yang disangkakan",
      "type": "textarea",
      "source": "case:allegedArticle",
      "editableAuto": true,
      "full": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "dossierNumber",
      "label": "Nomor berkas perkara",
      "type": "text",
      "source": "case:nomorBerkas",
      "editableAuto": true
     },
     {
      "key": "dossierDate",
      "label": "Tanggal berkas perkara",
      "type": "date",
      "source": "case:tanggalBerkas",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     }
    ]
   }
  ]
 },
 "P-20": {
  "title": "Pengembalian SPDP karena Batas Waktu Penyidikan Tambahan Telah Lampau",
  "subtitle": "Format B-310 · Penelitian berkas & gelar perkara",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     },
     {
      "key": "recipientTitle",
      "label": "Pejabat yang dituju (Yth.)",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     },
     {
      "key": "recipientPlace",
      "label": "Tempat tujuan (Di –)",
      "type": "text"
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "spdpNumber",
      "label": "Nomor SPDP",
      "type": "text",
      "source": "case:spdpNumber",
      "editableAuto": true
     },
     {
      "key": "spdpDate",
      "label": "Tanggal SPDP",
      "type": "date",
      "source": "case:spdpDate",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "p19Number",
      "label": "Nomor P-19",
      "type": "text",
      "source": "admin:P-19:documentNumber|case:p19Number",
      "editableAuto": true
     },
     {
      "key": "p19Date",
      "label": "Tanggal P-19",
      "type": "date",
      "source": "admin:P-19:documentDate|case:p19Date",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian P-20",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "attentionOf",
      "label": "U.p.",
      "type": "select",
      "options": [
       "Penyidik",
       "Atasan Penyidik"
      ]
     },
     {
      "key": "p19ReceivedDate",
      "label": "Tanggal P-18/P-19 diterima Penyidik",
      "type": "date"
     }
    ]
   }
  ]
 },
 "P-24B": {
  "title": "Nota Pendapat Verifikasi SPDP dan Berkas Perkara",
  "subtitle": "Format B-310 · Tahap II (tersangka & barang bukti)",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "spdpNumber",
      "label": "Nomor SPDP",
      "type": "text",
      "source": "case:spdpNumber",
      "editableAuto": true
     },
     {
      "key": "spdpDate",
      "label": "Tanggal SPDP",
      "type": "date",
      "source": "case:spdpDate",
      "editableAuto": true
     },
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "birthPlace",
      "label": "Tempat lahir",
      "type": "text",
      "source": "case:birthPlace",
      "editableAuto": true
     },
     {
      "key": "age",
      "label": "Umur",
      "type": "text",
      "source": "case:age",
      "editableAuto": true
     },
     {
      "key": "birthDate",
      "label": "Tanggal lahir",
      "type": "date",
      "source": "case:birthDate",
      "editableAuto": true
     },
     {
      "key": "gender",
      "label": "Jenis kelamin",
      "type": "text",
      "source": "case:gender",
      "editableAuto": true
     },
     {
      "key": "nationality",
      "label": "Kebangsaan",
      "type": "text",
      "source": "case:nationality",
      "editableAuto": true
     },
     {
      "key": "address",
      "label": "Tempat tinggal",
      "type": "textarea",
      "source": "case:address",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "religion",
      "label": "Agama",
      "type": "text",
      "source": "case:religion",
      "editableAuto": true
     },
     {
      "key": "occupation",
      "label": "Pekerjaan",
      "type": "text",
      "source": "case:occupation",
      "editableAuto": true
     },
     {
      "key": "education",
      "label": "Pendidikan",
      "type": "text",
      "source": "case:education",
      "editableAuto": true
     },
     {
      "key": "caseSummary",
      "label": "Kasus posisi / ringkasan perkara",
      "type": "textarea",
      "source": "case:caseSummary",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "allegedArticle",
      "label": "Pasal yang disangkakan",
      "type": "textarea",
      "source": "case:allegedArticle",
      "editableAuto": true,
      "full": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "p16Number",
      "label": "Nomor P-16",
      "type": "text",
      "source": "admin:P-16:documentNumber|case:p16Number",
      "editableAuto": true
     },
     {
      "key": "p16Date",
      "label": "Tanggal P-16",
      "type": "date",
      "source": "admin:P-16:documentDate|case:p16Date",
      "editableAuto": true
     },
     {
      "key": "dossierNumber",
      "label": "Nomor berkas perkara",
      "type": "text",
      "source": "case:nomorBerkas",
      "editableAuto": true
     },
     {
      "key": "dossierDate",
      "label": "Tanggal berkas perkara",
      "type": "date",
      "source": "case:tanggalBerkas",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian P-24B",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "verificationResult",
      "label": "Hasil verifikasi",
      "type": "select",
      "options": [
       "Sesuai",
       "Tidak Sesuai"
      ]
     },
     {
      "key": "crimeElements",
      "label": "Uraian unsur tindak pidana",
      "type": "textarea",
      "full": true
     },
     {
      "key": "criminalThreat",
      "label": "Ancaman pidana",
      "type": "text"
     },
     {
      "key": "archivedDossierNumber",
      "label": "Nomor berkas perkara pembanding (arsip P-21)",
      "type": "text"
     },
     {
      "key": "archivedDossierDate",
      "label": "Tanggal berkas perkara pembanding (arsip P-21)",
      "type": "date"
     },
     {
      "key": "verificationDiscrepancies",
      "label": "Penjelasan ketidaksesuaian",
      "type": "textarea",
      "full": true
     },
     {
      "key": "kasiPidumOpinion",
      "label": "Pendapat Kasi Pidum",
      "type": "textarea",
      "full": true
     },
     {
      "key": "kajariInstruction",
      "label": "Petunjuk Kepala Kejaksaan Negeri",
      "type": "textarea",
      "full": true
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "member1Name",
      "label": "Anggota tim 1",
      "type": "text",
      "source": "admin:P-16:field:member1Name",
      "editableAuto": true
     }
    ]
   }
  ]
 },
 "P-30": {
  "title": "Catatan Penuntut Umum",
  "subtitle": "Format B-310 · Penuntutan",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "registerNumber",
      "label": "Nomor register perkara",
      "type": "text"
     },
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "suspectIdentityNumber",
      "label": "Nomor identitas (NIK)",
      "type": "text",
      "source": "case:suspectIdentityNumber",
      "editableAuto": true
     },
     {
      "key": "birthPlace",
      "label": "Tempat lahir",
      "type": "text",
      "source": "case:birthPlace",
      "editableAuto": true
     },
     {
      "key": "age",
      "label": "Umur",
      "type": "text",
      "source": "case:age",
      "editableAuto": true
     },
     {
      "key": "birthDate",
      "label": "Tanggal lahir",
      "type": "date",
      "source": "case:birthDate",
      "editableAuto": true
     },
     {
      "key": "gender",
      "label": "Jenis kelamin",
      "type": "text",
      "source": "case:gender",
      "editableAuto": true
     },
     {
      "key": "nationality",
      "label": "Kebangsaan",
      "type": "text",
      "source": "case:nationality",
      "editableAuto": true
     },
     {
      "key": "address",
      "label": "Tempat tinggal",
      "type": "textarea",
      "source": "case:address",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "religion",
      "label": "Agama",
      "type": "text",
      "source": "case:religion",
      "editableAuto": true
     },
     {
      "key": "occupation",
      "label": "Pekerjaan",
      "type": "text",
      "source": "case:occupation",
      "editableAuto": true
     },
     {
      "key": "education",
      "label": "Pendidikan",
      "type": "text",
      "source": "case:education",
      "editableAuto": true
     },
     {
      "key": "detentionType",
      "label": "Jenis penahanan",
      "type": "select",
      "options": [
       "Rutan",
       "Rumah",
       "Kota"
      ]
     },
     {
      "key": "detentionStartDate",
      "label": "Penahanan mulai",
      "type": "date"
     },
     {
      "key": "detentionEndDate",
      "label": "Penahanan berakhir",
      "type": "date"
     },
     {
      "key": "extensionStartDate",
      "label": "Perpanjangan mulai",
      "type": "date"
     },
     {
      "key": "extensionEndDate",
      "label": "Perpanjangan berakhir",
      "type": "date"
     }
    ]
   },
   {
    "title": "Isian P-30",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "defendantType",
      "label": "Jenis pelaku",
      "type": "select",
      "options": [
       "Orang Dewasa",
       "Anak"
      ]
     },
     {
      "key": "otherDefendantsIdentity",
      "label": "Identitas Terdakwa/Anak lainnya (jika ada)",
      "type": "textarea",
      "full": true
     },
     {
      "key": "arrestStartDate",
      "label": "Penangkapan oleh Penyidik sejak tanggal",
      "type": "date"
     },
     {
      "key": "arrestEndDate",
      "label": "Penangkapan oleh Penyidik s/d tanggal",
      "type": "date"
     },
     {
      "key": "invTransferDate",
      "label": "Pengalihan penahanan oleh Penyidik tanggal",
      "type": "date"
     },
     {
      "key": "invSuspensionDate",
      "label": "Penangguhan penahanan oleh Penyidik tanggal",
      "type": "date"
     },
     {
      "key": "invSuspensionRevokeDate",
      "label": "Pencabutan penangguhan oleh Penyidik tanggal",
      "type": "date"
     },
     {
      "key": "invHospitalStartDate",
      "label": "Pembantaran oleh Penyidik sejak tanggal",
      "type": "date"
     },
     {
      "key": "invHospitalEndDate",
      "label": "Pembantaran oleh Penyidik s/d tanggal",
      "type": "date"
     },
     {
      "key": "invReleaseDate",
      "label": "Dikeluarkan dari tahanan oleh Penyidik tanggal",
      "type": "date"
     },
     {
      "key": "extensionDetentionType",
      "label": "Jenis tahanan perpanjangan Penuntut Umum",
      "type": "select",
      "options": [
       "Rutan",
       "Kota",
       "Rumah"
      ]
     },
     {
      "key": "court1ExtType",
      "label": "Jenis tahanan perpanjangan Ketua PN I (tahap penyidikan)",
      "type": "select",
      "options": [
       "Rutan",
       "Kota",
       "Rumah"
      ]
     },
     {
      "key": "court1ExtStartDate",
      "label": "Perpanjangan Ketua PN I (tahap penyidikan) sejak tanggal",
      "type": "date"
     },
     {
      "key": "court1ExtEndDate",
      "label": "Perpanjangan Ketua PN I (tahap penyidikan) s/d tanggal",
      "type": "date"
     },
     {
      "key": "court2ExtType",
      "label": "Jenis tahanan perpanjangan Ketua PN II (tahap penyidikan)",
      "type": "select",
      "options": [
       "Rutan",
       "Kota",
       "Rumah"
      ]
     },
     {
      "key": "court2ExtStartDate",
      "label": "Perpanjangan Ketua PN II (tahap penyidikan) sejak tanggal",
      "type": "date"
     },
     {
      "key": "court2ExtEndDate",
      "label": "Perpanjangan Ketua PN II (tahap penyidikan) s/d tanggal",
      "type": "date"
     },
     {
      "key": "puDetentionType",
      "label": "Jenis tahanan oleh Penuntut Umum",
      "type": "select",
      "options": [
       "Rutan",
       "Kota",
       "Rumah"
      ]
     },
     {
      "key": "puDetentionStartDate",
      "label": "Penahanan oleh Penuntut Umum sejak tanggal",
      "type": "date"
     },
     {
      "key": "puDetentionEndDate",
      "label": "Penahanan oleh Penuntut Umum s/d tanggal",
      "type": "date"
     },
     {
      "key": "puTransferDate",
      "label": "Pengalihan penahanan oleh Penuntut Umum tanggal",
      "type": "date"
     },
     {
      "key": "puSuspensionDate",
      "label": "Penangguhan penahanan oleh Penuntut Umum tanggal",
      "type": "date"
     },
     {
      "key": "puSuspensionRevokeDate",
      "label": "Pencabutan penangguhan oleh Penuntut Umum tanggal",
      "type": "date"
     },
     {
      "key": "puHospitalStartDate",
      "label": "Pembantaran oleh Penuntut Umum sejak tanggal",
      "type": "date"
     },
     {
      "key": "puHospitalEndDate",
      "label": "Pembantaran oleh Penuntut Umum s/d tanggal",
      "type": "date"
     },
     {
      "key": "puReleaseDate",
      "label": "Dikeluarkan dari tahanan oleh Penuntut Umum tanggal",
      "type": "date"
     },
     {
      "key": "puCourtExtType",
      "label": "Jenis tahanan perpanjangan Ketua PN (tahap penuntutan)",
      "type": "select",
      "options": [
       "Rutan",
       "Kota",
       "Rumah"
      ]
     },
     {
      "key": "puCourtExtStartDate",
      "label": "Perpanjangan Ketua PN (tahap penuntutan) sejak tanggal",
      "type": "date"
     },
     {
      "key": "puCourtExtEndDate",
      "label": "Perpanjangan Ketua PN (tahap penuntutan) s/d tanggal",
      "type": "date"
     },
     {
      "key": "puCourt1ExtType",
      "label": "Jenis tahanan perpanjangan Ketua PN I (tahap penuntutan)",
      "type": "select",
      "options": [
       "Rutan",
       "Kota",
       "Rumah"
      ]
     },
     {
      "key": "puCourt1ExtStartDate",
      "label": "Perpanjangan Ketua PN I (tahap penuntutan) sejak tanggal",
      "type": "date"
     },
     {
      "key": "puCourt1ExtEndDate",
      "label": "Perpanjangan Ketua PN I (tahap penuntutan) s/d tanggal",
      "type": "date"
     },
     {
      "key": "puCourt2ExtType",
      "label": "Jenis tahanan perpanjangan Ketua PN II (tahap penuntutan)",
      "type": "select",
      "options": [
       "Rutan",
       "Kota",
       "Rumah"
      ]
     },
     {
      "key": "puCourt2ExtStartDate",
      "label": "Perpanjangan Ketua PN II (tahap penuntutan) sejak tanggal",
      "type": "date"
     },
     {
      "key": "puCourt2ExtEndDate",
      "label": "Perpanjangan Ketua PN II (tahap penuntutan) s/d tanggal",
      "type": "date"
     },
     {
      "key": "otherDefendantsDetention",
      "label": "Status penangkapan dan penahanan Terdakwa/Anak lainnya (jika ada)",
      "type": "textarea",
      "full": true
     },
     {
      "key": "childInvDetentionPlace",
      "label": "Tempat penahanan Anak oleh Penyidik",
      "type": "select",
      "options": [
       "LPAS",
       "LPKS"
      ]
     },
     {
      "key": "childExtDetentionPlace",
      "label": "Tempat penahanan Anak perpanjangan Penuntut Umum",
      "type": "select",
      "options": [
       "LPAS",
       "LPKS"
      ]
     },
     {
      "key": "childPuDetentionPlace",
      "label": "Tempat penahanan Anak oleh Penuntut Umum",
      "type": "select",
      "options": [
       "LPAS",
       "LPKS"
      ]
     },
     {
      "key": "childCourtExtPlace",
      "label": "Tempat penahanan Anak perpanjangan Ketua PN",
      "type": "select",
      "options": [
       "LPAS",
       "LPKS"
      ]
     },
     {
      "key": "chargedOffenseNotes",
      "label": "Catatan tindak pidana yang didakwakan",
      "type": "textarea",
      "full": true
     },
     {
      "key": "kasiPidumOpinion",
      "label": "Pendapat Kasi Pidum",
      "type": "textarea",
      "full": true
     },
     {
      "key": "kajariInstruction",
      "label": "Petunjuk Kepala Kejaksaan Negeri",
      "type": "textarea",
      "full": true
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     }
    ]
   }
  ]
 },
 "PRAPID-1": {
  "title": "Surat Perintah Penugasan Penuntut Umum untuk Menghadiri Persidangan Praperadilan",
  "subtitle": "Format B-310 · Praperadilan",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian PRAPID-1",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "applicantName",
      "label": "Nama Pemohon Praperadilan",
      "type": "text"
     },
     {
      "key": "pretrialRegisterNumber",
      "label": "Nomor register perkara praperadilan",
      "type": "text"
     },
     {
      "key": "pretrialRegisterDate",
      "label": "Tanggal register perkara praperadilan",
      "type": "date"
     },
     {
      "key": "specialPowerNumber",
      "label": "Nomor Surat Kuasa Khusus (PRAPID-1A)",
      "type": "text"
     },
     {
      "key": "specialPowerDate",
      "label": "Tanggal Surat Kuasa Khusus",
      "type": "date"
     },
     {
      "key": "member1Position",
      "label": "Jabatan Jaksa kedua",
      "type": "text"
     },
     {
      "key": "respondentRole",
      "label": "Kedudukan dalam praperadilan",
      "type": "select",
      "options": [
       "Termohon",
       "Turut Termohon",
       "Kuasa Termohon",
       "Kuasa Turut Termohon"
      ]
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorPosition",
      "label": "Jabatan Penuntut Umum",
      "type": "text"
     },
     {
      "key": "member1Name",
      "label": "Anggota tim 1",
      "type": "text",
      "source": "admin:P-16:field:member1Name",
      "editableAuto": true
     }
    ]
   }
  ]
 },
 "PRAPID-1A": {
  "title": "Surat Kuasa Khusus Praperadilan",
  "subtitle": "Format B-310 · Praperadilan",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian PRAPID-1A",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "kuasaOption",
      "label": "Pilihan format (Opsi 1: Termohon/Turut Termohon dalam sidang praperadilan; Opsi 2: Perlawanan Pihak Ketiga atas Putusan Praperadilan)",
      "type": "select",
      "options": [
       "Opsi 1",
       "Opsi 2"
      ]
     },
     {
      "key": "respondentRole",
      "label": "Kedudukan Pemberi Kuasa",
      "type": "select",
      "options": [
       "TERMOHON",
       "TURUT TERMOHON",
       "PELAWAN"
      ]
     },
     {
      "key": "member1Position",
      "label": "Jabatan Penerima Kuasa kedua",
      "type": "text"
     },
     {
      "key": "pretrialRegisterNumber",
      "label": "Nomor perkara praperadilan",
      "type": "text"
     },
     {
      "key": "applicantName",
      "label": "Nama Pemohon Praperadilan",
      "type": "text"
     },
     {
      "key": "applicantAddress",
      "label": "Alamat Pemohon Praperadilan",
      "type": "text"
     },
     {
      "key": "policeInstitution",
      "label": "Kepolisian (Terlawan II, mis. Resor Muna)",
      "type": "text"
     },
     {
      "key": "investigatorUnit",
      "label": "Penyidik (Terlawan II)",
      "type": "text"
     },
     {
      "key": "policeAddress",
      "label": "Alamat Terlawan II",
      "type": "text"
     },
     {
      "key": "courtDecisionNumber",
      "label": "Nomor putusan praperadilan",
      "type": "text"
     },
     {
      "key": "courtDecisionDate",
      "label": "Tanggal putusan praperadilan",
      "type": "date"
     },
     {
      "key": "highCourtName",
      "label": "Pengadilan Tinggi",
      "type": "text"
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorPosition",
      "label": "Jabatan Penuntut Umum",
      "type": "text"
     },
     {
      "key": "member1Name",
      "label": "Anggota tim 1",
      "type": "text",
      "source": "admin:P-16:field:member1Name",
      "editableAuto": true
     }
    ]
   }
  ]
 },
 "PRAPID-1B": {
  "title": "Jawaban/Tanggapan Termohon dalam Perkara Praperadilan",
  "subtitle": "Format B-310 · Praperadilan",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian PRAPID-1B",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "includeException",
      "label": "Ajukan eksepsi",
      "type": "select",
      "options": [
       "Ya",
       "Tidak"
      ]
     },
     {
      "key": "respondentRole",
      "label": "Kedudukan Kejaksaan",
      "type": "select",
      "options": [
       "Termohon",
       "Turut Termohon"
      ]
     },
     {
      "key": "pretrialRegisterNumber",
      "label": "Nomor register perkara praperadilan",
      "type": "text"
     },
     {
      "key": "applicantName",
      "label": "Nama Pemohon Praperadilan",
      "type": "text"
     },
     {
      "key": "specialPowerNumber",
      "label": "Nomor Surat Kuasa Khusus (PRAPID-1A)",
      "type": "text"
     },
     {
      "key": "specialPowerDate",
      "label": "Tanggal Surat Kuasa Khusus",
      "type": "date"
     },
     {
      "key": "prapid1Number",
      "label": "Nomor Surat Perintah (PRAPID-1)",
      "type": "text"
     },
     {
      "key": "prapid1Date",
      "label": "Tanggal Surat Perintah (PRAPID-1)",
      "type": "date"
     },
     {
      "key": "exceptionJurisdiction",
      "label": "Dalil Pemohon yang bukan objek praperadilan",
      "type": "textarea",
      "full": true
     },
     {
      "key": "obscuurLibelMatter",
      "label": "Hal yang tidak jelas dalam permohonan (obscuur libel)",
      "type": "textarea",
      "full": true
     },
     {
      "key": "pretrialObject",
      "label": "Objek praperadilan",
      "type": "select",
      "options": [
       "Penetapan Tersangka",
       "Penahanan",
       "Penangkapan",
       "Penggeledahan",
       "Penyitaan",
       "Penghentian Penyidikan",
       "Penghentian Penuntutan"
      ]
     },
     {
      "key": "decreeName",
      "label": "Surat Ketetapan yang diterbitkan Termohon",
      "type": "text"
     },
     {
      "key": "evidenceList",
      "label": "Alat bukti yang sah yang dimiliki",
      "type": "textarea",
      "full": true
     },
     {
      "key": "noticeLetter",
      "label": "Surat perintah yang tembusannya diberikan kepada keluarga",
      "type": "text"
     },
     {
      "key": "noticeDate",
      "label": "Tanggal tembusan diberikan kepada keluarga",
      "type": "date"
     },
     {
      "key": "otherArguments",
      "label": "Argumentasi lain sesuai fakta kasus",
      "type": "textarea",
      "full": true
     },
     {
      "key": "contestedAction",
      "label": "Tindakan Termohon yang dimohonkan dinyatakan sah",
      "type": "text"
     },
     {
      "key": "costBearer",
      "label": "Biaya perkara dibebankan kepada",
      "type": "select",
      "options": [
       "Pemohon",
       "Negara"
      ]
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     }
    ]
   }
  ]
 },
 "PRAPID-1C": {
  "title": "Nota Dinas Rencana Persidangan Praperadilan",
  "subtitle": "Format B-310 · Praperadilan",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "hearingDate",
      "label": "Tanggal sidang",
      "type": "date",
      "source": "case:nextHearingDate",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian PRAPID-1C",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "letterNature",
      "label": "Sifat",
      "type": "select",
      "options": [
       "Segera",
       "Rahasia"
      ]
     },
     {
      "key": "pretrialRegisterNumber",
      "label": "Nomor perkara praperadilan",
      "type": "text"
     },
     {
      "key": "applicantName",
      "label": "Nama Pemohon Praperadilan",
      "type": "text"
     },
     {
      "key": "specialPowerNumber",
      "label": "Nomor Surat Kuasa Khusus (PRAPID-1A)",
      "type": "text"
     },
     {
      "key": "specialPowerDate",
      "label": "Tanggal Surat Kuasa Khusus",
      "type": "date"
     },
     {
      "key": "prapid1Number",
      "label": "Nomor Surat Perintah (PRAPID-1)",
      "type": "text"
     },
     {
      "key": "prapid1Date",
      "label": "Tanggal Surat Perintah (PRAPID-1)",
      "type": "date"
     },
     {
      "key": "summonsNumber",
      "label": "Nomor relaas panggilan sidang praperadilan",
      "type": "text"
     },
     {
      "key": "summonsDate",
      "label": "Tanggal relaas panggilan",
      "type": "date"
     },
     {
      "key": "summonsReceivedDay",
      "label": "Hari panggilan sidang diterima",
      "type": "text"
     },
     {
      "key": "summonsReceivedDate",
      "label": "Tanggal panggilan sidang diterima",
      "type": "date"
     },
     {
      "key": "pretrialObject",
      "label": "Objek praperadilan",
      "type": "select",
      "options": [
       "Penetapan Tersangka",
       "Penahanan",
       "Penangkapan",
       "Penggeledahan",
       "Penyitaan",
       "Penghentian Penyidikan",
       "Penghentian Penuntutan"
      ]
     },
     {
      "key": "hearingDay",
      "label": "Hari sidang pertama",
      "type": "text"
     },
     {
      "key": "kasiPidumOpinion",
      "label": "Pendapat Kasi Pidum",
      "type": "textarea",
      "full": true
     },
     {
      "key": "kajariInstruction",
      "label": "Petunjuk Kepala Kejaksaan Negeri",
      "type": "textarea",
      "full": true
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     }
    ]
   }
  ]
 },
 "PRAPID-1D": {
  "title": "Surat Panggilan Saksi/Ahli untuk Persidangan Praperadilan",
  "subtitle": "Format B-310 · Praperadilan",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "hearingDate",
      "label": "Tanggal sidang",
      "type": "date",
      "source": "case:nextHearingDate",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian PRAPID-1D",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "deliveryResult",
      "label": "Hasil penyampaian",
      "type": "select",
      "options": [
       "Diterima langsung",
       "Disampaikan melalui pihak lain"
      ]
     },
     {
      "key": "witnessStatus",
      "label": "Status yang dipanggil",
      "type": "select",
      "options": [
       "SAKSI",
       "AHLI"
      ]
     },
     {
      "key": "prapid1Number",
      "label": "Nomor Surat Perintah (PRAPID-1)",
      "type": "text"
     },
     {
      "key": "prapid1Date",
      "label": "Tanggal Surat Perintah (PRAPID-1)",
      "type": "date"
     },
     {
      "key": "pretrialRegisterNumber",
      "label": "Nomor permohonan praperadilan",
      "type": "text"
     },
     {
      "key": "applicantName",
      "label": "Nama Pemohon",
      "type": "text"
     },
     {
      "key": "respondentName",
      "label": "Nama Termohon",
      "type": "text"
     },
     {
      "key": "witnessName",
      "label": "Nama lengkap saksi/ahli",
      "type": "text"
     },
     {
      "key": "witnessIdentityNumber",
      "label": "Nomor identitas saksi/ahli",
      "type": "text"
     },
     {
      "key": "witnessBirthPlaceDate",
      "label": "Tempat/tanggal lahir saksi/ahli",
      "type": "text"
     },
     {
      "key": "witnessGender",
      "label": "Jenis kelamin saksi/ahli",
      "type": "select",
      "options": [
       "Laki-laki",
       "Perempuan"
      ]
     },
     {
      "key": "witnessOccupation",
      "label": "Pekerjaan saksi/ahli",
      "type": "text"
     },
     {
      "key": "witnessAddress",
      "label": "Alamat saksi/ahli",
      "type": "textarea",
      "full": true
     },
     {
      "key": "hearingDay",
      "label": "Hari menghadap",
      "type": "text"
     },
     {
      "key": "hearingTime",
      "label": "Pukul menghadap (WITA)",
      "type": "text"
     },
     {
      "key": "courtAddress",
      "label": "Alamat lengkap Pengadilan Negeri",
      "type": "text"
     },
     {
      "key": "respondentRole",
      "label": "Kedudukan Kejaksaan",
      "type": "select",
      "options": [
       "Termohon",
       "Turut Termohon"
      ]
     },
     {
      "key": "deliveryDay",
      "label": "Hari penyampaian surat panggilan",
      "type": "text"
     },
     {
      "key": "deliveryDate",
      "label": "Tanggal penyampaian surat panggilan",
      "type": "date"
     },
     {
      "key": "deliveryTime",
      "label": "Jam penyampaian surat panggilan",
      "type": "text"
     },
     {
      "key": "officerPosition",
      "label": "Jabatan petugas yang menyampaikan",
      "type": "text"
     },
     {
      "key": "deliveredVia",
      "label": "Disampaikan melalui",
      "type": "text"
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "officerName",
      "label": "Officer name",
      "type": "text"
     },
     {
      "key": "officerRank",
      "label": "Officer rank",
      "type": "text"
     },
     {
      "key": "officerNip",
      "label": "Officer nip",
      "type": "text"
     },
     {
      "key": "receiverName",
      "label": "Receiver name",
      "type": "text"
     },
     {
      "key": "receiverRank",
      "label": "Receiver rank",
      "type": "text"
     },
     {
      "key": "receiverNip",
      "label": "Receiver nip",
      "type": "text"
     }
    ]
   }
  ]
 },
 "PRAPID-1E": {
  "title": "Kesimpulan dalam Perkara Praperadilan",
  "subtitle": "Format B-310 · Praperadilan",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian PRAPID-1E",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "pretrialRegisterNumber",
      "label": "Nomor perkara praperadilan (…/Pid.Pra/20…/PN …)",
      "type": "text"
     },
     {
      "key": "applicantName",
      "label": "Nama Pemohon",
      "type": "text"
     },
     {
      "key": "respondentRole",
      "label": "Kedudukan Kejaksaan",
      "type": "select",
      "options": [
       "Termohon",
       "Turut Termohon"
      ]
     },
     {
      "key": "prapid1Number",
      "label": "Nomor Surat Perintah (PRAPID-1)",
      "type": "text"
     },
     {
      "key": "prapid1Date",
      "label": "Tanggal Surat Perintah (PRAPID-1)",
      "type": "date"
     },
     {
      "key": "pretrialObject",
      "label": "Objek praperadilan",
      "type": "select",
      "options": [
       "Penetapan Tersangka",
       "Penahanan",
       "Penangkapan",
       "Penggeledahan",
       "Penyitaan",
       "Penghentian Penyidikan",
       "Penghentian Penuntutan"
      ]
     },
     {
      "key": "applicantArguments",
      "label": "Ringkasan poin-poin utama keberatan Pemohon",
      "type": "textarea",
      "full": true
     },
     {
      "key": "respondentAnswerSummary",
      "label": "Ringkasan jawaban Termohon",
      "type": "textarea",
      "full": true
     },
     {
      "key": "applicantEvidenceWeakness",
      "label": "Bukti surat dan saksi Pemohon (kelemahannya)",
      "type": "textarea",
      "full": true
     },
     {
      "key": "respondentEvidence",
      "label": "Bukti surat dan saksi/ahli Termohon (T-1, T-2, dst.)",
      "type": "textarea",
      "full": true
     },
     {
      "key": "contestedAction",
      "label": "Tindakan Termohon (mis. SKP2/P-21/Penahanan)",
      "type": "text"
     },
     {
      "key": "applicantClaim",
      "label": "Dalil Pemohon yang dibantah",
      "type": "textarea",
      "full": true
     },
     {
      "key": "rebuttalReason",
      "label": "Alasan dalil Pemohon tidak berdasar hukum",
      "type": "textarea",
      "full": true
     },
     {
      "key": "costBearer",
      "label": "Biaya perkara dibebankan kepada",
      "type": "select",
      "options": [
       "Pemohon",
       "Negara"
      ]
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     }
    ]
   }
  ]
 },
 "PRAPID-5": {
  "title": "Laporan Penuntut Umum Setelah Putusan Praperadilan",
  "subtitle": "Format B-310 · Praperadilan",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "registerNumber",
      "label": "Nomor register perkara",
      "type": "text"
     }
    ]
   },
   {
    "title": "Isian PRAPID-5",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "pretrialObjectType",
      "label": "Objek praperadilan (Pasal 158 UU No. 20/2025)",
      "type": "select",
      "options": [
       "Upaya Paksa",
       "Penghentian Penyidikan atau Penuntutan",
       "Ganti Rugi atau Rehabilitasi",
       "Penyitaan Benda Tidak Terkait",
       "Penundaan Penanganan Perkara",
       "Penangguhan Pembantaran Penahanan"
      ]
     },
     {
      "key": "verdictAttitude",
      "label": "Sikap atas putusan",
      "type": "select",
      "options": [
       "Menerima",
       "Mengajukan Putusan Akhir ke Pengadilan Tinggi"
      ]
     },
     {
      "key": "followUpAction",
      "label": "Tindak lanjut eksekusi (Pasal 163 ayat 3 UU 20/2025)",
      "type": "select",
      "options": [
       "Membebaskan Tersangka",
       "Mengembalikan Barang Bukti",
       "Melanjutkan Penyidikan atau Penuntutan",
       "Ganti Rugi atau Rehabilitasi",
       "Upaya Paksa Ulang",
       "Lain-lain"
      ]
     },
     {
      "key": "pretrialRegisterNumber",
      "label": "Nomor register praperadilan",
      "type": "text"
     },
     {
      "key": "courtDecisionNumber",
      "label": "Nomor putusan pengadilan",
      "type": "text"
     },
     {
      "key": "courtDecisionDate",
      "label": "Tanggal putusan",
      "type": "date"
     },
     {
      "key": "judgeName",
      "label": "Hakim tunggal",
      "type": "text"
     },
     {
      "key": "coerciveMeasure",
      "label": "Jenis upaya paksa",
      "type": "select",
      "options": [
       "Penangkapan",
       "Penahanan",
       "Penggeledahan",
       "Penyitaan",
       "Penyadapan",
       "Pemblokiran"
      ]
     },
     {
      "key": "verdictText",
      "label": "Amar putusan (Mengadili)",
      "type": "textarea",
      "full": true
     },
     {
      "key": "followUpOther",
      "label": "Tindak lanjut lain-lain",
      "type": "text"
     },
     {
      "key": "prosecutorOpinion",
      "label": "Pendapat dan saran Penuntut Umum",
      "type": "textarea",
      "full": true
     },
     {
      "key": "kasiPidumOpinion",
      "label": "Pendapat Kasi Pidum",
      "type": "textarea",
      "full": true
     },
     {
      "key": "kajariInstruction",
      "label": "Petunjuk Kepala Kejaksaan Negeri",
      "type": "textarea",
      "full": true
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     }
    ]
   }
  ]
 },
 "PRAPID-5A": {
  "title": "Memori Banding dalam Perkara Praperadilan",
  "subtitle": "Format B-310 · Praperadilan",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     },
     {
      "key": "recipientPlace",
      "label": "Tempat tujuan (Di –)",
      "type": "text"
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian PRAPID-5A",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "terminationType",
      "label": "Penghentian yang dinyatakan tidak sah",
      "type": "select",
      "options": [
       "Penuntutan",
       "Penyidikan"
      ]
     },
     {
      "key": "includeRjArgument",
      "label": "Sertakan keberatan gugurnya kewenangan penuntutan (Pasal 132)",
      "type": "select",
      "options": [
       "Ya",
       "Tidak"
      ]
     },
     {
      "key": "courtDecisionNumber",
      "label": "Nomor putusan praperadilan (…/Pid.Pra/20…/PN …)",
      "type": "text"
     },
     {
      "key": "courtDecisionDate",
      "label": "Tanggal putusan praperadilan",
      "type": "date"
     },
     {
      "key": "applicantName",
      "label": "Nama Pemohon (Terbanding)",
      "type": "text"
     },
     {
      "key": "highCourtName",
      "label": "Pengadilan Tinggi",
      "type": "text"
     },
     {
      "key": "prapid1Number",
      "label": "Nomor Surat Perintah (PRAPID-1)",
      "type": "text"
     },
     {
      "key": "prapid1Date",
      "label": "Tanggal Surat Perintah (PRAPID-1)",
      "type": "date"
     },
     {
      "key": "appealDeedNumber",
      "label": "Nomor Akta Permohonan Banding",
      "type": "text"
     },
     {
      "key": "appealDeedDate",
      "label": "Tanggal Akta Permohonan Banding",
      "type": "date"
     },
     {
      "key": "terminationLetterNumber",
      "label": "Nomor SKP2/SP3",
      "type": "text"
     },
     {
      "key": "terminationReason",
      "label": "Kesimpulan gelar perkara",
      "type": "select",
      "options": [
       "tidak terdapat cukup bukti",
       "peristiwa tersebut bukan merupakan tindak pidana",
       "perkara ditutup demi hukum"
      ]
     },
     {
      "key": "terminationLetterDate",
      "label": "Tanggal SKP2/SP3",
      "type": "date"
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     }
    ]
   }
  ]
 },
 "PRAPID-6": {
  "title": "Berita Acara Pelaksanaan Putusan Praperadilan",
  "subtitle": "Format B-310 · Praperadilan",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "birthPlace",
      "label": "Tempat lahir",
      "type": "text",
      "source": "case:birthPlace",
      "editableAuto": true
     },
     {
      "key": "birthDate",
      "label": "Tanggal lahir",
      "type": "date",
      "source": "case:birthDate",
      "editableAuto": true
     },
     {
      "key": "gender",
      "label": "Jenis kelamin",
      "type": "text",
      "source": "case:gender",
      "editableAuto": true
     },
     {
      "key": "nationality",
      "label": "Kebangsaan",
      "type": "text",
      "source": "case:nationality",
      "editableAuto": true
     },
     {
      "key": "address",
      "label": "Tempat tinggal",
      "type": "textarea",
      "source": "case:address",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "religion",
      "label": "Agama",
      "type": "text",
      "source": "case:religion",
      "editableAuto": true
     },
     {
      "key": "occupation",
      "label": "Pekerjaan",
      "type": "text",
      "source": "case:occupation",
      "editableAuto": true
     },
     {
      "key": "detentionType",
      "label": "Jenis penahanan",
      "type": "select",
      "options": [
       "Rutan",
       "Rumah",
       "Kota"
      ]
     },
     {
      "key": "detentionPlace",
      "label": "Tempat penahanan",
      "type": "text"
     },
     {
      "key": "evidence",
      "label": "Barang bukti",
      "type": "textarea",
      "source": "case:evidence",
      "editableAuto": true,
      "full": true
     }
    ]
   },
   {
    "title": "Isian PRAPID-6",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "executionMethod",
      "label": "Cara pelaksanaan",
      "type": "select",
      "options": [
       "Membebaskan Tersangka",
       "Mengembalikan Barang Bukti",
       "Mencabut Status Tersangka",
       "Melanjutkan Penyidikan atau Penuntutan"
      ]
     },
     {
      "key": "executionPlace",
      "label": "Tempat pelaksanaan",
      "type": "text"
     },
     {
      "key": "courtDecisionNumber",
      "label": "Nomor putusan praperadilan",
      "type": "text"
     },
     {
      "key": "courtDecisionDate",
      "label": "Tanggal putusan praperadilan",
      "type": "date"
     },
     {
      "key": "verdictText",
      "label": "Amar putusan yang relevan",
      "type": "textarea",
      "full": true
     },
     {
      "key": "executionOrderNumber",
      "label": "Nomor Surat Perintah pelaksanaan (P-48 khusus Praperadilan)",
      "type": "text"
     },
     {
      "key": "executionOrderDate",
      "label": "Tanggal Surat Perintah pelaksanaan",
      "type": "date"
     },
     {
      "key": "evidenceReturnedTo",
      "label": "Barang bukti dikembalikan kepada",
      "type": "text"
     },
     {
      "key": "terminationLetter",
      "label": "Surat Ketetapan penghentian",
      "type": "text"
     },
     {
      "key": "witness1Note",
      "label": "Keterangan saksi 1 (mis. Petugas Rutan/Saksi Keluarga)",
      "type": "text"
     },
     {
      "key": "witness2Note",
      "label": "Keterangan saksi 2 (mis. Petugas Kejaksaan/Saksi Lain)",
      "type": "text"
     },
     {
      "key": "detentionHeadName",
      "label": "Nama Kepala Rutan/Lapas",
      "type": "text"
     },
     {
      "key": "detentionHeadRank",
      "label": "Pangkat Kepala Rutan/Lapas",
      "type": "text"
     },
     {
      "key": "detentionHeadNip",
      "label": "NIP Kepala Rutan/Lapas",
      "type": "text"
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "witness1Name",
      "label": "Witness1 name",
      "type": "text"
     },
     {
      "key": "witness2Name",
      "label": "Witness2 name",
      "type": "text"
     },
     {
      "key": "receiverName",
      "label": "Receiver name",
      "type": "text"
     },
     {
      "key": "receiverRank",
      "label": "Receiver rank",
      "type": "text"
     },
     {
      "key": "receiverNip",
      "label": "Receiver nip",
      "type": "text"
     }
    ]
   }
  ]
 },
 "PRAPID-7": {
  "title": "Perlawanan Pihak Ketiga (Derden Verzet) atas Putusan Praperadilan",
  "subtitle": "Format B-310 · Praperadilan",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     },
     {
      "key": "recipientPlace",
      "label": "Tempat tujuan (Di –)",
      "type": "text"
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "investigatorInstitution",
      "label": "Instansi penyidik",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian PRAPID-7",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "courtDecisionNumber",
      "label": "Nomor putusan praperadilan",
      "type": "text"
     },
     {
      "key": "attorneyNames",
      "label": "Nama-nama Jaksa kuasa (berdasarkan P-16/P-16A)",
      "type": "textarea",
      "full": true
     },
     {
      "key": "courtDecisionDate",
      "label": "Tanggal putusan praperadilan",
      "type": "date"
     }
    ]
   }
  ]
 },
 "PRAPID-7A": {
  "title": "Nota Pendapat Pengajuan Perlawanan Pihak Ketiga (Derden Verzet) terhadap Putusan Praperadilan",
  "subtitle": "Format B-310 · Praperadilan",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian PRAPID-7A",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "courtDecisionNumber",
      "label": "Nomor putusan praperadilan",
      "type": "text"
     },
     {
      "key": "courtDecisionDate",
      "label": "Tanggal putusan praperadilan",
      "type": "date"
     },
     {
      "key": "pretrialFiledDate",
      "label": "Tanggal permohonan praperadilan diajukan",
      "type": "date"
     },
     {
      "key": "kasiPidumOpinion",
      "label": "Pendapat Kasi Pidum",
      "type": "textarea",
      "full": true
     },
     {
      "key": "kajariInstruction",
      "label": "Petunjuk Kepala Kejaksaan Negeri",
      "type": "textarea",
      "full": true
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     }
    ]
   }
  ]
 },
 "SM-2": {
  "title": "Laporan Penuntut Umum Hasil Koordinasi dengan Penyidik terkait Penetapan Saksi Mahkota",
  "subtitle": "Format B-310 · Penahanan & Saksi Mahkota",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "crimeType",
      "label": "Jenis tindak pidana",
      "type": "text"
     },
     {
      "key": "allegedArticle",
      "label": "Pasal yang disangkakan",
      "type": "textarea",
      "source": "case:allegedArticle",
      "editableAuto": true,
      "full": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "p16Number",
      "label": "Nomor P-16",
      "type": "text",
      "source": "admin:P-16:documentNumber|case:p16Number",
      "editableAuto": true
     },
     {
      "key": "p16Date",
      "label": "Tanggal P-16",
      "type": "date",
      "source": "admin:P-16:documentDate|case:p16Date",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian SM-2",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "prosecutorStance",
      "label": "Sikap Penuntut Umum",
      "type": "select",
      "options": [
       "Menerima",
       "Menolak"
      ]
     },
     {
      "key": "reportNature",
      "label": "Sifat laporan",
      "type": "select",
      "options": [
       "Segera",
       "Rahasia"
      ]
     },
     {
      "key": "coordinationDate",
      "label": "Tanggal Berita Acara Koordinasi usulan Saksi Mahkota",
      "type": "date"
     },
     {
      "key": "otherSuspects",
      "label": "Nama Tersangka lain / pelaku utama",
      "type": "text"
     },
     {
      "key": "evidenceBasis",
      "label": "Alat bukti dasar analisis peran (saksi/surat/petunjuk)",
      "type": "text"
     },
     {
      "key": "suspectRole",
      "label": "Peran Tersangka (misal: turut serta membantu/driver/kurir)",
      "type": "text"
     },
     {
      "key": "roleQualification",
      "label": "Kualifikasi peran paling ringan",
      "type": "select",
      "options": [
       "memenuhi",
       "tidak memenuhi"
      ]
     },
     {
      "key": "mainSuspectName",
      "label": "Nama pelaku utama",
      "type": "text"
     },
     {
      "key": "testimonyUrgency",
      "label": "Dampak tanpa keterangan Tersangka (misal: sulit dilakukan/tetap kuat karena ada bukti lain)",
      "type": "text"
     },
     {
      "key": "sectionHeadOpinion",
      "label": "Pendapat Kasi Pidum",
      "type": "textarea",
      "full": true
     },
     {
      "key": "kajariInstruction",
      "label": "Petunjuk Kepala Kejaksaan Negeri",
      "type": "textarea",
      "full": true
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     }
    ]
   }
  ]
 },
 "SM-3": {
  "title": "Surat Perintah Tugas Penyelesaian Permohonan Penetapan Saksi Mahkota",
  "subtitle": "Format B-310 · Penahanan & Saksi Mahkota",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "p16Number",
      "label": "Nomor P-16",
      "type": "text",
      "source": "admin:P-16:documentNumber|case:p16Number",
      "editableAuto": true
     },
     {
      "key": "p16Date",
      "label": "Tanggal P-16",
      "type": "date",
      "source": "admin:P-16:documentDate|case:p16Date",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian SM-3",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "mainSuspectName",
      "label": "Nama Tersangka utama",
      "type": "text"
     },
     {
      "key": "member1Position",
      "label": "Jabatan Jaksa kedua",
      "type": "text"
     },
     {
      "key": "carbonCopyList",
      "label": "Tembusan",
      "type": "textarea",
      "full": true
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorPosition",
      "label": "Jabatan Penuntut Umum",
      "type": "text"
     },
     {
      "key": "member1Name",
      "label": "Anggota tim 1",
      "type": "text",
      "source": "admin:P-16:field:member1Name",
      "editableAuto": true
     }
    ]
   }
  ]
 },
 "SM-3A": {
  "title": "Surat Panggilan Tersangka (Saksi Mahkota)",
  "subtitle": "Format B-310 · Penahanan & Saksi Mahkota",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "allegedArticle",
      "label": "Pasal yang disangkakan",
      "type": "textarea",
      "source": "case:allegedArticle",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "suspectIdentityNumber",
      "label": "Nomor identitas (NIK)",
      "type": "text",
      "source": "case:suspectIdentityNumber",
      "editableAuto": true
     },
     {
      "key": "birthPlace",
      "label": "Tempat lahir",
      "type": "text",
      "source": "case:birthPlace",
      "editableAuto": true
     },
     {
      "key": "birthDate",
      "label": "Tanggal lahir",
      "type": "date",
      "source": "case:birthDate",
      "editableAuto": true
     },
     {
      "key": "gender",
      "label": "Jenis kelamin",
      "type": "text",
      "source": "case:gender",
      "editableAuto": true
     },
     {
      "key": "occupation",
      "label": "Pekerjaan",
      "type": "text",
      "source": "case:occupation",
      "editableAuto": true
     },
     {
      "key": "address",
      "label": "Tempat tinggal",
      "type": "textarea",
      "source": "case:address",
      "editableAuto": true,
      "full": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "p16Number",
      "label": "Nomor P-16",
      "type": "text",
      "source": "admin:P-16:documentNumber|case:p16Number",
      "editableAuto": true
     },
     {
      "key": "p16Date",
      "label": "Tanggal P-16",
      "type": "date",
      "source": "admin:P-16:documentDate|case:p16Date",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian SM-3A",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "receiptStatus",
      "label": "Status penerimaan panggilan",
      "type": "select",
      "options": [
       "Diterima langsung",
       "Disampaikan melalui pihak lain"
      ]
     },
     {
      "key": "sm3Number",
      "label": "Nomor Surat Perintah Tugas (SM-3)",
      "type": "text"
     },
     {
      "key": "sm3Date",
      "label": "Tanggal Surat Perintah Tugas (SM-3)",
      "type": "date"
     },
     {
      "key": "summonsDay",
      "label": "Hari menghadap",
      "type": "text"
     },
     {
      "key": "summonsDate",
      "label": "Tanggal menghadap",
      "type": "date"
     },
     {
      "key": "summonsTime",
      "label": "Pukul menghadap (WITA)",
      "type": "text"
     },
     {
      "key": "summonsPlace",
      "label": "Tempat menghadap (alamat lengkap)",
      "type": "text"
     },
     {
      "key": "receiptDay",
      "label": "Hari penyampaian panggilan",
      "type": "text"
     },
     {
      "key": "receiptDate",
      "label": "Tanggal penyampaian panggilan",
      "type": "date"
     },
     {
      "key": "receiptTime",
      "label": "Jam penyampaian panggilan",
      "type": "text"
     },
     {
      "key": "deliveredVia",
      "label": "Disampaikan melalui",
      "type": "text"
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "officerName",
      "label": "Officer name",
      "type": "text"
     },
     {
      "key": "officerRank",
      "label": "Officer rank",
      "type": "text"
     },
     {
      "key": "officerNip",
      "label": "Officer nip",
      "type": "text"
     },
     {
      "key": "officerPosition",
      "label": "Officer position",
      "type": "text"
     },
     {
      "key": "receiverName",
      "label": "Receiver name",
      "type": "text"
     },
     {
      "key": "receiverRank",
      "label": "Receiver rank",
      "type": "text"
     },
     {
      "key": "receiverNip",
      "label": "Receiver nip",
      "type": "text"
     }
    ]
   }
  ]
 },
 "SM-4": {
  "title": "Kesepakatan Perjanjian Saksi Mahkota",
  "subtitle": "Format B-310 · Penahanan & Saksi Mahkota",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "birthPlace",
      "label": "Tempat lahir",
      "type": "text",
      "source": "case:birthPlace",
      "editableAuto": true
     },
     {
      "key": "birthDate",
      "label": "Tanggal lahir",
      "type": "date",
      "source": "case:birthDate",
      "editableAuto": true
     },
     {
      "key": "suspectIdentityNumber",
      "label": "Nomor identitas (NIK)",
      "type": "text",
      "source": "case:suspectIdentityNumber",
      "editableAuto": true
     },
     {
      "key": "address",
      "label": "Tempat tinggal",
      "type": "textarea",
      "source": "case:address",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "crimeType",
      "label": "Jenis tindak pidana",
      "type": "text"
     },
     {
      "key": "allegedArticle",
      "label": "Pasal yang disangkakan",
      "type": "textarea",
      "source": "case:allegedArticle",
      "editableAuto": true,
      "full": true
     }
    ]
   },
   {
    "title": "Isian SM-4",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "guaranteeOption",
      "label": "Bentuk jaminan tuntutan (Pasal 74 ayat 3)",
      "type": "select",
      "options": [
       "Opsi A",
       "Opsi B",
       "Opsi C"
      ]
     },
     {
      "key": "crownWitnessStage",
      "label": "Tahap penetapan Saksi Mahkota",
      "type": "select",
      "options": [
       "Penyidikan",
       "Penuntutan"
      ]
     },
     {
      "key": "lawyerName",
      "label": "Nama Advokat / Pemberi Bantuan Hukum",
      "type": "text"
     },
     {
      "key": "lawFirm",
      "label": "Kantor Hukum",
      "type": "text"
     },
     {
      "key": "otherSuspects",
      "label": "Nama Tersangka lain (pelaku utama/intelektual)",
      "type": "text"
     },
     {
      "key": "chargedLaw",
      "label": "Undang-Undang yang dituntut",
      "type": "text"
     },
     {
      "key": "lawyerRank",
      "label": "Keterangan Advokat (di bawah nama)",
      "type": "text"
     },
     {
      "key": "lawyerNip",
      "label": "Nomor Induk Advokat",
      "type": "text"
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     }
    ]
   }
  ]
 },
 "SM-5": {
  "title": "Permohonan Penetapan Saksi Mahkota",
  "subtitle": "Format B-310 · Penahanan & Saksi Mahkota",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "birthPlace",
      "label": "Tempat lahir",
      "type": "text",
      "source": "case:birthPlace",
      "editableAuto": true
     },
     {
      "key": "birthDate",
      "label": "Tanggal lahir",
      "type": "date",
      "source": "case:birthDate",
      "editableAuto": true
     },
     {
      "key": "gender",
      "label": "Jenis kelamin",
      "type": "text",
      "source": "case:gender",
      "editableAuto": true
     },
     {
      "key": "nationality",
      "label": "Kebangsaan",
      "type": "text",
      "source": "case:nationality",
      "editableAuto": true
     },
     {
      "key": "religion",
      "label": "Agama",
      "type": "text",
      "source": "case:religion",
      "editableAuto": true
     },
     {
      "key": "occupation",
      "label": "Pekerjaan",
      "type": "text",
      "source": "case:occupation",
      "editableAuto": true
     },
     {
      "key": "address",
      "label": "Tempat tinggal",
      "type": "textarea",
      "source": "case:address",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "education",
      "label": "Pendidikan",
      "type": "text",
      "source": "case:education",
      "editableAuto": true
     },
     {
      "key": "crimeType",
      "label": "Jenis tindak pidana",
      "type": "text"
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "p16Number",
      "label": "Nomor P-16",
      "type": "text",
      "source": "admin:P-16:documentNumber|case:p16Number",
      "editableAuto": true
     },
     {
      "key": "p16Date",
      "label": "Tanggal P-16",
      "type": "date",
      "source": "admin:P-16:documentDate|case:p16Date",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian SM-5",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "crownWitnessStage",
      "label": "Tahap penetapan Saksi Mahkota",
      "type": "select",
      "options": [
       "Penyidikan",
       "Penuntutan"
      ]
     },
     {
      "key": "p16aNumber",
      "label": "Nomor P-16A",
      "type": "text"
     },
     {
      "key": "p16aDate",
      "label": "Tanggal P-16A",
      "type": "date"
     },
     {
      "key": "sm3Number",
      "label": "Nomor Surat Perintah Tugas (SM-3)",
      "type": "text"
     },
     {
      "key": "sm3Date",
      "label": "Tanggal Surat Perintah Tugas (SM-3)",
      "type": "date"
     },
     {
      "key": "agreementNumber",
      "label": "Nomor Kesepakatan Perjanjian Saksi Mahkota (SM-4)",
      "type": "text"
     },
     {
      "key": "agreementDate",
      "label": "Tanggal Kesepakatan Perjanjian Saksi Mahkota (SM-4)",
      "type": "date"
     },
     {
      "key": "otherSuspects",
      "label": "Nama Tersangka/Terdakwa pelaku utama",
      "type": "text"
     },
     {
      "key": "rewardType",
      "label": "Imbalan yang disepakati",
      "type": "select",
      "options": [
       "tuntutan pidana yang lebih ringan",
       "tidak menuntut pidana mati atau seumur hidup"
      ]
     },
     {
      "key": "carbonCopyList",
      "label": "Tembusan",
      "type": "textarea",
      "full": true
     },
     {
      "key": "receiptDay",
      "label": "Hari penyerahan",
      "type": "text"
     },
     {
      "key": "receiptDate",
      "label": "Tanggal penyerahan",
      "type": "date"
     },
     {
      "key": "supportingDocuments",
      "label": "Dokumen pendukung lainnya (jika ada)",
      "type": "textarea",
      "full": true
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "officerName",
      "label": "Officer name",
      "type": "text"
     },
     {
      "key": "officerRank",
      "label": "Officer rank",
      "type": "text"
     },
     {
      "key": "officerNip",
      "label": "Officer nip",
      "type": "text"
     },
     {
      "key": "officerPosition",
      "label": "Officer position",
      "type": "text"
     },
     {
      "key": "receiverName",
      "label": "Receiver name",
      "type": "text"
     },
     {
      "key": "receiverNip",
      "label": "Receiver nip",
      "type": "text"
     },
     {
      "key": "receiverPosition",
      "label": "Receiver position",
      "type": "text"
     },
     {
      "key": "receiverRank",
      "label": "Receiver rank",
      "type": "text"
     }
    ]
   }
  ]
 },
 "SM-6": {
  "title": "Pemberitahuan Penetapan Saksi Mahkota",
  "subtitle": "Format B-310 · Penahanan & Saksi Mahkota",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     },
     {
      "key": "recipientTitle",
      "label": "Pejabat yang dituju (Yth.)",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     },
     {
      "key": "recipientPlace",
      "label": "Tempat tujuan (Di –)",
      "type": "text"
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "crimeType",
      "label": "Jenis tindak pidana",
      "type": "text"
     },
     {
      "key": "investigatorInstitution",
      "label": "Instansi penyidik",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "p16Number",
      "label": "Nomor P-16",
      "type": "text",
      "source": "admin:P-16:documentNumber|case:p16Number",
      "editableAuto": true
     },
     {
      "key": "p16Date",
      "label": "Tanggal P-16",
      "type": "date",
      "source": "admin:P-16:documentDate|case:p16Date",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian SM-6",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "crownWitnessStage",
      "label": "Tahap penetapan Saksi Mahkota",
      "type": "select",
      "options": [
       "Penyidikan",
       "Penuntutan"
      ]
     },
     {
      "key": "receiverType",
      "label": "Pihak yang menerima",
      "type": "select",
      "options": [
       "Penyidik",
       "Tersangka atau Keluarga atau Penasihat Hukum"
      ]
     },
     {
      "key": "lawyerName",
      "label": "Nama Penasihat Hukum Tersangka",
      "type": "text"
     },
     {
      "key": "lawFirm",
      "label": "Nama Kantor Hukum",
      "type": "text"
     },
     {
      "key": "p16aNumber",
      "label": "Nomor P-16A",
      "type": "text"
     },
     {
      "key": "p16aDate",
      "label": "Tanggal P-16A",
      "type": "date"
     },
     {
      "key": "sm3Number",
      "label": "Nomor Surat Perintah Tugas (SM-3)",
      "type": "text"
     },
     {
      "key": "sm3Date",
      "label": "Tanggal Surat Perintah Tugas (SM-3)",
      "type": "date"
     },
     {
      "key": "agreementNumber",
      "label": "Nomor Kesepakatan Perjanjian Saksi Mahkota (SM-4)",
      "type": "text"
     },
     {
      "key": "agreementDate",
      "label": "Tanggal Kesepakatan Perjanjian Saksi Mahkota (SM-4)",
      "type": "date"
     },
     {
      "key": "courtDecisionNumber",
      "label": "Nomor Penetapan Ketua Pengadilan Negeri",
      "type": "text"
     },
     {
      "key": "courtDecisionDate",
      "label": "Tanggal Penetapan Ketua Pengadilan Negeri",
      "type": "date"
     },
     {
      "key": "otherSuspects",
      "label": "Nama Tersangka Utama/Lainnya",
      "type": "text"
     },
     {
      "key": "receiptDay",
      "label": "Hari penyerahan",
      "type": "text"
     },
     {
      "key": "receiptDate",
      "label": "Tanggal penyerahan",
      "type": "date"
     },
     {
      "key": "receiptPlace",
      "label": "Tempat penyerahan (misal: Kantor Polres Muna)",
      "type": "text"
     },
     {
      "key": "receiverStatus",
      "label": "Status penerima (non-penyidik)",
      "type": "select",
      "options": [
       "Tersangka",
       "Kuasa Hukum",
       "Keluarga"
      ]
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "officerName",
      "label": "Officer name",
      "type": "text"
     },
     {
      "key": "officerRank",
      "label": "Officer rank",
      "type": "text"
     },
     {
      "key": "officerNip",
      "label": "Officer nip",
      "type": "text"
     },
     {
      "key": "officerPosition",
      "label": "Officer position",
      "type": "text"
     },
     {
      "key": "receiverName",
      "label": "Receiver name",
      "type": "text"
     },
     {
      "key": "receiverRank",
      "label": "Receiver rank",
      "type": "text"
     },
     {
      "key": "receiverNip",
      "label": "Receiver nip",
      "type": "text"
     }
    ]
   }
  ]
 },
 "SOP FORM 1A": {
  "title": "Nota Pendapat Pengembalian SPDP",
  "subtitle": "Format B-310 · Penerimaan SPDP",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "investigatorInstitution",
      "label": "Instansi penyidik",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     },
     {
      "key": "spdpNumber",
      "label": "Nomor SPDP",
      "type": "text",
      "source": "case:spdpNumber",
      "editableAuto": true
     },
     {
      "key": "spdpDate",
      "label": "Tanggal SPDP",
      "type": "date",
      "source": "case:spdpDate",
      "editableAuto": true
     },
     {
      "key": "receivedDate",
      "label": "Tanggal SPDP diterima",
      "type": "date",
      "source": "case:receivedDate",
      "editableAuto": true
     },
     {
      "key": "sprindikDate",
      "label": "Tanggal Sprindik",
      "type": "date",
      "source": "case:sprindikDate",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian SOP FORM-1A",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "returnReason",
      "label": "Alasan pengembalian SPDP",
      "type": "select",
      "options": [
       "Lewat 7 Hari",
       "Tidak Sesuai Kesetaraan",
       "Tanpa Sprindik Baru"
      ]
     },
     {
      "key": "suspectStatus",
      "label": "Status",
      "type": "select",
      "options": [
       "Terlapor",
       "Tersangka"
      ]
     },
     {
      "key": "dayDifference",
      "label": "Selisih hari Sprindik ke penerimaan SPDP",
      "type": "number"
     },
     {
      "key": "wrongAddresseeOffice",
      "label": "Kantor Kejaksaan yang dituju SPDP",
      "type": "text"
     },
     {
      "key": "correctAddresseeOffice",
      "label": "Kantor Kejaksaan yang seharusnya dituju",
      "type": "text"
     },
     {
      "key": "previousReturnNumber",
      "label": "Nomor surat pengembalian SPDP sebelumnya",
      "type": "text"
     },
     {
      "key": "previousReturnDate",
      "label": "Tanggal surat pengembalian SPDP sebelumnya",
      "type": "date"
     },
     {
      "key": "kasiPidumName",
      "label": "Nama Kasi Pidum",
      "type": "text"
     },
     {
      "key": "kasiPidumRank",
      "label": "Pangkat Kasi Pidum",
      "type": "text"
     },
     {
      "key": "kasiPidumNip",
      "label": "NIP Kasi Pidum",
      "type": "text"
     },
     {
      "key": "kajariInstruction",
      "label": "Petunjuk Kepala Kejaksaan Negeri",
      "type": "textarea",
      "full": true
     }
    ]
   }
  ]
 },
 "SOP FORM 1B": {
  "title": "Laporan Penuntut Umum Perkembangan Hasil Penyidikan",
  "subtitle": "Format B-310 · Koordinasi & pemantauan penyidikan",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     },
     {
      "key": "recipientTitle",
      "label": "Pejabat yang dituju (Yth.)",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "spdpNumber",
      "label": "Nomor SPDP",
      "type": "text",
      "source": "case:spdpNumber",
      "editableAuto": true
     },
     {
      "key": "spdpDate",
      "label": "Tanggal SPDP",
      "type": "date",
      "source": "case:spdpDate",
      "editableAuto": true
     },
     {
      "key": "receivedDate",
      "label": "Tanggal SPDP diterima",
      "type": "date",
      "source": "case:receivedDate",
      "editableAuto": true
     },
     {
      "key": "investigatorInstitution",
      "label": "Instansi penyidik",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     },
     {
      "key": "allegedArticle",
      "label": "Pasal yang disangkakan",
      "type": "textarea",
      "source": "case:allegedArticle",
      "editableAuto": true,
      "full": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "p16Number",
      "label": "Nomor P-16",
      "type": "text",
      "source": "admin:P-16:documentNumber|case:p16Number",
      "editableAuto": true
     },
     {
      "key": "p16Date",
      "label": "Tanggal P-16",
      "type": "date",
      "source": "admin:P-16:documentDate|case:p16Date",
      "editableAuto": true
     },
     {
      "key": "p17Date",
      "label": "Tanggal P-17",
      "type": "date",
      "source": "admin:P-17:documentDate|case:p17Date",
      "editableAuto": true
     },
     {
      "key": "p19Date",
      "label": "Tanggal P-19",
      "type": "date",
      "source": "admin:P-19:documentDate|case:p19Date",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian SOP FORM-1B",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "reportOption",
      "label": "Pilihan format",
      "type": "select",
      "options": [
       "Opsi 1",
       "Opsi 2",
       "Opsi 3",
       "Opsi 4",
       "Opsi 5",
       "Opsi 6"
      ]
     },
     {
      "key": "sopForm2Date",
      "label": "Tanggal Surat SOP FORM-2",
      "type": "date"
     },
     {
      "key": "dossierReturnedDate",
      "label": "Tanggal berkas (P-19) diterima Penyidik (tanda terima P-1C)",
      "type": "date"
     },
     {
      "key": "completeNoticeDate",
      "label": "Tanggal P-21 / SOP FORM-8",
      "type": "date"
     },
     {
      "key": "completeNoticeType",
      "label": "Surat yang telah diterbitkan",
      "type": "select",
      "options": [
       "Pemberitahuan Hasil Penyidikan Sudah Lengkap (P-21)",
       "Pemberitahuan Dapat Diterimanya Penyerahan Tersangka dan Barang Bukti (SOP FORM-8)"
      ]
     },
     {
      "key": "kasiPidumOpinion",
      "label": "Pendapat Kasi Pidum",
      "type": "textarea",
      "full": true
     },
     {
      "key": "kajariInstruction",
      "label": "Petunjuk Kepala Kejaksaan Negeri",
      "type": "textarea",
      "full": true
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     }
    ]
   }
  ]
 },
 "SOP FORM 1C": {
  "title": "Pemberitahuan Kewajiban Koordinasi kepada Atasan Penyidik",
  "subtitle": "Format B-310 · Koordinasi & pemantauan penyidikan",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     },
     {
      "key": "recipientTitle",
      "label": "Pejabat yang dituju (Yth.)",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     },
     {
      "key": "recipientPlace",
      "label": "Tempat tujuan (Di –)",
      "type": "text"
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "spdpNumber",
      "label": "Nomor SPDP",
      "type": "text",
      "source": "case:spdpNumber",
      "editableAuto": true
     },
     {
      "key": "spdpDate",
      "label": "Tanggal SPDP",
      "type": "date",
      "source": "case:spdpDate",
      "editableAuto": true
     },
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "receivedDate",
      "label": "Tanggal SPDP diterima",
      "type": "date",
      "source": "case:receivedDate",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "p16Number",
      "label": "Nomor P-16",
      "type": "text",
      "source": "admin:P-16:documentNumber|case:p16Number",
      "editableAuto": true
     },
     {
      "key": "p16Date",
      "label": "Tanggal P-16",
      "type": "date",
      "source": "admin:P-16:documentDate|case:p16Date",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     }
    ]
   }
  ]
 },
 "SOP FORM 1 B310": {
  "title": "Pengembalian SPDP (Cacat Formil)",
  "subtitle": "Format B-310 · Penerimaan SPDP",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     },
     {
      "key": "recipientTitle",
      "label": "Pejabat yang dituju (Yth.)",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     },
     {
      "key": "recipientPlace",
      "label": "Tempat tujuan (Di –)",
      "type": "text"
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "allegedArticle",
      "label": "Pasal yang disangkakan",
      "type": "textarea",
      "source": "case:allegedArticle",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "spdpNumber",
      "label": "Nomor SPDP",
      "type": "text",
      "source": "case:spdpNumber",
      "editableAuto": true
     },
     {
      "key": "spdpDate",
      "label": "Tanggal SPDP",
      "type": "date",
      "source": "case:spdpDate",
      "editableAuto": true
     },
     {
      "key": "receivedDate",
      "label": "Tanggal SPDP diterima",
      "type": "date",
      "source": "case:receivedDate",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian SOP FORM-1",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "returnReason",
      "label": "Alasan pengembalian SPDP",
      "type": "select",
      "options": [
       "Lewat 7 Hari",
       "Tidak Sesuai Kesetaraan",
       "Tanpa Sprindik Baru"
      ]
     },
     {
      "key": "suspectStatus",
      "label": "Status",
      "type": "select",
      "options": [
       "Tersangka",
       "Terlapor"
      ]
     },
     {
      "key": "investigatorSuperior",
      "label": "Atasan Penyidik (tembusan)",
      "type": "text"
     }
    ]
   }
  ]
 },
 "SOP FORM 4": {
  "title": "Nota Pendapat Perpanjangan Penahanan / Penolakan Perpanjangan Penahanan",
  "subtitle": "Format B-310 · Penahanan & Saksi Mahkota",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "birthPlace",
      "label": "Tempat lahir",
      "type": "text",
      "source": "case:birthPlace",
      "editableAuto": true
     },
     {
      "key": "birthDate",
      "label": "Tanggal lahir",
      "type": "date",
      "source": "case:birthDate",
      "editableAuto": true
     },
     {
      "key": "gender",
      "label": "Jenis kelamin",
      "type": "text",
      "source": "case:gender",
      "editableAuto": true
     },
     {
      "key": "nationality",
      "label": "Kebangsaan",
      "type": "text",
      "source": "case:nationality",
      "editableAuto": true
     },
     {
      "key": "address",
      "label": "Tempat tinggal",
      "type": "textarea",
      "source": "case:address",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "religion",
      "label": "Agama",
      "type": "text",
      "source": "case:religion",
      "editableAuto": true
     },
     {
      "key": "occupation",
      "label": "Pekerjaan",
      "type": "text",
      "source": "case:occupation",
      "editableAuto": true
     },
     {
      "key": "education",
      "label": "Pendidikan",
      "type": "text",
      "source": "case:education",
      "editableAuto": true
     },
     {
      "key": "allegedArticle",
      "label": "Pasal yang disangkakan",
      "type": "textarea",
      "source": "case:allegedArticle",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "investigatorInstitution",
      "label": "Instansi penyidik",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     },
     {
      "key": "extensionDays",
      "label": "Lama perpanjangan (hari)",
      "type": "text"
     },
     {
      "key": "extensionStartDate",
      "label": "Perpanjangan mulai",
      "type": "date"
     },
     {
      "key": "extensionEndDate",
      "label": "Perpanjangan berakhir",
      "type": "date"
     },
     {
      "key": "detentionType",
      "label": "Jenis penahanan",
      "type": "select",
      "options": [
       "Rutan",
       "Rumah",
       "Kota"
      ]
     },
     {
      "key": "detentionPlace",
      "label": "Tempat penahanan",
      "type": "text"
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "p16Number",
      "label": "Nomor P-16",
      "type": "text",
      "source": "admin:P-16:documentNumber|case:p16Number",
      "editableAuto": true
     },
     {
      "key": "p16Date",
      "label": "Tanggal P-16",
      "type": "date",
      "source": "admin:P-16:documentDate|case:p16Date",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian SOP FORM-4",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "extensionDecision",
      "label": "Pendapat Penuntut Umum",
      "type": "select",
      "options": [
       "Perpanjangan Penahanan",
       "Penolakan Perpanjangan Penahanan"
      ]
     },
     {
      "key": "extensionRequestNumber",
      "label": "Nomor surat permintaan perpanjangan penahanan dari Penyidik",
      "type": "text"
     },
     {
      "key": "extensionRequestDate",
      "label": "Tanggal surat permintaan perpanjangan penahanan",
      "type": "date"
     },
     {
      "key": "objectiveRequirement",
      "label": "Syarat objektif (ancaman pidana)",
      "type": "select",
      "options": [
       "memenuhi",
       "tidak memenuhi"
      ]
     },
     {
      "key": "evidenceRequirement",
      "label": "Syarat minimal 2 alat bukti",
      "type": "select",
      "options": [
       "Memenuhi",
       "Tidak memenuhi"
      ]
     },
     {
      "key": "subjectiveRequirement",
      "label": "Syarat subjektif (keadaan kekhawatiran)",
      "type": "select",
      "options": [
       "Memenuhi",
       "Tidak memenuhi"
      ]
     },
     {
      "key": "kasiPidumOpinion",
      "label": "Pendapat Kasi Pidum",
      "type": "textarea",
      "full": true
     },
     {
      "key": "kajariInstruction",
      "label": "Petunjuk Kepala Kejaksaan Negeri",
      "type": "textarea",
      "full": true
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorPosition",
      "label": "Jabatan Penuntut Umum",
      "type": "text"
     }
    ]
   }
  ]
 },
 "SOP FORM 5": {
  "title": "Lembar Penelitian Hasil Penyidikan",
  "subtitle": "Format B-310 · Penelitian berkas & gelar perkara",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "spdpNumber",
      "label": "Nomor SPDP",
      "type": "text",
      "source": "case:spdpNumber",
      "editableAuto": true
     },
     {
      "key": "spdpDate",
      "label": "Tanggal SPDP",
      "type": "date",
      "source": "case:spdpDate",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "dossierReceivedDate",
      "label": "Tanggal berkas Tahap I diterima",
      "type": "date",
      "source": "admin:P-1B:documentDate|case:p1bDate",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian SOP FORM-5",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "suspectCategory",
      "label": "Kategori Tersangka",
      "type": "select",
      "options": [
       "Orang Perorangan Dewasa",
       "Anak",
       "Korporasi"
      ]
     },
     {
      "key": "researchConclusion",
      "label": "Kesimpulan Penuntut Umum",
      "type": "select",
      "options": [
       "Lengkap (P-21)",
       "Dikembalikan (P-19)",
       "Koordinasi atau Gelar Perkara"
      ]
     },
     {
      "key": "dossierSubmissionCount",
      "label": "Penerimaan berkas perkara ke-",
      "type": "number"
     },
     {
      "key": "additionalDossierReceivedDate",
      "label": "Tanggal penerimaan berkas setelah penyidikan tambahan",
      "type": "date"
     },
     {
      "key": "conclusionDate",
      "label": "Tanggal kesimpulan Penuntut Umum",
      "type": "date"
     },
     {
      "key": "kasiPidumOpinion",
      "label": "Pendapat Kasi Pidum",
      "type": "textarea",
      "full": true
     },
     {
      "key": "kajariInstruction",
      "label": "Petunjuk Kepala Kejaksaan Negeri",
      "type": "textarea",
      "full": true
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "teamLeaderName",
      "label": "Ketua tim Penuntut Umum",
      "type": "text",
      "source": "admin:P-16:field:teamLeaderName",
      "editableAuto": true
     },
     {
      "key": "member1Name",
      "label": "Anggota tim 1",
      "type": "text",
      "source": "admin:P-16:field:member1Name",
      "editableAuto": true
     },
     {
      "key": "member2Name",
      "label": "Anggota tim 2",
      "type": "text",
      "source": "admin:P-16:field:member2Name",
      "editableAuto": true
     },
     {
      "key": "member3Name",
      "label": "Anggota tim 3",
      "type": "text",
      "source": "admin:P-16:field:member3Name",
      "editableAuto": true
     }
    ]
   }
  ]
 },
 "SOP FORM 5A": {
  "title": "Berita Acara Pelaksanaan Ekspose",
  "subtitle": "Format B-310 · Penelitian berkas & gelar perkara",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "allegedArticle",
      "label": "Pasal yang disangkakan",
      "type": "textarea",
      "source": "case:allegedArticle",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "caseSummary",
      "label": "Kasus posisi / ringkasan perkara",
      "type": "textarea",
      "source": "case:caseSummary",
      "editableAuto": true,
      "full": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "p16Number",
      "label": "Nomor P-16",
      "type": "text",
      "source": "admin:P-16:documentNumber|case:p16Number",
      "editableAuto": true
     },
     {
      "key": "p16Date",
      "label": "Tanggal P-16",
      "type": "date",
      "source": "admin:P-16:documentDate|case:p16Date",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian SOP FORM-5A",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "exposeVenue",
      "label": "Tempat pelaksanaan ekspose",
      "type": "text"
     },
     {
      "key": "exposeLeaderName",
      "label": "Nama Pimpinan Ekspose",
      "type": "text"
     },
     {
      "key": "exposeLeaderRank",
      "label": "Pangkat Pimpinan Ekspose",
      "type": "text"
     },
     {
      "key": "exposeLeaderNip",
      "label": "NIP Pimpinan Ekspose",
      "type": "text"
     },
     {
      "key": "exposeLeaderPosition",
      "label": "Jabatan Pimpinan Ekspose",
      "type": "text"
     },
     {
      "key": "otherParticipants",
      "label": "Peserta lainnya (Nama/Jabatan)",
      "type": "textarea",
      "full": true
     },
     {
      "key": "basisDocType",
      "label": "Dasar dokumen",
      "type": "select",
      "options": [
       "Surat Pemberitahuan Dimulainya Penyidikan (SPDP)",
       "Berkas Perkara"
      ]
     },
     {
      "key": "basisDocNumber",
      "label": "Nomor SPDP / Berkas Perkara",
      "type": "text"
     },
     {
      "key": "basisDocDate",
      "label": "Tanggal SPDP / Berkas Perkara",
      "type": "date"
     },
     {
      "key": "evidenceAnalysis",
      "label": "Uraian alat bukti dan barang bukti",
      "type": "textarea",
      "full": true
     },
     {
      "key": "legalIssues",
      "label": "Permasalahan / isu hukum yang dibahas",
      "type": "textarea",
      "full": true
     },
     {
      "key": "presenterOpinion",
      "label": "Pendapat Jaksa Pemapar",
      "type": "textarea",
      "full": true
     },
     {
      "key": "participant1Response",
      "label": "Tanggapan/Masukan Peserta 1",
      "type": "textarea",
      "full": true
     },
     {
      "key": "participant2Response",
      "label": "Tanggapan/Masukan Peserta 2",
      "type": "textarea",
      "full": true
     },
     {
      "key": "leaderInstructions",
      "label": "Kesimpulan dan petunjuk Pimpinan",
      "type": "textarea",
      "full": true
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorPosition",
      "label": "Jabatan Penuntut Umum",
      "type": "text"
     }
    ]
   }
  ]
 },
 "SOP FORM 5B": {
  "title": "Undangan Gelar Perkara (Ekspose) Internal",
  "subtitle": "Format B-310 · Penelitian berkas & gelar perkara",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "investigatorInstitution",
      "label": "Instansi penyidik",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "p16Number",
      "label": "Nomor P-16",
      "type": "text",
      "source": "admin:P-16:documentNumber|case:p16Number",
      "editableAuto": true
     },
     {
      "key": "p16Date",
      "label": "Tanggal P-16",
      "type": "date",
      "source": "admin:P-16:documentDate|case:p16Date",
      "editableAuto": true
     },
     {
      "key": "dossierNumber",
      "label": "Nomor berkas perkara",
      "type": "text",
      "source": "case:nomorBerkas",
      "editableAuto": true
     },
     {
      "key": "dossierDate",
      "label": "Tanggal berkas perkara",
      "type": "date",
      "source": "case:tanggalBerkas",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian SOP FORM-5B",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "exposeOption",
      "label": "Pilihan format (Opsi 1: sebelum Gelar Perkara Bersama; Opsi 2: setelah Gelar Perkara Bersama)",
      "type": "select",
      "options": [
       "Opsi 1",
       "Opsi 2"
      ]
     },
     {
      "key": "letterNature",
      "label": "Sifat surat",
      "type": "select",
      "options": [
       "Segera",
       "Rahasia"
      ]
     },
     {
      "key": "jointExposeInvitationNumber",
      "label": "Nomor undangan Gelar Perkara Bersama dari Penyidik",
      "type": "text"
     },
     {
      "key": "jointExposeInvitationDate",
      "label": "Tanggal undangan Gelar Perkara Bersama dari Penyidik",
      "type": "date"
     },
     {
      "key": "jointExposeDate",
      "label": "Tanggal Berita Acara Pelaksanaan Gelar Perkara Bersama",
      "type": "date"
     },
     {
      "key": "exposeDay",
      "label": "Hari pelaksanaan ekspose",
      "type": "text"
     },
     {
      "key": "exposeDate",
      "label": "Tanggal pelaksanaan ekspose",
      "type": "date"
     },
     {
      "key": "exposeTime",
      "label": "Pukul mulai ekspose",
      "type": "text"
     },
     {
      "key": "exposeRoom",
      "label": "Nama ruang rapat",
      "type": "text"
     },
     {
      "key": "zoomMeetingId",
      "label": "Zoom Meeting ID",
      "type": "text"
     },
     {
      "key": "zoomPasscode",
      "label": "Zoom Passcode",
      "type": "text"
     },
     {
      "key": "locusDelictiOffice",
      "label": "Kejaksaan Negeri locus delicti",
      "type": "text"
     },
     {
      "key": "prosecutionSupervisor",
      "label": "Pengawas Penuntut Umum yang diundang",
      "type": "text"
     },
     {
      "key": "reporterName",
      "label": "Nama Pelapor / Korban / Kuasa Hukum Korban",
      "type": "text"
     },
     {
      "key": "suspectSideName",
      "label": "Nama Tersangka / Penasihat Hukum Tersangka",
      "type": "text"
     },
     {
      "key": "expertName",
      "label": "Nama Ahli",
      "type": "text"
     },
     {
      "key": "expertField",
      "label": "Bidang keahlian Ahli",
      "type": "text"
     }
    ]
   }
  ]
 },
 "SOP FORM 6": {
  "title": "Berita Acara Koordinasi Penyidik dan Penuntut Umum",
  "subtitle": "Format B-310 · Koordinasi & pemantauan penyidikan",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "investigatorName",
      "label": "Nama penyidik",
      "type": "text",
      "source": "case:investigatorName",
      "editableAuto": true
     },
     {
      "key": "investigatorRank",
      "label": "Pangkat penyidik",
      "type": "text",
      "source": "case:investigatorRank",
      "editableAuto": true
     },
     {
      "key": "investigatorNipNrp",
      "label": "NRP/NIP penyidik",
      "type": "text",
      "source": "case:investigatorNipNrp",
      "editableAuto": true
     },
     {
      "key": "investigatorPosition",
      "label": "Jabatan penyidik",
      "type": "text",
      "source": "case:investigatorPosition",
      "editableAuto": true
     },
     {
      "key": "spdpNumber",
      "label": "Nomor SPDP",
      "type": "text",
      "source": "case:spdpNumber",
      "editableAuto": true
     },
     {
      "key": "spdpDate",
      "label": "Tanggal SPDP",
      "type": "date",
      "source": "case:spdpDate",
      "editableAuto": true
     },
     {
      "key": "allegedArticle",
      "label": "Pasal yang disangkakan",
      "type": "textarea",
      "source": "case:allegedArticle",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "crimeType",
      "label": "Jenis tindak pidana",
      "type": "text"
     },
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "birthPlace",
      "label": "Tempat lahir",
      "type": "text",
      "source": "case:birthPlace",
      "editableAuto": true
     },
     {
      "key": "birthDate",
      "label": "Tanggal lahir",
      "type": "date",
      "source": "case:birthDate",
      "editableAuto": true
     },
     {
      "key": "gender",
      "label": "Jenis kelamin",
      "type": "text",
      "source": "case:gender",
      "editableAuto": true
     },
     {
      "key": "religion",
      "label": "Agama",
      "type": "text",
      "source": "case:religion",
      "editableAuto": true
     },
     {
      "key": "occupation",
      "label": "Pekerjaan",
      "type": "text",
      "source": "case:occupation",
      "editableAuto": true
     },
     {
      "key": "address",
      "label": "Tempat tinggal",
      "type": "textarea",
      "source": "case:address",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "evidence",
      "label": "Barang bukti",
      "type": "textarea",
      "source": "case:evidence",
      "editableAuto": true,
      "full": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "p16Number",
      "label": "Nomor P-16",
      "type": "text",
      "source": "admin:P-16:documentNumber|case:p16Number",
      "editableAuto": true
     },
     {
      "key": "p16Date",
      "label": "Tanggal P-16",
      "type": "date",
      "source": "admin:P-16:documentDate|case:p16Date",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian SOP FORM-6",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "coordinationOption",
      "label": "Pilihan format",
      "type": "select",
      "options": [
       "Opsi 1",
       "Opsi 2",
       "Opsi 3"
      ]
     },
     {
      "key": "coordinationNotes",
      "label": "Materi koordinasi yang disepakati",
      "type": "textarea",
      "full": true
     },
     {
      "key": "crownWitnessIdentity",
      "label": "Identitas lengkap tersangka yang diusulkan sebagai Saksi Mahkota",
      "type": "textarea",
      "full": true
     },
     {
      "key": "crownWitnessRole",
      "label": "Peran tersangka dalam perkara",
      "type": "text"
     },
     {
      "key": "mainPerpetratorName",
      "label": "Nama pelaku utama",
      "type": "text"
     },
     {
      "key": "crownWitnessStatements",
      "label": "Uraian keterangan calon Saksi Mahkota",
      "type": "textarea",
      "full": true
     },
     {
      "key": "suspectExamDate",
      "label": "Tanggal BAP Tersangka",
      "type": "date"
     },
     {
      "key": "guiltyPleaDate",
      "label": "Tanggal Berita Acara Pengakuan Bersalah",
      "type": "date"
     },
     {
      "key": "otherEvidence",
      "label": "Alat bukti lain (Saksi/Ahli/Surat)",
      "type": "textarea",
      "full": true
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorPosition",
      "label": "Jabatan Penuntut Umum",
      "type": "text"
     }
    ]
   }
  ]
 },
 "SOP FORM 6A": {
  "title": "Berita Acara Konsultasi antara Penyelidik dan Pejabat Kejaksaan",
  "subtitle": "Format B-310 · Koordinasi & pemantauan penyidikan",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "investigatorName",
      "label": "Nama penyidik",
      "type": "text",
      "source": "case:investigatorName",
      "editableAuto": true
     },
     {
      "key": "investigatorRank",
      "label": "Pangkat penyidik",
      "type": "text",
      "source": "case:investigatorRank",
      "editableAuto": true
     },
     {
      "key": "investigatorNipNrp",
      "label": "NRP/NIP penyidik",
      "type": "text",
      "source": "case:investigatorNipNrp",
      "editableAuto": true
     },
     {
      "key": "investigatorPosition",
      "label": "Jabatan penyidik",
      "type": "text",
      "source": "case:investigatorPosition",
      "editableAuto": true
     },
     {
      "key": "evidence",
      "label": "Barang bukti",
      "type": "textarea",
      "source": "case:evidence",
      "editableAuto": true,
      "full": true
     }
    ]
   },
   {
    "title": "Isian SOP FORM-6A",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "reportNumber",
      "label": "Nomor Laporan/Pengaduan",
      "type": "text"
     },
     {
      "key": "inquiryOrderNumber",
      "label": "Nomor Surat Perintah Penyelidikan",
      "type": "text"
     },
     {
      "key": "incidentChronology",
      "label": "Uraian singkat peristiwa (kasus posisi)",
      "type": "textarea",
      "full": true
     },
     {
      "key": "witnessStatements",
      "label": "Keterangan (calon) Saksi/Ahli",
      "type": "textarea",
      "full": true
     },
     {
      "key": "otherIndications",
      "label": "Petunjuk lainnya",
      "type": "textarea",
      "full": true
     },
     {
      "key": "consultationMatters",
      "label": "Materi konsultasi",
      "type": "textarea",
      "full": true
     },
     {
      "key": "juridicalAnalysis",
      "label": "Analisis yuridis",
      "type": "textarea",
      "full": true
     },
     {
      "key": "evidenceAdvice",
      "label": "Saran kelengkapan alat bukti",
      "type": "textarea",
      "full": true
     },
     {
      "key": "interimConclusion",
      "label": "Kesimpulan sementara",
      "type": "select",
      "options": [
       "Layak ditingkatkan ke Tahap Penyidikan.",
       "Belum Layak (Perlu pendalaman lebih lanjut).",
       "Bukan Merupakan Tindak Pidana.",
       "Dapat diselesaikan melalui Mekanisme Keadilan Restoratif pada tahap Penyelidikan."
      ]
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorPosition",
      "label": "Jabatan Penuntut Umum",
      "type": "text"
     }
    ]
   }
  ]
 },
 "SOP FORM 6E": {
  "title": "Berita Acara Pelaksanaan Gelar Perkara Bersama",
  "subtitle": "Format B-310 · Penelitian berkas & gelar perkara",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "allegedArticle",
      "label": "Pasal yang disangkakan",
      "type": "textarea",
      "source": "case:allegedArticle",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "investigatorName",
      "label": "Nama penyidik",
      "type": "text",
      "source": "case:investigatorName",
      "editableAuto": true
     },
     {
      "key": "investigatorRank",
      "label": "Pangkat penyidik",
      "type": "text",
      "source": "case:investigatorRank",
      "editableAuto": true
     },
     {
      "key": "investigatorNipNrp",
      "label": "NRP/NIP penyidik",
      "type": "text",
      "source": "case:investigatorNipNrp",
      "editableAuto": true
     },
     {
      "key": "investigatorPosition",
      "label": "Jabatan penyidik",
      "type": "text",
      "source": "case:investigatorPosition",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "dossierNumber",
      "label": "Nomor berkas perkara",
      "type": "text",
      "source": "case:nomorBerkas",
      "editableAuto": true
     },
     {
      "key": "dossierDate",
      "label": "Tanggal berkas perkara",
      "type": "date",
      "source": "case:tanggalBerkas",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian SOP FORM-6E",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "exposeConclusion",
      "label": "Kesimpulan hasil gelar perkara",
      "type": "select",
      "options": [
       "P-21",
       "SP3",
       "Pemeriksaan Tambahan",
       "Deadlock"
      ]
     },
     {
      "key": "exposeVenue",
      "label": "Ruang Gelar Perkara",
      "type": "text"
     },
     {
      "key": "exposeRequester",
      "label": "Permintaan gelar perkara dari",
      "type": "select",
      "options": [
       "Penyidik",
       "Penuntut Umum"
      ]
     },
     {
      "key": "exposeRequestNumber",
      "label": "Nomor surat permintaan gelar perkara",
      "type": "text"
     },
     {
      "key": "exposeRequestDate",
      "label": "Tanggal surat permintaan gelar perkara",
      "type": "date"
     },
     {
      "key": "assistantInvestigator",
      "label": "Penyidik Pembantu (Nama, Pangkat/NRP, Jabatan)",
      "type": "text"
     },
     {
      "key": "investigatorSupervisor",
      "label": "Pengawas Penyidik/Wassidik (Nama, Pangkat/NRP, Jabatan)",
      "type": "text"
     },
     {
      "key": "prosecutorSupervisor",
      "label": "Pengawas Penuntut Umum/Kasi Pidum (Nama, Pangkat/NIP, Jabatan)",
      "type": "text"
     },
     {
      "key": "expertName",
      "label": "Nama Ahli (jika ada)",
      "type": "text"
     },
     {
      "key": "expertField",
      "label": "Keahlian Ahli",
      "type": "text"
     },
     {
      "key": "investigatorFacts",
      "label": "Fakta perbuatan (paparan Penyidik)",
      "type": "textarea",
      "full": true
     },
     {
      "key": "investigatorEvidence",
      "label": "Alat bukti yang sudah didapat (paparan Penyidik)",
      "type": "textarea",
      "full": true
     },
     {
      "key": "investigatorObstacles",
      "label": "Hambatan pemenuhan petunjuk P-19 sebelumnya",
      "type": "textarea",
      "full": true
     },
     {
      "key": "elementAnalysis",
      "label": "Analisis unsur pasal (tanggapan Penuntut Umum)",
      "type": "textarea",
      "full": true
     },
     {
      "key": "p19PointNumbers",
      "label": "Nomor petunjuk P-19 yang belum dipenuhi",
      "type": "text"
     },
     {
      "key": "p19Reason",
      "label": "Alasan yuridis petunjuk P-19 belum dipenuhi",
      "type": "textarea",
      "full": true
     },
     {
      "key": "evidenceValidity",
      "label": "Validitas alat bukti (tanggapan Penuntut Umum)",
      "type": "textarea",
      "full": true
     },
     {
      "key": "expertOpinion",
      "label": "Pendapat Ahli",
      "type": "textarea",
      "full": true
     },
     {
      "key": "investigatorSupervisorOpinion",
      "label": "Pendapat Pengawas Penyidik",
      "type": "textarea",
      "full": true
     },
     {
      "key": "prosecutorSupervisorOpinion",
      "label": "Pendapat Pengawas Penuntut Umum",
      "type": "textarea",
      "full": true
     },
     {
      "key": "sp3Reason",
      "label": "Alasan penghentian penyidikan",
      "type": "select",
      "options": [
       "Peristiwa bukan tindak pidana",
       "Tidak cukup bukti",
       "Demi hukum"
      ]
     },
     {
      "key": "investigatorSuperiorName",
      "label": "Nama Atasan Penyidik",
      "type": "text"
     },
     {
      "key": "investigatorSuperiorRank",
      "label": "Pangkat Atasan Penyidik",
      "type": "text"
     },
     {
      "key": "investigatorSuperiorNip",
      "label": "NRP/NIP Atasan Penyidik",
      "type": "text"
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "prosecutorName",
      "label": "Nama Penuntut Umum / Jaksa",
      "type": "text",
      "source": "case:prosecutorName|user:fullName",
      "editableAuto": true
     },
     {
      "key": "prosecutorRank",
      "label": "Pangkat Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorNip",
      "label": "NIP Penuntut Umum (kosongkan = otomatis dari List Jaksa)",
      "type": "text"
     },
     {
      "key": "prosecutorPosition",
      "label": "Jabatan Penuntut Umum",
      "type": "text"
     }
    ]
   }
  ]
 },
 "SOP FORM 7": {
  "title": "Pengembalian SPDP dan Berkas Perkara karena Belum Dilakukan Penyerahan Tersangka dan Barang Bukti",
  "subtitle": "Format B-310 · Tahap II (tersangka & barang bukti)",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     },
     {
      "key": "recipientTitle",
      "label": "Pejabat yang dituju (Yth.)",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     },
     {
      "key": "recipientPlace",
      "label": "Tempat tujuan (Di –)",
      "type": "text"
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "spdpNumber",
      "label": "Nomor SPDP",
      "type": "text",
      "source": "case:spdpNumber",
      "editableAuto": true
     },
     {
      "key": "spdpDate",
      "label": "Tanggal SPDP",
      "type": "date",
      "source": "case:spdpDate",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "p21Number",
      "label": "Nomor P-21",
      "type": "text",
      "source": "admin:P-21:documentNumber|case:p21Number",
      "editableAuto": true
     },
     {
      "key": "p21Date",
      "label": "Tanggal P-21",
      "type": "date",
      "source": "admin:P-21:documentDate|case:p21Date",
      "editableAuto": true
     },
     {
      "key": "dossierNumber",
      "label": "Nomor berkas perkara",
      "type": "text",
      "source": "case:nomorBerkas",
      "editableAuto": true
     },
     {
      "key": "dossierDate",
      "label": "Tanggal berkas perkara",
      "type": "date",
      "source": "case:tanggalBerkas",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian SOP FORM-7",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "basisLetter",
      "label": "Surat dasar",
      "type": "select",
      "options": [
       "P-21",
       "SOP FORM-8"
      ]
     },
     {
      "key": "attentionOf",
      "label": "U.p.",
      "type": "select",
      "options": [
       "Penyidik",
       "Atasan Penyidik"
      ]
     },
     {
      "key": "sopForm8Number",
      "label": "Nomor SOP FORM-8",
      "type": "text"
     },
     {
      "key": "sopForm8Date",
      "label": "Tanggal SOP FORM-8",
      "type": "date"
     }
    ]
   }
  ]
 },
 "SOP FORM 8": {
  "title": "Pemberitahuan Sikap Penuntut Umum atas Penyerahan Tersangka dan Barang Bukti",
  "subtitle": "Format B-310 · Tahap II (tersangka & barang bukti)",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     },
     {
      "key": "recipientTitle",
      "label": "Pejabat yang dituju (Yth.)",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     },
     {
      "key": "recipientPlace",
      "label": "Tempat tujuan (Di –)",
      "type": "text"
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian SOP FORM-8",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "letterSubject",
      "label": "Sikap Penuntut Umum (perihal surat)",
      "type": "select",
      "options": [
       "Pemberitahuan Penolakan Penyerahan Tersangka dan Barang Bukti",
       "Pemberitahuan Jadwal Penyerahan Tersangka dan Barang Bukti (Tahap II)"
      ]
     },
     {
      "key": "attentionOf",
      "label": "U.p.",
      "type": "select",
      "options": [
       "Penyidik",
       "Atasan Penyidik"
      ]
     },
     {
      "key": "jointExposeDate",
      "label": "Tanggal Berita Acara Gelar Perkara Bersama",
      "type": "date"
     },
     {
      "key": "unprovenElement",
      "label": "Unsur yang belum didukung alat bukti yang sah",
      "type": "text"
     },
     {
      "key": "rejectionReasons",
      "label": "Alasan yuridis penolakan (alasan krusial dan kekurangan alat bukti)",
      "type": "textarea",
      "full": true
     },
     {
      "key": "handoverDay",
      "label": "Hari penyerahan Tersangka dan Barang Bukti",
      "type": "text"
     },
     {
      "key": "handoverDate",
      "label": "Tanggal penyerahan (dalam kurun waktu 14 hari)",
      "type": "date"
     },
     {
      "key": "handoverTime",
      "label": "Pukul penyerahan",
      "type": "text"
     }
    ]
   }
  ]
 },
 "SOP FORM 8A": {
  "title": "Pemberitahuan Hasil Verifikasi SPDP dan Berkas Perkara",
  "subtitle": "Format B-310 · Tahap II (tersangka & barang bukti)",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     },
     {
      "key": "recipientTitle",
      "label": "Pejabat yang dituju (Yth.)",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     },
     {
      "key": "recipientPlace",
      "label": "Tempat tujuan (Di –)",
      "type": "text"
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Rujukan administrasi",
    "description": "Nomor/tanggal administrasi sebelumnya (otomatis bila sudah dibuat).",
    "fields": [
     {
      "key": "p21Date",
      "label": "Tanggal P-21",
      "type": "date",
      "source": "admin:P-21:documentDate|case:p21Date",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Isian SOP FORM-8A",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "verificationFollowUp",
      "label": "Hasil verifikasi / tindak lanjut",
      "type": "select",
      "options": [
       "Permintaan Penyerahan Tersangka & Barang Bukti",
       "Pengembalian Berkas"
      ]
     },
     {
      "key": "attentionOf",
      "label": "U.p.",
      "type": "select",
      "options": [
       "Penyidik",
       "Atasan Penyidik"
      ]
     },
     {
      "key": "sopForm7Number",
      "label": "Nomor SOP FORM-7",
      "type": "text"
     },
     {
      "key": "sopForm7Date",
      "label": "Tanggal SOP FORM-7",
      "type": "date"
     },
     {
      "key": "investigatorCoverLetterNumber",
      "label": "Nomor surat pengantar Penyidik (pengiriman kembali)",
      "type": "text"
     },
     {
      "key": "investigatorCoverLetterDate",
      "label": "Tanggal surat pengantar Penyidik (pengiriman kembali)",
      "type": "date"
     },
     {
      "key": "p24bDate",
      "label": "Tanggal Nota Pendapat Verifikasi (P-24B)",
      "type": "date"
     },
     {
      "key": "handoverDay",
      "label": "Hari penyerahan Tersangka dan Barang Bukti",
      "type": "text"
     },
     {
      "key": "handoverDate",
      "label": "Tanggal penyerahan Tersangka dan Barang Bukti",
      "type": "date"
     },
     {
      "key": "handoverTime",
      "label": "Pukul penyerahan",
      "type": "text"
     },
     {
      "key": "verificationDiscrepancies",
      "label": "Perbedaan substansi yang ditemukan",
      "type": "textarea",
      "full": true
     }
    ]
   }
  ]
 },
 "SP PENUNJUKAN PU": {
  "title": "Surat Perintah Penunjukan Jaksa selaku Penuntut Umum",
  "subtitle": "Format B-310 · Penerimaan SPDP",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "spdpNumber",
      "label": "Nomor SPDP",
      "type": "text",
      "source": "case:spdpNumber",
      "editableAuto": true
     },
     {
      "key": "spdpDate",
      "label": "Tanggal SPDP",
      "type": "date",
      "source": "case:spdpDate",
      "editableAuto": true
     },
     {
      "key": "investigatorInstitution",
      "label": "Instansi penyidik",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     },
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "allegedArticle",
      "label": "Pasal yang disangkakan",
      "type": "textarea",
      "source": "case:allegedArticle",
      "editableAuto": true,
      "full": true
     }
    ]
   },
   {
    "title": "Isian SP PENUNJUKAN PU",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "member1Position",
      "label": "Jabatan Anggota 1",
      "type": "text"
     },
     {
      "key": "member2Position",
      "label": "Jabatan Anggota 2",
      "type": "text"
     },
     {
      "key": "member3Position",
      "label": "Jabatan Anggota 3",
      "type": "text"
     }
    ]
   },
   {
    "title": "Penandatangan & para pihak",
    "description": "Pangkat/NIP Jaksa diisi otomatis dari sheet List Jaksa bila dikosongkan. Kepala Kejaksaan Negeri diambil dari pengaturan backend.",
    "fields": [
     {
      "key": "teamLeaderName",
      "label": "Ketua tim Penuntut Umum",
      "type": "text",
      "source": "admin:P-16:field:teamLeaderName",
      "editableAuto": true
     },
     {
      "key": "member1Name",
      "label": "Anggota tim 1",
      "type": "text",
      "source": "admin:P-16:field:member1Name",
      "editableAuto": true
     },
     {
      "key": "member2Name",
      "label": "Anggota tim 2",
      "type": "text",
      "source": "admin:P-16:field:member2Name",
      "editableAuto": true
     },
     {
      "key": "member3Name",
      "label": "Anggota tim 3",
      "type": "text",
      "source": "admin:P-16:field:member3Name",
      "editableAuto": true
     }
    ]
   }
  ]
 },
 "T-5": {
  "title": "Surat Penolakan Permintaan Perpanjangan Penahanan",
  "subtitle": "Format B-310 · Penahanan & Saksi Mahkota",
  "b310": true,
  "sections": [
   {
    "title": "Identitas dokumen",
    "description": "Nomor, tanggal, dan tujuan surat.",
    "fields": [
     {
      "key": "documentNumber",
      "label": "Nomor surat/administrasi",
      "type": "text"
     },
     {
      "key": "documentDate",
      "label": "Tanggal surat/administrasi",
      "type": "date",
      "required": true,
      "source": "today",
      "editableAuto": true
     }
    ]
   },
   {
    "title": "Data perkara",
    "description": "Terisi otomatis dari data SPDP/perkara — periksa kembali sebelum membuat dokumen.",
    "fields": [
     {
      "key": "investigatorInstitution",
      "label": "Instansi penyidik",
      "type": "text",
      "source": "case:investigatorInstitution",
      "editableAuto": true
     },
     {
      "key": "suspectName",
      "label": "Nama tersangka",
      "type": "text",
      "source": "case:suspectName",
      "editableAuto": true
     },
     {
      "key": "birthPlace",
      "label": "Tempat lahir",
      "type": "text",
      "source": "case:birthPlace",
      "editableAuto": true
     },
     {
      "key": "birthDate",
      "label": "Tanggal lahir",
      "type": "date",
      "source": "case:birthDate",
      "editableAuto": true
     },
     {
      "key": "age",
      "label": "Umur",
      "type": "text",
      "source": "case:age",
      "editableAuto": true
     },
     {
      "key": "gender",
      "label": "Jenis kelamin",
      "type": "text",
      "source": "case:gender",
      "editableAuto": true
     },
     {
      "key": "nationality",
      "label": "Kebangsaan",
      "type": "text",
      "source": "case:nationality",
      "editableAuto": true
     },
     {
      "key": "address",
      "label": "Tempat tinggal",
      "type": "textarea",
      "source": "case:address",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "religion",
      "label": "Agama",
      "type": "text",
      "source": "case:religion",
      "editableAuto": true
     },
     {
      "key": "occupation",
      "label": "Pekerjaan",
      "type": "text",
      "source": "case:occupation",
      "editableAuto": true
     },
     {
      "key": "education",
      "label": "Pendidikan",
      "type": "text",
      "source": "case:education",
      "editableAuto": true
     },
     {
      "key": "allegedArticle",
      "label": "Pasal yang disangkakan",
      "type": "textarea",
      "source": "case:allegedArticle",
      "editableAuto": true,
      "full": true
     },
     {
      "key": "detentionEndDate",
      "label": "Penahanan berakhir",
      "type": "date"
     }
    ]
   },
   {
    "title": "Isian T-5",
    "description": "Bagian yang kosong akan tampil \"......\" pada dokumen dan dapat dilengkapi langsung di Google Docs.",
    "fields": [
     {
      "key": "extensionRequestNumber",
      "label": "Nomor surat permintaan perpanjangan penahanan dari Penyidik",
      "type": "text"
     },
     {
      "key": "extensionRequestDate",
      "label": "Tanggal surat permintaan perpanjangan penahanan",
      "type": "date"
     },
     {
      "key": "detentionWarrantNumber",
      "label": "Nomor Surat Perintah Penahanan dari Penyidik",
      "type": "text"
     },
     {
      "key": "detentionWarrantDate",
      "label": "Tanggal Surat Perintah Penahanan",
      "type": "date"
     },
     {
      "key": "investigationReportDate",
      "label": "Tanggal Resume Hasil Pemeriksaan / Laporan Perkembangan Penyidikan",
      "type": "date"
     },
     {
      "key": "otherRejectionReasons",
      "label": "Alasan kemanusiaan/lainnya",
      "type": "textarea",
      "full": true
     }
    ]
   }
  ]
 }
};
  const extendSections = {
 "P-24": [
  {
   "title": "Tambahan format B-310",
   "description": "Field tambahan yang dipakai template B-310 (varian anak/korporasi dll.).",
   "fields": [
    {
     "key": "suspectCategory",
     "label": "Kategori tersangka",
     "type": "select",
     "options": [
      "Orang Perorangan Dewasa",
      "Anak",
      "Korporasi"
     ]
    }
   ]
  }
 ],
 "P-29": [
  {
   "title": "Tambahan format B-310",
   "description": "Field tambahan yang dipakai template B-310 (varian anak/korporasi dll.).",
   "fields": [
    {
     "key": "corporationName",
     "label": "Nama Korporasi (sesuai Anggaran Dasar)",
     "type": "text"
    },
    {
     "key": "corporationEstablishment",
     "label": "Tempat/Tanggal Pendirian Korporasi",
     "type": "text"
    },
    {
     "key": "corporationDeedNumber",
     "label": "Nomor Anggaran Dasar/Akta Pendirian (termasuk perubahannya)",
     "type": "textarea",
     "full": true
    },
    {
     "key": "corporationDecreeNumber",
     "label": "Nomor Keputusan Menkumham (pengesahan badan hukum)",
     "type": "text"
    },
    {
     "key": "corporationDeedAtOffense",
     "label": "Nomor dan Tanggal Akta pada Saat Tindak Pidana Terjadi",
     "type": "text"
    },
    {
     "key": "corporationDomicile",
     "label": "Tempat Kedudukan Korporasi",
     "type": "textarea",
     "full": true
    },
    {
     "key": "corporationType",
     "label": "Jenis Korporasi (PT/CV/Yayasan/Koperasi/Ormas)",
     "type": "text"
    },
    {
     "key": "corporationBusiness",
     "label": "Bentuk Kegiatan/Usaha Korporasi",
     "type": "text"
    },
    {
     "key": "corporationNpwp",
     "label": "NPWP Korporasi",
     "type": "text"
    },
    {
     "key": "corporationNib",
     "label": "Nomor Induk Berusaha (NIB)",
     "type": "text"
    },
    {
     "key": "representativePosition",
     "label": "Jabatan Pengurus/Kuasa yang mewakili Korporasi",
     "type": "text"
    },
    {
     "key": "diversionNarrative",
     "label": "Uraian upaya Diversi (khusus Anak)",
     "type": "textarea",
     "full": true
    },
    {
     "key": "corporateAttribution",
     "label": "Uraian atribusi kesalahan Korporasi (Pasal 47-48 KUHP)",
     "type": "textarea",
     "full": true
    }
   ]
  }
 ]
};
  const merged = Object.assign({}, base);
  Object.keys(extendSections).forEach((type) => {
    if (!merged[type]) return;
    merged[type] = Object.assign({}, merged[type], { sections: [...(merged[type].sections || []), ...extendSections[type]] });
  });
  Object.keys(extraSchemas).forEach((type) => { if (!merged[type]) merged[type] = extraSchemas[type]; });
  window.SIAP_ADMIN_FORM_SCHEMAS = Object.freeze(merged);
  window.SIAP_B310_STAGES = Object.freeze([
 {
  "code": "P-1A",
  "title": "Tanda Terima Penerimaan SPDP",
  "detail": "Format P-1A · Penerimaan SPDP",
  "phase": "spdp",
  "phaseLabel": "Penerimaan SPDP",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SOP FORM 1 B310",
  "title": "Pengembalian SPDP (Cacat Formil)",
  "detail": "Format SOP FORM-1 · Penerimaan SPDP",
  "phase": "spdp",
  "phaseLabel": "Penerimaan SPDP",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SOP FORM 1A",
  "title": "Nota Pendapat Pengembalian SPDP",
  "detail": "Format SOP FORM-1A · Penerimaan SPDP",
  "phase": "spdp",
  "phaseLabel": "Penerimaan SPDP",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SP PENUNJUKAN PU",
  "title": "Surat Perintah Penunjukan Jaksa selaku Penuntut Umum",
  "detail": "Format tanpa kode · Penerimaan SPDP",
  "phase": "spdp",
  "phaseLabel": "Penerimaan SPDP",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SOP FORM 1B",
  "title": "Laporan Penuntut Umum Perkembangan Hasil Penyidikan",
  "detail": "Format SOP FORM-1B · Koordinasi & pemantauan penyidikan",
  "phase": "koordinasi",
  "phaseLabel": "Koordinasi & pemantauan penyidikan",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SOP FORM 1C",
  "title": "Pemberitahuan Kewajiban Koordinasi kepada Atasan Penyidik",
  "detail": "Format SOP FORM-1C · Koordinasi & pemantauan penyidikan",
  "phase": "koordinasi",
  "phaseLabel": "Koordinasi & pemantauan penyidikan",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SOP FORM 6",
  "title": "Berita Acara Koordinasi Penyidik dan Penuntut Umum",
  "detail": "Format SOP FORM-6 · Koordinasi & pemantauan penyidikan",
  "phase": "koordinasi",
  "phaseLabel": "Koordinasi & pemantauan penyidikan",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SOP FORM 6A",
  "title": "Berita Acara Konsultasi antara Penyelidik dan Pejabat Kejaksaan",
  "detail": "Format SOP FORM-6A · Koordinasi & pemantauan penyidikan",
  "phase": "koordinasi",
  "phaseLabel": "Koordinasi & pemantauan penyidikan",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SM-2",
  "title": "Laporan Penuntut Umum Hasil Koordinasi dengan Penyidik terkait Penetapan Saksi Mahkota",
  "detail": "Format SM-2 · Penahanan & Saksi Mahkota",
  "phase": "upaya_paksa",
  "phaseLabel": "Penahanan & Saksi Mahkota",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SM-3",
  "title": "Surat Perintah Tugas Penyelesaian Permohonan Penetapan Saksi Mahkota",
  "detail": "Format SM-3 · Penahanan & Saksi Mahkota",
  "phase": "upaya_paksa",
  "phaseLabel": "Penahanan & Saksi Mahkota",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SM-3A",
  "title": "Surat Panggilan Tersangka (Saksi Mahkota)",
  "detail": "Format SM-3A · Penahanan & Saksi Mahkota",
  "phase": "upaya_paksa",
  "phaseLabel": "Penahanan & Saksi Mahkota",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SM-4",
  "title": "Kesepakatan Perjanjian Saksi Mahkota",
  "detail": "Format SM-4 · Penahanan & Saksi Mahkota",
  "phase": "upaya_paksa",
  "phaseLabel": "Penahanan & Saksi Mahkota",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SM-5",
  "title": "Permohonan Penetapan Saksi Mahkota",
  "detail": "Format SM-5 · Penahanan & Saksi Mahkota",
  "phase": "upaya_paksa",
  "phaseLabel": "Penahanan & Saksi Mahkota",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SM-6",
  "title": "Pemberitahuan Penetapan Saksi Mahkota",
  "detail": "Format SM-6 · Penahanan & Saksi Mahkota",
  "phase": "upaya_paksa",
  "phaseLabel": "Penahanan & Saksi Mahkota",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SOP FORM 4",
  "title": "Nota Pendapat Perpanjangan Penahanan / Penolakan Perpanjangan Penahanan",
  "detail": "Format SOP FORM-4 · Penahanan & Saksi Mahkota",
  "phase": "upaya_paksa",
  "phaseLabel": "Penahanan & Saksi Mahkota",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "T-5",
  "title": "Surat Penolakan Permintaan Perpanjangan Penahanan",
  "detail": "Format T-5 · Penahanan & Saksi Mahkota",
  "phase": "upaya_paksa",
  "phaseLabel": "Penahanan & Saksi Mahkota",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "PRAPID-1",
  "title": "Surat Perintah Penugasan Penuntut Umum untuk Menghadiri Persidangan Praperadilan",
  "detail": "Format PRAPID-1 · Praperadilan",
  "phase": "prapid",
  "phaseLabel": "Praperadilan",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "PRAPID-1A",
  "title": "Surat Kuasa Khusus Praperadilan",
  "detail": "Format PRAPID-1A · Praperadilan",
  "phase": "prapid",
  "phaseLabel": "Praperadilan",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "PRAPID-1B",
  "title": "Jawaban/Tanggapan Termohon dalam Perkara Praperadilan",
  "detail": "Format PRAPID-1B · Praperadilan",
  "phase": "prapid",
  "phaseLabel": "Praperadilan",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "PRAPID-1C",
  "title": "Nota Dinas Rencana Persidangan Praperadilan",
  "detail": "Format PRAPID-1C · Praperadilan",
  "phase": "prapid",
  "phaseLabel": "Praperadilan",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "PRAPID-1D",
  "title": "Surat Panggilan Saksi/Ahli untuk Persidangan Praperadilan",
  "detail": "Format PRAPID-1D · Praperadilan",
  "phase": "prapid",
  "phaseLabel": "Praperadilan",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "PRAPID-1E",
  "title": "Kesimpulan dalam Perkara Praperadilan",
  "detail": "Format PRAPID-1E · Praperadilan",
  "phase": "prapid",
  "phaseLabel": "Praperadilan",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "PRAPID-5",
  "title": "Laporan Penuntut Umum Setelah Putusan Praperadilan",
  "detail": "Format PRAPID-5 · Praperadilan",
  "phase": "prapid",
  "phaseLabel": "Praperadilan",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "PRAPID-5A",
  "title": "Memori Banding dalam Perkara Praperadilan",
  "detail": "Format PRAPID-5A · Praperadilan",
  "phase": "prapid",
  "phaseLabel": "Praperadilan",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "PRAPID-6",
  "title": "Berita Acara Pelaksanaan Putusan Praperadilan",
  "detail": "Format PRAPID-6 · Praperadilan",
  "phase": "prapid",
  "phaseLabel": "Praperadilan",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "PRAPID-7",
  "title": "Perlawanan Pihak Ketiga (Derden Verzet) atas Putusan Praperadilan",
  "detail": "Format PRAPID-7 · Praperadilan",
  "phase": "prapid",
  "phaseLabel": "Praperadilan",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "PRAPID-7A",
  "title": "Nota Pendapat Pengajuan Perlawanan Pihak Ketiga (Derden Verzet) terhadap Putusan Praperadilan",
  "detail": "Format PRAPID-7A · Praperadilan",
  "phase": "prapid",
  "phaseLabel": "Praperadilan",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "P-1B",
  "title": "Tanda Terima Penerimaan Berkas Perkara",
  "detail": "Format P-1B · Penerimaan berkas (Tahap I)",
  "phase": "tahap1",
  "phaseLabel": "Penerimaan berkas (Tahap I)",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "P-18",
  "title": "Surat Pengantar Pengembalian Berkas Perkara untuk Dilengkapi",
  "detail": "Format P-18 · Penelitian berkas & gelar perkara",
  "phase": "penelitian",
  "phaseLabel": "Penelitian berkas & gelar perkara",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "P-1C",
  "title": "Tanda Terima Penyerahan Berkas Perkara untuk Dilengkapi",
  "detail": "Format P-1C · Penelitian berkas & gelar perkara",
  "phase": "penelitian",
  "phaseLabel": "Penelitian berkas & gelar perkara",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "P-20",
  "title": "Pengembalian SPDP karena Batas Waktu Penyidikan Tambahan Telah Lampau",
  "detail": "Format P-20 · Penelitian berkas & gelar perkara",
  "phase": "penelitian",
  "phaseLabel": "Penelitian berkas & gelar perkara",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SOP FORM 5",
  "title": "Lembar Penelitian Hasil Penyidikan",
  "detail": "Format SOP FORM-5 · Penelitian berkas & gelar perkara",
  "phase": "penelitian",
  "phaseLabel": "Penelitian berkas & gelar perkara",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SOP FORM 5A",
  "title": "Berita Acara Pelaksanaan Ekspose",
  "detail": "Format SOP FORM-5A · Penelitian berkas & gelar perkara",
  "phase": "penelitian",
  "phaseLabel": "Penelitian berkas & gelar perkara",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SOP FORM 5B",
  "title": "Undangan Gelar Perkara (Ekspose) Internal",
  "detail": "Format SOP FORM-5B · Penelitian berkas & gelar perkara",
  "phase": "penelitian",
  "phaseLabel": "Penelitian berkas & gelar perkara",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SOP FORM 6E",
  "title": "Berita Acara Pelaksanaan Gelar Perkara Bersama",
  "detail": "Format SOP FORM-6E · Penelitian berkas & gelar perkara",
  "phase": "penelitian",
  "phaseLabel": "Penelitian berkas & gelar perkara",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "BA-4",
  "title": "Berita Acara Penerimaan dan Penelitian Tersangka",
  "detail": "Format BA-4 · Tahap II (tersangka & barang bukti)",
  "phase": "tahap2",
  "phaseLabel": "Tahap II (tersangka & barang bukti)",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "BA-4A",
  "title": "Berita Acara Pemenuhan Hak Bantuan Hukum pada Tahap Penuntutan",
  "detail": "Format BA-4A · Tahap II (tersangka & barang bukti)",
  "phase": "tahap2",
  "phaseLabel": "Tahap II (tersangka & barang bukti)",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "BA-5",
  "title": "Berita Acara Penerimaan dan Penelitian Benda Sitaan/Barang Bukti",
  "detail": "Format BA-5 · Tahap II (tersangka & barang bukti)",
  "phase": "tahap2",
  "phaseLabel": "Tahap II (tersangka & barang bukti)",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "BA-5A",
  "title": "Nota Pendapat Hasil Penyerahan Tersangka dan Barang Bukti",
  "detail": "Format BA-5A · Tahap II (tersangka & barang bukti)",
  "phase": "tahap2",
  "phaseLabel": "Tahap II (tersangka & barang bukti)",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "BA-5C",
  "title": "Berita Acara Serah Terima Pengelolaan Fisik Benda Sitaan/Barang Bukti",
  "detail": "Format BA-5C · Tahap II (tersangka & barang bukti)",
  "phase": "tahap2",
  "phaseLabel": "Tahap II (tersangka & barang bukti)",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "P-24B",
  "title": "Nota Pendapat Verifikasi SPDP dan Berkas Perkara",
  "detail": "Format P-24B · Tahap II (tersangka & barang bukti)",
  "phase": "tahap2",
  "phaseLabel": "Tahap II (tersangka & barang bukti)",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SOP FORM 7",
  "title": "Pengembalian SPDP dan Berkas Perkara karena Belum Dilakukan Penyerahan Tersangka dan Barang Bukti",
  "detail": "Format SOP FORM-7 · Tahap II (tersangka & barang bukti)",
  "phase": "tahap2",
  "phaseLabel": "Tahap II (tersangka & barang bukti)",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SOP FORM 8",
  "title": "Pemberitahuan Sikap Penuntut Umum atas Penyerahan Tersangka dan Barang Bukti",
  "detail": "Format SOP FORM-8 · Tahap II (tersangka & barang bukti)",
  "phase": "tahap2",
  "phaseLabel": "Tahap II (tersangka & barang bukti)",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "SOP FORM 8A",
  "title": "Pemberitahuan Hasil Verifikasi SPDP dan Berkas Perkara",
  "detail": "Format SOP FORM-8A · Tahap II (tersangka & barang bukti)",
  "phase": "tahap2",
  "phaseLabel": "Tahap II (tersangka & barang bukti)",
  "status": "",
  "prerequisites": [],
  "core": false
 },
 {
  "code": "P-30",
  "title": "Catatan Penuntut Umum",
  "detail": "Format P-30 · Penuntutan",
  "phase": "penuntutan",
  "phaseLabel": "Penuntutan",
  "status": "",
  "prerequisites": [],
  "core": false
 }
]);
  window.SIAP_B310_SHARED_KEYS = Object.freeze(["advocateName", "advocateNip", "advocateRank", "agreementDate", "agreementNumber", "applicantName", "articleElements", "attentionOf", "contestedAction", "costBearer", "courtDecisionDate", "courtDecisionNumber", "crimeType", "crownWitnessStage", "defendantType", "detentionEndDate", "detentionPlace", "detentionStartDate", "detentionType", "dossierDate", "dossierNumber", "expertField", "expertName", "exposeVenue", "extensionEndDate", "extensionRequestDate", "extensionRequestNumber", "extensionStartDate", "hearingDate", "highCourtName", "investigatorLetterDate", "investigatorLetterNumber", "lawFirm", "lawyerName", "mainSuspectName", "member1Name", "member1Position", "member2Name", "member3Name", "officerName", "officerNip", "officerPosition", "officerRank", "otherSuspects", "p16aDate", "p16aNumber", "prapid1Date", "prapid1Number", "pretrialObject", "pretrialRegisterNumber", "prosecutorNip", "prosecutorPosition", "prosecutorRank", "receiverName", "receiverNip", "receiverPosition", "receiverRank", "recipientPlace", "recipientTitle", "registerNumber", "respondentRole", "sm3Date", "sm3Number", "specialPowerDate", "specialPowerNumber", "suspectCategory", "suspectStatus", "teamLeaderName", "witness1Name", "witness2Name"]);
})();
