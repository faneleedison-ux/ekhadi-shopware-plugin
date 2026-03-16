import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db'

// ─── Static data pools ────────────────────────────────────────────────────────

const AREAS_DATA = [
  // Gauteng (6)
  { name: 'Soweto',       province: 'Gauteng' },
  { name: 'Alexandra',    province: 'Gauteng' },
  { name: 'Tembisa',      province: 'Gauteng' },
  { name: 'Mamelodi',     province: 'Gauteng' },
  { name: 'Soshanguve',   province: 'Gauteng' },
  { name: 'Katlehong',    province: 'Gauteng' },
  // Western Cape (4)
  { name: 'Khayelitsha',    province: 'Western Cape' },
  { name: 'Gugulethu',      province: 'Western Cape' },
  { name: "Mitchell's Plain", province: 'Western Cape' },
  { name: 'Delft',           province: 'Western Cape' },
  // KwaZulu-Natal (5)
  { name: 'Umlazi',       province: 'KwaZulu-Natal' },
  { name: 'KwaMashu',     province: 'KwaZulu-Natal' },
  { name: 'Inanda',       province: 'KwaZulu-Natal' },
  { name: 'Ntuzuma',      province: 'KwaZulu-Natal' },
  { name: 'Hammarsdale',  province: 'KwaZulu-Natal' },
  // Eastern Cape (3)
  { name: 'Mdantsane',    province: 'Eastern Cape' },
  { name: 'Motherwell',   province: 'Eastern Cape' },
  { name: 'Mthatha',      province: 'Eastern Cape' },
  // Limpopo (3)
  { name: 'Seshego',      province: 'Limpopo' },
  { name: 'Giyani',       province: 'Limpopo' },
  { name: 'Tzaneen',      province: 'Limpopo' },
  // Mpumalanga (3)
  { name: 'Kanyamazane',  province: 'Mpumalanga' },
  { name: 'Matsulu',      province: 'Mpumalanga' },
  { name: 'KwaMhlanga',   province: 'Mpumalanga' },
  // North West (3)
  { name: 'Ikageng',      province: 'North West' },
  { name: 'Jouberton',    province: 'North West' },
  { name: 'Moretele',     province: 'North West' },
  // Free State (3)
  { name: 'Mangaung',     province: 'Free State' },
  { name: 'Botshabelo',   province: 'Free State' },
  { name: 'Thaba Nchu',   province: 'Free State' },
  // Northern Cape (2)
  { name: 'Galeshewe',    province: 'Northern Cape' },
  { name: 'Roodepan',     province: 'Northern Cape' },
]

// 100 member names — diverse South African representation
const MEMBER_NAMES = [
  // Primary demo member (index 0)
  'Nomsa Dlamini',
  // Zulu / Ndebele
  'Sipho Nkosi', 'Thandeka Mokoena', 'Bongani Zulu', 'Lindiwe Khumalo',
  'Nhlanhla Mthembu', 'Sifiso Ntuli', 'Nokwanda Cele', 'Zanele Shabalala',
  'Xolani Mkhize', 'Nompumelelo Buthelezi', 'Sibusiso Ndlovu', 'Mduduzi Ngema',
  'Nonhlanhla Dube', 'Siyanda Mnguni', 'Ntombi Madlala', 'Thulani Ntanzi',
  'Nosipho Gumede', 'Lungile Mthethwa', 'Sindisiwe Ngcobo', 'Nokukhanya Xulu',
  'Sandile Nene', 'Lungelo Zwane', 'Siyabonga Mnguni', 'Buyani Mdlalose',
  // Xhosa
  'Luyanda Botha', 'Anele Nxesi', 'Asanda Magwaza', 'Lungisa Ncwana',
  'Vuyani Mfecane', 'Azola Dyani', 'Luxolo Mabandla', 'Nomvula Sigcau',
  'Nolwazi Ntsomi', 'Simangele Mda', 'Nobantu Baartman', 'Nonceba Bikani',
  'Zoleka Titi', 'Thandiswa Mabizela', 'Mthunzi Dyantyi', 'Nceba Jokweni',
  'Nontobeko Kobese', 'Phiwe Madikizela', 'Siviwe Magadla', 'Yoliswa Faltein',
  // Sotho / Tswana / Pedi
  'Lerato Sithole', 'Tebogo Motaung', 'Mpho Molefe', 'Kabo Letsoko',
  'Boitumelo Makgato', 'Kagiso Sefatsa', 'Onthatile Mphela', 'Thato Radebe',
  'Katlego Mahlangu', 'Mmapula Modise', 'Refilwe Lekganyane', 'Neo Moshoeshoe',
  'Lesedi Ramaphosa', 'Khumo Motsepe', 'Dineo Moroka', 'Palesa Mokoena',
  'Tshepo Mthembu', 'Kamogelo Tau', 'Tlotlo Seleke', 'Motse Vilakazi',
  // Venda / Tsonga
  'Murendeni Tshivhase', 'Tshifhiwa Mudau', 'Livhuwani Netshitenzhe',
  'Ndivhuwo Mulaudzi', 'Hlayani Baloyi', 'Wiseman Maluleke', 'Mavis Nkuna',
  'Given Chauke', 'Innocent Khoza', 'Fortunate Mabunda',
  // Afrikaans / Coloured / Cape Malay
  'Chantal Isaacs', 'Farouk Hendricks', 'Melissa Carolus', 'Ashley Adams',
  'Charlene Jansen', 'Nadia Davids', 'Bradley October', 'Shamiela Manuel',
  'Deon Fortuin', 'Liezl Solomons',
  // Indian South African
  'Priya Pillay', 'Rajesh Govender', 'Kavitha Moodley', 'Sanjay Naidoo',
  'Sunita Reddy', 'Aisha Moosa', 'Mohammed Essop', 'Preethi Chetty',
  'Krish Naicker', 'Devika Pather',
  // Mixed / Additional
  'Thandi Sithole', 'Phumzile Cele', 'Vusi Mahlangu', 'Zodwa Luthuli',
  'Musa Msomi', 'Nobuhle Mhlongo', 'Sbusiso Ndaba', 'Thobile Zondo',
  'Sthembile Majola', 'Ntando Khoza', 'Lungani Gumbi', 'Thandolwethu Ntuli',
  'Nokuthula Miya', 'Senzo Vilane', 'Nandipha Mhlongo',
]

