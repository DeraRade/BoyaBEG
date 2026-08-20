# CLAUDE.md — Boya Belgrade (BoyaBEG)

Ovo je repo za **Boya Porcelain Belgrade**, ne Valencia. Pročitaj ovo pre bilo kakvog
push-a ili predloga korisniku o deploy-u. Svaka nova sesija počinje bez pamćenja —
ovaj fajl je jedini izvor istine za koji sajt/store/tema idu zajedno.

## Dve prodavnice postoje, ne mešaj ih

| Brend                       | Custom domen             | Shopify handle                  | Lokalni folder     | GitHub repo             |
|-----------------------------|--------------------------|---------------------------------|--------------------|-------------------------|
| Boya Porcelain **Belgrade** | `boyaporcelain.com`      | `boyaporcelain.myshopify.com`   | `~/BoyaBEG`        | `DeraRade/BoyaBEG`      |
| Boya Porcelana **Valencia** | `boyaporcelana.com` (…)  | `boya-valencia.myshopify.com`   | `~/boyavlc`        | *(drugi repo)*          |

**Belgrade deploy vrednosti (potvrdio korisnik):**
- `--store boyaporcelain.myshopify.com`
- `--theme 122473283718` (live tema; admin: `admin.shopify.com/store/boyaporcelain/themes/122473283718`)

**Ovaj repo (`DeraRade/BoyaBEG`, folder `~/BoyaBEG`) pripada Belgrade-u.** Sve
izmene odavde idu na Belgrade Shopify store. NIKAD ne push-uj kod iz ovog foldera
na Valencia store — to je bila greška u prošloj sesiji koja je dva puta zaprljala
Valencia live temu.

Ako korisnik ne pomene brend eksplicitno u zadatku, a ti si u folderu `BoyaBEG` →
radiš za Belgrade. Ako ti kaže "gurni na sajt" iz ovog foldera, ide na Belgrade
store. Ne pretpostavljaj, ne biraj sam. Ako imalo sumnjaš (kontekst, pomen
Valencie, drugi folder), PITAJ pre push-a.

## Procedura koju korisnik koristi za push na Shopify

Uvek istim redom:

```bash
cd <folder-projekta>                          # npr. cd boyavlc ili cd BoyaBEG
git fetch origin
git reset --hard origin/<naziv-branch-a>      # branch iz kog gura
shopify theme push --store <handle>.myshopify.com --theme <ID> --only "<fajl1>" "<fajl2>"
```

Ključno:
- **`--store` je uvek eksplicitan.** Bez njega CLI koristi zadnji upamćeni store,
  što je uzrok greške sa Valencia push-om.
- **`--theme <ID>` je uvek eksplicitan.** Bez njega CLI može otići na razvojnu ili
  pogrešnu temu.
- **`--only "…"` lista fajlova.** Push samo onih fajlova koji su se stvarno
  promenili. Ne guraj celu temu na live — rizik od preživljavanja starih fajlova.
- `git reset --hard` osigurava da lokalno stanje odgovara branch-u iz kog se
  gura (nema stray izmena koje odu na Shopify).

Primer koji je korisnik dao za Valencia:

```bash
cd boyavlc
git fetch origin
git reset --hard origin/claude/funny-brahmagupta-sf9ulu
shopify theme push --store boya-valencia.myshopify.com --theme 195422847320 --only "snippets/global-fonts.liquid"
```

Za Belgrade (ovaj repo) — struktura je identična, samo se `--store` i `--theme`
razlikuju. **Pre prvog push-a u novoj sesiji, pitaj korisnika za `--store`
handle i `--theme` ID za Belgrade** i upiši ih u ovaj CLAUDE.md tabelu iznad
(sekcija „Boya Porcelain Belgrade") kad ih dobiješ, da sledeća sesija ne pita
ponovo.

## Šta NIKAD ne raditi

- **NE koristi `shopify theme push --live`** bez `--store` i `--theme`. CLI pamti
  poslednji store i može gurnuti na pogrešnu radnju (dokazano gore).
- **NE guraj bez `--only` liste fajlova.** Pun push cele teme može pregaziti
  izmene koje su druge sesije/kolaboratori radili direktno u Shopify admin-u.
- **NE predlaži `shopify theme push` prvi put u sesiji bez potvrde od korisnika.**
  Pokaži tačnu komandu koju bi pokrenuo (sa `--store`, `--theme`, `--only`),
  pitaj „da guram?", sačekaj potvrdu.
- **NE ostavljaj otvorene grane koje nisu stigle na live.** Ako push nije uspeo
  ili je bio na pogrešan store, granu treba obrisati pre kraja sesije, ne
  ostavljati je da se vuče u budućnost.

## Ako korisnik kaže „gurni" iz ovog foldera

Podrazumevana pretpostavka: Belgrade store, live tema, samo fajlovi koje smo
zajedno menjali u ovoj sesiji. Pre nego što pokreneš CLI, ispiši u tekstu:

```
Idem sa: shopify theme push --store <handle>.myshopify.com --theme <ID> --only "<promenjeni fajlovi>"
Store: Boya Belgrade (boyaporcelain.com)
Tema: <naziv> (ID <ID>)
Fajlovi: <lista>

Ok?
```

Sačekaj „da" pre pokretanja.
