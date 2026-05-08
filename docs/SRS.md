SPECIFIKACE SOFTWAROVÝCH POŽADAVKŮ (SRS)
Tailorent - Platforma pro krejcovské služby na vyžádání

Verze: 1.0
Datum: 25. dubna 2026
Autor: Martin Severa
Status: Finální


========================================
1. INTRODUCTION AND PURPOSE
========================================

Tento dokument specifikuje softwarové požadavky pro systém Tailorent. Popisuje, co má systém dělat, pro koho je urcen a jaká omezení platí pri jeho vývoji a provozu. Dokument slouží jako základ pro návrh, implementaci a testování aplikace a je urcen vývojárúm, testerúm, projektovým manažerúm a zadavatelúm.

Tailorent je webová platforma propojující zákazníky s krejcími, kterí nabízejí profesionální krejcovské služby s príjezdem k zákazníkovi domú. Systém pokrývá celý životní cyklus zakázky, od registrace zákazníka pres vytvorení objednávky až po její dokoncení. Zákazníci si mohou prostredictvím webového rozhraní objednat úpravu odévu, šití na míru nebo expresní krejcovskou službu, aniž by museli opustit domov.

Systém nezpracovává platby v reálném case (integrace platební brány je plánována do budoucích verzí), neposkytuje sledování polohy krejcího v reálném case a nerídí dopravu ani logistiku.

Definice a zkratky používané v tomto dokumentu:

SRS - Software Requirements Specification, specifikace softwarových požadavku
API - Application Programming Interface, rozhraní pro komunikaci mezi komponentami
JWT - JSON Web Token, bezpecnostní token pro autentizaci
ORM - Object-Relational Mapping, vrstva mapující objekty na databázové záznamy
UI - User Interface, uživatelské rozhraní
SSR - Server-Side Rendering, vykreslovani na strane serveru
PENDING - Cekající, pocáteční stav objednávky
CONFIRMED - Potvrzená, objednávka prirrazena krejcímu
IN_PROGRESS - Probíhající, krejcí pracuje na zakázce
COMPLETED - Dokoncená, zakázka splnena
CANCELLED - Zrušená, objednávka stornována


========================================
2. BUSINESS REQUIREMENT
========================================

Trh s krejcovskými službami trpí nízkou dostupností - zákazníci musí vyhledávat krejcí, dojednávat termíny individuálne a fyzicky dojíždet do dílen. Pro krejcí je naopak obtížné získávat nové zákazníky a efektivne spravovat svúj rozvrh.

Tailorent rešl tento problém jako digitální zprostredkovatelská platforma. Obchodní požadavky jsou následující:

Platforma musí umožnit zákazníkúm objednat krejcovskou službu online v kratší dobe než 5 minut bez jakékoliv predchozí znalosti systému.

Platforma musí automaticky spojovat zákazníky s krejcími na základe geografické polohy a odborné specializace, cimž eliminuje ruční zprostredkování.

Provozovatel musí mít nástroje pro správu celého systému, vcetne správy krejcích, objednávek a nastavení cen, aby mohl zajistit kvalitu a rentabilitu.

Systém musí být provozovatelný jako webová aplikace bez nutnosti instalace mobilní aplikace, aby byly vstupní náklady minimální.

Orientacní ceny platné pro první verzi systému jsou: úprava odévu od 200 Kc, šití na míru od 1 500 Kc, expresní služba od 500 Kc. Finální cena je stanovena administrátorem po konzultaci s krejcím.


========================================
3. USER PERSONAS OR ROLES
========================================

Systém rozlišuje tri typy uživatelú s odlišnými potrebami a oprávneními.

3.1 Zákazník (CUSTOMER)

Zákazník je fyzická nebo právnická osoba, která poptává krejcovské služby. Jedná se o bezného uživatele internetu bez speciálních technických znalostí. Systém používá príležitostne, odhadem jednou až desetsát za mesíc. Jeho primární potrebou je jednoduché objednání služby bez zbytecné složitosti. Zákazník má právo vytvárret a rušit vlastní objednávky a sledovat jejich stav, nemá však prístup k objednávkám jiných zákazníkú ani ke správe systému.