// 100 shop names and owner names
const SHOP_DATA = [
  { owner: 'Thabo Sithole',    shop: "Thabo's Spaza",          email: 'shop@ekhadi.co.za' },
  { owner: 'Fatima Ahmed',     shop: "Fatima's General Store",  email: 'fatima.shop@ekhadi.co.za' },
  { owner: 'Joseph Dlamini',   shop: 'Dlamini Provisions',      email: 'joseph.shop@ekhadi.co.za' },
  { owner: 'Grace Nkosi',      shop: 'Grace Corner Store',      email: 'grace.shop@ekhadi.co.za' },
  { owner: 'Peter Mokoena',    shop: 'Mokoena Mini-Market',     email: 'peter.shop@ekhadi.co.za' },
  { owner: 'Betty Zwane',      shop: "Betty's Spaza",           email: 'betty.shop@ekhadi.co.za' },
  { owner: 'Samuel Ndlovu',    shop: 'Ndlovu Family Store',     email: 'samuel.shop@ekhadi.co.za' },
  { owner: 'Florence Cele',    shop: 'Florence Essentials',     email: 'florence.shop@ekhadi.co.za' },
  { owner: 'David Mthembu',    shop: 'Mthembu Convenience',     email: 'david.shop@ekhadi.co.za' },
  { owner: 'Agnes Zulu',       shop: "Agnes's Spaza",           email: 'agnes.shop@ekhadi.co.za' },
  { owner: 'Thomas Khumalo',   shop: 'Khumalo Traders',         email: 'thomas.shop@ekhadi.co.za' },
  { owner: 'Miriam Dube',      shop: 'Miriam Corner Shop',      email: 'miriam.shop@ekhadi.co.za' },
  { owner: 'Simon Ntuli',      shop: 'Ntuli Spaza & More',      email: 'simon.shop@ekhadi.co.za' },
  { owner: 'Sarah Mkhize',     shop: 'Mkhize Provisions',       email: 'sarah.shop@ekhadi.co.za' },
  { owner: 'Michael Buthelezi',shop: 'Buthelezi General',       email: 'michael.shop@ekhadi.co.za' },
  { owner: 'Ruth Ngema',       shop: "Ruth's Spaza",            email: 'ruth.shop@ekhadi.co.za' },
  { owner: 'Daniel Gumede',    shop: 'Gumede Convenience',      email: 'daniel.shop@ekhadi.co.za' },
  { owner: 'Esther Mthethwa',  shop: 'Esther Essentials',       email: 'esther.shop@ekhadi.co.za' },
  { owner: 'Jacob Ngcobo',     shop: 'Ngcobo Family Store',     email: 'jacob.shop@ekhadi.co.za' },
  { owner: 'Maria Shabalala',  shop: 'Maria Mini-Market',       email: 'maria.shop@ekhadi.co.za' },
  { owner: 'Isaac Nene',       shop: "Isaac's Spaza",           email: 'isaac.shop@ekhadi.co.za' },
  { owner: 'Pauline Madlala',  shop: 'Pauline Corner Store',    email: 'pauline.shop@ekhadi.co.za' },
  { owner: 'Moses Ntanzi',     shop: 'Ntanzi Provisions',       email: 'moses.shop@ekhadi.co.za' },
  { owner: 'Rebecca Cele',     shop: "Rebecca's General",       email: 'rebecca.shop@ekhadi.co.za' },
  { owner: 'Joshua Mnguni',    shop: 'Mnguni Spaza',            email: 'joshua.shop@ekhadi.co.za' },
  { owner: 'Deborah Xulu',     shop: "Deborah's Essentials",    email: 'deborah.shop@ekhadi.co.za' },
  { owner: 'Aaron Luthuli',    shop: 'Luthuli Store',           email: 'aaron.shop@ekhadi.co.za' },
  { owner: 'Naomi Msomi',      shop: "Naomi's Spaza",           email: 'naomi.shop@ekhadi.co.za' },
  { owner: 'Elijah Sithole',   shop: 'Sithole Convenience',     email: 'elijah.shop@ekhadi.co.za' },
  { owner: 'Lydia Mhlongo',    shop: 'Mhlongo Traders',         email: 'lydia.shop@ekhadi.co.za' },
  // Western Cape names
  { owner: 'Carlos Hendricks', shop: 'Hendricks Spaza',         email: 'carlos.shop@ekhadi.co.za' },
  { owner: 'Zainab Abrahams',  shop: 'Abrahams Corner',         email: 'zainab.shop@ekhadi.co.za' },
  { owner: 'Wayne Davids',     shop: 'Davids General Store',    email: 'wayne.shop@ekhadi.co.za' },
  { owner: 'Shanaaz Isaacs',   shop: 'Isaacs Provisions',       email: 'shanaaz.shop@ekhadi.co.za' },
  { owner: 'Clive Jansen',     shop: "Clive's Mini-Market",     email: 'clive.shop@ekhadi.co.za' },
  { owner: 'Gadija Salie',     shop: 'Salie Family Store',      email: 'gadija.shop@ekhadi.co.za' },
  { owner: 'Neville Adams',    shop: 'Adams Corner Store',      email: 'neville.shop@ekhadi.co.za' },
  { owner: 'Soraya October',   shop: "Soraya's Spaza",          email: 'soraya.shop@ekhadi.co.za' },
  // Eastern Cape
  { owner: 'Lungisa Botha',    shop: 'Botha Essentials',        email: 'lungisa.shop@ekhadi.co.za' },
  { owner: 'Nomfundo Nxesi',   shop: "Nomfundo's Spaza",        email: 'nomfundo.shop@ekhadi.co.za' },
  { owner: 'Andile Dyani',     shop: 'Dyani Convenience',       email: 'andile.shop@ekhadi.co.za' },
  { owner: 'Ayanda Ncwana',    shop: 'Ncwana Provisions',       email: 'ayanda.shop@ekhadi.co.za' },
  { owner: 'Noxolo Magwaza',   shop: "Noxolo's General",        email: 'noxolo.shop@ekhadi.co.za' },
  { owner: 'Sisanda Ntsomi',   shop: 'Ntsomi Corner',           email: 'sisanda.shop@ekhadi.co.za' },
  // KZN
  { owner: 'Thembi Pillay',    shop: "Thembi's Spaza",          email: 'thembi.shop@ekhadi.co.za' },
  { owner: 'Rajan Govender',   shop: 'Govender Traders',        email: 'rajan.shop@ekhadi.co.za' },
  { owner: 'Suria Naidoo',     shop: 'Naidoo General Store',    email: 'suria.shop@ekhadi.co.za' },
  { owner: 'Krishen Reddy',    shop: 'Reddy Provisions',        email: 'krishen.shop@ekhadi.co.za' },
  { owner: 'Anisha Moodley',   shop: 'Moodley Essentials',      email: 'anisha.shop@ekhadi.co.za' },
  // Limpopo / Mpumalanga
  { owner: 'Tshidi Mudau',     shop: "Tshidi's Spaza",          email: 'tshidi.shop@ekhadi.co.za' },
  { owner: 'Rendani Tshivhase',shop: 'Tshivhase Store',         email: 'rendani.shop@ekhadi.co.za' },
  { owner: 'Mulalo Netshitenzhe', shop: 'Mulalo Provisions',    email: 'mulalo.shop@ekhadi.co.za' },
  { owner: 'Khathutshelo Mudau', shop: 'KM Mini-Market',        email: 'khathutshelo.shop@ekhadi.co.za' },
  { owner: 'Avhashoni Baloyi', shop: "Baloyi's Corner",         email: 'avhashoni.shop@ekhadi.co.za' },
  { owner: 'Elmon Maluleke',   shop: 'Maluleke General',        email: 'elmon.shop@ekhadi.co.za' },
  { owner: 'Beauty Chauke',    shop: "Beauty's Spaza",          email: 'beauty.shop@ekhadi.co.za' },
  { owner: 'Justice Nkuna',    shop: 'Nkuna Essentials',        email: 'justice.shop@ekhadi.co.za' },
  { owner: 'Solly Mabunda',    shop: 'Mabunda Traders',         email: 'solly.shop@ekhadi.co.za' },
  { owner: 'Phineas Khoza',    shop: 'Khoza Corner Store',      email: 'phineas.shop@ekhadi.co.za' },
  // North West
  { owner: 'Gosiame Tau',      shop: 'Tau Provisions',          email: 'gosiame.shop@ekhadi.co.za' },
  { owner: 'Mmabatho Seleke',  shop: 'Seleke Spaza',            email: 'mmabatho.shop@ekhadi.co.za' },
  { owner: 'Ontlametse Sithole', shop: "Ontlametse's General",  email: 'ontlametse.shop@ekhadi.co.za' },
  { owner: 'Keitumetse Modise',shop: 'Modise Corner',           email: 'keitumetse.shop@ekhadi.co.za' },
  { owner: 'Ipeleng Vilakazi', shop: "Ipeleng's Mini-Market",   email: 'ipeleng.shop@ekhadi.co.za' },
  // Free State
  { owner: 'Mamello Radebe',   shop: 'Radebe Essentials',       email: 'mamello.shop@ekhadi.co.za' },
  { owner: 'Seabelo Moroka',   shop: 'Moroka Spaza',            email: 'seabelo.shop@ekhadi.co.za' },
  { owner: 'Lineo Motsepe',    shop: "Lineo's Store",           email: 'lineo.shop@ekhadi.co.za' },
  { owner: 'Tankiso Moshoeshoe', shop: 'Moshoeshoe General',    email: 'tankiso.shop@ekhadi.co.za' },
  { owner: 'Nthabiseng Ramaphosa', shop: 'Nthabiseng Traders',  email: 'nthabiseng.shop@ekhadi.co.za' },
  // Northern Cape
  { owner: 'Kelebogile Motlhaping', shop: 'Motlhaping Spaza',   email: 'kelebogile.shop@ekhadi.co.za' },
  { owner: 'Kagiso Phiri',     shop: 'Phiri Provisions',        email: 'kagiso.shop@ekhadi.co.za' },
  { owner: 'Boitshoko Tsheko', shop: "Boitshoko's Corner",      email: 'boitshoko.shop@ekhadi.co.za' },
  // Additional spread
  { owner: 'Vusi Mthembu',     shop: 'Mthembu Spaza',          email: 'vusi.shop@ekhadi.co.za' },
  { owner: 'Zanele Shabalala', shop: 'Shabalala Convenience',   email: 'zanele.shop@ekhadi.co.za' },
  { owner: 'Mandla Mnguni',    shop: 'Mnguni Family Store',     email: 'mandla.shop@ekhadi.co.za' },
  { owner: 'Nozipho Nxumalo',  shop: "Nozipho's Spaza",        email: 'nozipho.shop@ekhadi.co.za' },
  { owner: 'Comfort Dladla',   shop: 'Dladla Provisions',       email: 'comfort.shop@ekhadi.co.za' },
  { owner: 'Ntombi Mdlalose',  shop: 'Mdlalose Corner Store',   email: 'ntombi.shop@ekhadi.co.za' },
  { owner: 'Siphiwe Majola',   shop: "Siphiwe's Essentials",    email: 'siphiwe.shop@ekhadi.co.za' },
  { owner: 'Nokukhanya Luthuli', shop: 'Luthuli Mini-Market',   email: 'nokukhanya.shop@ekhadi.co.za' },
  { owner: 'Sabelo Mthiyane',  shop: 'Mthiyane Traders',        email: 'sabelo.shop@ekhadi.co.za' },
  { owner: 'Hlengiwe Buthelezi', shop: "Hlengiwe's Spaza",      email: 'hlengiwe.shop@ekhadi.co.za' },
  { owner: 'Mthokozisi Mhlongo', shop: 'Mhlongo General',       email: 'mthokozisi.shop@ekhadi.co.za' },
  { owner: 'Nombuso Mthethwa', shop: "Nombuso's Corner",        email: 'nombuso.shop@ekhadi.co.za' },
  { owner: 'Gcinile Ntuli',    shop: 'Ntuli Spaza',             email: 'gcinile.shop@ekhadi.co.za' },
  { owner: 'Mbuso Vilakazi',   shop: 'Vilakazi Convenience',    email: 'mbuso.shop@ekhadi.co.za' },
  { owner: 'Thokozile Mkhize', shop: "Thokozile's Provisions",  email: 'thokozile.shop@ekhadi.co.za' },
  { owner: 'Buhle Khumalo',    shop: 'Khumalo Corner Store',    email: 'buhle.shop@ekhadi.co.za' },
  { owner: 'Siyethemba Cele',  shop: "Siyethemba's General",    email: 'siyethemba.shop@ekhadi.co.za' },
  { owner: 'Thandazile Gumede',shop: 'Gumede Spaza',           email: 'thandazile.shop@ekhadi.co.za' },
  { owner: 'Lungani Mthembu',  shop: "Lungani's Store",         email: 'lungani.shop@ekhadi.co.za' },
  { owner: 'Nontuthuko Ndlovu',shop: 'Ndlovu Essentials',       email: 'nontuthuko.shop@ekhadi.co.za' },
]

