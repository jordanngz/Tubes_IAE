export interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  rating: number
  reviews: number
  sold: number
  description: string
  variants: {
    name: string
    options: string[]
  }[]
  stock: number
}

export const categories = [
  { id: "daging", name: "Daging", icon: "🥩" },
  { id: "ikan", name: "Ikan & Seafood", icon: "🐟" },
  { id: "sayuran", name: "Sayuran", icon: "🥬" },
  { id: "buah", name: "Buah", icon: "🍎" },
  { id: "olahan", name: "Makanan Olahan", icon: "🍲" },
  { id: "sambal", name: "Sambal & Saus", icon: "🌶️" },
]

export const products: Product[] = [
  {
    id: "1",
    name: "Canned It Beef Rendang",
    price: 45000,
    image: "/beef-rendang-in-can.jpg",
    category: "daging",
    rating: 4.9,
    reviews: 1245,
    sold: 10000,
    description:
      "Rendang sapi premium dengan bumbu rempah pilihan. Diproses dengan teknologi modern untuk menjaga kesegaran dan cita rasa autentik.",
    variants: [
      {
        name: "Tingkat Kepedasan",
        options: ["Original", "Pedas", "Extra Pedas"],
      },
      {
        name: "Ukuran",
        options: ["250g", "500g", "1kg"],
      },
    ],
    stock: 250,
  },
  {
    id: "2",
    name: "Gudeg Kaleng Bu Tjitro",
    price: 21000,
    image: "/gudeg-jackfruit-in-can.jpg",
    category: "sayuran",
    rating: 4.8,
    reviews: 892,
    sold: 5000,
    description: "Gudeg nangka muda khas Yogyakarta dengan rasa manis legit. Tersedia berbagai varian rasa.",
    variants: [
      {
        name: "Varian Rasa",
        options: ["Basreng Original", "Sambal Jambal", "Oseng Kikil", "Rendang", "Sambal Krecek"],
      },
    ],
    stock: 180,
  },
  {
    id: "3",
    name: "Tuna Kaleng Premium",
    price: 35000,
    image: "/tuna-fish-in-can.jpg",
    category: "ikan",
    rating: 4.7,
    reviews: 654,
    sold: 8500,
    description: "Tuna pilihan dengan kualitas terbaik. Kaya protein dan omega-3 untuk kesehatan keluarga.",
    variants: [
      {
        name: "Jenis",
        options: ["Tuna Potongan", "Tuna Utuh", "Tuna Sambal"],
      },
      {
        name: "Ukuran",
        options: ["185g", "320g"],
      },
    ],
    stock: 320,
  },
  {
    id: "4",
    name: "Sarden Saus Tomat",
    price: 18000,
    image: "/sardines-in-tomato-sauce-can.jpg",
    category: "ikan",
    rating: 4.6,
    reviews: 1120,
    sold: 15000,
    description: "Sarden berkualitas dengan saus tomat segar. Praktis dan bergizi untuk menu sehari-hari.",
    variants: [
      {
        name: "Varian",
        options: ["Saus Tomat", "Saus Cabai", "Extra Pedas"],
      },
    ],
    stock: 450,
  },
  {
    id: "5",
    name: "Kornet Sapi Premium",
    price: 42000,
    image: "/corned-beef-in-can.jpg",
    category: "daging",
    rating: 4.9,
    reviews: 2340,
    sold: 20000,
    description: "Kornet sapi asli dengan daging pilihan. Tanpa pengawet berbahaya, aman untuk keluarga.",
    variants: [
      {
        name: "Ukuran",
        options: ["198g", "340g"],
      },
    ],
    stock: 280,
  },
  {
    id: "6",
    name: "Sambal Ijo Kaleng",
    price: 25000,
    image: "/green-chili-sambal-in-jar.jpg",
    category: "sambal",
    rating: 4.8,
    reviews: 567,
    sold: 4500,
    description: "Sambal ijo khas Padang dengan cita rasa pedas segar. Cocok untuk berbagai masakan.",
    variants: [
      {
        name: "Tingkat Kepedasan",
        options: ["Sedang", "Pedas", "Extra Pedas"],
      },
    ],
    stock: 200,
  },
  {
    id: "7",
    name: "Buah Leci Kaleng",
    price: 28000,
    image: "/lychee-fruit-in-can.jpg",
    category: "buah",
    rating: 4.5,
    reviews: 432,
    sold: 3200,
    description: "Buah leci segar dalam sirup manis. Sempurna untuk dessert atau minuman segar.",
    variants: [
      {
        name: "Ukuran",
        options: ["320g", "565g"],
      },
    ],
    stock: 150,
  },
  {
    id: "8",
    name: "Nanas Kaleng Potongan",
    price: 22000,
    image: "/pineapple-chunks-in-can.jpg",
    category: "buah",
    rating: 4.6,
    reviews: 789,
    sold: 6700,
    description: "Potongan nanas segar dalam sirup. Praktis untuk salad buah atau topping dessert.",
    variants: [
      {
        name: "Jenis Potongan",
        options: ["Potongan Kecil", "Potongan Besar", "Cincang"],
      },
    ],
    stock: 340,
  },
]
