const categoriesData = {
  Hushall: {
    label: "Hus & Hem",
    value: "husochhem",
    child: [
      {
        label: "Kaminer",
        value: "kaminer",
        child: [
          {
            label: "Braskaminer",
            value: "braskaminer",
          },
          {
            label: "Täljstenskaminer",
            value: "taljstenskaminer",
            
          },
          {
            label: "Eldstäder/Murspis",
            value: "eldstader/murspis",
          },
          {
            label: "Gjutjärnskaminer",
            value: "gjutjarnskaminer",
          }
        ],
      },
      {
        label: "Värmepumpar",
        value: "varmepumpar",
        child: [
          { label: "Luftvärmepumpar", value: "luftvarmepumpar" },
          { label: "Frånluftvärmepump", value: "franluftvarmepump" },
          { label: "Bergvärmepumpar", value: "bergvarmepumpar" },
          { label: "Jordvärmepump", value: "jordvarmepump" },
          { label: "AC", value: "AC" },
        ],
      },
      {
        label: "Ventilation",
        value: "ventilation",
        child: [
          { label: "FTX-Aggregat", value: "ftx-aggregat" },
          { label: "Mekanisk Ventilation", value: "mekaniskventilation" },
          { label: "Friflöde/Självdrag", value: "friflode-sjalvdrag" },
        ],
      },
      {
        label: "Golvvärme",
        value: "golvvarme",
      },
      {
        label: "VVS",
        value: "vvs",
        child: [
          { label: "Kranar", value: "kranar" },
          { label: "Handfat/Badkar", value: "handfat/badkar" },
          { label: "Spabad/Badtunnor", value: "spabad/badtunnor" },
          { label: "Toalstolar", value: "toastolar" },
        ],
      },
      {
        label: "Sol/Lagring/Elbil",
        value: "sol/lagring/elbil",
        child: [
          { label: "Solsystem", value: "solsystem" },
          { label: "Batterier", value: "batterier" },
          { label: "Elbilsladdning", value: "elbilsladdning" },
        ],
      },
      {
        label: "Byggvaror",
        value: "byggvaror",
        child: [
          { label: "Fönster", value: "fonster" },
          { label: "Takstegar", value: "takstegar" },
        ],
      },
      {
        label: "Inredning",
        value: "inredning",
        child: [
          { label: "Köksinredning", value: "koksinredning" },
          { label: "Badrumsinredning", value: "badrumsinredning" },
          { label: "Garderob/Förvaring", value: "garderob/forvaring" },
          { label: "Hallinredning", value: "hallinredning" },
          { label: "Vardagsrumsinredning", value: "vardagsrumsinrening" },
        ],
      },
      {
        label: "Vitvaror",
        value: "vitvaror",
        child: [
          { label: "Kylar", value: "kylar" },
          { label: "Frysar", value: "frysar" },
          { label: "Vinkylar", value: "vinkylar" },
          { label: "Diskmaskiner", value: "diskmaskiner" },
          { label: "Frysboxar", value: "frysboxar" },
          { label: "Kombinerad Kyl/Frys", value: "kombineradkyl/frys" },
          { label: "Fläktar", value: "flaktar" },
          { label: "Tvättmaskiner", value: "tvattmaskiner" },
          { label: "Torktumlare", value: "torktumlare" },
          { label: "Mikrougn", value: "microugn" },
          { label: "Hällar", value: "hallar" },
          { label: "Ugnar", value: "ugnar" },
        ],
      },
      {
        label: "Kök",
        value: "kok",
        child: [
          { label: "Kökskranar", value: "kokskranar" },
          { label: "Diskho", value: "diskho" },
          { label: "Tillbehör", value: "tillbehor" }
        ]
      },
      {
        label: "Badrum",
        value: "badrum",
        child: [
          { label: "Tvättställskranar", value: "tvattstallskranar" },
          { label: "Badkarsblandare", value: "badkarsblandare" },
          { label: "Handfat", value: "handfat" },
          { label: "badkar", value: "Badkar" }
        ]
      }
    ],
  },  
   Fritid: {
    label: "Fritid",
    value: "fritid",
    child: [
      {
        label: "Bastu",
        value: "bastu",
        child: [
          { label: "Elektrisk Bastupriser", value: "elektiskt/bastupriser" },
          { label: "Vedeldade Bastuspisar", value: "vedeldade/bastuspisar" },
          { label: "Tillbehör", value: "tillbehor" },
          { label: "Bastuinredning", value: "bastu-inredning" },
          { label: "Bastustugor", value: "bastu-stugor" },
        ],
      },
      {
        label: "Fordon/ATV",
        value: "forfon/atv",
        child: [
          { label: "ATV/UTV", value: "atv/utv" },
          { label: "Snöskoter", value: "snoskoter" },
          { label: "Elsparkcyklar", value: "elsparkcyklar" },
          { label: "Elcyklar", value: "elcyklar" },
          { label: "Cyklar", value: "cyklar" },
          { label: "Mopeder", value: "mopeder" },
          { label: "Mopedbilar", value: "mopedbilar" },
        ],
      },
      {
        label: "Båtar/Marin",
        value: "batar/marin",
        child: [
          { label: "Plotter/Ekolod", value: "plotter/ekolod" },
          { label: "Radar", value: "radar" },
          { label: "Rodd båt", value: "roddbat" },
          { label: "Jetskis", value: "jetskis" },
          { label: "Bryggor", value: "bryggor" },
          { label: "Flytvästar", value: "flytvastar" },
        ],
      },
      {
        label: "Fiske",
        value: "fiske",
        child: [
          { label: "Fiskespön", value: "fiskespon" },
          { label: "Fiskerullar", value: "fiskerulle" },
          { label: "Fiskedrag", value: "fiskedrag" },
          { label: "Ekolod", value: "ekolod" },
          { label: "Trollingmotor", value: "trollingmotor" },
          { label: "Fiskekläder", value: "fiskeklader" },
        ],
      },
    ],
  },
  Sport: {
    label: "Sport",
    value: "sport",
    child: [
      {
        label: "Golf",
        value: "golf",
        child: [
          { label: "Golfbollar", value: "golfbollar" },
          { label: "Golfklubbor", value: "golfklubbor" },
          { label: "Utrustning", value: "utrustning" },
          { label: "Golfkläder", value: "golfklader" },
        ],
      },
      {
        label: "Sportkläder",
        value: "sportklader",
        child: [
          { label: "Träningskläder", value: "traningsklader" },
          { label: "Golfkläder", value: "golfklader" },
        ],
      },
      {
        label: "Alpin",
        value: "alpin",
        child: [
          { label: "Längdskidor", value: "langdskidor" },
          { label: "Skidor", value: "skidor" },
        ],
      },
      {
        label: "Fotboll",
        value: "fotboll",
        child: [
          { label: "Fotbollar", value: "fotbollar" },
          { label: "Fotbollskläder", value: "fotbollsklader" },
          { label: "Fotbollsskor", value: "fotbollskor" },
        ],
      },
      {
        label: "Hockey",
        value: "hockey",
        child: [
          { label: "Hockeyutrustning", value: "hockeyutrustning" },
          { label: "Skridskor", value: "skridskor" },
          { label: "Klubbor", value: "klubbor" },
        ],
      },
    ],
  }
};

export default categoriesData;
