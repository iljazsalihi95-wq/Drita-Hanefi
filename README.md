# Drita Hanefi

Platformë modulare islame. Çdo rubrikë është sistem më vete dhe Ballina i lidh të gjitha.

## Sistemet
- Ballina
- Fikhu Hanefi
- Akide Maturidije
- Enciklopedia e Kuranit
- Hadithi
- Tefsiri
- Hudbet
- Pedagogjia Islame
- Historia Islame
- Texhvidi
- Abetarja Kuranore
- Më bëj një temë
- Admini

## Parime
Përmbajtja publikohet vetëm nga burime reale të verifikueshme. Nuk përdoren placeholder, demo, “Material” apo përmbledhje të sajuara. Code.gs ekzistues nuk ndryshohet.

## Gjendja LIVE e verifikuar

- API: `11.0.0-CLEAN`
- Kurani: 114 sure / 6236 ajete
- Fikhu: 500 rreshta LIVE të lexuar; ndërfaqja publikon vetëm rekordet e plota
- Hadithi: 4 rekorde të plota të publikuara (1 API + 3 të audituara nga baza Hadith 4872 LIVE)
- Tefsiri: 3 komente të audituara me ajet, mufessir, vepër, referencë dhe URL burimore të vlefshme
- Akide: 46 rekorde të publikuara me hierarki Tema → Nëntema → mësim; 5 fragmente klasike të audituara nga El-Fikh'ul-Ekber dallohen qartë nga përmbledhjet e literaturës
- Hudbe: 13 të publikuara (1 përkthim i plotë nga PDF, 1 hutbe me argumente të verifikuara dhe 11 përgatitje redaksionale me burime); HT-013 fshihet derisa të përfundojë verifikimi hadithor
- Pedagogji: 17; Histori: 20; Texhvid: 7
- Abetarja: 4 mësime të plota/verifikuara nga `ABETARJA_KURANORE`; 9 rreshtat pa burim të endpoint-it ruhen vetëm si rezervë dhe nuk publikohen
- Qendra tematike: kërkimi `namaz` kthen 4 rezultate reale

## Shpërndarja

- Android: projekt native me `applicationId` `com.dritahanefi.app` dhe workflow për APK.
- iPhone: PWA e veçantë me manifest, service worker dhe ikona 180/192/512 px.
- Publikimi web aktivizon GitHub Pages përpara build-it Android.

## Verifikimi

Ekzekuto `node tests/verify.mjs` për të kontrolluar 13 faqet, sintaksën e
skripteve inline, lidhjet lokale, manifestin PWA, konfigurimin bazë Android dhe
të 13 endpoint-et LIVE. Testi ndalon nëse indeksi i Kuranit nuk ka saktësisht
114 sure / 6236 ajete.
