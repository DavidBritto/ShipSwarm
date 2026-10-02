# 🎨 1-Shot Cover Banner Prompt for ChatGPT / DALL-E 3 & Midjourney

Use this prompt to generate the official cover banner for the **AWS Builder Center post** and the **GitHub Repository header**. It is carefully engineered to work on the first try with **DALL-E 3** inside ChatGPT Plus, adhering to the 16:9 wide landscape format and avoiding any garbled AI text artifacts.

---

## 📌 The Exact Prompt (Copy & Paste directly into ChatGPT)

```text
A cinematic, ultra-wide 16:9 banner illustration showcasing the concept of "From Amorphous Chaos to Crystalline Cloud Architecture."

On the left side of the composition, an ethereal, shapeless, amorphous nebula of swirling iridescent liquid particles, fluid purple and cyan cosmic smoke, and untamed raw energy floats in deep space, representing an unformed idea and chaotic raw code.

In the center, a luminous wave of transformation takes place: four sleek, autonomous geometric sentinel drones cast focused beams of radiant emerald green and electric cyan laser light into the chaos, organizing and forging the particles.

On the right side, the chaotic matter fully crystallizes into a breathtaking, immaculate 3D serverless cloud architecture: glowing modular glass cubes, translucent circuit conduits, floating serverless monoliths, and precision geometric nodes linked by laser-sharp emerald fiber-optic conduits.

Atmosphere: Pitch-black obsidian background, dramatic volumetric rim lighting, glowing neon emerald and cyan accents, subtle holographic caustics, Unreal Engine 5 architectural render, hyper-detailed, clean 3D isometric perspective, photorealistic glass reflections, 8k resolution, wide landscape banner format. 

CRITICAL: Do NOT include any legible text, letters, words, logos, or typography anywhere in the image. Pure visual metaphor only.
```

---

## 🛠️ Settings & Tips for Best Results in ChatGPT

1. **Aspect Ratio**: If using DALL-E 3 via API or prompt parameter, ensure `--ar 16:9` or prompt ChatGPT: *"Generate this in wide landscape 16:9 ratio"*.
2. **No Text Rule**: The prompt explicitly commands DALL-E not to render text. This prevents the classic AI misspelling bugs on covers.
3. **Overlaying Titles (Post-Production)**: Because the image has a pitch-black obsidian base with the focal transformation in the center, you can easily use Canva, Figma, or Photoshop to drop your clean SVG title (`ShipSwarm AI | Zero to Shipped`) in pure white without competing with background clutter.

---

## 🚀 Alternative for Midjourney v6 (if available)

```text
/imagine prompt: cinematic ultra-wide banner, from amorphous chaotic liquid nebula on the left to crystalline glowing serverless cloud architecture on the right, autonomous sentinel drones guiding laser beams, translucent glass cubes and glowing emerald conduits, deep obsidian black background, volumetric lighting, Octane render, no text, no words --ar 16:9 --v 6.0 --style raw
```