// 30 stokvel group definitions (distributed across area indices)
const GROUP_DEFS = [
  { name: 'Soweto Stokvel 1',        areaIdx: 0,  maxMembers: 10, day: 5  },
  { name: 'Soweto Savings Circle',   areaIdx: 0,  maxMembers: 12, day: 10 },
  { name: 'Alexandra Unity Group',   areaIdx: 1,  maxMembers: 8,  day: 3  },
  { name: 'Tembisa Stokvel',         areaIdx: 2,  maxMembers: 10, day: 7  },
  { name: 'Mamelodi Savings',        areaIdx: 3,  maxMembers: 10, day: 12 },
  { name: 'Soshanguve Stokvel',      areaIdx: 4,  maxMembers: 8,  day: 15 },
  { name: 'Katlehong Circle',        areaIdx: 5,  maxMembers: 10, day: 20 },
  { name: 'Khayelitsha Savings Circle', areaIdx: 6, maxMembers: 8, day: 10 },
  { name: 'Khayelitsha Stokvel 2',   areaIdx: 6,  maxMembers: 10, day: 18 },
  { name: 'Gugulethu Stokvel',       areaIdx: 7,  maxMembers: 8,  day: 6  },
  { name: "Mitchell's Plain Stokvel",areaIdx: 8,  maxMembers: 12, day: 14 },
  { name: 'Delft Savings Group',     areaIdx: 9,  maxMembers: 8,  day: 22 },
  { name: 'Umlazi Stokvel',          areaIdx: 10, maxMembers: 10, day: 8  },
  { name: 'KwaMashu Savings',        areaIdx: 11, maxMembers: 10, day: 11 },
  { name: 'Inanda Circle',           areaIdx: 12, maxMembers: 8,  day: 16 },
  { name: 'Ntuzuma Stokvel',         areaIdx: 13, maxMembers: 10, day: 4  },
  { name: 'Hammarsdale Savings',     areaIdx: 14, maxMembers: 8,  day: 19 },
  { name: 'Mdantsane Stokvel',       areaIdx: 15, maxMembers: 10, day: 9  },
  { name: 'Motherwell Circle',       areaIdx: 16, maxMembers: 8,  day: 13 },
  { name: 'Mthatha Stokvel',         areaIdx: 17, maxMembers: 10, day: 17 },
  { name: 'Seshego Savings',         areaIdx: 18, maxMembers: 8,  day: 2  },
  { name: 'Giyani Stokvel',          areaIdx: 19, maxMembers: 10, day: 21 },
  { name: 'Tzaneen Circle',          areaIdx: 20, maxMembers: 8,  day: 25 },
  { name: 'Kanyamazane Stokvel',     areaIdx: 21, maxMembers: 10, day: 1  },
  { name: 'KwaMhlanga Savings',      areaIdx: 23, maxMembers: 8,  day: 23 },
  { name: 'Ikageng Stokvel',         areaIdx: 24, maxMembers: 10, day: 6  },
  { name: 'Mangaung Circle',         areaIdx: 27, maxMembers: 10, day: 8  },
  { name: 'Botshabelo Stokvel',      areaIdx: 28, maxMembers: 8,  day: 12 },
  { name: 'Galeshewe Savings',       areaIdx: 30, maxMembers: 10, day: 5  },
  { name: 'Roodepan Circle',         areaIdx: 31, maxMembers: 8,  day: 20 },
]