3.2 Krejcí (TAILOR)

Krejcí je profesionální remeselník registrovaný na platforme, který vykonává objednané služby. Má základní znalosti práce s webem a používá systém denne pro správu svých zakázek. Krejcí vidí pouze objednávky, které mu byly prirrazeny, a má oprávnení aktualizovat jejich stav. Nemúže vytváret objednávky ani spravovat jiné krejcí. Krejcího profil zahrnuje jeho lokalitu, specializaci a hodnocení, podle nichž systém provádí párování se zákazníky.

3.3 Administrátor (ADMIN)

Administrátor je zamestnanec provozovatele platformy s plným prístupem k systému. Zná obchodní procesy a používá systém denne pro monitoring a správu. Má oprávnení spravovat všechny uživatele, krejcí a objednávky, nastavovat ceny a vkládat interní poznámky. Administrátor je jedinou rolí, která múže vytváret krejcovské úcty a menit role uživatelú.


========================================
4. FEATURE LIST
========================================

Systém obsahuje následující funkce:

Správa uživatelských úctu
- Registrace nového zákazníka
- Prihlášení a odhlášení
- Ochrana chránených stránek autentizací
- Správa rolí (zákazník, krejcí, administrátor)

Správa objednávek
- Vytvorení objednávky prostrednictvím trístupnového prúvodce
- Zobrazení seznamu objednávek filtrovaného podle role
- Aktualizace stavu objednávky
- Zrušení objednávky

Párovací systém
- Automatické prirrazení krejcího k objednávce na základe lokality, dostupnosti a specializace
- Ruční prirrazení krejcího administrátorem

Profily krejcích
- Evidence lokality, specializace, dostupnosti a hodnocení

Administrátorské funkce
- Správa krejcích (pridávání, úprava, deaktivace, smazání)
- Nastavení ceny objednávky
- Interní poznámky k objednávkám

Verejná cást
- Prezentacní hlavní stránka se službami, cenami a procesem objednávky


========================================
5. USER STORY OR USE CASES
========================================

5.1 Zákazník si objednává krejcovskou službu

Zákazník navštíví web Tailorent, protoze potrebuje zkrátit kalhoty a nechce dojíždet do krejcovské. Na hlavní stránce si precte, jak služba funguje, a klikne na tlacítko Registrovat. Vyplní své jméno, e-mail a heslo a vytvorí si úcet. Po prihlášení klikne na Nová objednávka. V prvním kroku vybere typ Úprava odévu a do popisu napíše, o kolik centimetrú chce zkrátit nohavice. Ve druhém kroku zadá svou domácí adresu a vybere termín návštévy. Ve tretím kroku si vše zkontroluje a odešle objednávku. Systém prirradí dostupného krejcího z jeho mesta a zákazník na dashboardu vidí, že objednávka je ve stavu Potvrzená. V dohodnutý cas krejcí prijedejde, provede úpravu a zákazník objednávku vidí jako Dokoncenou.

5.2 Krejcí spravuje svúj pracovní den

Krejcí se ráno prihlásí do systému a na dashboardu vidí seznam dnešních a nadcházejících zakázek serazených podle termínu. U každé zakázky vidí adresu zákazníka, typ služby a jeho popis požadavku. Pred odjezdem si precte detaily a pri príjezdu k zákazníkovi zmení stav na Probíhá. Po dokoncení práce a predání ohodí stav na Dokoncená. Zakázka zmizí z aktivních a presune se do historie.

5.3 Administrátor nastavuje cenu a rídí systém

Zákazník vytvorí objednávku šití na míru. Systém ji priradí krejcímu Janu Novákovému. Administrátor se prihlásí, otevré detail objednávky a zavolá krejcímu, aby zjistil rozsah práce. Na základe konzultace zadá do systému cenu 2 800 Kc a prridá interní poznámku. Zákazník cenu ihned uvidí na svém dashboardu.

