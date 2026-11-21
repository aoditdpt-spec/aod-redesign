// "Your Work Details" in the artist application: each category's own questions, as on aod.co.in
// (from AOD's Google Forms for each kind of artist), grouped into the redesign's six categories.
// "one" picks one, "many" picks any, "text" is a line, "long" a few lines, "link" a Google Drive
// link (photos of the equipment).

export type WorkQuestion = { id: string; label: string; kind: "one" | "many" | "text" | "long" | "link"; options?: string[]; hint?: string };

const yesNo = ["Yes", "No"];
const level = (who: string): WorkQuestion => ({ id: "level", label: `Are You A Professional ${who}?`, kind: "one", options: ["Full-Time Professional", "Freelance", "Part-Time", "Student Or Beginner"] });
const travel: WorkQuestion = { id: "travel", label: "Willing To Travel For Events?", kind: "one", options: ["Yes", "No", "Within My City Only"] };
const brands: WorkQuestion[] = [
  { id: "brandWork", label: "Have You Worked With Brands, Artists Or Events Before?", kind: "one", options: yesNo },
  { id: "brandWorkDetails", label: "Notable Brands, Clients Or Events (Optional)", kind: "long" },
];
const gear = (what: string): WorkQuestion => ({ id: "equipmentPhotos", label: "Photos Of Your Equipment (Google Drive Link)", kind: "link", hint: `Put photos of ${what} in a Google Drive folder, set sharing to "Anyone with the link", and paste the link.` });

export const workQuestions: Record<string, WorkQuestion[]> = {
  "photo-video": [
    level("Photographer, Cinematographer Or Drone Operator"),
    { id: "specialisations", label: "What You Shoot", kind: "many", options: ["Wedding", "Pre-Wedding", "Fashion", "Portrait", "Product", "Event", "Corporate", "Drone / Aerial", "Real Estate", "Podcast", "Other"] },
    { id: "editor", label: "Do You Edit As Well, Or Have An Editor With You?", kind: "one", options: yesNo },
    { id: "licence", label: "If You Fly Drones: A DGCA Remote Pilot Certificate?", kind: "one", options: ["Yes", "No", "I Don't Fly Drones"] },
    { id: "equipment", label: "Equipment You Use", kind: "many", options: ["DSLR", "Mirrorless", "Cinema Camera", "Gimbal", "Drone", "Studio Lights"] },
    { id: "cameraBrand", label: "Camera Brand", kind: "text", hint: "Sony, Canon, Nikon, Fujifilm, DJI…" },
    gear("your camera, lenses and drones"),
    travel,
    ...brands,
  ],
  "anchors-hosts": [
    level("Anchor Or Host"),
    { id: "specialisations", label: "Type Of Hosting Experience", kind: "many", options: ["Corporate Events", "Weddings", "Stage Shows", "Live Concerts", "Award Functions", "Exhibitions / Trade Shows", "Digital / Online Events", "Radio / Podcast"] },
    { id: "style", label: "Hosting Style", kind: "many", options: ["Formal / Corporate", "Energetic / Entertaining", "Interactive / Crowd Engagement", "Luxury / Premium", "Youth / Fun"] },
    { id: "preferredEvents", label: "Preferred Events", kind: "many", options: ["Corporate Events", "Weddings", "Brand Launches", "College Festivals", "Private Parties", "Virtual Events"] },
    { id: "paid", label: "Open To Paid Hosting Through AOD?", kind: "one", options: ["Yes", "Depends On Event", "No"] },
    travel,
    ...brands,
  ],
  "musicians-djs": [
    level("Musician, Singer Or DJ"),
    { id: "specialisations", label: "What You Play", kind: "many", options: ["Wedding / Sangeet", "Club / Lounge", "Corporate", "Bollywood", "Garba / Dandiya", "Live Band", "Sufi / Ghazal", "Instrumental", "Other"] },
    { id: "lineUp", label: "Solo Or With A Band?", kind: "one", options: ["Solo", "Duo", "Band (3 Or More)"] },
    { id: "equipment", label: "Equipment You Bring", kind: "many", options: ["DJ Controller / CDJs", "Speakers / PA", "Microphones", "Lights", "Smoke / Effects", "Instruments", "None"] },
    gear("the equipment you bring"),
    travel,
    ...brands,
  ],
  comedians: [
    level("Stand-Up Comedian"),
    { id: "style", label: "Your Style", kind: "many", options: ["Clean / Corporate", "Observational", "Crowd Work", "Storytelling", "Improv", "Satire"] },
    { id: "languages", label: "Languages You Perform In", kind: "many", options: ["Gujarati", "Hindi", "English"] },
    { id: "setLength", label: "Set Length You Can Do", kind: "one", options: ["10 To 15 Minutes", "20 To 30 Minutes", "45 To 60 Minutes", "More Than An Hour"] },
    { id: "corporate", label: "Have You Performed At Corporate Events?", kind: "one", options: yesNo },
    { id: "clips", label: "A Link To Your Recorded Sets", kind: "text", hint: "YouTube, Instagram or Google Drive." },
    travel,
  ],
  "models-creators": [
    { id: "type", label: "You Are A", kind: "many", options: ["Model", "Influencer", "Reel Creator"] },
    { id: "specialisations", label: "Work You Do", kind: "many", options: ["Runway", "Brand Campaigns", "Product Shoots", "Ethnic Wear", "Western Wear", "Jewellery", "Reels", "Event Hosting On Social"] },
    { id: "followers", label: "Instagram Followers", kind: "one", options: ["Under 10K", "10K To 50K", "50K To 1 Lakh", "More Than 1 Lakh"] },
    { id: "shoots", label: "Do You Shoot Your Own Content?", kind: "one", options: ["Yes, With A Phone", "Yes, With A Camera", "No"] },
    travel,
    ...brands,
  ],
  "makeup-styling": [
    level("Makeup Artist"),
    { id: "specialisations", label: "Services You Offer", kind: "many", options: ["Bridal Makeup", "Party Makeup", "HD / Airbrush", "Saree Draping", "Nail Art", "Groom Makeup"] },
    { id: "products", label: "Brands You Use", kind: "text", hint: "MAC, Huda Beauty, Bobbi Brown…" },
    { id: "kit", label: "Do You Bring Your Own Kit?", kind: "one", options: yesNo },
    travel,
    ...brands,
  ],
};
