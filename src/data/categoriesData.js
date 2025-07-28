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
            label: "Eldstäder/Murspisar",
            value: "eldstader-murspisar",
          },
          {
            label: "Gjutjärnskaminer",
            value: "gjutjarnskaminer",
          },
          
          {
            label: "Skorstenar",
            value: "skorstenar",
          },
          ,
          
          {
            label: "Tillbehör",
            value: "tillbehor",
          }
        ],
      },
      {
        label: "Värmepumpar",
        value: "varmepumpar",
        child: [
          { label: "Luft-Luft", value: "luft-luft" },
          { label: "Luft-Vatten", value: "luft-vatten" },
          { label: "Frånluft", value: "franluft" },
          { label: "Bergvärme", value: "bergvarme" },
          { label: "Jordvärme", value: "jordvarme" },
          { label: "AC/Kyla", value: "AC-kyla" },
           {
            label: "Tillbehör",
            value: "tillbehor",
          }
        ],
      },
      {
        label: "Ventilation",
        value: "ventilation",
        child: [
          { label: "FTX-Aggregat", value: "ftx-aggregat" },
          { label: "Mekanisk Ventilation", value: "mekaniskventilation" },
          { label: "Friflöde/Självdrag", value: "friflode-sjalvdrag" },
           {
            label: "Tillbehör",
            value: "tillbehor",
          }
        ],
      },
      {
        label: "Golvvärme",
        value: "golvvarme",
         child: [
          { label: "El-Golvvärme", value: "el-golvvarme" },
           { label: "Vattenburen Golvvärme", value: "vattenburen-golvvarme" },
            {
            label: "Tillbehör",
            value: "tillbehor",
          }
           ]
      },
      {
        label: "VVS",
        value: "vvs",
        child: [
          { label: "Kranar", value: "kranar" },
          { label: "Handfat", value: "handfat" },
          { label: "Badkar", value: "badkar" },
          
          { label: "Toalstolar", value: "toastolar" },
           {
            label: "Tillbehör",
            value: "tillbehor",
          }
        ],
      },
      {
        label: "Sol/Lagring/Elbil",
        value: "sol/lagring/elbil",
        child: [
          { label: "Solsystem", value: "solsystem" },
          { label: "Batterier", value: "batterier" },
          { label: "Elbilsladdning", value: "elbilsladdning" },
           {
            label: "Tillbehör",
            value: "tillbehor",
          }
        ],
      },
      {
        label: "Byggvaror",
        value: "byggvaror",
        child: [
          { label: "Fönster", value: "fonster" },
          { label: "Takstegar", value: "takstegar" },
           {
            label: "Tillbehör",
            value: "tillbehor",
          }
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
           {
            label: "Tillbehör",
            value: "tillbehor",
          }
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
           {
            label: "Tillbehör",
            value: "tillbehor",
          }
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
          { label: "badkar", value: "Badkar" },
           {
            label: "Tillbehör",
            value: "tillbehor",
          }
        ]
      }
    ],
  },  
   Fritid: {
    label: "Fritid & Trädgård",
    value: "fritid-tradgard",
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
           {
            label: "Tillbehör",
            value: "tillbehor",
          }
        ],
      },
       {
        label: "Trädgård & Utemiljö",
        value: "tradgard-utemiljo",
        
        child: [
          { label: "Spabad", value: "spabad" },
          { label: "Badtunnor", value: "badtunnor" },
           {
            label: "Tillbehör",
            value: "tillbehor",
          }
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
           {
            label: "Tillbehör",
            value: "tillbehor",
          }
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
           {
            label: "Tillbehör",
            value: "tillbehor",
          }
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
           {
            label: "Tillbehör",
            value: "tillbehor",
          }
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
           {
            label: "Tillbehör",
            value: "tillbehor",
          }
        ],
      },
      {
        label: "Sportkläder",
        value: "sportklader",
        child: [
          { label: "Träningskläder", value: "traningsklader" },
          { label: "Golfkläder", value: "golfklader" },
           {
            label: "Tillbehör",
            value: "tillbehor",
          }
        ],
      },
      {
        label: "Alpin",
        value: "alpin",
        child: [
          { label: "Längdskidor", value: "langdskidor" },
          { label: "Skidor", value: "skidor" },
           {
            label: "Tillbehör",
            value: "tillbehor",
          }
        ],
      },
      {
        label: "Fotboll",
        value: "fotboll",
        child: [
          { label: "Fotbollar", value: "fotbollar" },
          { label: "Fotbollskläder", value: "fotbollsklader" },
          { label: "Fotbollsskor", value: "fotbollskor" },
           {
            label: "Tillbehör",
            value: "tillbehor",
          }
        ],
      },
      {
        label: "Hockey",
        value: "hockey",
        child: [
          { label: "Hockeyutrustning", value: "hockeyutrustning" },
          { label: "Skridskor", value: "skridskor" },
          { label: "Klubbor", value: "klubbor" },
           {
            label: "Tillbehör",
            value: "tillbehor",
          }
        ],
      },
    ],
  }
};

export default categoriesData;
