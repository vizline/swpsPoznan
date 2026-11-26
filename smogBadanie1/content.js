/* =====================================================================
   SMOG – Badanie 1 – TREŚCI (zgoda, narzędzia, informacja końcowa)

   Formy zależne od płci zapisano jako {kobieta|mężczyzna} albo
   {kobieta|mężczyzna|inna/nie podano}. Gdy brak trzeciego wariantu,
   dla odpowiedzi „inna / wolę nie podawać” używana jest forma „kobieta/mężczyzna”.
   Numery pozycji (n) odpowiadają numeracji w źródłach i w kluczach kodowania.
   ===================================================================== */
window.CONTENT = {

  /* ---------------- ŚWIADOMA ZGODA (wg Załącznika B, Badanie 1) ---------------- */
  consent: (opinia) => `
    <h1>Postawy wobec jakości powietrza</h1>
    <p class="lead">Informacja o badaniu i zgoda na udział</p>

    <h3>Instytucja odpowiedzialna</h3>
    <p>Uniwersytet SWPS, ul. Chodakowska 19/31, 03-815 Warszawa. Osoba odpowiedzialna: dr Maciej Kościelniak, Wydział Psychologii i Prawa w Poznaniu. Kontakt: <a href="mailto:mkoscielniak@swps.edu.pl">mkoscielniak@swps.edu.pl</a> lub wiadomość przez Prolific. Projekt zaopiniowany pozytywnie przez Komisję ds. Etyki Badań Naukowych Uniwersytetu SWPS, Wydziału Psychologii i Prawa w Poznaniu. Opinia nr: ${opinia}</p>

    <h3>Opis badania</h3>
    <p>Badanie dotyczy wartości, sposobu myślenia i reagowania oraz opinii i działań związanych z jakością powietrza. Odpowie Pan/Pani na pytania w kwestionariuszach online. Badanie trwa ok. 15 minut i nie zawiera treści drastycznych. Ryzyko jest minimalne (chwilowe zmęczenie). Wynagrodzenie zostanie wypłacone przez Prolific. Wyniki pomogą lepiej zrozumieć postawy wobec zanieczyszczenia powietrza.</p>
    <p>Udział jest dobrowolny, a odmowa nie wiąże się z żadnymi konsekwencjami. Może Pan/Pani przerwać badanie w dowolnym momencie bez podawania przyczyny, zamykając okno ankiety. Do 28.02.2027 można też wycofać zgodę na przetwarzanie danych (wiadomość przez Prolific lub e-mail).</p>
    <p>Dane są poufne. Nie zbieramy imienia, nazwiska ani danych kontaktowych. Odpowiedzi są powiązane wyłącznie z identyfikatorem Prolific, przechowywanym oddzielnie i dostępnym wyłącznie dla zespołu badawczego. Identyfikator usuniemy 28.02.2027, a od tego momentu dane będą anonimowe. Wyniki analizujemy wyłącznie zbiorczo. Zanonimizowane dane zostaną udostępnione w publicznym repozytorium naukowym.</p>

    <h3>Informacja dotycząca przetwarzania danych osobowych</h3>
    <p class="small">Administratorem danych jest Uniwersytet SWPS, ul. Chodakowska 19/31, 03-815 Warszawa (swps@swps.pl, tel. 22 517 96 00). Inspektor ochrony danych: iod@swps.edu.pl. Przetwarzamy identyfikator Prolific i odpowiedzi w kwestionariuszach w celu przeprowadzenia badania naukowego na podstawie zgody (art. 6 ust. 1 lit. a RODO), do 28.02.2027, po czym dane zostaną zanonimizowane. Odbiorcami danych są: Prolific Academic Ltd (Wielka Brytania, kraj objęty decyzją Komisji Europejskiej o odpowiednim stopniu ochrony) w zakresie rozliczenia wynagrodzenia oraz dostawcy usług IT działający na zlecenie administratora (platforma ankietowa). Innym podmiotom dane mogą być udostępnione wyłącznie na podstawie przepisów prawa. Przysługuje Panu/Pani prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia, sprzeciwu oraz wycofania zgody (bez wpływu na zgodność z prawem wcześniejszego przetwarzania). Zgodnie z art. 469b ust. 1 ustawy Prawo o szkolnictwie wyższym i nauce prawa dostępu, sprostowania, przenoszenia i sprzeciwu mogą zostać wyłączone, jeśli uniemożliwiałyby lub poważnie utrudniałyby realizację celów badania. Przysługuje Panu/Pani prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych. Podanie danych jest dobrowolne, ale niezbędne do udziału w badaniu. Administrator nie będzie podejmował zautomatyzowanych decyzji, w tym poprzez profilowanie.</p>

    <h3>Zgoda</h3>
    <p>Ponieważ badanie jest prowadzone przez Internet, nie zbieramy osobnych formularzy zgody. Kliknięcie przycisku „Rozpocznij badanie” oznacza, że zapoznał(a) się Pan/Pani z tą informacją i z własnej, nieprzymuszonej woli zgadza się uczestniczyć w badaniu, wyrażając dobrowolną zgodę na przetwarzanie swoich danych osobowych przez Uniwersytet SWPS w celu realizacji swojego udziału w badaniu i jego celów. W razie pytań, także po badaniu, prosimy o kontakt z osobą odpowiedzialną, która na prośbę udostępni również zbiorcze wyniki.</p>
  `,

  /* ---------------- INFORMACJA KOŃCOWA (wg Załącznika B, Badanie 1) ---------------- */
  debrief: `
    <h1>Dziękujemy za udział w badaniu!</h1>
    <p>Badanie służy wyodrębnieniu profili psychologicznych, czyli typowych konfiguracji wartości, wrażliwości na nagrody i kary oraz stylu myślenia, a także sprawdzeniu, jak te profile wiążą się z postawami wobec smogu i działaniami na rzecz czystego powietrza. Wyniki posłużą do przygotowania kolejnego badania.</p>
    <p>Jeśli chce Pan/Pani wycofać swoje dane, prosimy o wiadomość przez Prolific lub na adres e-mail <a href="mailto:mkoscielniak@swps.edu.pl">mkoscielniak@swps.edu.pl</a> do 28.02.2027. Wycofanie danych nie wpływa na wynagrodzenie. Pod tym samym adresem można zadać pytania lub poprosić o wyniki zbiorcze.</p>
    <p>Aktualne informacje o jakości powietrza: <a href="https://powietrze.gios.gov.pl" target="_blank" rel="noopener">powietrze.gios.gov.pl</a></p>
  `,

  /* ---------------- KWESTIONARIUSZE ---------------- */
  questionnaires: {

    /* PVQ-21 (ESS; Cieciuch i Davidov, 2012). Wersja dopasowana do płci.
       Kodowanie surowe jak w pliku PVQ-21: 1 = bardzo podobna … 6 = zupełnie niepodobna
       (składnia SPSS najpierw odwraca: 7 − x). */
    PVQ: {
      code: "pvq",
      title: "Opisy osób",
      instruction: `<p>Na kolejnych ekranach przeczytasz opisy różnych osób. Zaznacz, w jakim stopniu każda z tych osób jest (lub też nie jest) podobna do Ciebie.</p>`,
      prompt: "W jakim stopniu ta osoba jest podobna do Ciebie?",
      scale: [
        [1, "Bardzo {podobna|podobny} do mnie"],
        [2, "{Podobna|Podobny} do mnie"],
        [3, "W pewnym stopniu {podobna|podobny} do mnie"],
        [4, "Nieco {podobna|podobny} do mnie"],
        [5, "{Niepodobna|Niepodobny} do mnie"],
        [6, "Zupełnie {niepodobna|niepodobny} do mnie"]
      ],
      items: [
        [1,  "Ważne jest dla {niej|niego} wymyślanie nowych rzeczy i twórcze podejście. Lubi robić wszystko na swój własny, oryginalny sposób."],
        [2,  "Ważne jest dla {niej|niego} bogactwo. Chce mieć dużo pieniędzy i drogich przedmiotów."],
        [3,  "Uważa, że ważne jest równe traktowanie wszystkich ludzi na świecie. Jest {przekonana|przekonany}, że każdy powinien mieć w życiu równe szanse."],
        [4,  "Ważne jest dla {niej|niego} pokazywanie własnych umiejętności. Chce, aby ludzie podziwiali to, co robi."],
        [5,  "Ważne jest dla {niej|niego}, aby żyć w bezpiecznym otoczeniu. Unika wszystkiego, co mogłoby zagrażać {jej|jego} bezpieczeństwu."],
        [6,  "Lubi niespodzianki i zawsze poszukuje nowych zajęć. {Jej|Jego} zdaniem ważne jest, by w życiu zajmować się wieloma różnymi rzeczami."],
        [7,  "Uważa, że ludzie powinni robić to, co im się każe. Sądzi, że ludzie powinni zawsze stosować się do zasad i przepisów, nawet gdy nikt ich nie obserwuje."],
        [8,  "Ważne jest dla {niej|niego} słuchanie ludzi, którzy są inni niż {ona|on}. Nawet wtedy, gdy się z nimi nie zgadza, wciąż pragnie ich zrozumieć."],
        [9,  "Ważna jest dla {niej|niego} skromność i pokora. Stara się nie zwracać na siebie uwagi."],
        [10, "Ważna jest dla {niej|niego} dobra zabawa. Lubi sobie „dogadzać” (nie odmawia sobie niczego)."],
        [11, "Ważne jest dla {niej|niego} samodzielne podejmowanie decyzji we własnych sprawach. Lubi swobodę i niezależność od innych."],
        [12, "Bardzo ważne jest dla {niej|niego}, aby pomagać otaczającym {ją|go} ludziom. Pragnie dbać o ich dobro."],
        [13, "Ważne jest dla {niej|niego} odnoszenie znaczących sukcesów. Ma nadzieję, że ludzie docenią {jej|jego} osiągnięcia."],
        [14, "Ważne jest dla {niej|niego}, aby władze zapewniły {jej|mu} ochronę przed wszelkimi zagrożeniami. Pragnie, aby państwo było silne i zdolne bronić swych obywateli."],
        [15, "Poszukuje przygód i lubi podejmować ryzyko. Chce mieć życie pełne wrażeń."],
        [16, "Ważne jest dla {niej|niego} poprawne zachowanie w każdej sytuacji. Pragnie uniknąć postępowania, które ludzie mogliby uznać za niewłaściwe."],
        [17, "Ważne jest dla {niej|niego} zyskanie szacunku innych ludzi. Chce, aby ludzie robili to, co im każe."],
        [18, "Ważne jest dla {niej|niego}, aby być {lojalną|lojalnym} wobec przyjaciół. Chce być {oddana|oddany} wobec bliskich sobie osób."],
        [19, "Jest głęboko {przekonana|przekonany}, że ludzie powinni dbać o przyrodę. Ważna jest dla {niej|niego} troska o środowisko naturalne."],
        [20, "Ważna jest dla {niej|niego} tradycja. Stara się kultywować zwyczaje religijne lub rodzinne."],
        [21, "Szuka okazji do zabawy. Ważne jest dla {niej|niego}, aby robić to, co sprawia {jej|mu} przyjemność."]
      ]
    },

    /* SPSRQ-SF, polska wersja 21 pozycji (Wytykowska, Białaszek, Ostaszewski, 2014).
       Pozycje 1, 6, 11 usunięte w adaptacji. TAK = 1, NIE = 0.
       SP (wrażliwość na kary): 2,3,7,8,10,12,14,16,17,19,20,21,23
       SR (wrażliwość na nagrody): 4,5,9,13,15,18,22,24 */
    SPSRQ: {
      code: "spsrq",
      title: "Pytania o Twoje zachowania",
      instruction: `<p>Na kolejnych ekranach zobaczysz pytania dotyczące Twoich zachowań i odczuć w różnych sytuacjach. Na każde pytanie odpowiedz <strong>TAK</strong> albo <strong>NIE</strong>. Nie ma odpowiedzi dobrych ani złych – odpowiadaj zgodnie z tym, jak zwykle się zachowujesz.</p>`,
      prompt: "",
      scale: [[1, "TAK"], [0, "NIE"]],
      items: [
        [2,  "Czy często obawiasz się nowych, nieoczekiwanych sytuacji?"],
        [3,  "Czy trudno jest ci zadzwonić do kogoś, kogo nie znasz?"],
        [4,  "Czy często robisz różne rzeczy dla uznania?"],
        [5,  "Czy lubisz być w centrum uwagi na imprezie lub podczas spotkań towarzyskich?"],
        [7,  "Czy łatwo zniechęcasz się w trudnych sytuacjach?"],
        [8,  "Czy jesteś nieśmiałą osobą?"],
        [9,  "Czy kiedy jesteś w grupie, starasz się, by twoje opinie były najbardziej inteligentne lub zabawne?"],
        [10, "Czy kiedy tylko to możliwe, starasz się unikać ujawniania swoich umiejętności z obawy przed byciem {zawstydzoną|zawstydzonym}?"],
        [12, "Czy kiedy jesteś w grupie, masz trudności z wyborem dobrego tematu do rozmowy?"],
        [13, "Czy generalnie priorytetowo traktujesz te sprawy, które przynoszą natychmiastowe korzyści?"],
        [14, "Czy unikasz nieznanych miejsc, jeśli tylko możesz?"],
        [15, "Czy lubisz rywalizować i robisz wszystko, by wygrać?"],
        [16, "Czy często martwisz się z powodu rzeczy, które {zrobiłaś|zrobiłeś} lub {powiedziałaś|powiedziałeś}?"],
        [17, "Czy regularnie myślisz, że {mogłabyś|mógłbyś} robić więcej, gdyby nie twój brak poczucia bezpieczeństwa lub strach?"],
        [18, "Czy czasami robisz coś dla szybkiego zysku?"],
        [19, "Czy uważasz się za osobę, która obawia się wielu rzeczy w porównaniu do innych ludzi, których znasz?"],
        [20, "Czy często martwisz się rzeczami do tego stopnia, że gorzej wykonujesz różnego rodzaju zadania intelektualne?"],
        [21, "Czy często rezygnujesz z robienia rzeczy, które lubisz, po to, by nie doświadczyć dezaprobaty innych lub nie zostać {odrzuconą|odrzuconym}?"],
        [22, "Czy {chciałabyś|chciałbyś} być wpływową osobą?"],
        [23, "Czy często powstrzymujesz się od robienia czegoś, ponieważ obawiasz się, że zostaniesz {zawstydzona|zawstydzony}?"],
        [24, "Czy lubisz prezentować swoje umiejętności, nawet jeśli mogłoby się to wiązać z niebezpieczeństwem?"]
      ]
    },

    /* REI-24 (Pacini i Epstein, 1999; tłum. Śleboda i Sokołowska). Skala 1–5.
       Racjonalność: 1, 5r, 9, 13r, 19, 23r (zdolność) + 2r, 6, 15, 18r, 22, 24r (preferencja)
       Doświadczeniowość: 3, 7r, 10, 12r, 16, 20r (zdolność) + 4r, 8, 11r, 14, 17r, 21 (preferencja) */
    REI: {
      code: "rei",
      title: "Twierdzenia o sposobie myślenia",
      instruction: `<p>Na kolejnych ekranach zobaczysz 24 twierdzenia, które odnoszą się do Twoich uczuć, przekonań i zachowań. Oceń, na ile prawdziwe jest każde z tych twierdzeń w odniesieniu do Ciebie.</p>`,
      prompt: "Na ile to twierdzenie jest prawdziwe w odniesieniu do Ciebie?",
      scale: [
        [1, "Zdecydowanie nieprawdziwe"],
        [2, "Nieprawdziwe"],
        [3, "Nie umiem zdecydować – zarówno prawdziwe, jak i nieprawdziwe"],
        [4, "Prawdziwe"],
        [5, "Zdecydowanie prawdziwe"]
      ],
      items: [
        [1,  "Myślę logicznie."],
        [2,  "Wystarcza mi znajomość odpowiedzi, nawet jeśli nie rozumiem, jak do niej dojść."],
        [3,  "Jeśli idzie o ufanie ludziom, to zwykle polegam na moich przeczuciach."],
        [4,  "Nie uważam, że poleganie na intuicji przy podejmowaniu ważnych decyzji jest dobrym pomysłem."],
        [5,  "Mój umysł nie jest bardzo analityczny."],
        [6,  "Wolę złożone zadania niż proste."],
        [7,  "Podejrzewam, że moje przeczucia są często nietrafne."],
        [8,  "Często kieruję się instynktem, kiedy decyduję, co zrobić."],
        [9,  "Jestem dużo {lepsza|lepszy} niż inni w logicznym myśleniu."],
        [10, "Ufam moim pierwszym odczuciom na temat ludzi."],
        [11, "Przy podejmowaniu decyzji zwykle nie polegam na moich instynktach."],
        [12, "Gdybym {polegała|polegał} na moich przeczuciach, to często bym się {myliła|mylił}."],
        [13, "Nie jestem bardzo {dobra|dobry} w rozwiązywaniu problemów, które wymagają uważnego, logicznego myślenia."],
        [14, "Lubię polegać na intuicji."],
        [15, "Lubię problemy, które wymagają dogłębnego myślenia."],
        [16, "Wierzę, że należy ufać swoim przeczuciom."],
        [17, "Nie lubię sytuacji, w których muszę polegać na intuicji."],
        [18, "Nie lubię za dużo myśleć."],
        [19, "Poleganie na logice zwykle pozwala mi rozwiązać moje problemy życiowe."],
        [20, "Nie mam bardzo dobrej intuicji."],
        [21, "Uważam, że są sytuacje, w których poleganie na intuicji jest konieczne."],
        [22, "Lubię intelektualne wyzwania."],
        [23, "Uważne, logiczne wyciąganie wniosków nie jest moją mocną stroną."],
        [24, "Staram się unikać sytuacji, które wymagają dogłębnego myślenia."]
      ]
    },

    /* SZZP-10 (autorska; Załącznik C1). Skala 1–6. Odwrócone: 5, 10 (7 − x).
       AFEKT: 1–5; ZACHOWANIA: 6–10. Pozycja sprawdzająca uwagę: poprawna odpowiedź = 3. */
    SZZP: {
      code: "szzp",
      title: "Zanieczyszczenie powietrza",
      instruction: `<p>Na kolejnych ekranach zobaczy {Pani|Pan|Pan/Pani} stwierdzenia dotyczące zanieczyszczenia powietrza oraz codziennych reakcji na nie. Prosimy ocenić, w jakim stopniu zgadza się {Pani|Pan|Pan/Pani} z każdym z nich, zaznaczając jedną z sześciu odpowiedzi na skali. Nie ma odpowiedzi dobrych ani złych – interesuje nas {Pani|Pana|Pana/Pani} osobiste zdanie.</p>`,
      prompt: "W jakim stopniu zgadza się {Pani|Pan|Pan/Pani} z tym stwierdzeniem?",
      scale: [
        [1, "Zdecydowanie się nie zgadzam"],
        [2, "Nie zgadzam się"],
        [3, "Raczej się nie zgadzam"],
        [4, "Raczej się zgadzam"],
        [5, "Zgadzam się"],
        [6, "Zdecydowanie się zgadzam"]
      ],
      items: [
        [1,  "Niepokoi mnie poziom zanieczyszczenia powietrza w Polsce."],
        [2,  "Martwi mnie, że zanieczyszczone powietrze może szkodzić mojemu zdrowiu."],
        [3,  "Odczuwam niepokój na myśl o zanieczyszczonym powietrzu w mojej okolicy."],
        [4,  "Mimowolnie powracam myślami do zagrożeń związanych z zanieczyszczeniem powietrza."],
        [5,  "Rzadko zaprzątam swoje myśli tematem zanieczyszczonego powietrza."],
        [6,  "Regularnie sprawdzam poziom zanieczyszczenia powietrza w mojej okolicy."],
        [7,  "Gdy powietrze jest zanieczyszczone, skracam czas spędzany na zewnątrz."],
        [8,  "Planując wyjście z domu, uwzględniam jakość powietrza."],
        [9,  "Przemieszczając się pieszo lub rowerem, świadomie wybieram trasy z dala od ruchliwych ulic, aby unikać spalin."],
        [10, "Komunikaty o zanieczyszczonym powietrzu nie mają realnego wpływu na moje decyzje o wyjściu z domu."],
        ["attn", "Pozycja sprawdzająca uwagę – proszę zaznaczyć odpowiedź „raczej się nie zgadzam”."]
      ]
    },

    /* Moduł gotowości do 14 działań (autorski; Załącznik C2). Skala 1–5. */
    DZIAL: {
      code: "dzial",
      title: "Działania na rzecz czystego powietrza",
      instruction: `<p>Na kolejnych ekranach zobaczy {Pani|Pan|Pan/Pani} działania, które można podjąć na rzecz czystszego powietrza. Prosimy ocenić, na ile jest {Pani|Pan|Pan/Pani} {skłonna|skłonny|skłonny/skłonna} podjąć każde z nich w ciągu najbliższych trzech miesięcy. Nie ma odpowiedzi dobrych ani złych – interesuje nas wyłącznie {Pani|Pana|Pana/Pani} zdanie. Udzielenie odpowiedzi nie zobowiązuje do podjęcia żadnego z tych działań.</p>`,
      prompt: "Na ile jest {Pani|Pan|Pan/Pani} {skłonna|skłonny|skłonny/skłonna}…",
      scale: [
        [1, "Wcale"],
        [2, "W niewielkim stopniu"],
        [3, "W umiarkowanym stopniu"],
        [4, "W dużym stopniu"],
        [5, "W bardzo dużym stopniu"]
      ],
      items: [
        [1,  "…zainstalować w telefonie aplikację pokazującą bieżącą jakość powietrza?"],
        [2,  "…regularnie sprawdzać komunikaty o jakości powietrza w swojej okolicy, zwłaszcza w sezonie grzewczym?"],
        [3,  "…poszukać materiałów z rzetelnymi informacjami o przyczynach smogu i jego wpływie na zdrowie?"],
        [4,  "…porozmawiać z bliskimi lub znajomymi o problemie zanieczyszczenia powietrza?"],
        [5,  "…udostępnić w mediach społecznościowych informację o smogu lub o sposobach jego ograniczania?"],
        [6,  "…podpisać petycję (także internetową) w sprawie poprawy jakości powietrza?"],
        [7,  "…poprzeć uchwałę antysmogową lub inne przepisy ograniczające zanieczyszczenie powietrza, np. w konsultacjach społecznych?"],
        [8,  "…zgłosić straży miejskiej lub urzędowi gminy przypadek spalania odpadów w piecu lub na posesji?"],
        [9,  "…przekazać niewielką wpłatę (np. 10 zł) organizacji działającej na rzecz czystego powietrza?"],
        [10, "…w dni smogowe zrezygnować z jazdy samochodem na rzecz transportu publicznego, roweru lub chodzenia pieszo?"],
        [11, "…wziąć udział w wydarzeniu, pikiecie lub marszu na rzecz czystego powietrza?"],
        [12, "…poświęcić kilka godzin na wolontariat na rzecz lokalnej inicjatywy antysmogowej?"],
        [13, "…zachęcać osoby ogrzewające dom starym piecem na paliwo stałe (np. krewnych lub sąsiadów) do jego wymiany?"],
        [14, "…zaakceptować wyższe koszty ogrzewania swojego mieszkania lub domu, jeśli przyczyni się to do ograniczenia smogu?"]
      ]
    }
  }
};
