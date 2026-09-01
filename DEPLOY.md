# Kako radimo izmene na Shopify temi (Beograd / boyaporcelain.com)

Opšte uputstvo za tok rada na kodu ove teme — od zadatka do live izmene.
Cilj: da na osnovu ovog fajla svaki novi chat zna podelu posla i korake,
bez obzira koji fajl ili koju izmenu radimo.

## Mentalni model — ko šta može

- **Claude (cloud kontejner):** menja fajlove teme, validira, commit-uje i
  push-uje na GitHub. **Ne može** da priča sa Shopify-jem — egress policy
  ovog okruženja blokira `*.myshopify.com` (403). Zato Claude **nikad**
  ne deploy-uje na live i **nikad** ne pokreće `shopify` komande sam.
- **Ti (lokalni git bash):** povlačiš granu sa GitHub-a i radiš
  `shopify theme push` na live temu. Samo tvoja mašina ima Shopify login
  i mrežni pristup store-u.
- **Podela:** Claude piše kod i daje ti gotove komande za git bash;
  ti ih izvršavaš i deploy-uješ. Deploy i provera na živom sajtu su uvek
  tvoj korak.

## Invarijanta

`main` mora uvek da bude jednak onome što je na live temi. Zato Claude
sinhronizuje `main` **tek pošto ti potvrdiš da je izmena live** — nikad
pre. Sve dok deploy nije potvrđen, izmena stoji samo na radnoj grani.

## Fiksne konstante za ovaj store

| | |
|---|---|
| Repo | `DeraRade/BoyaBEG` |
| Store (`--store`) | `boyaporcelain.myshopify.com` |
| Live tema (`--theme`) | **proveri svaki put** (Korak 0) |
| Live sajt (provera) | `https://boyaporcelain.com` |

> Ovo je **Beograd** store — nikad Valencia. Ako `shopify theme list`
> pokaže drugi store, stani i javi.

Radna grana i fajl(ovi) zavise od zadatka — u chatu ćeš dobiti tačno ime
grane (`<radna-grana>`) i putanju fajla (`<fajl>`). Sve komande ispod
koriste te placeholdere.

## Korak 0 — pred-provera live teme (pre PRVOG deploy-a u zadatku)

ID live teme nije zauvek fiksan: kad se objavi nova kopija teme, live ID
se menja. Zato pre prvog `theme push` u svakom zadatku **obavezno** proveri
koja je tema trenutno live, i taj ID koristi za `--theme`:

```bash
shopify theme list --store boyaporcelain.myshopify.com
```

- Nađi red označen sa `[live]` → njegov ID ide u `--theme`.
- Potvrdi da je to **Beograd** store (ne Valencia).
- Ako želiš, javi Claude-u taj ID da ga upiše kao poslednji poznati u ovaj
  fajl.

**Backup kopije teme pravi korisnik**, pre nego što da zadatak. Claude ne
pravi i ne može da pravi kopije (nema pristup Shopify-ju). Deploy uvek ide
na već objavljenu (live) temu preko `--only <fajl>`.

## Tok, korak po korak

1. **Ti daš zadatak** (u chatu).

2. **Claude (cloud) uradi izmenu:**
   - prebaci se na radnu granu (kreira je ako ne postoji),
   - izmeni / kreira fajl(ove),
   - validira gde može (npr. `node --check` za JS u snippetu),
   - ako vidi grešku ili rizik u logici zadatka → **javi pre nego što
     išta gurne**,
   - commit **samo na radnu granu** + `git push`,
   - `main` se **ne dira** još,
   - da ti tačne komande za sledeći korak.

3. **Ti (git bash) deploy-uješ na live:**
   ```bash
   git pull origin <radna-grana>
   ```
   ```bash
   shopify theme push --store boyaporcelain.myshopify.com --theme <LIVE_ID> --only <fajl>
   ```
   `<LIVE_ID>` je ID koji si dobio u **Koraku 0** (`[live]` red).
   `--only <fajl>` gura samo izmenjeni fajl (može više `--only`) — ne
   pregazi ostatak live teme ako je live odmakao od repo-a.

4. **Ti proveriš na živom sajtu** (`https://boyaporcelain.com`, hard
   refresh Ctrl+F5, pa u konzoli/vizuelno ono što Claude navede za tu
   konkretnu izmenu).

5. **Ti potvrdiš „live je OK".**

6. **Claude (cloud) sinhronizuje `main`** fast-forward-om na radnu granu i
   push-uje `main`. Sad je `main == live`.

## Prva izmena kad fajl još ne postoji

Claude radi isto, plus po potrebi doda uključivanje (npr. `{% render %}`
u odgovarajući layout/sekciju). Pred-provera live teme je već pokrivena
Korakom 0.

## Zašto ovako (grablje na koje smo već stali)

- **„Zašto Claude ne push-uje sam na Shopify?"** — mreža ka Shopify-ju je
  blokirana iz cloud okruženja (403). Nije stvar tokena; fizički ne može.
  Deploy = tvoja mašina.
- **`main` se sinhronizuje POSLE live-a**, ne pre — inače bi `main` lagao
  da je nešto live kad nije.
- **Commit ide samo na radnu granu.** (Ako commit slučajno padne na `main`
  lokalno: premesti ga na granu, pa vrati `main` na `origin/main`.)
- **Nikad `git push --force` na tuđu istoriju**; ff-merge zadržava čist
  lanac.
- **Uvek proveri da je store Beograd** (`boyaporcelain`), ne Valencia.
- **Live tema ID nije zauvek fiksan** — proveri ga Korakom 0 pre prvog
  deploy-a, jer objavljivanje nove kopije menja live ID.
- **Backup kopije pravi korisnik**, ne Claude.