5.4 Administrátor pridává nového krejcího

Platforma rozširuje síí krejcích o nového spolupracovníka z Brna. Administrátor prejde do sekce Krejcí, klikne na Pridat krejcího, vyplní jeho jméno, e-mail, docasné heslo, lokalitu Brno, specializaci Úprava odévu a Šití na míru a uloží. Krejcí se múže okamžite prihlásit a prijímat zakázky z Brna.

5.5 Zákazník ruší objednávku

Zákazník si uvédomí, že si objednal návštévu na špatný den. Prihlásí se, najde objednávku ve stavu Cekající a klikne na Zrušit objednávku. Systém objednávku oznací jako Zrušenou a krejcí ji již neuvidí mezi svými aktivními zakázkami.


========================================
6. USER REQUIREMENTS
========================================

Tato sekce popisuje požadavky z pohledu uživatele, tedy co musí být systém schopen pro jednotlivé role zajistit.

Požadavky zákazníka:

UR-01: Zákazník si musí být schopen vytvorit úcet pomocí e-mailu a hesla bez asistence.
UR-02: Zákazník musí být schopen objednat krejcovskou službu v maximálne peti krocích.
UR-03: Zákazník musí vidét aktuální stav každé své objednávky.
UR-04: Zákazník musí vidét jméno krejcího prirrazeného k jeho objednávce.
UR-05: Zákazník musí vidét cenu objednávky, jakmile ji administrátor nastaví.
UR-06: Zákazník musí být schopen zrušit objednávku, která ješte nezacala.
UR-07: Zákazník nesmí vidét objednávky jiných zákazníkú.

Požadavky krejcího:

UR-08: Krejcí musí vidét seznam všech zakázek, které mu byly prirrazeny.
UR-09: Krejcí musí vidét adresu, typ služby, termín a popis každé zakázky.
UR-10: Krejcí musí být schopen zmenit stav zakázky na Probíhá a Dokoncená.
UR-11: Krejcí nesmí vidét zakázky prirrazené jiným krejcím.

Požadavky administrátora:

UR-12: Administrátor musí vidét všechny objednávky v systému bez omezení.
UR-13: Administrátor musí být schopen pridat, upravit a deaktivovat krejcího.
UR-14: Administrátor musí být schopen nastavit cenu libovolné objednávky.
UR-15: Administrátor musí být schopen rucne prirradit krejcího k objednávce.
UR-16: Administrátor musí být schopen pridat interní poznámku k objednávce, která nebude viditelná pro zákazníka.
UR-17: Administrátor musí být schopen zrušit libovolnou objednávku.


========================================
7. FUNCTIONAL REQUIREMENTS
========================================

7.1 Správa uživatelských úctu

FR-001: Registrace zákazníka

Systém umožní neregistrovanému uživateli vytvorit zákaznický úcet. Vstupem jsou celé jméno (minimálne 2 znaky), e-mailová adresa (unikátní, platný formát) a heslo (minimálne 8 znakú). Systém zvaliduje všechna pole, overí, že e-mail není již registrován, zahashuje heslo algoritmem bcryptjs s cost faktorem 12, vytvorí záznam uživatele s rolí CUSTOMER a vrátí potvrzení o úspešné registraci. Výsledkem je nový uživatelský úcet a prresmerování na prihlašovací stránku. Pokud je e-mail již registrován, systém vrátí chybu. Pokud vstup nesplnuje validacní pravidla, systém vrátí detailní chybovou zprávu.

FR-002: Prihlášení uživatele

Registrovaný uživatel se prihlásí pomocí e-mailu a hesla. Systém overí prihlašovací údaje vúci databázi, porovná hash hesla, vygeneruje JWT token obsahující id, e-mail a roli a uloží token do HTTP-only cookie. Výsledkem je aktivní session a prresmerování na dashboard. Nesprávné prihlašovací údaje vedou k obecné chybové zpráve bez specifikace, zda chyba je v e-mailu nebo hesle, z dúvodu ochrany pred výctem úctú.

FR-003: Odhlášení uživatele

