# Školská hra – návrh (design)

Dátum: 2026-11-19 · Stav: návrh na schválenie

## Prečo a pre koho

Hra pre študentov **Gymnázia J. C. Hronského vo Vrútkach**. Žiaci ju otvoria v mobile cez QR kód alebo NFC tag na nástenke. Má byť **na odreagovanie** (nie súťaž) a popritom trochu edukačná: precvičí pamäť, logiku a všeobecný prehľad. Autor chce, aby bola **prepracovaná a čo najlepšia**, nie rýchly prototyp.

## Ciele

- Pixel-art hra zhora, štvorčekový štýl à la „farm life“.
- Jedno prejdenie trvá **zhruba 15 minút**.
- Odohráva sa na **jednej chodbe gymnázia**. Budova je spojená so ZŠ, ale v hre je len chodba gymnázia.
- **Príbeh:** hráč je nový žiak a plní úlohy od triednej. Popri tom rieši malú záhadu so stratenou knihou.
- 6 mini hier v miestnostiach a rozhovory s vymyslenými NPC.
- Hra je celá **v slovenčine**.
- Hrá sa **na mobile** (na výšku) a ovláda sa **ťuknutím**: postava dôjde na miesto, kam si ťukol.
- **Všetko je zadarmo.** Žiadne platené služby, knižnice ani grafika.

## Čo hra nemá (non-goals)

- Rebríček, účty, server ani porovnávanie žiakov.
- Iné poschodia, jedáleň ani telocvičňu.
- Angličtinu.
- Skutočné osoby zo školy, žiadne reálne mená ani prezývky.

## Čo by hru pokazilo (anti-goals), aj keby technicky fungovala

- **Poučovanie.** Hronský má byť len v pozadí, inak žiakov hra prestane baviť.
- **Nepravdivé fakty.** Fakty o Hronskom, kvízové otázky a mapa musia sedieť.
- Postavy, ktoré by niekoho urazili alebo karikovali skutočného človeka.
- Nepohodlné ovládanie na mobile: malé tlačidlá alebo text, ktorý sa nedá prečítať.
- Hráč nevie, čo má robiť ďalej, a zasekne sa.

## Obmedzenia

- Statická webová stránka hostovaná zadarmo na **GitHub Pages**. Repo `benkopapek/-kolsk-hra-` bude **verejné**, s tým autor súhlasí.
- Školská wifi je dobrá, takže veľkosť hry (rádovo jednotky MB) nevadí.
- Musí fungovať v bežnom mobilnom Chrome (Android) aj Safari (iPhone).
- Grafika, hudba aj texty musia byť vlastné alebo s licenciou CC0 (voľné bez podmienok). Licencie cudzích súborov sa zapíšu do `CREDITS.md`.

## Ako sa to postaví – zvažované spôsoby

| Spôsob | Výhody | Nevýhody | Rozhodnutie |
|---|---|---|---|
| A) Čistý HTML Canvas + JavaScript | Najmenšia hra, úplná kontrola nad všetkým | Kameru, animácie a scény treba napísať ručne | nevybraté |
| **B) Phaser 3 (2D herný engine, MIT licencia, zadarmo)** | Hotové scény, kamera, tweeny, animácie, zvuk a škálovanie; viac času ostane na vyladenie hry | Pridá asi 1 MB | **vybraté autorom** (wifi je dobrá a chce prepracovanú hru) |
| C) Unity/Godot s exportom na web | Silné editory | 10–40 MB, pomalé na mobile | vylúčené |

## Mapa

Vychádza zo skice autora (`docs/assets/skica-chodby.jpg`). Skica **nie je presná** a autor ju bude ešte upravovať, takže mapa musí ísť ľahko zmeniť (pozri „Technické rozhodnutia“).

Rozloženie zhora nadol. Široká chodba vedie po pravej strane celou dĺžkou a miestnosti sú vľavo:

```
┌──────────────┬────────┐
│ INFORMATIKA  │        │
├──────────────┤        │
│  TRIEDA 1    │        │
├──────────────┤        │
│ [skrinky]    │   C    │
│              │   H    │
├──────────────┤   O    │
│ WC   │  WC   │   D    │
├──────┴───────┤   B    │
│ KABINET │ WC │   A    │
├──────────────┤        │
│  TRIEDA 2    │ [vitrína]
├──────────────┤ [portrét]
│  TRIEDA 3    │        │
├──────────────┤        │
│  TRIEDA 4    │        │
├──────────────┤        │
│ ZBOROVŇA*    │        │
└──────────────┴────────┘
```

\* Spodná miestnosť je na skici bez popisu. Zborovňa je **návrh**, autor to potvrdí alebo zmení.

- Každá miestnosť má dvere do chodby. Po ťuknutí na dvere postava dôjde k nim a vstúpi.
- Interiér miestnosti je samostatná malá mapa (lavice, tabuľa, police…), z ktorej sa ťuknutím na dvere vracia na chodbu.
- Chodba je dlhšia ako displej, preto kamera sleduje hráča.

