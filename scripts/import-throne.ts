import { config } from "dotenv";
config({ path: ".env.local" });

import { writeDbDocument } from "../src/lib/content/db-document";
import { slugify } from "../src/lib/slug";
import type { SiteContent, SiteWork, SiteWorkImage } from "../src/lib/types";

type ThroneItem = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imgLink: string;
  section: "prints" | "metal-plaques";
};

/** Prefer higher-res Cargo covers for works that already existed in seed. */
const CARGO_COVERS: Record<string, string[]> = {
  "in-the-night": [
    "https://freight.cargo.site/w/1000/i/T3206156601320121977228279492773/FL3_2_1920h.png",
  ],
  "camellias-and-lillies": [
    "https://freight.cargo.site/w/1000/i/N3206145231780092610788398280869/FL3_1_sm.png",
    "https://freight.cargo.site/w/1000/i/G3206151955765881430509638725797/Frame-10.png",
    "https://freight.cargo.site/w/1000/i/J3206152511916768508778910396581/Hahnemhle-German-etching---a3--hge--310gsm--portrait--AngledRolled.jpg",
  ],
  "plaque-1": [
    "https://freight.cargo.site/w/1000/i/Q3206189434975046678038553637029/postcard5.png",
    "https://freight.cargo.site/w/1000/i/L3206162556205810131777184411813/Dibond---matte--dibond--landscape--HeadOn.jpg",
    "https://freight.cargo.site/w/1000/i/F3206162556187363387703474860197/Dibond---matte--dibond--landscape--CloseUp.jpg",
  ],
  "plaque-2": [
    "https://freight.cargo.site/w/1000/i/Q3206188778252510909904806555813/postcard7.png",
    "https://freight.cargo.site/w/750/i/P3206162556150469899556055756965/Dibond---matte--dibond--landscape--Angled.jpg",
  ],
};

const HAHN = [
  "Hahnemühle German etching",
  "Warm natural white paper",
  "310gsm",
  "Textured",
  "Velvet matte finish",
  "Giclée fine art print",
].join("\n");