Prihlášený uživatel se múže bezpecne odhlásit. Systém invaliduje session a vymaže cookie. Výsledkem je prresmerování na hlavní stránku.

FR-004: Ochrana prihlášených tras

Systém chrání všechny trasy /dashboard, /orders a /admin pred neprihlášenými uživateli. Middleware zkontroluje platnost JWT tokenu pred každým požadavkem na chránenou trasu. Prihlášený uživatel pokracuje, neprihlášený je prresmerován na prihlašovací stránku.

FR-005: Ochrana administrátorských tras

Trasy /admin jsou prístupné pouze uživatelúm s rolí ADMIN. Uživatel s jinou rolí, i kdyz je prihlášen, je prresmerován na svúj dashboard.

7.2 Správa objednávek

FR-006: Vytvorení objednávky

Zákazník vytvorí novou objednávku prostrednictvím trístupnového prúvodce. V prvním kroku vybere typ služby (Úprava odévu, Šití na míru nebo Expresní) a volitelne zadá popis zakázky. Ve druhém kroku zadá ulici a císlo popisné (minimálne 5 znakú), mésto (minimálne 2 znaky) a datum a cas návštévy krejcího, který musí být v budoucnosti. Ve tretím kroku si zobrazí rekapitulaci a potvrdí objednávku. Systém zvaliduje všechna data, vytvorí objednávku ve stavu PENDING, prirradí identifikátor zákazníka z aktivní session a prresmeruje zákazníka na dashboard.

FR-007: Zobrazení seznamu objednávek

Prihlášený uživatel vidí seznam objednávek filtrovaný podle své role. Zákazník vidí pouze vlastní objednávky. Krejcí vidí pouze objednávky prirrazené jeho profilu. Administrátor vidí všechny objednávky v systému. Objednávky jsou azeny chronologicky.

FR-008: Aktualizace stavu objednávky

Oprávnený uživatel zmení stav objednávky. Povolené prechody stavú jsou: z PENDING do CONFIRMED provádí administrátor nebo krejcí po prirrazení, z CONFIRMED do IN_PROGRESS provádí krejcí pri zahájení práce, z IN_PROGRESS do COMPLETED provádí krejcí po dokoncení, z PENDING nebo CONFIRMED do CANCELLED múže provést zákazník nebo administrátor. Systém overí, že prechod stavu je platný, a uloží nový stav s casovým razítkem.

FR-009: Zrušení objednávky zákazníkem

Zákazník múže zrušit objednávku ve stavu PENDING nebo CONFIRMED. Zákazník smí rušit pouze vlastní objednávky. Objednávky ve stavu IN_PROGRESS nebo COMPLETED zákazník zrušit nemúže.

7.3 Správa profilu krejcího

FR-010: Evidence profilu krejcího

Systém eviduje rozšírený profil pro uživatele s rolí TAILOR. Profil obsahuje bio a popis zkušeností (volitelné), lokalitu (mésto nebo region), specializace (jedna nebo více z hodnot: Úprava odévu, Šití na míru, Expresní), příznak dostupnosti a prúmérné hodnocení s poctem recenzí.

FR-011: Automatické párování krejcího

Systém automaticky vyhledá vhodného krejcího pro novou objednávku. Kritéria výbéru v porradí priority jsou: krejcí musí mít shodnou lokalitu s objednávkou, musí být dostupný, musí mít požadovanou specializaci a z vyhovujících krejcích má prednost ten s nejvyšším hodnocením. Výsledkem je prirrazení krejcího k objednávce a zmena stavu na CONFIRMED.

7.4 Administrátorské funkce

FR-012: Správa krejcích

Administrátor múže pridat nového krejcího (vytvorení úctu a profilu), upravit profil existujícího krejcího, deaktivovat krejcího (nastavení príznaku nedostupnosti, nové objednávky mu nebudou prirrazovány) a smazat krejcího (profil bude odstranen, existující objednávky zústannou s prázdným prirrazením krejcího).

FR-013: Prirrazení ceny k objednávce