## Príbeh

1. **Úvod:** je prvý deň nového žiaka. Na začiatku chodby ho čaká triedna. Predstaví sa mu a dá mu **zoznam úloh**.
2. **Záhada:** pri vitríne na chodbe stojí spolužiak a čuduje sa, že je prázdna. Zmizla z nej stará kniha. Až v jednom rozhovore mimochodom padne, že je to staré vydanie *Smelého Zajka*. Kniha a vitrína sú vymyslené a hra netvrdí, že ich škola naozaj má.
3. **Úlohy:** hráč ich plní v **ľubovoľnom poradí**. Za každú dostane od niekoho **indíciu** k záhade.
4. **Rozuzlenie:** keď má všetky indície, ukážu na upratovačku. Tá knihu odložila do bezpečia, keď umývala vitrínu, a zabudla to povedať. Knihu vráti do vitríny. Nie je tu žiadny zloduch.
5. **Záver:** triedna ho pochváli. Na obrazovke sa ukážu štatistiky: čas, počet nájdených easter eggov a chyby v mini hrách (len pre radosť, nikam sa neodosielajú).

Úlohy, mini hry a indície:

| # | Úloha od triednej | Kde | Mini hra | Precvičí | Indícia (návrh) |
|---|---|---|---|---|---|
| 1 | Nájdi si skrinku | Skrinky | **Pexeso**: pod kartičkami je ukrytý tvoj kľúč | pamäť | Školník: „Kľúč od vitríny mám ja a upratovačka.“ |
| 2 | Zapíš sa na informatiku | Informatika | **Šifra**: uhádni heslo do počítača podľa nápovedy (napr. posun písmen, čísla → písmená) | logika | V logu počítača je ráno zapísané „vozík – upratovanie chodby 7:15“. |
| 3 | Odnes triednu knihu do kabinetu | Kabinet | **Hľadaj skryté predmety** v neporiadku (nápad autora) | pozornosť | Lístok na stole: „Vitrínu umyť dnes ráno.“ |
| 4 | Choď na hodinu do Triedy 1 | Trieda 1 | **Kvíz** zo všeobecného prehľadu: 5 náhodných otázok zo zásobníka | vedomosti | Spolužiak: „Ráno tam voňal čistiaci prostriedok.“ |
| 5 | Pomôž učiteľovi v Triede 2 | Trieda 2 | **Zapamätaj si poradie** svietiacich políčok, ako hra Simon | pamäť | Učiteľ: „Videl som upratovačku s niečím zabaleným.“ |
| 6 | Pomôž s mapou v Triede 3 | Trieda 3 | **Mapa Slovenska**: ťukni, kde leží mesto, rieka alebo vrch | prehľad | Spolužiačka: „Upratovačka býva pri WC.“ |

- Trieda 4, WC, zborovňa a chodba sú len na rozhovory s NPC, bez mini hier.
- Indície v tabuľke sú len **návrh**. Musia dokopy jasne viesť k upratovačke, ale žiadna sama nesmie prezradiť všetko.

### Pravidlá mini hier

- Každá trvá približne **1,5–2,5 minúty**.
- **Nedá sa prehrať natrvalo.** Pri neúspechu hráč skúsi znova, prípadne dostane nápovedu.
- Obťažnosť je mierna, pre gymnazistov na odreagovanie.
- Kvíz: zásobník minimálne **30 otázok**, hra vyberie 5 náhodných. Odpovede sú ako 4 tlačidlá.
- Mapa Slovenska: obrys musí byť zhruba správny a ťuknutie sa uzná s rozumnou toleranciou. Návrh miest: Bratislava, Košice, Žilina, Martin, Vrútky, Banská Bystrica, Zvolen, Gerlachovský štít, Dunaj, Váh. Hra vyberie 5.
- Všetky fakty v kvíze a na mape musia byť overené.

## Postavy (NPC)

Všetky sú vymyslené, s vymyslenými menami, a žiadna nesmie pripomínať skutočného človeka.

- **Triedna:** zadáva úlohy a na konci chváli.
- **Školník:** pri skrinkách, trochu mrzutý, ale dobrák.
- **Upratovačka:** pri WC, kľúčová postava rozuzlenia.
- **Učiteľ informatiky.**
- **Učiteľ v Triede 2.**
- **2–3 spolužiaci:** pri vitríne, v Triede 1 a v Triede 3.
- NPC sa trochu hýbu (prešľapujú, otáčajú sa) a niektoré sa prechádzajú po chodbe.
- Rozhovory sú krátke, s humorom a na úrovni gymnazistov. Ďalšia replika sa zobrazí po ťuknutí.

## Hronský v pozadí