const ITEMS: ThroneItem[] = [
  // prints — oldest → newest so last created shows first (id desc)
  {
    id: "4f3e9621-9007-47b5-95e4-d0f9c33945c5",
    name: "In the Night",
    description: `42 x 60 cm (16.5 x 23.4 in)\n${HAHN}`,
    priceCents: 30000,
    imgLink:
      "https://cdn.throne.com/wishlistItems/huDMBZEL0tUTcvPmtpXOwKYsJ3F3/4f3e9621-9007-47b5-95e4-d0f9c33945c5?version=1793234947103",
    section: "prints",
  },
  {
    id: "2978442b-d712-4e68-8780-a41520d2b75c",
    name: "In the Night #2",
    description: `76 x 50 cm (30 x 20 in)\n${HAHN}`,
    priceCents: 35000,
    imgLink:
      "https://cdn.throne.com/wishlistItems/huDMBZEL0tUTcvPmtpXOwKYsJ3F3/2978442b-d712-4e68-8780-a41520d2b75c?version=1793236227922",
    section: "prints",
  },
  {
    id: "0a6b4d05-2a59-4da1-8213-5c771b0b3701",
    name: "The Master's Gaze",
    description: `46 x 46 cm (18 x 18 in)\n${HAHN}`,
    priceCents: 35000,
    imgLink:
      "https://cdn.throne.com/wishlistItems/huDMBZEL0tUTcvPmtpXOwKYsJ3F3/0a6b4d05-2a59-4da1-8213-5c771b0b3701?version=1793237101886",
    section: "prints",
  },
  {
    id: "a10f1d33-9f85-40ef-931f-81403c037d77",
    name: "The Two",
    description: `50 x 60 cm (20 x 24 in)\n${HAHN}`,
    priceCents: 35000,
    imgLink:
      "https://cdn.throne.com/wishlistItems/huDMBZEL0tUTcvPmtpXOwKYsJ3F3/a10f1d33-9f85-40ef-931f-81403c037d77?version=1793237845239",
    section: "prints",
  },
  {
    id: "6e28913b-28a5-41b0-9223-1e498cf5a692",
    name: "In the Moonlight",
    description: `56 x 100 cm (22 x 40 in)\n${HAHN}`,
    priceCents: 50000,
    imgLink:
      "https://cdn.throne.com/wishlistItems/huDMBZEL0tUTcvPmtpXOwKYsJ3F3/6e28913b-28a5-41b0-9223-1e498cf5a692?version=1793238281959",
    section: "prints",
  },
  {
    id: "5b47effa-a341-430a-9991-3d781b60e7fd",
    name: "The Night #3",
    description: `40 x 96 cm (16 x 38 in)\n${HAHN}`,
    priceCents: 55000,
    imgLink:
      "https://cdn.throne.com/wishlistItems/huDMBZEL0tUTcvPmtpXOwKYsJ3F3/5b47effa-a341-430a-9991-3d781b60e7fd?version=1793245042882",
    section: "prints",
  },
  {
    id: "6b2de4e1-9f2a-4049-b2c8-abfa32c5a302",
    name: "Pale Forest (Triptych)",
    description: `50 x 90 cm (20 x 36 in)\n${HAHN}`,
    priceCents: 70000,
    imgLink:
      "https://cdn.throne.com/wishlistItems/huDMBZEL0tUTcvPmtpXOwKYsJ3F3/6b2de4e1-9f2a-4049-b2c8-abfa32c5a302?version=1793246062825",
    section: "prints",
  },
  {
    id: "c5a5e312-e0ef-4e7a-bc2c-d1602e21bc00",
    name: "Camellias & Lillies",
    description: `30 x 42 cm\n${HAHN}`,
    priceCents: 35000,
    imgLink:
      "https://cdn.throne.com/wishlistItems/huDMBZEL0tUTcvPmtpXOwKYsJ3F3/c5a5e312-e0ef-4e7a-bc2c-d1602e21bc00?version=1793373331995",
    section: "prints",
  },
  {
    id: "848b60d7-18d2-4c24-8361-418d3803fba6",
    name: "Waterfall",
    description: `50 x 100 cm (20 x 40 in)\n${HAHN}`,
    priceCents: 55000,
    imgLink:
      "https://cdn.throne.com/wishlistItems/huDMBZEL0tUTcvPmtpXOwKYsJ3F3/848b60d7-18d2-4c24-8361-418d3803fba6?version=1793243860066",
    section: "prints",
  },
  // metal plaques
  {
    id: "6606d7b6-73e6-4838-bd37-a68fb0bfbab8",
    name: "Plaque #1",
    description: "30 x 20 cm (12 x 8 in). Print on aluminium, sheer matte finish.",
    priceCents: 20000,
    imgLink:
      "https://cdn.throne.com/wishlistItems/huDMBZEL0tUTcvPmtpXOwKYsJ3F3/6606d7b6-73e6-4838-bd37-a68fb0bfbab8?version=1793253729554",
    section: "metal-plaques",
  },
  {
    id: "5fb55043-ede7-4689-b2c4-caeadbb0fb1c",
    name: "Plaque #2",
    description: "20 x 30 cm (8 x 12 in). Print on aluminium, sheer matte finish.",
    priceCents: 20000,
    imgLink:
      "https://cdn.throne.com/wishlistItems/huDMBZEL0tUTcvPmtpXOwKYsJ3F3/5fb55043-ede7-4689-b2c4-caeadbb0fb1c?version=1793253835120",
    section: "metal-plaques",
  },
  {
    id: "e503c973-2690-437d-8da3-de863025d579",
    name: "Plaque #3",
    description: "20 x 30 cm (8 x 12 in). Print on aluminium, sheer matte finish.",
    priceCents: 20000,
    imgLink:
      "https://cdn.throne.com/wishlistItems/huDMBZEL0tUTcvPmtpXOwKYsJ3F3/e503c973-2690-437d-8da3-de863025d579?version=1793253894804",
    section: "metal-plaques",
  },
  {
    id: "adf9c6ff-4e2f-4449-95e2-fc955101abb5",
    name: "Plaque #4",
    description: "20 x 30 cm (8 x 12 in). Print on aluminium, sheer matte finish.",
    priceCents: 20000,
    imgLink:
      "https://cdn.throne.com/wishlistItems/huDMBZEL0tUTcvPmtpXOwKYsJ3F3/adf9c6ff-4e2f-4449-95e2-fc955101abb5?version=1793253938768",
    section: "metal-plaques",
  },
  {
    id: "957920ad-89cf-4f8f-a4e1-1362603844b2",
    name: "Plaque #5",
    description: "20 x 30 cm (8 x 12 in). Print on aluminium, sheer matte finish.",
    priceCents: 20000,
    imgLink:
      "https://cdn.throne.com/wishlistItems/huDMBZEL0tUTcvPmtpXOwKYsJ3F3/957920ad-89cf-4f8f-a4e1-1362603844b2?version=1793254010982",
    section: "metal-plaques",
  },
  {
    id: "9f21e9c2-4bd4-49f8-a3f2-5c5d92716cac",
    name: "Plaque #6",
    description: "20 x 30 cm (8 x 12 in). Print on aluminium, sheer matte finish.",
    priceCents: 20000,
    imgLink:
      "https://cdn.throne.com/wishlistItems/huDMBZEL0tUTcvPmtpXOwKYsJ3F3/9f21e9c2-4bd4-49f8-a3f2-5c5d92716cac?version=1793254036340",
    section: "metal-plaques",
  },
  {
    id: "fe16d9b4-005b-48df-a405-b11c23850242",
    name: "Plaque #7",
    description: "20 x 30 cm (8 x 12 in). Print on aluminium, sheer matte finish.",
    priceCents: 20000,
    imgLink:
      "https://cdn.throne.com/wishlistItems/huDMBZEL0tUTcvPmtpXOwKYsJ3F3/fe16d9b4-005b-48df-a405-b11c23850242?version=1793254058723",
    section: "metal-plaques",
  },
];

