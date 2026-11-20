// The Portfolio page (aod.co.in/portfolio): our artists' work, artist by artist.
// MOCK DATA, on request (2026-11-20, "just generate a mock page for now"): these artists are made
// up and the photos are the site's own stock and category pictures (public/home, public/categories),
// not their work. Replace with real AOD artists (from the artist portal's portfolio uploads)
// before launch.

export type Work = { src: string; caption: string };

export type PortfolioArtist = {
  slug: string;
  name: string;
  craft: string; // what they do, singular
  category: string; // a category slug (src/data/site.ts)
  city: string;
  experience: string;
  languages: string[];
  about: string;
  works: Work[]; // the first is the cover
};

export const portfolioPage = {
  label: "Portfolio",
  title: "Our Artists' Work.",
  meta: "See the work of AOD's verified photographers, cinematographers, anchors, DJs, singers, comedians, models and makeup artists.",
  all: "All",
  aboutTitle: "About",
  workTitle: "Work",
  moreTitle: "More Artists",
  back: "All Portfolios",
  empty: "No portfolios in this category yet.",
  testNote: "Test mode: sample portfolios.",
};

export const portfolioArtists: PortfolioArtist[] = [
  {
    slug: "aarav-mehta",
    name: "Aarav Mehta",
    craft: "Photographer",
    category: "photo-video",
    city: "Ahmedabad",
    experience: "3–5 Years",
    languages: ["Gujarati", "Hindi", "English"],
    about: "Corporate events, conferences and studio portraits, shot clean and delivered fast.",
    works: [
      { src: "/home/photographer-main.jpg", caption: "Studio Portrait Setup" },
      { src: "/categories/photographers.jpg", caption: "Wedding Reception, Ahmedabad" },
      { src: "/categories/drone-pilots.jpg", caption: "Outdoor Shoot" },
      { src: "/categories/cinematographers.jpg", caption: "Product Launch" },
    ],
  },
  {
    slug: "kavya-shah",
    name: "Kavya Shah",
    craft: "Cinematographer",
    category: "photo-video",
    city: "Surat",
    experience: "More Than 5 Years",
    languages: ["Gujarati", "Hindi", "English"],
    about: "Brand films, event highlights and reels with a cinematic finish.",
    works: [
      { src: "/categories/cinematographers.jpg", caption: "Brand Film Shoot" },
      { src: "/categories/editors.jpg", caption: "Highlights Edit" },
      { src: "/home/drone-pilot.jpg", caption: "Aerial B-Roll" },
      { src: "/categories/photographers.jpg", caption: "Engagement Film" },
    ],
  },
  {
    slug: "rohan-patel",
    name: "Rohan Patel",
    craft: "Drone Operator",
    category: "photo-video",
    city: "Vadodara",
    experience: "1–3 Years",
    languages: ["Gujarati", "Hindi"],
    about: "Aerial photos and video for weddings, real estate and industrial sites.",
    works: [
      { src: "/home/drone-pilot.jpg", caption: "Sunset Flight" },
      { src: "/categories/drone-pilots.jpg", caption: "Venue Aerials" },
      { src: "/categories/cinematographers.jpg", caption: "Factory Plant Shoot" },
    ],
  },
  {
    slug: "nisha-desai",
    name: "Nisha Desai",
    craft: "Anchor",
    category: "anchors-hosts",
    city: "Ahmedabad",
    experience: "3–5 Years",
    languages: ["Gujarati", "Hindi", "English"],
    about: "Bilingual host for corporate award nights, conferences and sangeet evenings.",
    works: [
      { src: "/home/anchor.jpg", caption: "Corporate Awards Night" },
      { src: "/categories/anchors-hosts.jpg", caption: "Annual Conference" },
    ],
  },
  {
    slug: "meera-joshi",
    name: "Meera Joshi",
    craft: "DJ",
    category: "musicians-djs",
    city: "Ahmedabad",
    experience: "3–5 Years",
    languages: ["Gujarati", "Hindi", "English"],
    about: "Bollywood, house and Garba sets for weddings, clubs and corporate parties.",
    works: [
      { src: "/home/dj.jpg", caption: "Club Night" },
      { src: "/categories/musicians-djs.jpg", caption: "Wedding After-Party" },
      { src: "/categories/singers.jpg", caption: "Live Set With Vocalist" },
    ],
  },
  {
    slug: "arjun-trivedi",
    name: "Arjun Trivedi",
    craft: "Singer",
    category: "musicians-djs",
    city: "Rajkot",
    experience: "More Than 5 Years",
    languages: ["Gujarati", "Hindi"],
    about: "Sufi, Bollywood and Gujarati folk, solo or with a live band.",
    works: [
      { src: "/home/singer.jpg", caption: "Live Concert" },
      { src: "/categories/singers.jpg", caption: "Sangeet Evening" },
      { src: "/categories/musicians-djs.jpg", caption: "Corporate Gala" },
    ],
  },
  {
    slug: "kunal-bhatt",
    name: "Kunal Bhatt",
    craft: "Stand-Up Comedian",
    category: "comedians",
    city: "Ahmedabad",
    experience: "1–3 Years",
    languages: ["Gujarati", "Hindi", "English"],
    about: "Clean, observational stand-up for office parties, college fests and private shows.",
    works: [
      { src: "/home/comedian.jpg", caption: "Open Mic Night" },
      { src: "/categories/comedians.jpg", caption: "Corporate Show" },
    ],
  },
  {
    slug: "isha-rao",
    name: "Isha Rao",
    craft: "Model",
    category: "models-creators",
    city: "Gandhinagar",
    experience: "1–3 Years",
    languages: ["Hindi", "English"],
    about: "Fashion, jewellery and catalogue shoots, and brand promotions at events.",
    works: [
      { src: "/home/model.jpg", caption: "Studio Shoot" },
      { src: "/categories/models.jpg", caption: "Fashion Catalogue" },
      { src: "/categories/makeup-artists.jpg", caption: "Bridal Look" },
    ],
  },
  {
    slug: "dev-kapoor",
    name: "Dev Kapoor",
    craft: "Content Creator",
    category: "models-creators",
    city: "Ahmedabad",
    experience: "1–3 Years",
    languages: ["Gujarati", "Hindi", "English"],
    about: "Reels for cafes, launches and events, shot and edited on the day.",
    works: [
      { src: "/categories/content-creators.webp", caption: "Cafe Launch Reel" },
      { src: "/categories/editors.jpg", caption: "Same-Day Edit" },
      { src: "/categories/models.jpg", caption: "Brand Collaboration" },
    ],
  },
  {
    slug: "priya-soni",
    name: "Priya Soni",
    craft: "Makeup Artist",
    category: "makeup-styling",
    city: "Surat",
    experience: "More Than 5 Years",
    languages: ["Gujarati", "Hindi"],
    about: "Bridal, party and on-camera makeup, with hair styling on request.",
    works: [
      { src: "/categories/makeup-artists.jpg", caption: "Bridal Makeup" },
      { src: "/categories/models.jpg", caption: "Editorial Look" },
      { src: "/home/model.jpg", caption: "Studio Glam" },
    ],
  },
];
