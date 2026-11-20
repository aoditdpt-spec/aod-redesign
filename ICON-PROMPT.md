# Icon Brief: AOD Category Icons (Urban Company Style)

> **How to use this:** paste this whole file into Gemini or ChatGPT, together with a screenshot of Urban Company's category icons (the woman with a face mask, the man with a beard and an eye mask, the vacuum cleaner, the paint roller…). Ask for the icons **one at a time**: "Make icon 1", then "Make icon 2"… Every icon must follow the **Style** and **Rules** sections.

---

## 1. What the icons are for

**AOD (Artists On Demand)** is a booking platform from **Ahmedabad, Gujarat, India**. People book verified event artists through it. The website's homepage has a section called **"Who Are You Looking For?"** with six category cards.

Each card needs **one small 3D icon** above the category name, exactly in the style of **Urban Company's** category icons. The cards are light grey fading to white. The site itself is very clean and minimal (white, black, with AOD orange #FF6201 for small details).

---

## 2. Style (all 6 must look like one set)

- **The look:** a soft, glossy **3D render**, like Urban Company's icons and Apple's 3D emoji.
  - Smooth, rounded shapes and slightly simplified forms.
  - Soft studio lighting from the top left, with gentle shadows inside the object.
  - Realistic but friendly. Not cartoonish, not flat, not photographic.
- **People:** shown from the **chest up**, facing the viewer or slightly turned, eyes closed or a calm, pleasant expression.
  - **Indian looks:** a **light-medium, warm Indian skin tone**. Not dark brown, not pale, not yellow.
  - **Hair:** natural **black or very dark brown** hair, neat and well groomed. No blond hair.
- **Objects:** shown alone, slightly angled (three-quarter view), with clean shapes and real materials (metal, plastic, fabric).
- **Colours:** natural and soft. White, light grey, warm skin tones, and one or two gentle accent colours per icon. AOD orange (#FF6201) may appear as a small accent but is not required.
- **Size and framing:** the subject is centred and fills about **80%** of the canvas, with even empty space around it.

---

## 3. Rules (every icon)

1. **Square, 1:1, 1024 × 1024 px.**
2. **Plain white background (#FFFFFF), or transparent if possible.** No floor, no shadow on the ground, no scene, no gradient, no frame or circle behind it. (A white background is fine: it will be cut out.)
3. **No text, letters, numbers, logos or watermarks.**
4. **One subject per icon.** Nothing else in the picture.
5. **Same lighting, same rendering style and same level of detail across all 6.** They must look like one family.

---

## 4. The six icons

### Icon 1: Photography & Film
**File:** `camera.png`

A modern black mirrorless camera with a large lens, three-quarter view, slightly tilted. A small red or orange detail on the body. Glossy 3D, like Urban Company's appliance icons.

### Icon 2: Anchors and Hosts
**File:** `microphone.png`

A sleek handheld wireless microphone (silver body, dark grey mesh head), angled diagonally, like a stage anchor's mic.

### Icon 3: Musicians & DJs
**File:** `dj-set.png`

A compact **DJ controller**: two round turntable platters on the left and right, a small mixer with a few sliders and knobs in the middle, and a pair of headphones resting on top. Black and silver with a few soft glowing accent lights. Three-quarter view from slightly above.

### Icon 4: Stand-Up Comedians
**File:** `comedian.png`

A **formal, professional Indian man** shown from the chest up, smiling warmly with mouth closed.
- **Skin and hair:** light-medium warm Indian skin tone, short neat black hair styled to the side, and a well-trimmed short black beard.
- **Clothes:** a dark navy blazer over a crisp white shirt, open collar, no tie.
- **Microphone:** he holds a small handheld microphone near his chest.

Calm and confident, like a corporate-event comedian.

### Icon 5: Models & Creators
**File:** `model.png`

A stylish **Indian woman** shown from the chest up, posing confidently with one hand lightly touching her hair.
- **Skin and hair:** light-medium warm Indian skin tone, long sleek black hair.
- **Clothes:** an elegant beige blazer over a black top.
- **Accessory:** small gold earrings.

### Icon 6: Makeup & Styling (exactly like Urban Company's salon icon)
**File:** `makeup.png`

A **woman at a spa or salon**, shown from the chest up, eyes closed and relaxed.
- **Towel and robe:** a **white towel wrapped around her hair** like a turban, and a **white towel robe** on her shoulders.
- **Face:** a **light green face mask** on her face, with her eyes, lips and nose showing.
- **Makeup brush:** a **large fluffy makeup brush** (wooden or rose-gold handle, soft beige bristles) floats just above the top right of her head, touching her cheek lightly, as if makeup is being applied.
- **Skin:** light-medium warm Indian skin tone where the skin shows.

Same soft 3D style as Urban Company's "Women's Salon & Spa" icon.

---

## 5. Checklist before saving each icon

- [ ] Square, 1024 × 1024, white (or transparent) background
- [ ] Soft glossy 3D like Urban Company's icons, matching the other icons in the set
- [ ] People: light-medium Indian skin, black or dark brown hair, neat and professional
- [ ] No text, logos, watermarks, ground shadows or background shapes
- [ ] The subject fills about 80% of the square, centred

**When they're done,** send all six to Claude in the chat. Claude cuts out the white background, crops them evenly and puts them on the homepage cards (`public/categories/icons/`, listed in `categoryIcons` in `src/data/home.ts`).