function imagesFor(item: ThroneItem, workId: number, startImageId: number) {
  const slug = slugify(item.name);
  const urls = CARGO_COVERS[slug] || [item.imgLink];
  let imageId = startImageId;
  const images: SiteWorkImage[] = urls.map((url, idx) => ({
    id: imageId++,
    workId,
    url,
    caption: null,
    sortOrder: idx,
  }));
  return { images, nextId: imageId };
}

async function main() {
  const sections = [
    {
      id: 1,
      slug: "prints",
      title: "Prints",
      sortOrder: 1,
      showInNav: true,
    },
    {
      id: 2,
      slug: "metal-plaques",
      title: "Metal Plaques",
      sortOrder: 2,
      showInNav: true,
    },
  ];

  const sectionBySlug = new Map(sections.map((s) => [s.slug, s]));
  let workId = 1;
  let imageId = 1;
  const works: SiteWork[] = [];
  const printOrder = new Map<string, number>();
  const plaqueOrder = new Map<string, number>();
  let p = 1;
  let m = 1;

  for (const item of ITEMS) {
    const section = sectionBySlug.get(item.section)!;
    const id = workId++;
    const mapped = imagesFor(item, id, imageId);
    imageId = mapped.nextId;
    const sortOrder =
      item.section === "prints"
        ? (printOrder.set(item.id, p), p++)
        : (plaqueOrder.set(item.id, m), m++);

    works.push({
      id,
      sectionId: section.id,
      sectionSlug: section.slug,
      sectionTitle: section.title,
      slug: slugify(item.name),
      title: item.name,
      series: "Master And His Companion",
      description: item.description,
      longDescription: null,
      edition: "Ed. 10/10",
      year: "2026",
      price: String(Math.round(item.priceCents / 100)),
      buyUrl: `https://throne.com/flynnegan/item/${item.id}`,
      prodigiSku: item.section === "metal-plaques" ? "MOU-DI-20X30" : null,
      altLabel: null,
      altDescription: null,
      altLongDescription: null,
      altEdition: null,
      altPrice: null,
      altBuyUrl: null,
      altProdigiSku: null,
      sortOrder,
      published: true,
      images: mapped.images,
      altImages: [],
    });
  }

  const content: SiteContent = {
    sections,
    works,
    site: {
      title: "Flynn Egan. Male Erotic Art",
      tagline: "Gay BDSM Erotic Art | Prints & Private Commissions",
      description:
        "Erotic Male Fine Art, Gay Queer BDSM Gothic Dark Prints & Custom Artwork",
    },
  };

  await writeDbDocument(content);
  console.log(
    `Imported ${works.length} works (${works.filter((w) => w.sectionSlug === "prints").length} prints, ${works.filter((w) => w.sectionSlug === "metal-plaques").length} plaques)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
