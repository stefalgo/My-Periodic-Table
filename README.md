[![by-nc-nd](docs/images/by_nc_nd_4_0.png)](https://creativecommons.org/licenses/by-nc-nd/4.0/)

# My Periodic Table
https://stefalgo.github.io/My-Periodic-Table

## Όλα τα 118 στοιχεία
![image](docs/images/PeriodicTable.png)\
Μπορείτε να δείτε όλα τα 118 χημικά στοιχεία στον πίνακα και κάνοντας κλικ στην προεπισκόπηση του στοιχείου,\
θα εμφανιστούν περισσότερες πληροφορίες για αυτό το στοιχείο, όπως το όνομα, το σύμβολο (σύντομο όνομα), ο ατομικός αριθμός κ.ά.\
Εάν κάνετε κλικ στην προεπισκόπηση αυτού του παραθύρου, θα ανοίξει το PDF του στοιχείου από τη Wikipedia.
![image](docs/images/Closeup.png)\
![image](docs/images/InfoWindow2.png)


## Οπτικοποίησης
![image](docs/images/Highlights.png)\
Μπορείτε να περάσετε το ποντίκι πάνω από αυτά τα κουτάκια για να επισημάνετε τα στοιχεία της αντίστοιχης κατηγορίας.

Επίσης, μπορείτε να πατήσετε το αναπτυσσόμενο πλαίσιο για να επιλέξετε άλλες απεικονίσεις\
![image](docs/images/Dropdown2.png)\
![image](docs/images/State.png)

# JSON Data
## Πηγές δεδομένων στοιχείων
[https://github.com/Bowserinator/Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON)\
[https://pse-info.de](https://pse-info.de)\
[https://wikipedia.org](https://wikipedia.org)

Data are combined into 1 file.\
The spectrum.json is from the [https://pse-info.de](https://pse-info.de) and is it used as its own file.\
Current in use: `JsonData/ElementsV5.json` and `JsonData/spectrum.json`
## Format ElementsV5.json
```jsonc
{
    "1": {
        "atomic": 1,
        "symbol": "H",
        "name": "Υδρογόνο",
        "wiki": "Υδρογόνο",
        "atomicMass": 1.008,
        "electronConfiguration": "1s1",
        "electronStringConf": "1s1",
        "electronegativity": 2.2,
        "atomicRadius": 53,
        "ionizationEnergy": 1312.0,
        "electronAffinity": 72.8,
        "oxidation": "-1c,1c",
        "melt": 14.01,
        "boil": 20.28,
        "valence": 1,
        "density": 0.0899,
        "quantum": {
            "l": 0,
            "m": 0,
            "n": 1
        },
        "elementAbundance": {
            "universe": "75",
            "solar": "75",
            "meteor": "2.4",
            "crust": "0.15",
            "ocean": "11",
            "human": "10"
        },
        "heatCap": "14300",
        "thermalConductivity": "0.1805",
        "category": "nonmetal",
        "period": 1,
        "group": 1,
        "discovered": "1766"
    },
    //...
}
```

## Format spectrum.json
```jsonc
{
    "h":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAABCAIAAADPbEtiAAAA80lEQVRIx+2UTw7BUBDGf++9ioRYiIiVRCxcxS1cwDlcwtbW3g0sXYArkJAg8W+s0KevtFWpRJumb76Zb7558y2qSlR5PMofaTyP4oE9iJPgPz2KhsKBrYQQ3ipoTJn6jtWZY0SFG3giBKeoQFnXaINesgCJo6BcnE+rKlGvwnToVWjNGFw43cviI4vdK7ZCCASU2G68gK4R7olirxAOrRVc8O0Kjo2sU/mCWPCTLm3oTjAw7bOef2tWiheOBOXm9NMbPfkj5IgKCZ3L8878w+CsvukKBn588TKZ0P5Jv+ExagIMl4w3/2KjxA++wczFf+0aVy1Z9wfkGdqJAAAAAElFTkSuQmCC",
    //...
}
```

# Author
&copy; 2025 [@stefalgo](https://github.com/stefalgo) **All Rights Reserved.**
