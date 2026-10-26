# Recovery of damaged packaged Hadith JSON — 26 October 2026

The original `bukhari.json` and `tirmidhi.json` contained non-UTF-8 binary damage at byte 393216 and could not be parsed. Removing the damaged section would lose records, so the files were rebuilt with the existing `tools/build_hadith_library.py` from the owner's source workbook, spreadsheet `12i8lAsSDHumk8NiYajhqVth34DRtWnjoba43v5HZZWE`, exported read-only on this date.

Only the two damaged collection files were replaced. The manifest, all verified batches, other collection files and the source Sheet were preserved. Their counts exactly match the existing manifest:

| Collection | Records | Albanian translations | Graded |
| --- | ---: | ---: | ---: |
| Bukhari | 936 | 3 | 916 |
| Tirmidhi | 488 | 1 | 462 |

All 572 complete recoverable Bukhari records and 423 complete recoverable Tirmidhi records match the rebuilt records field for field. This verifies source recovery, not a new scholarly verification of the source content.

SHA-256 of recovered UTF-8 files:

- Bukhari: `2c719f572a599a03e8d9c242a2189c3829862abf0c0bd90cfe58be0f063b8785`
- Tirmidhi: `685cfdda7b16cde934b0973fe804afa7801244bd36b92254f5ec4f2d3edfc05a`

`node tests/verify.mjs --offline` validates all 4,873 packaged records, the original 4,872 source-record total, manifest translation counts, module scripts and links, PWA contracts and Android source contracts. LIVE tests remain a separate run; offline success does not assert network availability or device behavior.