Administrátor múže nastavit cenu objednávky po konzultaci s krejcím. Vstupem je cástka v Kc jako desetinné císlo, minimálne 0. Cena se uloží k objednávce a zákazník ji ihned uvidí na svém dashboardu.

FR-014: Interní poznámky k objednávce

Administrátor múže pridat interní poznámky k objednávce. Tyto poznámky nejsou viditelné pro zákazníka ani krejcího.

FR-015: Rucní prirrazení krejcího

Administrátor múže rucne prirradit nebo zmenit krejcího u libovolné objednávky ze seznamu dostupných krejcích.

7.5 Verejná cást aplikace

FR-016: Hlavní stránka

Verejná hlavní stránka prezentuje službu a umožnuje prechod k registraci. Obsahuje hero sekci se tremi rotujícími slidery a výzvou k akci, sekci popisující proces objednávky ve trech krocích, prehled služeb s orientacními cenami, statistiky platformy a príbéh zakladatele.


========================================
8. NONFUNCTIONAL REQUIREMENTS
========================================

NFR-001: Spolehlivost - Dostupnost systému musí být alespon 99 procent méísícne, což odpovídá maximálne 7,2 hodiny výpadku za mésíc.

NFR-002: Spolehlivost - Data zákazníku a objednávek nesmí být ztracena pri pádu aplikacního serveru. Databáze musí prezít restart serveru bez ztráty dat.

NFR-003: Spolehlivost - Systém musí korektne zpracovávat chyby databázového pripojení a vrátit uživateli srozumitelné hlášení místo neošetrené výjimky.

NFR-004: Udržovatelnost - Zdrojový kód musí být psán v TypeScriptu se striktní typovou kontrolou. Databázové schéma se spravuje výhradne pres Prisma migrace, prímé úpravy DDL jsou zakázány.

NFR-005: Udržovatelnost - Opakované používaná UI logika musí být zapouzdrena v samostatných znovupoužitelných komponentách.

NFR-006: Prrenositelnost - Aplikace musí být spustitelná na systémech Linux a Windows s Node.js 18 a vyšším.

NFR-007: Použitelnost - Nový zákazník musí být schopen vytvorit první objednávku bez asistence do 5 minut.

NFR-008: Použitelnost - Formuláre musí zobrazovat srozumitelné chybové zprávy v ceštine bezprostredne po chybe.

NFR-009: Použitelnost - Aplikace musí být responzivní a plne použitelná na zarízeních s rozlišením od 360 pixelú (mobilní telefony) po 1920 pixelú a více (monitory).

NFR-010: Použitelnost - Prúvodce objednávkou musí jasne zobrazovat, ve kterém kroku se uživatel nachází.


========================================
9. INTERFACE REQUIREMENTS
========================================

9.1 Uživatelské rozhraní

Aplikace je webová a pístupná skrze standardní webový prohlížec. Nevyžaduje instalaci žádného doplnku ani aplikace. Rozhraní musí být plne funkní ve všech moderních prohlížecích: Google Chrome verze 100 a vyšší, Mozilla Firefox verze 100 a vyšší, Apple Safari verze 15 a vyšší, Microsoft Edge verze 100 a vyšší.

Rozhraní musí být responzivní. Na mobilních zarízeních (šírka od 360 px) musí být všechny funkce prístupné bez horizontálního posouvání. Na tabletech a stolních pocítacích se rozhraní prizpúsobuje dostupné šírce obrazovky.

Navigace musí být konzistentní na všech stránkách a musí jasne odlišovat sekce prístupné pred a po prihlášení. Barevné schéma je definováno v návrhové dokumentaci a vychází z kombinace tmavé modri a zlaté barvy evokující prémiovost.

9.2 Softwarové rozhraní (API)

Systém poskytuje interní REST API pro komunikaci mezi frontendem a backendem. Všechny API endpointy vrací odpovedi ve formátu JSON. Autentizace probíhá prostrednictvím JWT tokenu uloženého v HTTP-only cookie, který je automaticky priložen ke každému požadavku prohlížecem.