- Na chodbe visí **portrét**. Po ťuknutí ukáže jednu náhodnú zaujímavosť, je to easter egg.
- *Smelý Zajko* padne raz mimochodom v rozhovore pri vitríne.
- Žiadne iné poučovanie.
- **Overené fakty** (2026-11-19, zdroje teraz.sk, matica.sk, Wikipedia EN, Philologia 2020):
  - narodil sa 23. 2. 1896 vo Zvolene, zomrel 13. 7. 1960 v Lujáne v Argentíne;
  - učil v Krupine a od roku 1927 v Martine;
  - pôsobil v Matici slovenskej v Martine (tajomník, neskôr správca);
  - redigoval detský časopis *Slniečko*;
  - knihy pre deti: *Smelý Zajko* (1930), *Smelý Zajko v Afrike* (1931), *Budkáčik a Dubkáčik* (1932);
  - romány: *Chlieb* (1931), *Jozef Mak* (1933);
  - pochovaný je na Národnom cintoríne v Martine.
- **Nepoužiť:** presné roky jeho funkcií v Matici (zdroje sa líšia), rok prenesenia pozostatkov, zatknutie v roku 1944 a politiku. História samotného gymnázia sa nenašla, ak ju autor dodá, môže sa pridať.

## Easter eggy

Asi 5 skrytých vecí na ťuknutie, napríklad portrét Hronského, zabudnutý desiatový chlebík alebo poster na nástenke. Počet nájdených sa ukáže na konci. Ich obsah vymyslí ten, kto hru stavia.

## Vzhľad a zvuk

- Pixel art, jednoduchý a štvorčekový, teplé farby ako vo „farm life“ hrách. Všetku grafiku kreslí ten, kto hru stavia.
- Animácie: chôdza do 4 smerov, jemný pohyb NPC, prechody medzi scénami a efekt pri úspechu.
- **Hudba a zvuky:** chiptune hudba na pozadí, zvuk krokov, ťuknutia, úspechu a otvorenia dverí. Tlačidlo na stlmenie je vždy viditeľné. Zvuk sa zapne až po prvom ťuknutí, lebo mobilné prehliadače inak zvuk blokujú.
- **Obrazovky:** úvod (názov hry a „Ťukni a začni“), hra, mini hry, záver.
- Texty musia byť na mobile čitateľné. Tlačidlá majú aspoň zhruba 44 px, čo je veľkosť pohodlná na prst.

## Uloženie postupu

- Postup sa ukladá v telefóne (`localStorage`): splnené úlohy, nájdené indície a easter eggy, pozícia.
- Keď hru zavrieš a znova otvoríš, pokračuješ tam, kde si skončil.
- Na úvodnej obrazovke je tlačidlo **„Nová hra“**.
- Ak ukladanie v telefóne nefunguje (napr. súkromný režim), hra beží ďalej, len bez uloženia.

## Technické rozhodnutia (autor ich nechal na mňa)

- **Phaser 3:** posledná stabilná verzia 3.x. Knižnica sa uloží priamo do repa, takže nezávisí od cudzieho CDN.
- **Bez build nástrojov:** obyčajné JavaScript moduly. Na GitHub Pages ide repo tak, ako je.
- **Rozlíšenie a škálovanie:** hra sa kreslí v malom pixelovom rozlíšení (rádovo 180×320, na výšku) a celým násobkom sa zväčší na displej, aby boli pixely ostré. Ak niekto drží mobil na šírku, uvidí výzvu „otoč mobil“.
- **Mapa ako dáta:** miestnosti, ich poradie a veľkosť, dvere a polohy NPC budú v jednom prehľadnom súbore s dátami, nie roztrúsené v kóde. Úprava mapy podľa novej skice tak bude jednoduchá. Na hľadanie cesty po ťuknutí stačí BFS na mriežke.
- **Texty ako dáta:** rozhovory a kvízové otázky budú v samostatných súboroch, aby ich mohol upravovať aj niekto, kto neprogramuje.
- **Testy:** malé automatické kontroly logiky, ako hľadanie cesty, pravidlá mini hier, ukladanie a postup úloh. Okrem toho sa hra preklikne v prehliadači v rozlíšení mobilu (Playwright).

## Nasadenie

- GitHub Pages z verejného repa. Výsledkom je stály link, napr. `https://benkopapek.github.io/-kolsk-hra-/`, ktorý pôjde do QR kódu alebo NFC tagu.
- Spustenie Pages vyžaduje zlúčenie do hlavnej vetvy a zapnutie Pages v nastaveniach repa. Oboje urobí autor alebo sa robí s jeho súhlasom.

## Postup schvaľovania

Autor chce schvaľovať veľké kroky. Hra sa preto stavia po etapách a po každej si ju autor pozrie:

1. chodba, pohyb ťuknutím a kamera (zatiaľ jednoduchá grafika);
2. **grafický štýl**: vzorka postavy, podlahy, stien a jednej miestnosti, **na schválenie**;
3. NPC a rozhovory;
4. mini hry, postupne;
5. príbeh, uloženie postupu, zvuk a záver;
6. vyladenie a nasadenie.

## Otvorené (na autora)

- Čo je spodná miestnosť? Zatiaľ je to zborovňa.
- Neskoršie úpravy mapy podľa presnejšej skice.
- Prípadná história gymnázia.
