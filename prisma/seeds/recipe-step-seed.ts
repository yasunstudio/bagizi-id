/**
 * @fileoverview Recipe Step Seed - Instruksi memasak lengkap untuk 21 menu
 * @version Prisma 6.19.0
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 *
 * Complete Indonesian cooking instructions for all nutrition menus
 * Features:
 * - Step-by-step cooking instructions in Indonesian
 * - Duration, temperature, and equipment for each step
 * - Quality control checks for food safety
 * - Professional kitchen standards
 */

import { PrismaClient, NutritionMenu, RecipeStep } from '@prisma/client'

interface RecipeStepData {
  menuCode: string
  steps: {
    stepNumber: number
    title?: string
    instruction: string
    duration?: number // in minutes
    temperature?: number // in celsius
    equipment: string[]
    qualityCheck?: string
  }[]
}

/**
 * Recipe steps for all 21 menus
 * Structure: PMAS lunch menus (12) + PMT snack menus (9)
 */
const RECIPE_STEPS: RecipeStepData[] = [
  // ========================================
  // PMAS LUNCH MENUS (12 recipes)
  // ========================================

  // PMAS-L001: Nasi Ayam Suwir Bumbu Kuning
  {
    menuCode: 'PMAS-L001',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Cuci bersih ayam kampung. Iris bawang merah dan bawang putih. Siapkan bumbu kuning: kunyit, jahe, bawang merah, bawang putih, kemiri. Cuci bersih sayuran (wortel, bayam).',
        duration: 15,
        equipment: ['Pisau', 'Telenan', 'Baskom', 'Cobek/blender'],
        qualityCheck: 'Pastikan ayam segar, tidak berbau. Sayuran hijau segar tanpa layu.'
      },
      {
        stepNumber: 2,
        title: 'Rebus Ayam',
        instruction: 'Rebus ayam kampung dengan air secukupnya hingga empuk (sekitar 45 menit). Angkat, tiriskan, suwir-suwir dagingnya. Sisihkan kaldu untuk kuah.',
        duration: 45,
        temperature: 100,
        equipment: ['Panci besar', 'Sendok', 'Garpu untuk menyuwir'],
        qualityCheck: 'Ayam harus empuk, mudah disuwir. Kaldu bening tidak keruh.'
      },
      {
        stepNumber: 3,
        title: 'Tumis Bumbu Kuning',
        instruction: 'Haluskan bumbu kuning (kunyit, jahe, bawang merah, bawang putih, kemiri). Panaskan minyak, tumis bumbu halus hingga harum dan matang (sekitar 10 menit).',
        duration: 10,
        temperature: 150,
        equipment: ['Wajan', 'Spatula', 'Kompor'],
        qualityCheck: 'Bumbu harum, tidak ada rasa mentah, warna kuning keemasan.'
      },
      {
        stepNumber: 4,
        title: 'Masak Ayam Bumbu Kuning',
        instruction: 'Masukkan ayam suwir ke dalam bumbu yang sudah ditumis. Tambahkan kaldu secukupnya, garam, gula secukupnya. Masak hingga bumbu meresap (15 menit). Koreksi rasa.',
        duration: 15,
        temperature: 100,
        equipment: ['Wajan', 'Spatula', 'Sendok sayur'],
        qualityCheck: 'Rasa gurih seimbang, tidak terlalu asin. Ayam bumbu merata.'
      },
      {
        stepNumber: 5,
        title: 'Masak Nasi',
        instruction: 'Cuci beras putih premium hingga bersih. Masak nasi dengan rice cooker atau panci. Perbandingan beras:air = 1:1.2. Masak hingga matang sempurna.',
        duration: 30,
        equipment: ['Rice cooker/panci', 'Centong nasi'],
        qualityCheck: 'Nasi pulen, tidak lembek, matang merata.'
      },
      {
        stepNumber: 6,
        title: 'Tumis Sayuran',
        instruction: 'Tumis bawang putih cincang, masukkan wortel (potong dadu) hingga setengah matang. Tambahkan bayam, tumis sebentar. Beri sedikit garam. Angkat.',
        duration: 5,
        equipment: ['Wajan', 'Spatula'],
        qualityCheck: 'Sayuran tidak overcooked, wortel masih renyah, bayam tidak gosong.'
      },
      {
        stepNumber: 7,
        title: 'Penyajian & Quality Check',
        instruction: 'Tata nasi di piring/kotak makan. Siram dengan ayam bumbu kuning beserta kuahnya. Tambahkan tumis sayuran di samping. Sajikan hangat.',
        duration: 5,
        equipment: ['Piring/kotak makan', 'Sendok sayur', 'Penjepit'],
        qualityCheck: 'Suhu penyajian 60-70°C. Porsi sesuai standar (200g nasi, 100g ayam, 100g sayur). Tampilan menarik, tidak berantakan.'
      }
    ]
  },

  // PMAS-L002: Nasi Pepes Ikan
  {
    menuCode: 'PMAS-L002',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Cuci bersih ikan nila/mujair, bumbui dengan air jeruk nipis dan garam, diamkan 10 menit. Iris tipis bawang merah, bawang putih, cabai merah, tomat. Siapkan daun pisang, cuci bersih.',
        duration: 15,
        equipment: ['Pisau', 'Telenan', 'Baskom', 'Daun pisang'],
        qualityCheck: 'Ikan segar, mata jernih, insang merah. Daun pisang bersih, tidak robek.'
      },
      {
        stepNumber: 2,
        title: 'Buat Bumbu Pepes',
        instruction: 'Haluskan bumbu: bawang merah, bawang putih, kunyit, jahe, kemiri. Iris tipis cabai merah dan tomat. Campurkan bumbu halus dengan irisan cabai, tomat, daun kemangi. Beri garam dan gula secukupnya.',
        duration: 10,
        equipment: ['Cobek/blender', 'Pisau', 'Mangkuk'],
        qualityCheck: 'Bumbu tercampur rata, aroma harum kunyit dan jahe.'
      },
      {
        stepNumber: 3,
        title: 'Bungkus Ikan dengan Bumbu',
        instruction: 'Olesi ikan dengan bumbu pepes hingga merata. Letakkan ikan di atas daun pisang, tambahkan sisa bumbu di atasnya. Bungkus rapat dengan daun pisang, sematkan dengan tusuk gigi atau tali.',
        duration: 10,
        equipment: ['Daun pisang', 'Tusuk gigi/tali', 'Sendok'],
        qualityCheck: 'Bungkusan rapat, tidak bocor. Bumbu merata di seluruh permukaan ikan.'
      },
      {
        stepNumber: 4,
        title: 'Kukus Pepes Ikan',
        instruction: 'Kukus pepes ikan dalam steamer atau dandang selama 30-40 menit hingga ikan matang sempurna dan bumbu meresap. Buka sedikit bungkusan untuk mengecek kematangan.',
        duration: 40,
        temperature: 100,
        equipment: ['Steamer/dandang', 'Kompor'],
        qualityCheck: 'Ikan matang sempurna (daging putih, tidak berlendir), bumbu meresap, aroma harum.'
      },
      {
        stepNumber: 5,
        title: 'Masak Nasi',
        instruction: 'Cuci beras putih premium hingga bersih. Masak nasi dengan rice cooker. Perbandingan beras:air = 1:1.2. Masak hingga matang sempurna dan pulen.',
        duration: 30,
        equipment: ['Rice cooker', 'Centong nasi'],
        qualityCheck: 'Nasi pulen, tidak lembek atau keras, matang merata.'
      },
      {
        stepNumber: 6,
        title: 'Tumis Sayuran Pelengkap',
        instruction: 'Tumis bawang putih cincang, masukkan kangkung/bayam yang sudah dicuci bersih. Tambahkan sedikit garam. Tumis sebentar hingga layu tapi masih hijau segar. Angkat.',
        duration: 5,
        equipment: ['Wajan', 'Spatula'],
        qualityCheck: 'Sayuran hijau segar, tidak overcooked, tekstur masih renyah.'
      },
      {
        stepNumber: 7,
        title: 'Penyajian & Quality Check',
        instruction: 'Tata nasi di piring/kotak makan. Letakkan pepes ikan di sampingnya (bisa dibuka bungkusannya atau tetap terbungkus). Tambahkan sayuran tumis. Tambahkan sambal jika tersedia.',
        duration: 5,
        equipment: ['Piring/kotak makan', 'Sendok sayur'],
        qualityCheck: 'Suhu penyajian 60-70°C. Porsi sesuai standar. Pepes ikan utuh, tidak hancur. Tampilan menarik.'
      }
    ]
  },

  // PMAS-L003: Nasi Rendang Sapi
  {
    menuCode: 'PMAS-L003',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Potong daging sapi menjadi kubus (3x3 cm). Cuci bersih. Siapkan bumbu rendang: bawang merah, bawang putih, cabai merah, jahe, kunyit, kemiri, lengkuas, serai. Siapkan santan kental dan kelapa parut sangrai.',
        duration: 20,
        equipment: ['Pisau', 'Telenan', 'Baskom', 'Cobek/blender', 'Wajan untuk sangrai'],
        qualityCheck: 'Daging sapi segar merah muda, tidak berbau. Kelapa parut kering sangrai hingga cokelat.'
      },
      {
        stepNumber: 2,
        title: 'Haluskan Bumbu Rendang',
        instruction: 'Haluskan bumbu: bawang merah 8 siung, bawang putih 5 siung, cabai merah 10 buah, jahe 3 cm, kunyit 2 cm, kemiri 5 butir. Geprek lengkuas dan serai.',
        duration: 15,
        equipment: ['Cobek/blender', 'Pisau'],
        qualityCheck: 'Bumbu halus sempurna, tidak ada yang masih kasar.'
      },
      {
        stepNumber: 3,
        title: 'Tumis Bumbu',
        instruction: 'Panaskan minyak, tumis bumbu halus, lengkuas, serai, daun salam, daun jeruk hingga harum dan berminyak (15 menit). Api sedang, aduk terus agar tidak gosong.',
        duration: 15,
        temperature: 150,
        equipment: ['Wajan besar/panci', 'Spatula kayu', 'Kompor'],
        qualityCheck: 'Bumbu harum, berminyak, tidak ada rasa mentah, warna merah kecokelatan.'
      },
      {
        stepNumber: 4,
        title: 'Masak Daging dengan Santan',
        instruction: 'Masukkan potongan daging sapi, aduk rata dengan bumbu. Tambahkan santan kental, garam, gula merah. Masak dengan api sedang sambil terus diaduk hingga santan menyusut dan daging empuk (1-1.5 jam).',
        duration: 90,
        temperature: 90,
        equipment: ['Panci besar', 'Sendok kayu', 'Kompor'],
        qualityCheck: 'Daging empuk (mudah ditusuk garpu), santan tidak pecah, bumbu meresap.'
      },
      {
        stepNumber: 5,
        title: 'Tambahkan Kelapa Sangrai',
        instruction: 'Setelah daging empuk dan kuah menyusut, tambahkan kelapa parut sangrai. Aduk rata. Masak terus sambil diaduk hingga kuah mengental dan berminyak (30 menit). Koreksi rasa.',
        duration: 30,
        temperature: 80,
        equipment: ['Sendok kayu', 'Spatula'],
        qualityCheck: 'Rendang kering, berminyak, warna cokelat tua, daging sangat empuk.'
      },
      {
        stepNumber: 6,
        title: 'Masak Nasi',
        instruction: 'Cuci beras putih premium. Masak nasi dengan rice cooker hingga matang sempurna dan pulen.',
        duration: 30,
        equipment: ['Rice cooker', 'Centong'],
        qualityCheck: 'Nasi pulen, matang merata.'
      },
      {
        stepNumber: 7,
        title: 'Penyajian & Quality Check',
        instruction: 'Tata nasi di piring. Siram dengan rendang sapi beserta minyaknya. Tambahkan sayuran rebus (wortel, kacang panjang) sebagai pelengkap. Sajikan hangat.',
        duration: 5,
        equipment: ['Piring/kotak makan', 'Sendok sayur'],
        qualityCheck: 'Suhu 60-70°C. Rendang berminyak, warna cokelat gelap. Porsi sesuai standar (200g nasi, 100g rendang).'
      }
    ]
  },

  // PMAS-L004: Nasi Telur Bumbu Bali
  {
    menuCode: 'PMAS-L004',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Siapkan telur ayam. Haluskan bumbu Bali: bawang merah, bawang putih, cabai merah, kencur, kunyit, terasi, gula merah. Iris tomat dan daun salam.',
        duration: 15,
        equipment: ['Cobek/blender', 'Pisau', 'Telenan', 'Mangkuk'],
        qualityCheck: 'Telur segar (tidak berbau). Bumbu halus sempurna.'
      },
      {
        stepNumber: 2,
        title: 'Rebus Telur',
        instruction: 'Rebus telur hingga matang sempurna (10 menit). Angkat, rendam air dingin, kupas kulitnya. Goreng telur rebus hingga kulitnya kecokelatan dan berkerut. Tiriskan.',
        duration: 15,
        temperature: 180,
        equipment: ['Panci', 'Wajan', 'Minyak goreng', 'Serok'],
        qualityCheck: 'Telur matang sempurna, kulit luar kecokelatan, tekstur kenyal.'
      },
      {
        stepNumber: 3,
        title: 'Tumis Bumbu Bali',
        instruction: 'Panaskan minyak, tumis bumbu halus, daun salam, daun jeruk hingga harum dan matang (10 menit). Tambahkan irisan tomat, kecap manis, garam, gula. Aduk rata.',
        duration: 10,
        temperature: 150,
        equipment: ['Wajan', 'Spatula'],
        qualityCheck: 'Bumbu harum, tidak ada rasa terasi mentah, warna merah kecokelatan.'
      },
      {
        stepNumber: 4,
        title: 'Masak Telur dengan Bumbu',
        instruction: 'Masukkan telur goreng ke dalam bumbu. Tambahkan sedikit air, masak hingga bumbu meresap ke telur (10 menit). Belah telur menjadi 2-4 bagian agar bumbu meresap. Koreksi rasa.',
        duration: 10,
        temperature: 100,
        equipment: ['Wajan', 'Sendok sayur'],
        qualityCheck: 'Bumbu meresap ke telur, kuah kental, rasa gurih pedas seimbang.'
      },
      {
        stepNumber: 5,
        title: 'Masak Nasi',
        instruction: 'Cuci beras putih premium. Masak dengan rice cooker hingga pulen dan matang sempurna.',
        duration: 30,
        equipment: ['Rice cooker', 'Centong'],
        qualityCheck: 'Nasi pulen, tidak lembek.'
      },
      {
        stepNumber: 6,
        title: 'Tumis Sayuran',
        instruction: 'Tumis bawang putih, masukkan kacang panjang potong 3 cm, wortel iris tipis. Beri sedikit garam. Tumis hingga matang tapi masih renyah.',
        duration: 7,
        equipment: ['Wajan', 'Spatula'],
        qualityCheck: 'Sayuran matang tapi masih renyah, warna cerah.'
      },
      {
        stepNumber: 7,
        title: 'Penyajian & Quality Check',
        instruction: 'Tata nasi di piring. Letakkan telur bumbu Bali dengan kuahnya. Tambahkan tumis sayuran di samping. Sajikan hangat dengan kerupuk jika ada.',
        duration: 5,
        equipment: ['Piring/kotak makan', 'Sendok sayur'],
        qualityCheck: 'Suhu 60-70°C. Porsi sesuai (200g nasi, 2-3 potong telur, 100g sayur). Tampilan menarik.'
      }
    ]
  },

  // PMAS-L005: Nasi Oseng Tempe Tahu
  {
    menuCode: 'PMAS-L005',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Potong dadu tempe dan tahu (2x2 cm). Iris bawang merah, bawang putih, cabai merah, cabai hijau. Cuci kacang panjang, potong 3 cm. Siapkan daun salam dan lengkuas.',
        duration: 15,
        equipment: ['Pisau', 'Telenan', 'Baskom'],
        qualityCheck: 'Tempe segar tidak berlendir. Tahu putih bersih tidak asam.'
      },
      {
        stepNumber: 2,
        title: 'Goreng Tempe dan Tahu',
        instruction: 'Goreng tempe dan tahu hingga kuning kecokelatan dan matang. Angkat, tiriskan. Sisihkan untuk ditumis nanti.',
        duration: 10,
        temperature: 170,
        equipment: ['Wajan', 'Minyak goreng', 'Serok', 'Piring'],
        qualityCheck: 'Tempe dan tahu renyah di luar, empuk di dalam, warna kuning keemasan.'
      },
      {
        stepNumber: 3,
        title: 'Tumis Bumbu',
        instruction: 'Panaskan sedikit minyak, tumis bawang merah, bawang putih, cabai merah, cabai hijau, daun salam, lengkuas geprek hingga harum (5 menit).',
        duration: 5,
        temperature: 150,
        equipment: ['Wajan', 'Spatula'],
        qualityCheck: 'Bumbu harum, tidak gosong, warna kecokelatan.'
      },
      {
        stepNumber: 4,
        title: 'Oseng Tempe Tahu dengan Sayuran',
        instruction: 'Masukkan tempe dan tahu goreng ke dalam tumisan bumbu. Tambahkan kacang panjang, santan sedikit, kecap manis, garam, gula. Oseng dengan api besar sambil terus diaduk hingga bumbu meresap (7 menit). Koreksi rasa.',
        duration: 7,
        temperature: 180,
        equipment: ['Wajan', 'Spatula', 'Sendok'],
        qualityCheck: 'Bumbu merata, tempe tahu tidak hancur, kacang panjang matang tapi renyah.'
      },
      {
        stepNumber: 5,
        title: 'Masak Nasi',
        instruction: 'Cuci beras putih premium. Masak nasi dengan rice cooker hingga pulen dan matang sempurna.',
        duration: 30,
        equipment: ['Rice cooker', 'Centong'],
        qualityCheck: 'Nasi pulen, matang merata.'
      },
      {
        stepNumber: 6,
        title: 'Penyajian & Quality Check',
        instruction: 'Tata nasi di piring/kotak makan. Siram dengan oseng tempe tahu beserta kuahnya. Tambahkan kerupuk jika tersedia. Sajikan hangat.',
        duration: 5,
        equipment: ['Piring/kotak makan', 'Sendok sayur'],
        qualityCheck: 'Suhu 60-70°C. Porsi sesuai (200g nasi, 150g oseng tempe tahu). Menu vegetarian bergizi tinggi.'
      }
    ]
  },

  // PMAS-L006: Mie Goreng Telur
  {
    menuCode: 'PMAS-L006',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Rebus mie kuning hingga matang, tiriskan. Kocok lepas telur ayam. Iris tipis bawang merah, bawang putih, daun bawang, kubis, wortel. Siapkan sawi hijau.',
        duration: 15,
        equipment: ['Panci', 'Mangkuk', 'Pisau', 'Telenan', 'Saringan'],
        qualityCheck: 'Mie matang sempurna tidak lembek. Sayuran segar dan bersih.'
      },
      {
        stepNumber: 2,
        title: 'Orak-arik Telur',
        instruction: 'Panaskan sedikit minyak, buat orak-arik telur (scrambled egg) hingga matang. Sisihkan.',
        duration: 3,
        temperature: 150,
        equipment: ['Wajan', 'Spatula'],
        qualityCheck: 'Telur matang sempurna, tekstur lembut tidak kering.'
      },
      {
        stepNumber: 3,
        title: 'Tumis Bumbu dan Sayuran',
        instruction: 'Panaskan minyak, tumis bawang merah, bawang putih hingga harum. Masukkan wortel, kubis, tumis hingga setengah matang (3 menit).',
        duration: 5,
        temperature: 180,
        equipment: ['Wajan besar', 'Spatula'],
        qualityCheck: 'Bumbu harum, sayuran mulai layu tapi masih renyah.'
      },
      {
        stepNumber: 4,
        title: 'Goreng Mie',
        instruction: 'Masukkan mie yang sudah direbus ke dalam wajan. Tambahkan kecap manis, saus tiram, garam, merica. Aduk rata dengan api besar. Masukkan telur orak-arik, sawi hijau, daun bawang. Aduk cepat hingga bumbu merata (5 menit).',
        duration: 5,
        temperature: 200,
        equipment: ['Wajan besar', 'Spatula/sendok kayu', 'Kompor'],
        qualityCheck: 'Mie tidak lengket, bumbu merata, sayuran matang sempurna, warna menarik.'
      },
      {
        stepNumber: 5,
        title: 'Penyajian & Quality Check',
        instruction: 'Tata mie goreng di piring/kotak makan. Tambahkan taburan bawang goreng di atasnya. Sajikan hangat dengan acar timun jika tersedia.',
        duration: 3,
        equipment: ['Piring/kotak makan', 'Sendok sayur', 'Penjepit'],
        qualityCheck: 'Suhu 60-70°C. Porsi sesuai standar (300g mie goreng). Tampilan menarik, tidak berminyak berlebihan.'
      }
    ]
  },

  // PMAS-L007: Nasi Opor Ayam
  {
    menuCode: 'PMAS-L007',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Potong ayam menjadi 8-12 bagian, cuci bersih. Haluskan bumbu: bawang merah, bawang putih, kemiri, ketumbar, merica. Siapkan santan kental, lengkuas, serai, daun salam, daun jeruk.',
        duration: 20,
        equipment: ['Pisau', 'Telenan', 'Cobek/blender', 'Baskom'],
        qualityCheck: 'Ayam segar. Bumbu halus sempurna. Santan kental berkualitas baik.'
      },
      {
        stepNumber: 2,
        title: 'Tumis Bumbu Opor',
        instruction: 'Panaskan minyak, tumis bumbu halus, lengkuas geprek, serai geprek, daun salam, daun jeruk hingga harum dan matang (10 menit). Aduk terus agar tidak gosong.',
        duration: 10,
        temperature: 150,
        equipment: ['Panci/wajan', 'Spatula kayu', 'Kompor'],
        qualityCheck: 'Bumbu harum, berminyak, tidak ada rasa mentah.'
      },
      {
        stepNumber: 3,
        title: 'Masak Ayam dengan Santan',
        instruction: 'Masukkan potongan ayam, aduk rata dengan bumbu. Tuang santan kental, tambahkan air secukupnya, garam, gula pasir. Masak dengan api sedang sambil sesekali diaduk hingga ayam empuk dan kuah mengental (40 menit). Jangan biarkan santan pecah.',
        duration: 40,
        temperature: 90,
        equipment: ['Panci besar', 'Sendok kayu', 'Kompor'],
        qualityCheck: 'Ayam empuk, santan tidak pecah (kuah kental putih), bumbu meresap. Koreksi rasa.'
      },
      {
        stepNumber: 4,
        title: 'Masak Nasi',
        instruction: 'Cuci beras putih premium hingga bersih. Masak nasi dengan rice cooker hingga pulen dan matang sempurna.',
        duration: 30,
        equipment: ['Rice cooker', 'Centong'],
        qualityCheck: 'Nasi pulen, matang merata.'
      },
      {
        stepNumber: 5,
        title: 'Siapkan Pelengkap',
        instruction: 'Rebus telur hingga matang, kupas. Goreng kacang tanah hingga garing. Siapkan sebagai pelengkap opor.',
        duration: 15,
        equipment: ['Panci', 'Wajan', 'Serok'],
        qualityCheck: 'Telur matang sempurna. Kacang garing renyah.'
      },
      {
        stepNumber: 6,
        title: 'Penyajian & Quality Check',
        instruction: 'Tata nasi di piring/kotak makan. Siram dengan opor ayam dan kuah santannya. Tambahkan telur rebus dan kacang goreng. Sajikan hangat.',
        duration: 5,
        equipment: ['Piring/kotak makan', 'Sendok sayur'],
        qualityCheck: 'Suhu 60-70°C. Opor berwarna putih kental. Porsi sesuai (200g nasi, 1-2 potong ayam, kuah santan).'
      }
    ]
  },

  // PMAS-L008: Nasi Soto Ayam
  {
    menuCode: 'PMAS-L008',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Rebus ayam utuh dengan air, jahe, serai, daun salam hingga empuk (45 menit). Angkat ayam, suwir dagingnya, saring kaldunya. Haluskan bumbu: bawang merah, bawang putih, kunyit, kemiri, ketumbar.',
        duration: 60,
        temperature: 100,
        equipment: ['Panci besar', 'Cobek/blender', 'Saringan', 'Garpu'],
        qualityCheck: 'Ayam empuk mudah disuwir. Kaldu bening kuning keemasan. Bumbu halus.'
      },
      {
        stepNumber: 2,
        title: 'Tumis Bumbu Soto',
        instruction: 'Panaskan minyak, tumis bumbu halus hingga harum dan matang (10 menit). Tambahkan serai geprek, lengkuas geprek, daun salam, daun jeruk.',
        duration: 10,
        temperature: 150,
        equipment: ['Wajan', 'Spatula'],
        qualityCheck: 'Bumbu harum kunyit, tidak ada rasa mentah.'
      },
      {
        stepNumber: 3,
        title: 'Masak Kuah Soto',
        instruction: 'Tuang bumbu tumis ke dalam kaldu ayam. Tambahkan garam, gula, merica bubuk. Masak hingga mendidih dan bumbu meresap (15 menit). Koreksi rasa.',
        duration: 15,
        temperature: 100,
        equipment: ['Panci besar', 'Sendok sayur'],
        qualityCheck: 'Kuah kuning bening, rasa gurih segar seimbang, aroma harum.'
      },
      {
        stepNumber: 4,
        title: 'Rebus Mie dan Sayuran',
        instruction: 'Rebus mie kuning hingga matang, tiriskan. Rebus tauge dan kol iris hingga matang tapi masih renyah (2 menit). Tiriskan.',
        duration: 10,
        equipment: ['Panci', 'Saringan'],
        qualityCheck: 'Mie matang tidak lembek. Sayuran matang tapi masih renyah.'
      },
      {
        stepNumber: 5,
        title: 'Masak Nasi',
        instruction: 'Cuci beras putih premium. Masak dengan rice cooker hingga pulen dan matang sempurna.',
        duration: 30,
        equipment: ['Rice cooker', 'Centong'],
        qualityCheck: 'Nasi pulen, matang merata.'
      },
      {
        stepNumber: 6,
        title: 'Penyajian & Quality Check',
        instruction: 'Tata nasi di mangkuk/kotak. Tambahkan mie, tauge, kol. Letakkan ayam suwir di atasnya. Siram dengan kuah soto panas. Tambahkan bawang goreng, seledri, jeruk nipis, sambal. Sajikan hangat.',
        duration: 5,
        equipment: ['Mangkuk', 'Sendok sayur', 'Penjepit'],
        qualityCheck: 'Suhu 70-80°C. Kuah cukup, tidak terlalu sedikit. Porsi lengkap dan menarik.'
      }
    ]
  },

  // PMAS-L009: Nasi Ikan Bumbu Kuning
  {
    menuCode: 'PMAS-L009',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Cuci bersih ikan kakap/ikan merah, bumbui dengan jeruk nipis dan garam, diamkan 10 menit. Haluskan bumbu kuning: kunyit, jahe, bawang merah, bawang putih, kemiri, kunyit. Siapkan serai, lengkuas, daun jeruk.',
        duration: 20,
        equipment: ['Pisau', 'Telenan', 'Baskom', 'Cobek/blender'],
        qualityCheck: 'Ikan segar (mata jernih, insang merah). Bumbu halus sempurna.'
      },
      {
        stepNumber: 2,
        title: 'Goreng Ikan Setengah Matang',
        instruction: 'Goreng ikan hingga setengah matang dan kulitnya kecokelatan (5 menit per sisi). Angkat, tiriskan.',
        duration: 10,
        temperature: 170,
        equipment: ['Wajan', 'Minyak goreng', 'Serok'],
        qualityCheck: 'Ikan setengah matang, kulit garing, tidak hancur.'
      },
      {
        stepNumber: 3,
        title: 'Tumis Bumbu Kuning',
        instruction: 'Panaskan minyak, tumis bumbu halus, serai geprek, lengkuas geprek, daun jeruk, daun salam hingga harum dan matang (10 menit).',
        duration: 10,
        temperature: 150,
        equipment: ['Panci/wajan', 'Spatula'],
        qualityCheck: 'Bumbu harum kunyit, warna kuning keemasan, tidak gosong.'
      },
      {
        stepNumber: 4,
        title: 'Masak Ikan dengan Bumbu Kuning',
        instruction: 'Masukkan ikan goreng ke dalam bumbu. Tambahkan air secukupnya, garam, gula, asam jawa/belimbing wuluh. Masak dengan api sedang hingga bumbu meresap dan kuah menyusut (20 menit). Balik ikan hati-hati agar tidak hancur.',
        duration: 20,
        temperature: 90,
        equipment: ['Panci', 'Sendok sayur', 'Spatula'],
        qualityCheck: 'Ikan matang sempurna, bumbu meresap, kuah kuning kental, rasa segar asam gurih.'
      },
      {
        stepNumber: 5,
        title: 'Masak Nasi',
        instruction: 'Cuci beras putih premium. Masak dengan rice cooker hingga pulen.',
        duration: 30,
        equipment: ['Rice cooker', 'Centong'],
        qualityCheck: 'Nasi pulen, matang merata.'
      },
      {
        stepNumber: 6,
        title: 'Tumis Sayuran Pelengkap',
        instruction: 'Tumis bawang putih, masukkan buncis/kacang panjang potong, wortel iris. Tumis hingga matang tapi masih renyah. Beri sedikit garam.',
        duration: 7,
        equipment: ['Wajan', 'Spatula'],
        qualityCheck: 'Sayuran matang, warna cerah, tekstur renyah.'
      },
      {
        stepNumber: 7,
        title: 'Penyajian & Quality Check',
        instruction: 'Tata nasi di piring/kotak makan. Letakkan ikan bumbu kuning dengan kuahnya. Tambahkan sayuran tumis di samping. Sajikan hangat dengan sambal.',
        duration: 5,
        equipment: ['Piring/kotak makan', 'Sendok sayur'],
        qualityCheck: 'Suhu 60-70°C. Ikan utuh tidak hancur. Porsi sesuai standar. Kuah cukup.'
      }
    ]
  },

  // PMAS-L010: Nasi Pecel
  {
    menuCode: 'PMAS-L010',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Cuci bersih sayuran: bayam, kacang panjang, tauge, kangkung. Rebus telur hingga matang. Siapkan kacang tanah sangrai untuk sambal pecel. Haluskan bumbu pecel: kacang tanah sangrai, cabai merah, bawang putih, gula merah, asam jawa, kencur.',
        duration: 20,
        equipment: ['Pisau', 'Baskom', 'Panci', 'Cobek/blender', 'Wajan sangrai'],
        qualityCheck: 'Sayuran segar hijau. Kacang tanah sangrai matang harum. Bumbu halus.'
      },
      {
        stepNumber: 2,
        title: 'Sangrai Kacang untuk Sambal',
        instruction: 'Sangrai kacang tanah tanpa minyak hingga matang dan harum (10 menit). Angkat, tiriskan, kupas kulitnya.',
        duration: 10,
        temperature: 140,
        equipment: ['Wajan', 'Spatula'],
        qualityCheck: 'Kacang sangrai matang merata, harum, warna cokelat muda.'
      },
      {
        stepNumber: 3,
        title: 'Buat Sambal Pecel',
        instruction: 'Haluskan kacang tanah sangrai dengan cobek/blender. Haluskan cabai merah, bawang putih, kencur, gula merah. Campurkan dengan kacang halus, tambahkan air asam jawa, garam, sedikit air matang. Aduk rata hingga kental seperti saus.',
        duration: 15,
        equipment: ['Cobek/blender', 'Mangkuk', 'Sendok'],
        qualityCheck: 'Sambal pecel kental, rasa gurih manis pedas seimbang, tekstur halus.'
      },
      {
        stepNumber: 4,
        title: 'Rebus Sayuran',
        instruction: 'Rebus air hingga mendidih. Rebus sayuran satu per satu (kacang panjang 3 menit, bayam 2 menit, kangkung 2 menit, tauge 1 menit). Jangan overcook agar tetap renyah. Tiriskan.',
        duration: 10,
        temperature: 100,
        equipment: ['Panci besar', 'Saringan', 'Penjepit'],
        qualityCheck: 'Sayuran matang sempurna tapi masih renyah, warna hijau cerah.'
      },
      {
        stepNumber: 5,
        title: 'Masak Nasi',
        instruction: 'Cuci beras putih premium. Masak dengan rice cooker hingga pulen.',
        duration: 30,
        equipment: ['Rice cooker', 'Centong'],
        qualityCheck: 'Nasi pulen, matang merata.'
      },
      {
        stepNumber: 6,
        title: 'Goreng Tempe dan Tahu',
        instruction: 'Potong tempe dan tahu sesuai selera. Goreng hingga kuning kecokelatan dan garing. Tiriskan.',
        duration: 10,
        temperature: 170,
        equipment: ['Wajan', 'Minyak goreng', 'Serok'],
        qualityCheck: 'Tempe dan tahu garing, warna kuning keemasan.'
      },
      {
        stepNumber: 7,
        title: 'Penyajian & Quality Check',
        instruction: 'Tata nasi di piring. Susun sayuran rebus (bayam, kacang panjang, kangkung, tauge). Tambahkan tempe goreng, tahu goreng, telur rebus potong. Siram dengan sambal pecel kacang. Tambahkan kerupuk. Sajikan hangat atau suhu ruang.',
        duration: 5,
        equipment: ['Piring/kotak makan', 'Sendok sayur'],
        qualityCheck: 'Sambal pecel cukup merata. Sayuran segar hijau. Porsi lengkap bergizi tinggi. Menu vegetarian friendly.'
      }
    ]
  },

  // PMAS-L011: Nasi Lodeh Ayam
  {
    menuCode: 'PMAS-L011',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Potong ayam menjadi 8 bagian. Cuci bersih sayuran: labu siam, kacang panjang, wortel. Haluskan bumbu: bawang merah, bawang putih, kemiri, ketumbar, merica. Siapkan santan kental, lengkuas, serai, daun salam.',
        duration: 20,
        equipment: ['Pisau', 'Telenan', 'Baskom', 'Cobek/blender'],
        qualityCheck: 'Ayam segar. Sayuran segar. Bumbu halus. Santan kental berkualitas.'
      },
      {
        stepNumber: 2,
        title: 'Tumis Bumbu Lodeh',
        instruction: 'Panaskan minyak, tumis bumbu halus, lengkuas geprek, serai geprek, daun salam hingga harum dan matang (10 menit).',
        duration: 10,
        temperature: 150,
        equipment: ['Panci besar', 'Spatula kayu'],
        qualityCheck: 'Bumbu harum, berminyak, tidak ada rasa mentah.'
      },
      {
        stepNumber: 3,
        title: 'Masak Ayam dan Sayuran',
        instruction: 'Masukkan potongan ayam ke dalam bumbu, aduk rata. Tambahkan air secukupnya, masak hingga ayam setengah matang (15 menit). Masukkan sayuran keras terlebih dahulu (labu siam, wortel), masak 5 menit. Lalu masukkan kacang panjang.',
        duration: 20,
        temperature: 90,
        equipment: ['Panci besar', 'Sendok kayu'],
        qualityCheck: 'Ayam mulai empuk, sayuran mulai matang tapi masih renyah.'
      },
      {
        stepNumber: 4,
        title: 'Tambahkan Santan',
        instruction: 'Tuang santan kental, tambahkan garam, gula pasir. Masak dengan api sedang kecil sambil sesekali diaduk hingga ayam empuk, sayuran matang, dan kuah lodeh mengental (20 menit). Jangan biarkan santan pecah. Koreksi rasa.',
        duration: 20,
        temperature: 80,
        equipment: ['Panci', 'Sendok kayu', 'Kompor'],
        qualityCheck: 'Ayam empuk, sayuran matang sempurna, santan tidak pecah (kuah kental putih), rasa gurih.'
      },
      {
        stepNumber: 5,
        title: 'Masak Nasi',
        instruction: 'Cuci beras putih premium. Masak dengan rice cooker hingga pulen.',
        duration: 30,
        equipment: ['Rice cooker', 'Centong'],
        qualityCheck: 'Nasi pulen, matang merata.'
      },
      {
        stepNumber: 6,
        title: 'Rebus Telur Pelengkap',
        instruction: 'Rebus telur hingga matang, kupas kulitnya. Bisa dibelah dua sebagai pelengkap.',
        duration: 10,
        equipment: ['Panci kecil', 'Pisau'],
        qualityCheck: 'Telur matang sempurna.'
      },
      {
        stepNumber: 7,
        title: 'Penyajian & Quality Check',
        instruction: 'Tata nasi di mangkuk/kotak makan. Siram dengan sayur lodeh ayam beserta kuah santannya yang kental. Tambahkan telur rebus dan kerupuk. Sajikan hangat.',
        duration: 5,
        equipment: ['Mangkuk', 'Sendok sayur'],
        qualityCheck: 'Suhu 60-70°C. Lodeh berwarna putih kental. Sayuran tidak overcook. Porsi lengkap.'
      }
    ]
  },

  // PMAS-L012: Nasi Gudeg Ayam
  {
    menuCode: 'PMAS-L012',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Cuci bersih potongan ayam. Potong nangka muda (150g), kentang (100g) sesuai ukuran. Haluskan bumbu gudeg: bawang merah, bawang putih, kemiri, ketumbar. Siapkan santan kental, lengkuas, serai, daun salam, daun jati (jika ada), gula merah.',
        duration: 25,
        equipment: ['Pisau', 'Telenan', 'Baskom', 'Cobek/blender'],
        qualityCheck: 'Nangka muda segar. Ayam segar. Bumbu halus. Santan kental.'
      },
      {
        stepNumber: 2,
        title: 'Tumis Bumbu Gudeg',
        instruction: 'Panaskan minyak, tumis bumbu halus, lengkuas geprek, serai geprek, daun salam hingga harum dan matang (10 menit).',
        duration: 10,
        temperature: 150,
        equipment: ['Panci besar', 'Spatula kayu'],
        qualityCheck: 'Bumbu harum, berminyak, tidak gosong.'
      },
      {
        stepNumber: 3,
        title: 'Masak Nangka dan Ayam dengan Santan',
        instruction: 'Masukkan nangka muda, ayam, kentang ke dalam bumbu. Tuang santan kental, tambahkan air secukupnya, gula merah sisir, garam. Masak dengan api kecil sambil sesekali diaduk hingga nangka empuk, ayam empuk, dan kuah menyusut menjadi kental berwarna cokelat (1-1.5 jam). Sabar, gudeg butuh waktu lama.',
        duration: 90,
        temperature: 75,
        equipment: ['Panci besar bertutup', 'Sendok kayu', 'Kompor'],
        qualityCheck: 'Nangka empuk berwarna cokelat, ayam sangat empuk, kentang lembut, kuah kental manis gurih.'
      },
      {
        stepNumber: 4,
        title: 'Koreksi Rasa Gudeg',
        instruction: 'Setelah gudeg matang dan mengental, koreksi rasa. Tambahkan gula merah atau garam jika perlu. Gudeg yang baik harus manis gurih seimbang, warna cokelat gelap.',
        duration: 5,
        equipment: ['Sendok', 'Piring kecil untuk tes rasa'],
        qualityCheck: 'Rasa manis gurih seimbang, tekstur sangat empuk, warna cokelat tua.'
      },
      {
        stepNumber: 5,
        title: 'Masak Nasi',
        instruction: 'Cuci beras putih premium. Masak dengan rice cooker hingga pulen.',
        duration: 30,
        equipment: ['Rice cooker', 'Centong'],
        qualityCheck: 'Nasi pulen, matang merata.'
      },
      {
        stepNumber: 6,
        title: 'Siapkan Pelengkap',
        instruction: 'Rebus telur hingga matang, kupas. Bisa dibuat telur pindang dengan bumbu gudeg. Siapkan krecek (kulit sapi) jika tersedia.',
        duration: 15,
        equipment: ['Panci', 'Pisau'],
        qualityCheck: 'Telur matang. Pelengkap siap.'
      },
      {
        stepNumber: 7,
        title: 'Penyajian & Quality Check',
        instruction: 'Tata nasi di piring/kotak makan. Siram dengan gudeg (nangka, ayam, kentang) beserta kuah kentalnya. Tambahkan telur, krecek jika ada. Sajikan hangat dengan sambal krecek.',
        duration: 5,
        equipment: ['Piring/kotak makan', 'Sendok sayur'],
        qualityCheck: 'Suhu 60-70°C. Gudeg berwarna cokelat tua, tekstur sangat empuk. Porsi lengkap. Menu khas Yogyakarta autentik.'
      }
    ]
  },

  // ========================================
  // PMT SNACK MENUS (9 recipes)
  // ========================================

  // PMT-S001: Bubur Kacang Hijau
  {
    menuCode: 'PMT-S001',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Kacang Hijau',
        instruction: 'Cuci bersih kacang hijau (100g). Rendam dalam air selama 2 jam agar lebih cepat empuk. Tiriskan.',
        duration: 120,
        equipment: ['Baskom', 'Saringan'],
        qualityCheck: 'Kacang hijau segar, tidak berbau apek, warna hijau cerah.'
      },
      {
        stepNumber: 2,
        title: 'Rebus Kacang Hijau',
        instruction: 'Rebus kacang hijau dengan air secukupnya (perbandingan 1:4) hingga empuk dan pecah (30-40 menit). Tambahkan air jika berkurang. Aduk sesekali agar tidak gosong.',
        duration: 40,
        temperature: 100,
        equipment: ['Panci', 'Sendok kayu', 'Kompor'],
        qualityCheck: 'Kacang hijau empuk pecah, tekstur lembut seperti bubur.'
      },
      {
        stepNumber: 3,
        title: 'Tambahkan Santan dan Gula',
        instruction: 'Setelah kacang hijau empuk, tambahkan santan kental (50ml), gula merah sisir (30g). Aduk rata, masak dengan api kecil hingga santan mendidih dan gula larut (10 menit). Koreksi rasa manis.',
        duration: 10,
        temperature: 80,
        equipment: ['Sendok kayu', 'Kompor'],
        qualityCheck: 'Bubur kental creamy, rasa manis pas, santan tidak pecah.'
      },
      {
        stepNumber: 4,
        title: 'Penyajian & Quality Check',
        instruction: 'Tuang bubur kacang hijau ke mangkuk. Tambahkan topping susu cair (20ml) jika diinginkan. Sajikan hangat.',
        duration: 3,
        equipment: ['Mangkuk', 'Sendok sayur'],
        qualityCheck: 'Suhu 60-70°C. Tekstur kental creamy. Cocok untuk ibu hamil dan balita (tinggi protein dan folat).'
      }
    ]
  },

  // PMT-S002: Nagasari
  {
    menuCode: 'PMT-S002',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Siapkan tepung beras (100g, bisa giling sendiri dari beras). Siapkan santan kental (100ml), pisang ambon matang (50g), gula pasir (40g), sedikit garam. Cuci bersih daun pisang.',
        duration: 15,
        equipment: ['Mangkuk', 'Pisau', 'Daun pisang', 'Blender (jika giling beras)'],
        qualityCheck: 'Tepung beras halus. Santan kental segar. Pisang matang tapi tidak terlalu lembek. Daun pisang bersih.'
      },
      {
        stepNumber: 2,
        title: 'Buat Adonan Nagasari',
        instruction: 'Campur tepung beras, santan kental, gula pasir, sedikit garam dalam mangkuk. Aduk rata hingga tidak bergerindil. Saring adonan agar halus.',
        duration: 10,
        equipment: ['Mangkuk besar', 'Pengaduk', 'Saringan'],
        qualityCheck: 'Adonan halus tanpa gumpalan, kekentalan sedang (seperti adonan pancake).'
      },
      {
        stepNumber: 3,
        title: 'Masak Adonan Nagasari',
        instruction: 'Panaskan adonan dengan api kecil sambil terus diaduk hingga menjadi kental seperti bubur dan setengah matang (tidak mentah) sekitar 10 menit. Angkat.',
        duration: 10,
        temperature: 70,
        equipment: ['Panci', 'Sendok kayu', 'Kompor'],
        qualityCheck: 'Adonan kental, setengah matang, mudah dibentuk, tidak lengket berlebihan.'
      },
      {
        stepNumber: 4,
        title: 'Bungkus Nagasari',
        instruction: 'Potong pisang ambon memanjang (tipis). Ambil selembar daun pisang, taruh 2 sendok adonan, letakkan pisang di tengah, tutup dengan adonan lagi. Bungkus rapi, sematkan ujungnya.',
        duration: 15,
        equipment: ['Daun pisang', 'Sendok', 'Tusuk gigi/tali'],
        qualityCheck: 'Bungkusan rapat, pisang tertutup sempurna, tidak bocor.'
      },
      {
        stepNumber: 5,
        title: 'Kukus Nagasari',
        instruction: 'Kukus nagasari dalam steamer selama 20-25 menit hingga matang sempurna. Tes dengan menusuk, jika adonan tidak lengket berarti sudah matang.',
        duration: 25,
        temperature: 100,
        equipment: ['Steamer/dandang', 'Kompor'],
        qualityCheck: 'Nagasari matang sempurna (adonan kenyal, tidak lengket), aroma harum pisang dan pandan.'
      },
      {
        stepNumber: 6,
        title: 'Penyajian & Quality Check',
        instruction: 'Angkat nagasari, dinginkan sebentar. Sajikan masih terbungkus daun pisang atau sudah dibuka. Nagasari bisa disajikan hangat atau suhu ruang.',
        duration: 5,
        equipment: ['Piring', 'Pisau (jika mau dipotong)'],
        qualityCheck: 'Tekstur kenyal lembut, rasa manis pisang, warna putih kehijauan. Cocok untuk semua usia.'
      }
    ]
  },

  // PMT-S003: Onde-Onde
  {
    menuCode: 'PMT-S003',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Siapkan tepung ketan (100g), kacang hijau kupas (50g), gula merah sisir (30g), santan (30ml), wijen putih untuk taburan. Rendam kacang hijau 1 jam.',
        duration: 65,
        equipment: ['Mangkuk', 'Baskom', 'Piring'],
        qualityCheck: 'Tepung ketan segar. Kacang hijau bersih. Wijen putih bersih.'
      },
      {
        stepNumber: 2,
        title: 'Buat Isian Kacang Hijau',
        instruction: 'Kukus kacang hijau yang sudah direndam hingga empuk (20 menit). Haluskan, campur dengan gula merah, masak sebentar hingga mengental. Bentuk bulat kecil, sisihkan.',
        duration: 30,
        equipment: ['Steamer', 'Ulekan', 'Wajan kecil'],
        qualityCheck: 'Isian kacang hijau manis, kental, mudah dibentuk bulat.'
      },
      {
        stepNumber: 3,
        title: 'Buat Adonan Onde-Onde',
        instruction: 'Campur tepung ketan dengan santan hangat sedikit-sedikit sambil diuleni hingga kalis (tidak lengket, mudah dibentuk). Jika terlalu kering tambah santan, jika terlalu lembek tambah tepung.',
        duration: 15,
        equipment: ['Mangkuk', 'Tangan untuk menguleni'],
        qualityCheck: 'Adonan kalis, lembut, tidak lengket, tidak retak saat dibentuk.'
      },
      {
        stepNumber: 4,
        title: 'Bentuk Onde-Onde',
        instruction: 'Ambil adonan sebesar bola pingpong, pipihkan, letakkan isian kacang hijau di tengah, tutup rapat, bulatkan. Gulingkan di wijen putih hingga tertutup sempurna. Ulangi hingga adonan habis.',
        duration: 20,
        equipment: ['Tangan', 'Piring berisi wijen'],
        qualityCheck: 'Onde-onde bulat sempurna, isian tertutup rapat (tidak bocor), wijen menempel rata.'
      },
      {
        stepNumber: 5,
        title: 'Goreng Onde-Onde',
        instruction: 'Panaskan minyak banyak dengan api sedang kecil. Goreng onde-onde sambil terus diaduk perlahan hingga mengembang dan warna kuning keemasan (8-10 menit). Angkat, tiriskan.',
        duration: 10,
        temperature: 150,
        equipment: ['Wajan dalam', 'Minyak goreng banyak', 'Serok', 'Spatula kayu'],
        qualityCheck: 'Onde-onde mengembang sempurna (berongga di dalam), warna kuning keemasan, wijen garing, tidak gosong.'
      },
      {
        stepNumber: 6,
        title: 'Penyajian & Quality Check',
        instruction: 'Tiriskan onde-onde, sajikan hangat atau suhu ruang. Onde-onde yang baik harus renyah di luar, kenyal di dalam, isian manis.',
        duration: 5,
        equipment: ['Piring', 'Tissue/paper towel'],
        qualityCheck: 'Onde-onde mengembang, renyah, isian tidak bocor, rasa manis gurih. Cocok untuk semua usia.'
      }
    ]
  },

  // PMT-S004: Kolak Pisang
  {
    menuCode: 'PMT-S004',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Kupas pisang raja (150g), potong bulat tebal 2-3 cm. Siapkan santan kental (100ml), gula merah sisir (40g), sedikit garam, daun pandan.',
        duration: 10,
        equipment: ['Pisau', 'Telenan', 'Mangkuk'],
        qualityCheck: 'Pisang raja matang tapi tidak terlalu lembek. Santan segar kental. Gula merah asli.'
      },
      {
        stepNumber: 2,
        title: 'Masak Kuah Kolak',
        instruction: 'Rebus santan dengan daun pandan, gula merah, sedikit garam dengan api kecil sambil terus diaduk agar santan tidak pecah (10 menit). Aduk hingga gula larut sempurna.',
        duration: 10,
        temperature: 80,
        equipment: ['Panci', 'Sendok kayu', 'Kompor'],
        qualityCheck: 'Santan tidak pecah, gula merah larut sempurna, kuah berwarna cokelat muda.'
      },
      {
        stepNumber: 3,
        title: 'Masukkan Pisang',
        instruction: 'Setelah kuah mendidih dan gula larut, masukkan potongan pisang. Masak dengan api kecil hingga pisang matang tapi tidak hancur (5-7 menit). Jangan terlalu lama agar pisang tidak terlalu lembek.',
        duration: 7,
        temperature: 75,
        equipment: ['Sendok kayu', 'Kompor'],
        qualityCheck: 'Pisang matang empuk tapi masih utuh (tidak hancur), kuah kental manis.'
      },
      {
        stepNumber: 4,
        title: 'Penyajian & Quality Check',
        instruction: 'Tuang kolak pisang ke mangkuk beserta kuah santannya. Sajikan hangat. Kolak lebih nikmat dimakan saat masih hangat.',
        duration: 3,
        equipment: ['Mangkuk', 'Sendok sayur'],
        qualityCheck: 'Suhu 60-70°C. Kuah santan kental manis. Pisang utuh empuk. Cocok untuk semua usia, terutama ibu hamil dan menyusui (tinggi kalori dan kalium).'
      }
    ]
  },

  // PMT-S005: Roti Isi Cokelat + Susu
  {
    menuCode: 'PMT-S005',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Siapkan roti tawar (2 lembar, 80g), selai cokelat/hazelnut (20g), susu cair segar (200ml). Potong pinggiran roti jika diinginkan.',
        duration: 5,
        equipment: ['Pisau', 'Telenan', 'Piring', 'Gelas'],
        qualityCheck: 'Roti tawar segar tidak berjamur. Selai cokelat kualitas baik. Susu cair segar dingin.'
      },
      {
        stepNumber: 2,
        title: 'Olesi Roti dengan Selai',
        instruction: 'Olesi satu sisi roti dengan selai cokelat secara merata (sekitar 10g per lembar). Pastikan selai merata hingga ke pinggir.',
        duration: 3,
        equipment: ['Pisau/sendok', 'Piring'],
        qualityCheck: 'Selai merata di seluruh permukaan roti, tidak terlalu tebal atau tipis.'
      },
      {
        stepNumber: 3,
        title: 'Panggang Roti (Opsional)',
        instruction: 'Panggang roti sebentar dengan toaster atau teflon (tanpa minyak) hingga sedikit garing di luar (2-3 menit). Ini membuat roti lebih renyah dan selai lebih lumer. Bisa juga langsung disajikan tanpa dipanggang.',
        duration: 3,
        temperature: 150,
        equipment: ['Toaster/teflon'],
        qualityCheck: 'Roti hangat, sedikit garing, selai cokelat lumer, aroma harum.'
      },
      {
        stepNumber: 4,
        title: 'Penyajian & Quality Check',
        instruction: 'Potong roti menjadi 2 atau 4 bagian (segitiga). Tata di piring. Sajikan dengan segelas susu cair segar dingin (200ml).',
        duration: 3,
        equipment: ['Pisau', 'Piring', 'Gelas'],
        qualityCheck: 'Roti hangat atau suhu ruang, selai lumer. Susu dingin segar. Cocok untuk remaja putri (tinggi kalsium dan zat besi dari selai).'
      }
    ]
  },

  // PMT-S006: Pisang Goreng + Teh Manis
  {
    menuCode: 'PMT-S006',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Kupas pisang raja (100g), belah 2 memanjang. Siapkan tepung beras (50g), gula merah (20g untuk adonan), air secukupnya. Siapkan 1 sachet teh celup dan gula pasir (15g) untuk teh.',
        duration: 10,
        equipment: ['Pisau', 'Telenan', 'Mangkuk', 'Gelas'],
        qualityCheck: 'Pisang raja matang (kulit kuning berbintik). Tepung beras segar. Teh celup berkualitas.'
      },
      {
        stepNumber: 2,
        title: 'Buat Adonan Tepung',
        instruction: 'Campur tepung beras, gula merah yang sudah disisir halus, sedikit garam, tambahkan air sedikit-sedikit sambil diaduk hingga adonan kental (kekentalan seperti adonan bakwan). Jangan terlalu encer.',
        duration: 7,
        equipment: ['Mangkuk', 'Sendok/pengaduk'],
        qualityCheck: 'Adonan kental tepat (menempel di pisang), tidak terlalu encer atau kental.'
      },
      {
        stepNumber: 3,
        title: 'Goreng Pisang',
        instruction: 'Panaskan minyak banyak dengan api sedang. Celupkan pisang yang sudah dibelah ke dalam adonan tepung hingga terbalut sempurna. Goreng hingga kuning keemasan dan garing (4-5 menit per sisi). Balik perlahan. Angkat, tiriskan.',
        duration: 10,
        temperature: 170,
        equipment: ['Wajan dalam', 'Minyak goreng', 'Serok', 'Spatula'],
        qualityCheck: 'Pisang goreng garing renyah di luar, lembut di dalam, warna kuning keemasan merata.'
      },
      {
        stepNumber: 4,
        title: 'Seduh Teh Manis',
        instruction: 'Rebus air 200ml hingga mendidih. Masukkan 1 sachet teh celup, diamkan 3-5 menit. Angkat teh celup, tambahkan gula pasir (15g), aduk rata.',
        duration: 8,
        temperature: 100,
        equipment: ['Panci kecil/ketel', 'Gelas', 'Sendok'],
        qualityCheck: 'Teh harum, warna cokelat tua, manis pas (tidak terlalu manis).'
      },
      {
        stepNumber: 5,
        title: 'Penyajian & Quality Check',
        instruction: 'Tata pisang goreng di piring (2-3 potong). Sajikan dengan segelas teh manis hangat. Pisang goreng sebaiknya dimakan hangat agar renyah.',
        duration: 3,
        equipment: ['Piring', 'Gelas'],
        qualityCheck: 'Pisang goreng hangat renyah. Teh hangat (tidak mendidih). Cocok untuk snack sore hari, semua usia.'
      }
    ]
  },

  // PMT-S007: Lemper Ayam
  {
    menuCode: 'PMT-S007',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Rendam tepung ketan (100g) dalam air selama 4 jam atau semalaman. Tiriskan. Siapkan ayam suwir (50g), santan (50ml), bumbu: bawang merah, bawang putih, daun salam. Siapkan daun pisang.',
        duration: 240,
        equipment: ['Baskom', 'Saringan', 'Daun pisang'],
        qualityCheck: 'Tepung ketan sudah direndam sempurna. Daun pisang bersih. Ayam suwir segar.'
      },
      {
        stepNumber: 2,
        title: 'Kukus Ketan',
        instruction: 'Campur tepung ketan dengan santan dan sedikit garam. Kukus dalam steamer selama 20 menit hingga setengah matang (tidak lengket berlebihan). Angkat, sisihkan.',
        duration: 20,
        temperature: 100,
        equipment: ['Steamer', 'Kain kukus', 'Mangkuk'],
        qualityCheck: 'Ketan setengah matang, tidak terlalu lengket, bisa dibentuk.'
      },
      {
        stepNumber: 3,
        title: 'Buat Isian Ayam',
        instruction: 'Tumis bawang merah, bawang putih cincang hingga harum. Masukkan ayam suwir, daun salam, sedikit santan, garam, gula, merica. Masak hingga bumbu meresap dan tidak terlalu basah (10 menit). Angkat, sisihkan.',
        duration: 10,
        temperature: 150,
        equipment: ['Wajan kecil', 'Spatula'],
        qualityCheck: 'Isian ayam berbumbu harum, tidak terlalu basah (agar tidak bocor), rasa gurih.'
      },
      {
        stepNumber: 4,
        title: 'Bentuk Lemper',
        instruction: 'Ambil selembar daun pisang, taruh ketan kukus secukupnya, pipihkan, letakkan isian ayam di tengah, tutup dengan ketan lagi, bentuk silinder memanjang. Bungkus rapi dengan daun pisang, sematkan ujungnya.',
        duration: 20,
        equipment: ['Daun pisang', 'Tangan', 'Tusuk gigi/tali'],
        qualityCheck: 'Bungkusan rapi, isian tertutup sempurna, bentuk silinder rapi.'
      },
      {
        stepNumber: 5,
        title: 'Kukus Lemper',
        instruction: 'Kukus lemper yang sudah dibungkus selama 15-20 menit hingga ketan matang sempurna. Angkat, dinginkan sebentar.',
        duration: 20,
        temperature: 100,
        equipment: ['Steamer', 'Kompor'],
        qualityCheck: 'Lemper matang, ketan kenyal pulen, aroma harum daun pisang dan ayam.'
      },
      {
        stepNumber: 6,
        title: 'Penyajian & Quality Check',
        instruction: 'Sajikan lemper masih terbungkus daun pisang atau sudah dibuka. Lemper bisa disajikan hangat atau suhu ruang. Potong menjadi 2-3 bagian jika perlu.',
        duration: 5,
        equipment: ['Piring', 'Pisau'],
        qualityCheck: 'Lemper kenyal, isian tidak bocor, rasa gurih ayam meresap. Cocok untuk semua usia (tinggi karbohidrat dan protein).'
      }
    ]
  },

  // PMT-S008: Puding Buah
  {
    menuCode: 'PMT-S008',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Siapkan susu cair (200ml), agar-agar bubuk (10g), gula pasir (40g), pepaya potong dadu (50g), pisang potong bulat (30g). Cuci bersih buah.',
        duration: 10,
        equipment: ['Pisau', 'Telenan', 'Mangkuk', 'Gelas ukur'],
        qualityCheck: 'Susu cair segar. Agar-agar bubuk berkualitas. Buah segar matang.'
      },
      {
        stepNumber: 2,
        title: 'Masak Adonan Puding',
        instruction: 'Campur susu cair, agar-agar bubuk, gula pasir dalam panci. Masak sambil terus diaduk hingga mendidih dan agar-agar larut sempurna (5-7 menit). Jangan biarkan gosong.',
        duration: 7,
        temperature: 90,
        equipment: ['Panci', 'Sendok kayu', 'Kompor'],
        qualityCheck: 'Agar-agar larut sempurna, tidak bergerindil, adonan mendidih merata.'
      },
      {
        stepNumber: 3,
        title: 'Tambahkan Buah',
        instruction: 'Matikan api, dinginkan adonan puding sebentar (2 menit). Masukkan potongan pepaya dan pisang, aduk rata agar buah tersebar merata.',
        duration: 5,
        equipment: ['Sendok', 'Mangkuk'],
        qualityCheck: 'Buah tersebar merata, tidak mengendap di dasar atau mengapung semua.'
      },
      {
        stepNumber: 4,
        title: 'Tuang ke Cetakan',
        instruction: 'Tuang adonan puding buah ke dalam cetakan/gelas/mangkuk kecil. Biarkan uap panas keluar sebentar sebelum ditutup.',
        duration: 5,
        equipment: ['Cetakan puding/gelas', 'Sendok sayur'],
        qualityCheck: 'Adonan merata di cetakan, buah tersebar baik.'
      },
      {
        stepNumber: 5,
        title: 'Dinginkan di Kulkas',
        instruction: 'Setelah puding agak dingin (suhu ruang), masukkan ke kulkas. Dinginkan minimal 2 jam hingga puding set/padat sempurna.',
        duration: 120,
        temperature: 4,
        equipment: ['Kulkas'],
        qualityCheck: 'Puding set padat, tidak lembek, mudah dikeluarkan dari cetakan.'
      },
      {
        stepNumber: 6,
        title: 'Penyajian & Quality Check',
        instruction: 'Keluarkan puding dari kulkas. Bisa disajikan langsung di cetakan atau dikeluarkan ke piring. Sajikan dingin.',
        duration: 5,
        equipment: ['Piring', 'Pisau (jika perlu)'],
        qualityCheck: 'Puding dingin segar, tekstur kenyal lembut, buah fresh, tampilan menarik. Cocok untuk semua usia (tinggi kalsium dan vitamin).'
      }
    ]
  },

  // PMT-S009: Kue Lumpur
  {
    menuCode: 'PMT-S009',
    steps: [
      {
        stepNumber: 1,
        title: 'Persiapan Bahan',
        instruction: 'Siapkan tepung beras (80g), santan kental (100ml), telur ayam (1 butir, 50g), gula pasir (60g), margarin (20g) untuk adonan dan olesan loyang. Siapkan loyang cupcake kecil atau cetakan kue lumpur.',
        duration: 10,
        equipment: ['Mangkuk', 'Mixer/pengocok', 'Loyang kecil', 'Kuas'],
        qualityCheck: 'Telur segar. Tepung beras halus. Santan kental segar. Margarin berkualitas baik.'
      },
      {
        stepNumber: 2,
        title: 'Kocok Telur dan Gula',
        instruction: 'Kocok telur dan gula pasir dengan mixer hingga mengembang, putih, dan kental (sekitar 10 menit). Ini penting agar kue lumpur mengembang baik.',
        duration: 10,
        equipment: ['Mixer', 'Mangkuk besar'],
        qualityCheck: 'Adonan telur mengembang sempurna, warna putih pucat, kental (ribbon stage).'
      },
      {
        stepNumber: 3,
        title: 'Campur Adonan Kue Lumpur',
        instruction: 'Masukkan tepung beras sedikit-sedikit sambil terus dikocok perlahan. Tambahkan santan kental, margarin leleh. Aduk rata dengan spatula hingga semua tercampur sempurna (jangan overmix).',
        duration: 8,
        equipment: ['Spatula', 'Mangkuk'],
        qualityCheck: 'Adonan tercampur rata, kental seperti adonan pancake, tidak ada gumpalan tepung.'
      },
      {
        stepNumber: 4,
        title: 'Siapkan Loyang',
        instruction: 'Olesi loyang cupcake atau cetakan kue lumpur dengan margarin tipis agar tidak lengket. Atau gunakan paper cup.',
        duration: 5,
        equipment: ['Kuas', 'Margarin', 'Loyang/cetakan'],
        qualityCheck: 'Loyang terolesi margarin merata, atau paper cup siap.'
      },
      {
        stepNumber: 5,
        title: 'Tuang Adonan dan Panggang',
        instruction: 'Tuang adonan ke loyang/cetakan (¾ penuh). Panggang dalam oven dengan suhu 180°C selama 20-25 menit hingga permukaan kuning kecokelatan dan matang sempurna. Tes tusuk, jika tidak lengket berarti matang.',
        duration: 25,
        temperature: 180,
        equipment: ['Oven', 'Loyang', 'Tusuk gigi untuk tes'],
        qualityCheck: 'Kue lumpur mengembang baik, permukaan kuning kecokelatan, bagian tengah matang (tidak basah).'
      },
      {
        stepNumber: 6,
        title: 'Tambahkan Topping (Opsional)',
        instruction: 'Setelah kue matang, bisa tambahkan topping kismis atau cherry di atasnya. Bisa juga tanpa topping.',
        duration: 3,
        equipment: ['Kismis/cherry'],
        qualityCheck: 'Kue matang sempurna, topping menempel baik.'
      },
      {
        stepNumber: 7,
        title: 'Penyajian & Quality Check',
        instruction: 'Keluarkan kue lumpur dari oven, dinginkan sebentar. Keluarkan dari loyang. Sajikan hangat atau suhu ruang.',
        duration: 10,
        equipment: ['Piring', 'Wadah'],
        qualityCheck: 'Kue lumpur lembut kenyal, tidak bantat, rasa manis gurih santan. Cocok untuk semua usia (tinggi karbohidrat dan protein).'
      }
    ]
  },

]