Hlavní endpointy systému:

POST /api/auth/register - registrace nového zákazníka, nevyžaduje autentizaci
POST /api/auth/signin - prihlášení, spravuje NextAuth.js
POST /api/auth/signout - odhlášení, vyžaduje aktivní session
GET /api/orders - seznam objednávek filtrovaný dle role, vyžaduje autentizaci
POST /api/orders - vytvorení nové objednávky, vyžaduje roli CUSTOMER
GET /api/orders/{id} - detail objednávky, vyžaduje autentizaci a vlastnictví záznamu nebo roli ADMIN
PUT /api/orders/{id} - aktualizace stavu, ceny nebo poznámky, vyžaduje autentizaci
DELETE /api/orders/{id} - zrušení objednávky, vyžaduje autentizaci

9.3 Hardwarové rozhraní

Systém je provozován na standardním serverovém hardwaru. Minimální konfigurace serveru: procesor s podporou Node.js 18, 512 MB operacní pameti (doporuceno 1 GB a více), 10 GB diskového prostoru pro aplikaci a logy. Databáze PostgreSQL múže být provozována na témže nebo separátním serveru.


========================================
10. PERFORMANCE REQUIREMENTS
========================================

PR-001: Stránky renderované na serveru musí být odeslány klientovi do 2 sekund pri standardním internetovém pripojení s rychlostí 50 Mbit/s za bezných provozních podmínek.

PR-002: API endpointy musí odpovídat do 500 milisekund pro operace ctení (GET) a do 1 000 milisekund pro operace zápisu (POST, PUT, DELETE) za normálního zatížení.

PR-003: Systém musí zvládnout alespon 100 soubeežných aktivních uživatelú bez meritelné degradace doby odpovedi.

PR-004: Databázové dotazy na tabulky Order a TailorProfile musí využívat indexy na sloupcích customerId, tailorId, status a scheduledAt, aby bylo zajišteno konstantní cas odpovedi i pri rústu objemu dat.

PR-005: Frontendové assety (JavaScript, CSS, obrázky) musí být kompilovány a miniﬁkovány v produkckním buildu. Obrázky musí být ve formátu WebP pro minimalizaci prenesených dat.


========================================
11. SECURITY REQUIREMENTS
========================================

SR-001: Hashování hesel - Hesla jsou vždy hashována algoritmem bcryptjs s cost faktorem minimálne 12 pred uložením do databáze. Hesla se nikdy neukládají ani nelogují v ctitelné podobe. Prri porovnání hesla pri prihlášení se vždy porovnává zadané heslo s uloženým hashem, nikoliv plain-text s plain-textem.

SR-002: Správa tokenu - Autentizacní JWT tokeny jsou ukládány výhradne v HTTP-only cookies s atributem Secure (prenos pouze pres HTTPS) a SameSite=Lax (ochrana pred CSRF). Tokeny nejsou prristupné JavaScriptovému kódu na strane prohlížece.

SR-003: Validace vstupu - Veškerý vstup od uživatele musí být validován na serverové strane pomocí Zod schémat pred jakýmkoliv zpracováním. Klientská validace slouží pouze pro zlepšení uživatelského zážitku a nelze na ni spolehnout z bezpecnostního hlediska.

SR-004: Autorizace - Prristup k chráneným trasám musí být oven middlewarem pri každém požadavku. API endpointy overují prislušnost záznamu k prrihlášenému uživateli pred každou operací. Zákazník nemúže císt ani upravovat objednávky jiného zákazníka.

SR-005: Obecné chybové zprávy - API endpointy vracejí obecné chybové zprávy pro bezpecnostní chyby. Zejména pri prihlašování systém nerozlišuje, zda je e-mail neznámý nebo je heslo nesprávné, aby nebylo možné metodou pokus-omyl zjistit, které e-maily jsou v systému registrovány.

SR-006: Ochrana klícu - Databázové prihlašovací údaje, podpisový klíc JWT a další tajné klíce nesmí být soucástí zdrojového kódu ani verzovacího systému. Musí být uloženy výhradne v proménných prostredí (.env soubor), který je v gitignore.