const CREDIT_REASONS = [
  'Food & groceries', 'Medicine & healthcare', 'Baby products',
  'Electricity & utilities', 'Toiletries & hygiene', 'School supplies',
  'Emergency household needs', 'Other essential goods',
]

const SHOP_DESCRIPTIONS = [
  'Food', 'Medicine', 'Toiletries', 'Baby Products', 'Electricity', 'Groceries',
]

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function sassaId(index: number) {
  const year = 55 + (index % 40)
  const month = String((index % 12) + 1).padStart(2, '0')
  const day = String((index % 28) + 1).padStart(2, '0')
  const seq = String(1000000 + index).slice(0, 7)
  return `${year}${month}${day}${seq}`
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.SEED_SECRET}`) {
      return NextResponse.json({ error: 'Forbidden in production' }, { status: 403 })
    }
  }

  try {
    // ── Clear existing data ──────────────────────────────────────────────────
    await prisma.notification.deleteMany()
    await prisma.storeCreditHistory.deleteMany()
    await prisma.storeCredit.deleteMany()
    await prisma.repaymentSchedule.deleteMany()
    await prisma.creditRequest.deleteMany()
    await prisma.rotationCycle.deleteMany()
    await prisma.groupBucket.deleteMany()
    await prisma.groupWallet.deleteMany()
    await prisma.groupMember.deleteMany()
    await prisma.group.deleteMany()
    await prisma.grantCycle.deleteMany()
    await prisma.customerProfile.deleteMany()
    await prisma.shop.deleteMany()
    await prisma.user.deleteMany()
    await prisma.area.deleteMany()

    // ── AREAS ────────────────────────────────────────────────────────────────
    const areas = await Promise.all(
      AREAS_DATA.map((a) => prisma.area.create({ data: a }))
    )

    // ── HASHES ───────────────────────────────────────────────────────────────
    const [adminHash, memberHash, shopHash] = await Promise.all([
      hash('Admin123!', 12),
      hash('Member123!', 10),
      hash('Shop123!', 10),
    ])

    // ── ADMIN ────────────────────────────────────────────────────────────────
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@ekhadi.co.za',
        passwordHash: adminHash,
        role: 'ADMIN',
        phone: '+27 11 000 0001',
      },
    })

    // ── MEMBERS (100) ────────────────────────────────────────────────────────
    const memberUsers = await Promise.all(
      MEMBER_NAMES.map((name, i) => {
        const slug = name.toLowerCase().replace(/[^a-z]/g, '.')
        return prisma.user.create({
          data: {
            name,
            email: i === 0 ? 'member@ekhadi.co.za' : `${slug}.${i}@ekhadi.co.za`,
            passwordHash: memberHash,
            role: 'MEMBER',
            phone: `+27 ${60 + (i % 30)} ${String(100 + i).padStart(3, '0')} ${String(1000 + i * 7).slice(0, 4)}`,
          },
        })
      })
    )

    // ── SHOP USERS + SHOPS (100) ─────────────────────────────────────────────
    const shopUsers = await Promise.all(
      SHOP_DATA.map((s) =>
        prisma.user.create({
          data: {
            name: s.owner,
            email: s.email,
            passwordHash: shopHash,
            role: 'SHOP',
            phone: `+27 ${31 + (SHOP_DATA.indexOf(s) % 40)} ${String(200 + SHOP_DATA.indexOf(s)).padStart(3,'0')} ${String(2000 + SHOP_DATA.indexOf(s) * 11).slice(0,4)}`,
          },
        })
      )
    )

    // Assign each shop to an area (cycle through areas)
    const shops = await Promise.all(
      SHOP_DATA.map((s, i) =>
        prisma.shop.create({
          data: {
            name: s.shop,
            userId: shopUsers[i].id,
            areaId: areas[i % areas.length].id,
            isActive: true,
          },
        })
      )
    )

    // ── CUSTOMER PROFILES ────────────────────────────────────────────────────
    // Assign each member to an area (cycle through areas)
    await Promise.all(
      memberUsers.map((u, i) =>
        prisma.customerProfile.create({
          data: {
            userId: u.id,
            sassaId: sassaId(i + 100),
            areaId: areas[i % areas.length].id,
            creditScore: 40 + (i % 55),        // 40–94
            monthlyGrantAmount: 350,
            isActive: true,
          },
        })
      )
    )

    // ── GROUPS (30) ──────────────────────────────────────────────────────────
    const groups = await Promise.all(
      GROUP_DEFS.map((g) =>
        prisma.group.create({
          data: {
            name: g.name,
            areaId: areas[Math.min(g.areaIdx, areas.length - 1)].id,
            maxMembers: g.maxMembers,
            rotationDay: g.day,
            description: `Community savings and credit group — ${AREAS_DATA[Math.min(g.areaIdx, AREAS_DATA.length - 1)].name}`,
          },
        })
      )
    )

    // ── GROUP MEMBERS ────────────────────────────────────────────────────────
    // Distribute members across groups — ~3–5 per group, admin is first member
    const membersPerGroup = 4
    const groupMemberData: { groupId: string; userId: string; role: 'ADMIN' | 'MEMBER' }[] = []

    groups.forEach((group, gi) => {
      const base = gi * membersPerGroup
      for (let k = 0; k < membersPerGroup; k++) {
        const memberIdx = (base + k) % memberUsers.length
        groupMemberData.push({
          groupId: group.id,
          userId: memberUsers[memberIdx].id,
          role: k === 0 ? 'ADMIN' : 'MEMBER',
        })
      }
    })

    // Deduplicate — a user can only appear once per group
    const seen = new Set<string>()
    const dedupedGroupMembers = groupMemberData.filter((gm) => {
      const key = `${gm.groupId}-${gm.userId}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    await prisma.groupMember.createMany({ data: dedupedGroupMembers })

    // ── GROUP WALLETS + BUCKETS ──────────────────────────────────────────────
    const wallets = await Promise.all(
      groups.map((g, i) =>
        prisma.groupWallet.create({
          data: {
            groupId: g.id,
            balance: 300 + (i * 87) % 1500,
          },
        })
      )
    )

    const bucketCategories: ('FOOD' | 'MEDICINE' | 'TOILETRIES' | 'ELECTRICITY' | 'BABY_PRODUCTS')[] =
      ['FOOD', 'MEDICINE', 'TOILETRIES', 'ELECTRICITY', 'BABY_PRODUCTS']

    const allBuckets: {
      walletId: string
      category: 'FOOD' | 'MEDICINE' | 'TOILETRIES' | 'ELECTRICITY' | 'BABY_PRODUCTS'
      allocatedAmount: number
      spentAmount: number
    }[] = []

    wallets.forEach((w, i) => {
      const cats = bucketCategories.slice(0, 3 + (i % 3))
      cats.forEach((cat, ci) => {
        const alloc = 100 + ((i + ci) * 73) % 400
        allBuckets.push({
          walletId: w.id,
          category: cat,
          allocatedAmount: alloc,
          spentAmount: Math.floor(alloc * (0.2 + ((i + ci) % 6) * 0.1)),
        })
      })
    })

    await prisma.groupBucket.createMany({ data: allBuckets })

    // ── GRANT CYCLES ─────────────────────────────────────────────────────────
    const now = new Date()
    const cm = now.getMonth() + 1
    const cy = now.getFullYear()

    await prisma.grantCycle.createMany({
      data: memberUsers.map((u, i) => ({
        userId: u.id,
        month: cm,
        year: cy,
        grantAmount: 350,
        spentAmount: (i * 37) % 300,
        repaidAmount: i % 3 === 0 ? (i * 13) % 100 : 0,
        status: 'ACTIVE' as const,
      })),
    })

    // ── STORE CREDIT ─────────────────────────────────────────────────────────
    await prisma.storeCredit.createMany({
      data: memberUsers.map((u, i) => ({
        userId: u.id,
        balance: (i * 53) % 300,
      })),
    })

    // ── STORE CREDIT HISTORY ─────────────────────────────────────────────────
    const historyRows: {
      userId: string
      amount: number
      type: 'CREDIT' | 'DEBIT'
      description: string
      createdAt: Date
    }[] = []

    memberUsers.forEach((u, i) => {
      const creditAmt = 50 + (i * 37) % 250
      historyRows.push({
        userId: u.id,
        amount: creditAmt,
        type: 'CREDIT',
        description: `Credit approved: ${CREDIT_REASONS[i % CREDIT_REASONS.length]}`,
        createdAt: daysAgo(10 + (i % 20)),
      })
      if (creditAmt > 50) {
        historyRows.push({
          userId: u.id,
          amount: Math.floor(creditAmt * 0.4),
          type: 'DEBIT',
          description: `Purchase at ${shops[i % shops.length].name} - ${SHOP_DESCRIPTIONS[i % SHOP_DESCRIPTIONS.length]}`,
          createdAt: daysAgo(3 + (i % 8)),
        })
      }
      if (i % 3 === 0 && creditAmt > 80) {
        historyRows.push({
          userId: u.id,
          amount: Math.floor(creditAmt * 0.2),
          type: 'DEBIT',
          description: `Purchase at ${shops[(i + 1) % shops.length].name} - ${SHOP_DESCRIPTIONS[(i + 2) % SHOP_DESCRIPTIONS.length]}`,
          createdAt: daysAgo(1 + (i % 3)),
        })
      }
    })

    await prisma.storeCreditHistory.createMany({ data: historyRows })

    // ── ROTATION CYCLES ───────────────────────────────────────────────────────
    const rotationRows: {
      groupId: string
      month: number
      year: number
      recipientUserId: string
      amount: number
      status: 'PENDING' | 'ACTIVE' | 'COMPLETED'
    }[] = []

    dedupedGroupMembers
      .filter((gm) => gm.role === 'ADMIN')
      .forEach((gm, i) => {
        const g = groups.find((gr) => gr.id === gm.groupId)!
        const wallet = wallets[groups.indexOf(g)]
        rotationRows.push({
          groupId: g.id,
          month: cm,
          year: cy,
          recipientUserId: gm.userId,
          amount: Number(wallet.balance),
          status: 'ACTIVE',
        })
        const nextM = cm === 12 ? 1 : cm + 1
        const nextY = cm === 12 ? cy + 1 : cy
        const nextMemberIdx = (i + 1) % dedupedGroupMembers.filter((x) => x.groupId === g.id).length
        const nextMember = dedupedGroupMembers.filter((x) => x.groupId === g.id)[nextMemberIdx]
        if (nextMember) {
          rotationRows.push({
            groupId: g.id,
            month: nextM,
            year: nextY,
            recipientUserId: nextMember.userId,
            amount: Number(wallet.balance),
            status: 'PENDING',
          })
        }
      })

    await prisma.rotationCycle.createMany({ data: rotationRows })

    // ── CREDIT REQUESTS (~150) ────────────────────────────────────────────────
    const creditRequestRows: {
      requesterId: string
      groupId: string
      amount: number
      reason: string
      status: 'PENDING' | 'APPROVED' | 'REJECTED'
      approvedBy?: string
      createdAt: Date
    }[] = []

    dedupedGroupMembers.forEach((gm, i) => {
      const amount = 50 + (i * 43) % 251
      const statusRoll = i % 5
      const status: 'PENDING' | 'APPROVED' | 'REJECTED' =
        statusRoll < 3 ? 'APPROVED' : statusRoll === 3 ? 'PENDING' : 'REJECTED'
      creditRequestRows.push({
        requesterId: gm.userId,
        groupId: gm.groupId,
        amount,
        reason: CREDIT_REASONS[i % CREDIT_REASONS.length],
        status,
        ...(status !== 'PENDING' ? { approvedBy: adminUser.id } : {}),
        createdAt: daysAgo(1 + (i % 25)),
      })
    })

    await prisma.creditRequest.createMany({ data: creditRequestRows })

    // ── REPAYMENT SCHEDULES ───────────────────────────────────────────────────
    const nextMonthFirst = new Date(cy, cm, 1)
    const approvedRequests = creditRequestRows.filter((r) => r.status === 'APPROVED')

    await prisma.repaymentSchedule.createMany({
      data: approvedRequests.map((r) => ({
        userId: r.requesterId,
        amount: r.amount * 1.02,
        dueDate: nextMonthFirst,
        status: 'PENDING' as const,
      })),
    })

    // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
    const notifRows: {
      userId: string
      title: string
      message: string
      type: string
      read: boolean
      createdAt: Date
    }[] = []

    creditRequestRows.forEach((r, i) => {
      if (r.status === 'APPROVED') {
        notifRows.push({
          userId: r.requesterId,
          title: 'Credit Request Approved',
          message: `Your credit request of R${r.amount.toFixed(2)} has been approved. Funds are available in your wallet.`,
          type: 'CREDIT_APPROVED',
          read: i % 3 !== 0,
          createdAt: daysAgo(i % 15),
        })
      } else if (r.status === 'REJECTED') {
        notifRows.push({
          userId: r.requesterId,
          title: 'Credit Request Rejected',
          message: `Your credit request of R${r.amount.toFixed(2)} was not approved. Contact your group admin.`,
          type: 'CREDIT_REJECTED',
          read: i % 2 === 0,
          createdAt: daysAgo(i % 15),
        })
      }
    })

    await prisma.notification.createMany({ data: notifRows })

    // ─────────────────────────────────────────────────────────────────────────
    return NextResponse.json({
      success: true,
      message: 'Seed data created successfully',
      credentials: {
        admin:  { email: 'admin@ekhadi.co.za',  password: 'Admin123!' },
        member: { email: 'member@ekhadi.co.za', password: 'Member123!' },
        shop:   { email: 'shop@ekhadi.co.za',   password: 'Shop123!' },
      },
      data: {
        provinces: 9,
        areas:     areas.length,
        members:   memberUsers.length,
        shops:     shops.length,
        groups:    groups.length,
        groupMemberships: dedupedGroupMembers.length,
        creditRequests:   creditRequestRows.length,
        transactions:     historyRows.length,
        notifications:    notifRows.length,
        repayments:       approvedRequests.length,
        rotationCycles:   rotationRows.length,
      },
    })
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