/**
 * Seed recipe steps for all nutrition menus
 */
export async function seedRecipeStep(
  prisma: PrismaClient,
  menus: NutritionMenu[]
): Promise<RecipeStep[]> {
  console.log('  → Creating RecipeSteps (cooking instructions)...')

  const recipeSteps: RecipeStep[] = []

  for (const recipeData of RECIPE_STEPS) {
    // Find menu by code
    const menu = menus.find((m) => m.menuCode === recipeData.menuCode)
    if (!menu) {
      console.warn(`  ⚠️  Menu ${recipeData.menuCode} not found, skipping recipe steps`)
      continue
    }

    // Create all steps for this menu
    for (const stepData of recipeData.steps) {
      const step = await prisma.recipeStep.upsert({
        where: {
          menuId_stepNumber: {
            menuId: menu.id,
            stepNumber: stepData.stepNumber
          }
        },
        update: {
          title: stepData.title,
          instruction: stepData.instruction,
          duration: stepData.duration,
          temperature: stepData.temperature,
          equipment: stepData.equipment,
          qualityCheck: stepData.qualityCheck
        },
        create: {
          menuId: menu.id,
          stepNumber: stepData.stepNumber,
          title: stepData.title,
          instruction: stepData.instruction,
          duration: stepData.duration,
          temperature: stepData.temperature,
          equipment: stepData.equipment,
          qualityCheck: stepData.qualityCheck
        }
      })
      recipeSteps.push(step)
    }
  }

  console.log(`  ✓ Created ${recipeSteps.length} recipe steps:`)
  console.log(`    - Menus with recipes: ${RECIPE_STEPS.length}/21`)
  console.log(`    - Average steps per menu: ${Math.round(recipeSteps.length / RECIPE_STEPS.length)}`)
  console.log(`    - Complete Indonesian cooking instructions`)
  console.log(`    - Quality checks for food safety`)

  return recipeSteps
}