SR-007: Šifrování prenosu - HTTPS s TLS 1.2 nebo vyšším je povinné v produkckním prostredí. Provoz bez šifrování je prristupný pouze ve vývojovém prostredí na lokálním pocítaci.

SR-008: GDPR - Systém musí zpracovávat osobní údaje v souladu s narízeníím GDPR. Uživatel má právo na výmaz svého úctu. Osobní údaje nesmí být sdíleny s tretími stranami bez souhlasu uživatele.


========================================
12. DESIGN AND IMPLEMENTATION CONSTRAINTS
========================================

DC-001: Aplikace je postavena na frameworku Next.js verze 16 s App Routerem. Zmena frameworku by vyžadovala kompletní prepracování.

DC-002: Databáze musí být PostgreSQL verze 14 nebo vyšší. Jiné databázové systémy nejsou podporovány bez úpravy schématu a ORM konfigurace.

DC-003: Autentizace je implementována pomocí NextAuth.js verze 4. Migrace na jinou autentizacní knihovnu by vyžadovala prepsání autentizacní logiky a správy session.

DC-004: Databázové schéma se verzuje a spravuje výhradne prostrednictvím Prisma Migrate. Runé DDL úpravy jsou zakázány, aby byla zachována konzistence migracní histórie.

DC-005: V první verzi není integrována platební brána. Ceny objednávek jsou pouze informacní a jejich úhrada probíhá mimo systém.

DC-006: Systém nepodporuje vícejazycknost. Uživatelské rozhraní a všechny zprávy jsou výhradne v ceském jazyce.

DC-007: Systém je ciste webová aplikace. Nativní mobilní aplikace pro iOS ani Android nejsou soucástí tohoto projektu.

DC-008: Veškerý zdrojový kód musí být psán v TypeScriptu. Použití JavaScriptu bez typové anotace není prristupné.

DC-009: Proménné prostredí (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL) musí být konfigurovány pred spuštením aplikace. Chybející proménné zpúsobí selhání startu.


========================================
13. EXTERNAL SYSTEM REQUIREMENTS
========================================

ESR-001: PostgreSQL databáze

Systém vyžaduje prístup k databázovému serveru PostgreSQL verze 14 nebo vyšší. Pripojení je konfigurovano prostrednictvím proménné prostredí DATABASE_URL ve formátu connection string. Databáze musí být prristupná ze serveru, na kterém bezi aplikace. Kritickost: bez databáze systém není funkní.

ESR-002: NextAuth.js

Systém využívá knihovnu NextAuth.js pro správu autentizace a session. Tato závislost je instalována jako NPM balícek a nevyžaduje externí síovou dostupnost za behu aplikace. Kritickost: bez NextAuth.js nelze overovat uživatele.

ESR-003: Google Fonts

Aplikace nactítá fonty Playfair Display a DM Sans ze služby Google Fonts pri každém nacítání stránky. Pokud je server Google Fonts nedostupný, prohlížec použije záložní systémové fonty a vizuální podoba aplikace se zmení, ale funkcnost zústane zachována. Kritickost: nekritická záislost.

ESR-004: bcryptjs

Knihovna bcryptjs je použita pro hashování a porovnávání hesel. Je instalována jako NPM balícek a nevyžaduje žádné externí síové pripojení. Kritickost: bez bcryptjs nelze registrovat ani prihlašovat uživatele.

ESR-005: Prisma ORM

Prisma Client slouží jako vrstva pro prístup k databázi. Generuje se ze schématu príkazem prisma generate a vyžaduje databázové pripojení pri spuštení. Kritickost: bez Prisma ORM systém nemúže pracovat s daty.

Produkní závislosti (verze):
next 16.2.1, react 18.2.0, next-auth 4.24.7, @prisma/client 5.10.0, bcryptjs 2.4.3, zod 3.22.4, sass 1.71.0


========================================
14. QUALITY ASSURANCE REQUIREMENTS
========================================

