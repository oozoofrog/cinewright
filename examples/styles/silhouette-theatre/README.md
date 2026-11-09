# Original cut-paper examples

`author.py` writes original CC0 Bezier cutouts and two authored scene specs; renderer has no forest/harbor branches. `build.mjs DEST forest|harbor|portrait` produces an unused manifest-v1 project and local modules/assets with a generated ownership ledger. `assets/provenance.json` records source, hashes, coordinates, alpha and hinge/clip limits. Do not mistake the historical film grammar for use of film frames: all supplied drawings are newly authored.

See [guide](../../../references/styles/silhouette-theatre.md). Full reproducible checks: `node examples/styles/validate.mjs PROJECT STORE OUTPUT`. Each default movie is 192 frames/24fps, 8s, 1920×1080; preview scale0.5. No music supplied or required. The player uses a generated silent transport track. Full exported MP4 has opaque H.264 yuv420p video and silent AAC transport.
