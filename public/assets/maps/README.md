# Map artwork

## Connected park

`park-cartoon.png` was generated with the built-in image tool. During waves 1–10 the park begins 1,500 world units from the original spawn (600, 380), reaching full coverage at 2,500. Smooth distance weights blend 128-unit patches over the streets; mirrored texture frames keep repeats joined. Fixed stumps and mossy logs replace cars in the outer park. All use the same collision and steering helpers. Returning to the center restores the same streets. Wave 11 still selects the robotics floor.

Park prompt: Square production tileable 2D cartoon game ground texture EXACT overhead orthographic. Overgrown abandoned city park matching bold outlined vector zombie survivor characters. Muted dark olive green grass with broad flat patches, a few sparse chunky three-blade grass tufts outlined dark navy. A few broad worn gray-green irregular concrete paving fragments and small muted brown soil patches scattered across surface, plenty of quiet open space. SIMPLE flat cel shaded shapes with restrained contrast. No photorealism, no grass hair, no grain, no complex texture, no 3D, no perspective, no trees, no props, no objects, no border, no text, no vignette. Full bleed evenly lit repeatable ground, matching smooth blue-gray cartoon asphalt.

## Current cartoon revision

Active assets: `city-asphalt-cartoon.png` and `wreck-sedan-cartoon.png`. Generated with the built-in image tool to match the outlined heroes and zombies. The earlier realistic images below are retained as unused source alternatives. Car chassis frame: (150, 18, 810, 1395). Display and collisions remain unchanged. Alternating mirrored ground tiles join the texture edges.

Ground prompt: Production 2D game texture square seamless tile, EXACT flat overhead view. Cartoon abandoned asphalt ground matching simple bold outlined vector zombie survivor characters. Muted dark blue-gray slate asphalt, large very subtle flat color patches, only a few widely spaced branching cracks drawn as clean dark angular lines. Tiny sparse olive cartoon grass tufts of 3 broad blades. Flat cel shading, graphic shapes, smooth matte surface. VERY LOW DETAIL, no grain, no gravel, no photographic texture, no realistic lighting, no 3D, no road lines, no objects, no border, no text. Quiet background for colorful small characters, seamless repeat on all sides.

Car prompt: A single game sprite on genuinely transparent background. EXACT ORTHOGRAPHIC TOP DOWN overhead damaged compact teal sedan, hood upward, complete car centered. Match simple vector cartoon zombie survival game: chunky geometric silhouette, thick dark navy outlines, flat muted teal body, big dark blue windshield and rear window, simple roof rectangle, four attached chunky dark wheels. Only two angular dents and one simple windshield crack, flat two tone cel shading. Very simplified illustrated icon style readable at 70 pixels wide, no realistic texture, no rust texture, no grain, no gradients, no 3D, no perspective, no environment, no text, no external glow. Car occupies central 70 percent width and 90 percent height of portrait image. Transparent outside car.

Created using the built-in image generation tool for this game.

- `city-asphalt.png`: painted seamless overhead asphalt, cracks, repair patches and small weeds; no rubbish or props. Displayed in a pooled 640-unit ground grid.
- `wreck-sedan.png`: transparent overhead damaged teal sedan. The runtime uses the chassis frame (170, 80, 690, 1380), shown at 70 × 142 world units. Color variants share this artwork.

## Generation prompts

Ground: Create a production game asset: square seamless tileable top-down orthographic abandoned urban asphalt ground texture for a stylized painted 2D zombie survival mobile game. Full bleed flat ground only. Muted charcoal gray olive asphalt, subtly mottled grain, a few fine branching cracks and worn concrete repair patches, tiny restrained grass tufts emerging from cracks. Consistent soft overhead illumination. All four edges must tile seamlessly, no vignette, no border, no perspective, no horizon, no cars, no objects, no rubbish, no text, no lane markings. Quiet low contrast texture that won't compete with colorful gameplay.

Car: Use case stylized-concept. Production transparent PNG game sprite, one abandoned damaged sedan seen EXACTLY overhead orthographic top-down, hood pointing up. Entire car centered with ample transparent margin. Muted faded teal body, dented hood, cracked dark windshield, recognizable roof, four attached black wheels, rust along edges. Hand-painted polished 2D mobile zombie game art, crisp silhouette readable at 100 pixels tall, subtle consistent top-left light. No ground, no scenery, no loose parts, no text, no perspective, no cast shadow beyond a tiny contact shadow. Actual transparent background.
