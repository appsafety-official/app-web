import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000);
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

type OrderItem = {
  productName: string;
  qty: number;
  price: number;
  subtotal: number;
};

const orderItem = (productName: string, qty: number, price: number): OrderItem => ({
  productName,
  qty,
  price,
  subtotal: qty * price,
});

const lineItemsTotal = (items: OrderItem[]) =>
  items.reduce((sum, item) => sum + item.subtotal, 0);

const products = [
  {
    name: "Aluminized Fire Proximity Suit",
    category: "Firefighting",
    price: 2_500_000,
    stock: randInt(10, 50),
    description:
      "Full-body aluminized proximity suit for radiant heat protection in industrial firefighting operations.",
    imageUrl:
      "https://placehold.co/600x600/1c1917/fbbf24?text=Proximity+Suit",
    specs: {
      material: "Aluminized aramid with heat-resistant lining",
      size: "L / XL",
      certification: "CE EN 1486",
    },
  },
  {
    name: "Nomex Welding Jacket",
    category: "Welding",
    price: 850_000,
    stock: randInt(10, 50),
    description:
      "Lightweight Nomex welding jacket with flame-resistant properties for welding and hot-work protection.",
    imageUrl:
      "https://placehold.co/600x600/1c1917/fbbf24?text=Welding+Jacket",
    specs: {
      material: "Nomex IIIA",
      size: "M / L / XL",
      certification: "EN ISO 11612",
    },
  },
  {
    name: "Beekeeper Suit Ventilated",
    category: "Hazmat",
    price: 1_200_000,
    stock: randInt(10, 50),
    description:
      "Ventilated beekeeper suit with breathable mesh for full-body protection and comfort in beekeeping or hazmat tasks.",
    imageUrl:
      "https://placehold.co/600x600/1c1917/fbbf24?text=Beekeeper+Suit",
    specs: {
      material: "Polycotton with ventilated mesh",
      size: "L / XL",
      certification: "ISO 9001",
    },
  },
  {
    name: "Heavy Duty Impact Gloves",
    category: "Hand Protection",
    price: 350_000,
    stock: randInt(10, 50),
    description:
      "Impact-resistant work gloves with reinforced knuckle protection for heavy-duty handling tasks.",
    imageUrl:
      "https://placehold.co/600x600/1c1917/fbbf24?text=Impact+Gloves",
    specs: {
      material: "Leather with TPR armor",
      size: "S / M / L / XL",
      certification: "EN 388",
    },
  },
] as const;

const prospects = [
  {
    name: "Budi Santoso",
    whatsapp: "0812-3456-7890",
    address: "Jl. Merdeka No. 12, Bandung",
    acquisitionChannel: "organic_web",
    status: "warm",
    notesAdmin: "Menanyakan pengiriman ke Bandung via kurir.",
    totalAmount: 850_000,
    orderItems: [orderItem("Nomex Welding Jacket", 1, 850_000)],
    createdAt: daysAgo(12),
  },
  {
    name: "Siti Rahayu",
    whatsapp: "0813-9876-5432",
    address: "Perum Griya Asri Blok C5, Jakarta Timur",
    acquisitionChannel: "instagram",
    status: "hot",
    notesAdmin: "Sudah deal harga, menunggu transfer DP.",
    totalAmount: 2_850_000,
    orderItems: [
      orderItem("Aluminized Fire Proximity Suit", 1, 2_500_000),
      orderItem("Heavy Duty Impact Gloves", 1, 350_000),
    ],
    createdAt: daysAgo(3),
  },
  {
    name: "Agus Wijaya",
    whatsapp: "0821-2233-4455",
    address: "Jl. Ahmad Yani No. 45, Semarang",
    acquisitionChannel: "tokopedia_insert",
    status: "cold",
    notesAdmin: "Baru kirim penawaran via DM Tokopedia.",
    totalAmount: 0,
    orderItems: [],
    createdAt: daysAgo(1),
  },
  {
    name: "Dewi Lestari",
    whatsapp: "0856-7788-9900",
    address: "Jl. Pemuda No. 88, Surabaya",
    acquisitionChannel: "walk_in",
    status: "warm",
    notesAdmin: "Datang langsung ke toko, meminta katalog.",
    totalAmount: 1_200_000,
    orderItems: [orderItem("Beekeeper Suit Ventilated", 1, 1_200_000)],
    createdAt: daysAgo(8),
  },
  {
    name: "Rizky Pratama",
    whatsapp: "0815-1122-3344",
    address: "Jl. Sudirman Kav. 21, Yogyakarta",
    acquisitionChannel: "organic_web",
    status: "hot",
    notesAdmin: "Request urgent, pengiriman secepatnya.",
    totalAmount: 350_000,
    orderItems: [orderItem("Heavy Duty Impact Gloves", 1, 350_000)],
    createdAt: daysAgo(5),
  },
  {
    name: "Maya Sari",
    whatsapp: "0896-5544-3322",
    address: "Jl. Gajah Mada No. 7, Medan",
    acquisitionChannel: "tokopedia_insert",
    status: "cold",
    notesAdmin: "",
    totalAmount: 0,
    orderItems: [],
    createdAt: daysAgo(10),
  },
  {
    name: "Andi Kurniawan",
    whatsapp: "0812-7788-1122",
    address: "Jl. Pahlawan No. 3, Malang",
    acquisitionChannel: "instagram",
    status: "warm",
    notesAdmin: "Menunggu konfirmasi jumlah stok.",
    totalAmount: 1_700_000,
    orderItems: [orderItem("Nomex Welding Jacket", 2, 850_000)],
    createdAt: daysAgo(14),
  },
];

