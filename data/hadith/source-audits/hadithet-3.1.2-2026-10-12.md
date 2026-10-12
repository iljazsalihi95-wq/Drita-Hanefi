# Audit i teksteve të Hadithet 3.1.2 (12.10.2026)

Burimi: XAPK i dhënë nga përdoruesi, me leje për materialet e haditheve dhe të Umres; jo për kodin, strukturën, dizajnin ose asetet e tjera.

U nxorën 28,166 regjistrime tekstuale nga 15 skedarë `index-*.js`:
- Buhari 7030; Muslimi 1514; Ebu Davudi 3288; Tirmidhi 3026; Nesai 2994; Ibn Maxhe 3776.
- Ahmed 1255; Muvataja 1567; Rijadus-Salihin 1776; Bulug 426; Edebul-Mufred 466; Mishkat 699; Shemail 267; Neveviu 42; Kudsij 40.

**Kufizime të verifikuara:** këta regjistrime janë tekste në shqip; fusha `teksti` nuk jep automatikisht senedin arab, metnin arab, gradimin me autoritet, koment të dokumentuar, lidhje hanefite apo audio. Numri `numri` rinis brenda `sectionId` dhe **nuk është numër global i Sunen Ebu Davudit**. Për shembull, `sectionId=20, numri=72` lidhet tematikisht me rrëfimin e Ibn Abbasit në Sunen Ebu Davud 3022, por çdo përputhje kërkon kontroll individual.

**Rregulli i importit:** ruaj `sourceCollection`, `sourceId`, `sectionId`, `sourceNumber` dhe `teksti` si material hyrës; mos e shëno si hadith të verifikuar pa përputhje me numrin global, metnin arab dhe senedin. Ruaj Koleksion → Libër → Kapitull → Hadith, tematika vetëm si filtër. Gradimet sipas autoritetit të dokumentuar (jo Albani si autoritet kryesor). Koment, Fikh Hanefi, Hifz dhe audio të shtohen si fusha të ndara vetëm pas verifikimit.

Kjo dosje është audit i burimit, **jo import i konfirmuar i 28,166 haditheve në aplikacion**. `Code.gs` nuk ndryshohet.
