Use Replicate MCP for generating game-ready assets. Prefer explicit constraints (size, palette, background) and keep a small “prompt library” of templates you reuse.
Quick model picker
- Vector icons / logos / UI → recraft-ai/recraft-20b-svg (SVG output)
- Sprite sheets (single image output with grid) → miike-ai/flux-sprites (raster output)
- Pixel-art tilesets (wang-style transitions) → retro-diffusion/rd-tile
- Pixel-art animations / spritesheets → retro-diffusion/rd-animation
- Fast general concept art / placeholders (<1s) → prunaai/p-image
---
1) recraft-ai/recraft-20b-svg (vector SVG)
   Best for
- Crisp UI icons, faction logos, resource icons, flat illustrative UI elements
- Anything you want to scale cleanly (SVG)
  Replicate
- Model: https://replicate.com/recraft-ai/recraft-20b-svg
- API: https://replicate.com/recraft-ai/recraft-20b-svg/api  
  Key inputs (schema)
- prompt (required)
- style (defaults to vector_illustration; includes many icon/* variants)
- size (defaults to 1024x1024; ignored if aspect_ratio set)
- aspect_ratio (optional)
  Output
- Single SVG URL (string)
  Useful style presets
- UI icons: icon, icon/outline, icon/colored_shapes, icon/colored_outline, icon/offset_fill
- Flat illustrations: vector_illustration/flat_2, vector_illustration/line_art, vector_illustration/cartoon
  Prompt patterns
- Flat icon (no shading)  
  Minimal flat vector icon of [SUBJECT], solid fills only, no gradients, no shadows, simple geometric shapes, [2–3 color palette], transparent background, works at 32px/64px
- Outline icon  
  Monoline outline icon of [SUBJECT], consistent 2–4px stroke, rounded caps, minimal details, transparent background, high contrast
- Layered UI badge  
  Flat vector badge of [SUBJECT], layered shapes (foreground/mid/background), limited palette, no gradients, clean vector paths, transparent background
  Official Recraft prompting guides (useful)
- Introduction: https://www.recraft.ai/docs/prompt-engineering-guide/introduction
- Vector art: https://www.recraft.ai/docs/prompt-engineering-guide/visual-formats/vector-art
- Logos & icons: https://www.recraft.ai/docs/prompt-engineering-guide/visual-formats/logos-and-icons
---
2) miike-ai/flux-sprites (sprite sheets; raster)
   Best for
- Sprite-sheet-like outputs arranged in a grid (character pose sheets, action sheets)
- Fast-ish raster “sheet” generation for prototyping
  Replicate
- Model: https://replicate.com/miike-ai/flux-sprites
- API: https://replicate.com/miike-ai/flux-sprites/api  
  Important
- Trigger word: include SPRITES (uppercase) in the prompt for this model’s intended behavior.
  Key inputs (schema highlights)
- prompt (required)
- model: dev (quality; ~28 steps) or schnell (fast; ~4–8 steps)
- num_inference_steps (1–50; default 28)
- guidance_scale (0–10; default 3; commonly 2–3.5)
- aspect_ratio (default 1:1; custom enables width/height)
- width / height (256–1440; multiples of 16; only if aspect_ratio="custom")
- num_outputs (1–4)
- output_format: webp | jpg | png
- Optional modes:
    - img2img: image (+ prompt_strength)
    - inpaint: image + mask
      Outputs
- Array of image URLs (usually 1)
  Constraints / gotchas
- If you want exact dimensions, set aspect_ratio="custom" and specify width/height (multiples of 16).
- Keep prompt extremely explicit about grid, equal spacing, consistent character, same viewpoint.
  Prompt templates
- Pose sheet  
  A sprite sheet of SPRITES showcasing an animated [CHARACTER] in various action poses. The SPRITES are arranged in a grid pattern with equal spacing, consistent camera angle, consistent proportions, plain background, each frame a unique pose.
- Directional set  
  Sprite sheet of SPRITES of [CHARACTER] walking animations facing 4 directions (front/back/left/right), grid layout, consistent size and alignment, transparent or plain background.
- UI-friendly sheet  
  Sprite sheet of SPRITES, clean silhouette readability, limited colors, no busy background, high contrast, game-ready.
---
3) retro-diffusion/rd-tile (pixel-art tilesets)
   Best for
- Seam-aware pixel tiles, tilesets with transitions, terrain materials, decorative tile objects
  Replicate
- Model: https://replicate.com/retro-diffusion/rd-tile
- README: https://replicate.com/retro-diffusion/rd-tile/readme
- API: https://replicate.com/retro-diffusion/rd-tile/api
- Examples: https://replicate.com/retro-diffusion/rd-tile/examples
- Retro Diffusion API examples repo: https://github.com/Retro-Diffusion/api-examples  
  Key inputs (schema)
- prompt (required)
- style:
    - tileset (full tileset)
    - tileset_advanced (blend two textures via extra_prompt/extra_input_image)
    - single_tile (one tile texture)
    - tile_variation (requires input_image)
    - tile_object (small props)
    - scene_object (large props)
- width / height: tile size (not full output), 16–384 depending on style
- num_images (1–10)
- Optional: input_image, extra_prompt, extra_input_image
- bypass_prompt_expansion (disable auto prompt enhancement)
  Outputs
- Array of image URLs (PNG tilesets / assets)
  Prompt templates
- Tileset  
  grass and dirt path tileset with stones and flowers, classic JRPG, readable shapes, limited palette
- Single tile  
  sand dunes texture tile, subtle variation, clean pixel clusters, no dithering
- Tileset advanced (two materials)  
  inside texture: cracked stone floor; outside texture: desert sand; seamless transition tileset
  Reference snippet (Replicate blog example)
- https://replicate.com/blog/retro-diffusions-pixel-art-models-are-now-on-replicate
---
4) retro-diffusion/rd-animation (pixel-art animations / spritesheets)
   Best for
- Low-frame-count, engine-friendly pixel animations with consistent framing/alignment
  Replicate
- Model: https://replicate.com/retro-diffusion/rd-animation
- README: https://replicate.com/retro-diffusion/rd-animation/readme
- API: https://replicate.com/retro-diffusion/rd-animation/api
- Examples: https://replicate.com/retro-diffusion/rd-animation/examples
- Retro Diffusion API examples repo: https://github.com/Retro-Diffusion/api-examples  
  Key inputs (schema)
- prompt (required)
- style:
    - four_angle_walking (48x48 only)
    - walking_and_idle (48x48 only)
    - small_sprites (32x32 only)
    - vfx (24–96 allowed)
- width / height must match style constraints
- return_spritesheet (true → PNG spritesheet; false → animated GIF)
- input_image (reference; not treated as initial frame)
- bypass_prompt_expansion
  Outputs
- Array of URLs (GIF by default or PNG spritesheet if enabled)
  Prompt templates
- Walking  
  [small character], walking animation, [distinct outfit colors], classic pixel art, consistent framing
- Small sprites set  
  [character], small sprite set, includes walk/attack/idle/surprised/laying, consistent proportions
- VFX  
  a swirling blue portal, looping vfx animation, bright core, readable silhouette
---
5) prunaai/p-image (ultra-fast text-to-image; raster)
   Best for
- Sub-second concept images, placeholders, rapid iteration, UI mock imagery
- Strong “prompt adherence” + good text rendering (per Pruna)
  Replicate
- Model: https://replicate.com/prunaai/p-image
- Pruna model info: https://docs.pruna.ai/en/docs-add-performance-pages/docs_pruna_endpoints/performance_models/p-image.html
- Prompting guide: https://docs.pruna.ai/en/docs-add-performance-pages/docs_pruna_endpoints/image_generation/advanced.html  
  Key inputs (schema)
- prompt (required)
- aspect_ratio (default 16:9; custom enables width/height)
- width / height (256–1440, multiples of 16, only for custom)
- seed (reproducibility)
- prompt_upsampling (LLM expands prompt)
- disable_safety_checker
  Output
- Single image URL (string)
  Prompt structure (Pruna guidance)
- [Subject] [Behavior] [Style] [Environment]  
  Example: armored desert soldier, standing guard, cinematic concept art, dunes at sunset
  Good use cases
- Background concept art references
- Marketing/placeholder images while waiting for pixel/vector assets
- Quick exploration of color + composition ideas
---
Practical “game asset” prompt hints (works across models)
- Include: viewpoint (top-down, isometric, side view), scale (fits in 32x32 tile), background (transparent or plain), palette (limited palette, list colors), readability (high contrast silhouette).
- Prefer positive constraints: “solid fills” instead of “no gradients” (but both can help).
- Save seeds for anything you want to iterate on consistently.