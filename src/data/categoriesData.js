const categoriesData = {
  Hushall: {
    label: "Hushåll",
    value: "hushall",
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
          },
          {
            label: "Tillbehor",
            value: "tillbehor-kamin",
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
          { label: "Kranar/Blandare", value: "kranar/blandare" },
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
    ],
  },
};

export default categoriesData;