const orders = [
  {
    customerName: "Budi Santoso",
    whatsapp: "0812-3456-7890",
    address: "Jl. Merdeka No. 12, Bandung",
    items: [orderItem("Nomex Welding Jacket", 2, 850_000)],
    totalAmount: 1_700_000,
    status: "paid",
    acquisitionChannel: "organic_web",
    notes: "Pembayaran lunas via transfer BCA.",
    createdAt: daysAgo(6),
  },
  {
    customerName: "Siti Rahayu",
    whatsapp: "0813-9876-5432",
    address: "Perum Griya Asri Blok C5, Jakarta Timur",
    items: [
      orderItem("Aluminized Fire Proximity Suit", 1, 2_500_000),
      orderItem("Heavy Duty Impact Gloves", 2, 350_000),
    ],
    totalAmount: 3_200_000,
    status: "shipped",
    acquisitionChannel: "organic_web",
    notes: "Dikirim via JNE Express, resi menyusul.",
    createdAt: daysAgo(4),
  },
  {
    customerName: "Dewi Lestari",
    whatsapp: "0856-7788-9900",
    address: "Jl. Pemuda No. 88, Surabaya",
    items: [orderItem("Beekeeper Suit Ventilated", 1, 1_200_000)],
    totalAmount: 1_200_000,
    status: "pending_payment",
    acquisitionChannel: "tokopedia_insert",
    notes: "Menunggu pembayaran di Tokopedia.",
    createdAt: daysAgo(2),
  },
  {
    customerName: "Rizky Pratama",
    whatsapp: "0815-1122-3344",
    address: "Jl. Sudirman Kav. 21, Yogyakarta",
    items: [orderItem("Heavy Duty Impact Gloves", 4, 350_000)],
    totalAmount: 1_400_000,
    status: "paid",
    acquisitionChannel: "tokopedia_insert",
    notes: "Pembayaran via Tokopedia sudah lunas.",
    createdAt: daysAgo(1),
  },
];

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@appsafety.com" },
    update: {},
    create: {
      email: "admin@appsafety.com",
      password: await bcrypt.hash("admin123", 10),
      name: "Admin",
    },
  });
  console.log(`Seeded admin user: ${admin.email}`);

  await prisma.order.deleteMany({});
  await prisma.prospect.deleteMany({});
  await prisma.product.deleteMany({});

  const createdProducts = await prisma.product.createMany({
    data: products.map((product) => ({ ...product })),
  });
  console.log(`Seeded products: ${createdProducts.count}`);

  const createdProspects = await prisma.prospect.createMany({
    data: prospects.map((prospect) => ({ ...prospect })),
  });
  console.log(`Seeded prospects: ${createdProspects.count}`);

  const createdOrders = await prisma.order.createMany({
    data: orders.map((order) => ({ ...order })),
  });
  console.log(`Seeded orders: ${createdOrders.count}`);

  const revenue = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: "paid" },
  });
  console.log(`Paid revenue (Rp): ${revenue._sum.totalAmount ?? 0}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