QA-001: Vstupní validace musí být pokryta pro všechny API endpointy. Každý endpoint musí odmítnout neplatný vstup s kódem HTTP 400 a opisem chyby. Tato vlastnost musí být overena testováním hrancích prírpadú pro každé vstupní pole.

QA-002: Autentizacní a autorizacní logika musí být overena testováním prístupu neprihlášených uživatelú na chránené trasy, testováním prístupu zákazníka na administrátorské trasy a testováním prístupu zákazníka k objednávkám jiného zákazníka.

QA-003: Stavové prechody objednávek musí být overeny testováním všech povolených prechodu a overením, že nepovolené prechody jsou odmítnuty.

QA-004: Hashování hesel musí být overeno kontrolou, že databáze nikdy neobsahuje heslo v plain-text podobe.

QA-005: Responzivita uživatelského rozhraní musí být overena na mobilních zarízení (šírka 360 px), tabletovém rozhraní (šírka 768 px) a stolním pocítaci (šírka 1280 px a více).

QA-006: Výkon musí být overení merením doby odpovedi API endpointu a doby nacítání stránek pri simulované zátéži.

QA-007: Pred každým nasazením do produkce musí být proveden manuální pruchod zlatou cestou: registrace, prihlášení, vytvorení objednávky, zmena stavu krejcím, nastavení ceny administrátorem, dokoncení zakázky.


========================================
15. DOCUMENTATION REQUIREMENTS
========================================

DR-001: Zdrojový kód musí být dostatecné zdokumentován, aby nový vývojár byl schopen pochopit strukturu projektu bez ústní prredávky. Dokumentace zahrnuje tento SRS dokument, Dokument softwarového návrhu (SDD) a uživatelskou a administrátorskou príručku.

DR-002: Uživatelská príručka musí pokrývat všechny klícové scénáre zákazníka: registraci, prihlášení, vytvorení objednávky, sledování stavu a zrušení objednávky.

DR-003: Administrátorská príručka musí pokrývat správu krejcích, správu objednávek, nastavení cen a technickou správu systému vcetne zálohy databáze, spuštení migrací a rešení beežných problému.

DR-004: Soubor .env.example musí být udržován aktuální a obsahovat všechny povinné proménné prostredí s popisem jejich úcelu. Nesmí obsahovat žádné reálné hodnoty.

DR-005: Databázové schéma musí být zdokumentováno v SDD dokument vcetne popisu všech entit, atributú, datových typú, omezení a vztahú.

DR-006: Každá výrazná architektonická zmena nebo zmena datového modelu musí být odzrcadlena v aktualizaci SRS a SDD dokumentu a musí být verzována.


========================================
SLOVNÍK POJMÚ
========================================

SRS - Software Requirements Specification, specifikace softwarových požadavku
SDD - Software Design Document, dokument softwarového návrhu
API - Application Programming Interface, rozhraní pro komunikaci mezi systémy
JWT - JSON Web Token, podepsaný token pro prenos autentizacních dat
ORM - Object-Relational Mapping, vrstva mapující objekty na databázové záznamy
UI - User Interface, uživatelské rozhraní
SSR - Server-Side Rendering, vykreslovani stránky na strane serveru
HTTPS - HyperText Transfer Protocol Secure, šifrovaný webový protokol
GDPR - General Data Protection Regulation, narizení EU o ochrane osobních údaju
PENDING - Cekající, pocátecní stav objednávky
CONFIRMED - Potvrzená, objednávka prirrazena krejcímu
IN_PROGRESS - Probíhající, krejcí pracuje na zakázce
COMPLETED - Dokoncená, zakázka splnena
CANCELLED - Zrušená, objednávka stornována
CUSTOMER - Zákazník, uživatelská role pro zákazníky
TAILOR - Krejcí, uživatelská role pro krejcí
ADMIN - Administrátor, uživatelská role s plným prístupem


Dokument podléhá zmenám v prúbéhu vývoje. Všechny zmeny požadavku musí být schváleny vedoucím projektu a zdokumentovány.
