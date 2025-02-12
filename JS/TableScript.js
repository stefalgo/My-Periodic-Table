const classes = ["alkali", "alkaline", "nonmetal", "transition", "unknown", "lanthanoid", "actinoid", "metalloid", "poor", "noble"];
const closeUp = document.getElementById('CloseUp');
var elementAtomicNumber;

const elementData = {
	'1':{'energyLevels': ['1'], 'block': 's', 'name': 'Υδρογόνο', 'shortName': 'H', 'discovered': '1766 μ.Χ'},
	'2':{'energyLevels': ['2'], 'block': 's', 'name': 'Ήλιο', 'shortName': 'He','discovered': '1895 μ.Χ.'},
	'3':{'energyLevels': ['2','1'], 'block': 's', 'name': 'Λίθιο', 'shortName': 'Li', 'discovered': '1817 μ.Χ.'},
	'4':{'energyLevels': ['2','2'], 'block': 's', 'name': 'Βηρύλλιο', 'shortName': 'Be', 'discovered': '1797 μ.Χ.'},
	'5':{'energyLevels': ['2','3'], 'block': 'p', 'name': 'Βόριο', 'shortName': 'B', 'discovered': '1808 μ.Χ.'},
	'6':{'energyLevels': ['2','4'], 'block': 'p', 'name': 'Άνθρακας', 'shortName': 'C', 'discovered': '3750 π.Χ.'},
	'7':{'energyLevels': ['2','5'], 'block': 'p', 'name': 'Άζωτο', 'shortName': 'N', 'discovered': '1772 μ.Χ.'},
	'8':{'energyLevels': ['2','6'], 'block': 'p', 'name': 'Οξυγόνο', 'shortName': 'O', 'discovered': '1774 μ.Χ.'},
	'9':{'energyLevels': ['2','7'], 'block': 'p', 'name': 'Φθόριο', 'shortName': 'F', 'discovered': '1886 μ.Χ.'},
	'10':{'energyLevels': ['2','8'], 'block': 'p', 'name': 'Νέον', 'shortName': 'Ne', 'discovered': '1898 μ.Χ.'},

	'11':{'energyLevels': ['2','8','1'], 'block': 's', 'name': 'Νάτριο', 'shortName': 'Na', 'discovered': '1807 μ.Χ.'},
	'12':{'energyLevels': ['2','8','2'], 'block': 's', 'name': 'Μαγνήσιο', 'shortName': 'Mg', 'discovered': '1755 μ.Χ.'},
	'13':{'energyLevels': ['2','8','3'], 'block': 'p', 'name': 'Αργίλιο', 'shortName': 'Al', 'discovered': '1825 μ.Χ.'},
	'14':{'energyLevels': ['2','8','4'], 'block': 'p', 'name': 'Πυρίτιο', 'shortName': 'Si', 'discovered': '1824 μ.Χ.'},
	'15':{'energyLevels': ['2','8','5'], 'block': 'p', 'name': 'Φωσφόρος', 'shortName': 'P', 'discovered': '1669 μ.Χ.'},
	'16':{'energyLevels': ['2','8','6'], 'block': 'p', 'name': 'Θείο', 'shortName': 'S', 'discovered': '500 π.Χ.'},
	'17':{'energyLevels': ['2','8','7'], 'block': 'p', 'name': 'Χλώριο', 'shortName': 'Cl', 'discovered': '1774 μ.Χ.'},
	'18':{'energyLevels': ['2','8','8'], 'block': 'p', 'name': 'Αργό', 'shortName': 'Ar', 'discovered': '1894 μ.Χ.'},
	
	'19':{'energyLevels': ['2','8','8','1'], 'block': 's', 'name': 'Κάλιο', 'shortName': 'K', 'discovered': '1807 μ.Χ.'},
	'20':{'energyLevels': ['2','8','8','2'], 'block': 's', 'name': 'Ασβέστιο', 'shortName': 'Ca', 'discovered': '1808 μ.Χ.'},
	'21':{'energyLevels': ['2','8','9','2'], 'block': 'd', 'name': 'Σκάνδιο', 'shortName': 'Sc', 'discovered': '1879 μ.Χ.'},
	'22':{'energyLevels': ['2','8','10','2'], 'block': 'd', 'name': 'Τιτάνιο', 'shortName': 'Ti', 'discovered': '1791 μ.Χ.'},
	'23':{'energyLevels': ['2','8','11','2'], 'block': 'd', 'name': 'Βανάδιο', 'shortName': 'V', 'discovered': '1801 μ.Χ.'},
	'24':{'energyLevels': ['2','8','13','1'], 'block': 'd', 'name': 'Χρώμιο', 'shortName': 'Cr', 'discovered': '1797 μ.Χ.'},
	'25':{'energyLevels': ['2','8','13','2'], 'block': 'd', 'name': 'Μαγγάνιο', 'shortName': 'Mn', 'discovered': '1774 μ.Χ.'},
	'26':{'energyLevels': ['2','8','14','2'], 'block': 'd', 'name': 'Σίδηρος', 'shortName': 'Fe', 'discovered': '2000 π.Χ.'},
	'27':{'energyLevels': ['2','8','15','2'], 'block': 'd', 'name': 'Κοβάλτιο', 'shortName': 'Co', 'discovered': '1735 μ.Χ.'},
	'28':{'energyLevels': ['2','8','16','2'], 'block': 'd', 'name': 'Νικέλιο', 'shortName': 'Ni', 'discovered': '1751 μ.Χ.'},
	'29':{'energyLevels': ['2','8','18','1'], 'block': 'd', 'name': 'Χαλκός', 'shortName': 'Cu', 'discovered': '8000 π.Χ.'},
	'30':{'energyLevels': ['2','8','18','2'], 'block': 'd', 'name': 'Ψευδάργυρος', 'shortName': 'Zn', 'discovered': '1500 μ.Χ.'},
	'31':{'energyLevels': ['2','8','18','3'], 'block': 'p', 'name': 'Γάλλιο', 'shortName': 'Ga', 'discovered': '1875 μ.Χ.'},
	'32':{'energyLevels': ['2','8','18','4'], 'block': 'p', 'name': 'Γερμάνιο', 'shortName': 'Ge', 'discovered': '1886 μ.Χ.'},
	'33':{'energyLevels': ['2','8','18','5'], 'block': 'p', 'name': 'Αρσενικό', 'shortName': 'As', 'discovered': '1250 μ.Χ.'},
	'34':{'energyLevels': ['2','8','18','6'], 'block': 'p', 'name': 'Σελήνιο', 'shortName': 'Se', 'discovered': '1817 μ.Χ.'},
	'35':{'energyLevels': ['2','8','18','7'], 'block': 'p', 'name': 'Βρώμιο', 'shortName': 'Br', 'discovered': '1826 μ.Χ.'},
	'36':{'energyLevels': ['2','8','18','8'], 'block': 'p', 'name': 'Κρυπτό', 'shortName': 'Kr', 'discovered': '1898 μ.Χ.'},

	'37':{'energyLevels': ['2','8','18','8','1'], 'block': 's', 'name': 'Ρουβίδιο', 'shortName': 'Rb', 'discovered': '1861 μ.Χ.'},
	'38':{'energyLevels': ['2','8','18','8','2'], 'block': 's', 'name': 'Στρόντιο', 'shortName': 'Sr', 'discovered': '1790 μ.Χ.'},
	'39':{'energyLevels': ['2','8','18','9','2'], 'block': 'd', 'name': 'Ύττριο', 'shortName': 'Y', 'discovered': '1794 μ.Χ.'},
	'40':{'energyLevels': ['2','8','18','10','2'], 'block': 'd', 'name': 'Ζιρκόνιο', 'shortName': 'Zr', 'discovered': '1789 μ.Χ.'},
	'41':{'energyLevels': ['2','8','18','12','1'], 'block': 'd', 'name': 'Νιόβιο', 'shortName': 'Nb', 'discovered': '1801 μ.Χ.'},
	'42':{'energyLevels': ['2','8','18','13','1'], 'block': 'd', 'name': 'Μολυβδαίνιο', 'shortName': 'Mo', 'discovered': '1781 μ.Χ.'},
	'43':{'energyLevels': ['2','8','18','13','2'], 'block': 'd', 'name': 'Τεχνήτιο', 'shortName': 'Tc', 'discovered': '1937 μ.Χ.'},
	'44':{'energyLevels': ['2','8','18','15','1'], 'block': 'd', 'name': 'Ρουθήνιο', 'shortName': 'Ru', 'discovered': '1844 μ.Χ.'},
	'45':{'energyLevels': ['2','8','18','16','1'], 'block': 'd', 'name': 'Ρόδιο', 'shortName': 'Rh', 'discovered': '1803 μ.Χ.'},
	'46':{'energyLevels': ['2','8','18','18'], 'block': 'd', 'name': 'Παλλάδιο', 'shortName': 'Pd', 'discovered': '1803 μ.Χ.'},
	'47':{'energyLevels': ['2','8','18','18','1'], 'block': 'd', 'name': 'Άργυρος', 'shortName': 'Ag', 'discovered': '3000 π.Χ.'},
	'48':{'energyLevels': ['2','8','18','18','2'], 'block': 'd', 'name': 'Κάδμιο', 'shortName': 'Cd', 'discovered': '1817 μ.Χ.'},
	'49':{'energyLevels': ['2','8','18','18','3'], 'block': 'p', 'name': 'Ίνδιο', 'shortName': 'In', 'discovered': '1863 μ.Χ.'},
	'50':{'energyLevels': ['2','8','18','18','4'], 'block': 'p', 'name': 'Κασσίτερος', 'shortName': 'Sn', 'discovered': '3000 π.Χ.'},
	'51':{'energyLevels': ['2','8','18','18','5'], 'block': 'p', 'name': 'Αντιμόνιο', 'shortName': 'Sb', 'discovered': '3000 π.Χ.'},
	'52':{'energyLevels': ['2','8','18','18','6'], 'block': 'p', 'name': 'Τελλούριο', 'shortName': 'Te', 'discovered': '1783 μ.Χ.'},
	'53':{'energyLevels': ['2','8','18','18','7'], 'block': 'p', 'name': 'Ιώδιο', 'shortName': 'I', 'discovered': '1811 μ.Χ.'},
	'54':{'energyLevels': ['2','8','18','18','8'], 'block': 'p', 'name': 'Ξένο', 'shortName': 'Xe', 'discovered': '1898 μ.Χ.'},

	'55':{'energyLevels': ['2','8','18','18','8','1'], 'block': 's', 'name': 'Καίσιο', 'shortName': 'Cs', 'discovered': '1860 μ.Χ.'},
	'56':{'energyLevels': ['2','8','18','18','8','2'], 'block': 's', 'name': 'Βάριο', 'shortName': 'Ba', 'discovered': '1808 μ.Χ.'},
	'57':{'energyLevels': ['2','8','18','18','9','2'], 'block': 'f', 'name': 'Λανθάνιο', 'shortName': 'La', 'discovered': '1839 μ.Χ.'},
	'58':{'energyLevels': ['2','8','18','19','9','2'], 'block': 'f', 'name': 'Δημήτριο', 'shortName': 'Ce', 'discovered': '1803 μ.Χ.'},
	'59':{'energyLevels': ['2','8','18','21','8','2'], 'block': 'f', 'name': 'Πρασεοδύμιο', 'shortName': 'Pr', 'discovered': '1885 μ.Χ.'},
	'60':{'energyLevels': ['2','8','18','22','8','2'], 'block': 'f', 'name': 'Νεοδύμιο', 'shortName': 'Nd', 'discovered': '1885 μ.Χ.'},
	'61':{'energyLevels': ['2','8','18','23','8','2'], 'block': 'f', 'name': 'Προμήθειο', 'shortName': 'Pm', 'discovered': '1945 μ.Χ.'},
	'62':{'energyLevels': ['2','8','18','24','8','2'], 'block': 'f', 'name': 'Σαμάριο', 'shortName': 'Sm', 'discovered': '1879 μ.Χ.'},
	'63':{'energyLevels': ['2','8','18','25','8','2'], 'block': 'f', 'name': 'Ευρώπιο', 'shortName': 'Eu', 'discovered': '1901 μ.Χ.'},
	'64':{'energyLevels': ['2','8','18','25','9','2'], 'block': 'f', 'name': 'Γαδολίνιο', 'shortName': 'Gd', 'discovered': '1880 μ.Χ.'},
	'65':{'energyLevels': ['2','8','18','27','8','2'], 'block': 'f', 'name': 'Τέρβιο', 'shortName': 'Tb', 'discovered': '1843 μ.Χ.'},
	'66':{'energyLevels': ['2','8','18','28','8','2'], 'block': 'f', 'name': 'Δυσπρόσιο', 'shortName': 'Dy', 'discovered': '1886 μ.Χ.'},
	'67':{'energyLevels': ['2','8','18','29','8','2'], 'block': 'f', 'name': 'Όλμιο', 'shortName': 'Ho', 'discovered': '1878 μ.Χ.'},
	'68':{'energyLevels': ['2','8','18','30','8','2'], 'block': 'f', 'name': 'Έρβιο', 'shortName': 'Er', 'discovered': '1842 μ.Χ.'},
	'69':{'energyLevels': ['2','8','18','31','8','2'], 'block': 'f', 'name': 'Θούλιο', 'shortName': 'Tm', 'discovered': '1879 μ.Χ.'},
	'70':{'energyLevels': ['2','8','18','32','8','2'], 'block': 'f', 'name': 'Υττέρβιο', 'shortName': 'Yb', 'discovered': '1878 μ.Χ.'},
	'71':{'energyLevels': ['2','8','18','32','9','2'], 'block': 'd', 'name': 'Λουτήτιο', 'shortName': 'Lu', 'discovered': '1907 μ.Χ.'},
	'72':{'energyLevels': ['2','8','18','32','10','2'], 'block': 'd', 'name': 'Άφνιο', 'shortName': 'Hf', 'discovered': '1923 μ.Χ.'},
	'73':{'energyLevels': ['2','8','18','32','11','2'], 'block': 'd', 'name': 'Ταντάλιο', 'shortName': 'Ta', 'discovered': '1802 μ.Χ.'},
	'74':{'energyLevels': ['2','8','18','32','12','2'], 'block': 'd', 'name': 'Βολφράμιο', 'shortName': 'W', 'discovered': '1783 μ.Χ.'},
	'75':{'energyLevels': ['2','8','18','32','13','2'], 'block': 'd', 'name': 'Ρήνιο', 'shortName': 'Re', 'discovered': '1925 μ.Χ.'},
	'76':{'energyLevels': ['2','8','18','32','14','2'], 'block': 'd', 'name': 'Όσμιο', 'shortName': 'Os', 'discovered': '1803 μ.Χ.'},
	'77':{'energyLevels': ['2','8','18','32','15','2'], 'block': 'd', 'name': 'Ιρίδιο', 'shortName': 'Ir', 'discovered': '1803 μ.Χ.'},
	'78':{'energyLevels': ['2','8','18','32','17','1'], 'block': 'd', 'name': 'Λευκόχρυσος', 'shortName': 'Pt', 'discovered': '1735 μ.Χ.'},
	'79':{'energyLevels': ['2','8','18','32','18','1'], 'block': 'd', 'name': 'Χρυσός', 'shortName': 'Au', 'discovered': '2500 π.Χ.'},
	'80':{'energyLevels': ['2','8','18','32','18','2'], 'block': 'd', 'name': 'Υδράργυρος', 'shortName': 'Hg', 'discovered': '1500 π.Χ.'},
	'81':{'energyLevels': ['2','8','18','32','18','3'], 'block': 'p', 'name': 'Θάλλιο', 'shortName': 'Ti', 'discovered': '1861 μ.Χ.'},
	'82':{'energyLevels': ['2','8','18','32','18','4'], 'block': 'p', 'name': 'Μόλυβδος', 'shortName': 'Pb', 'discovered': '4000 π.Χ.'},
	'83':{'energyLevels': ['2','8','18','32','18','5'], 'block': 'p', 'name': 'Βισμούθιο', 'shortName': 'Bi', 'discovered': '1400 μ.Χ.'},
	'84':{'energyLevels': ['2','8','18','32','18','6'], 'block': 'p', 'name': 'Πολώνιο', 'shortName': 'Po', 'discovered': '1898 μ.Χ.'},
	'85':{'energyLevels': ['2','8','18','32','18','7'], 'block': 'p', 'name': 'Άστατο', 'shortName': 'At', 'discovered': '1940 μ.Χ.'},
	'86':{'energyLevels': ['2','8','18','32','18','8'], 'block': 'p', 'name': 'Ραδόνιο', 'shortName': 'Rn', 'discovered': '1900 μ.Χ.'},

	'87':{'energyLevels': ['2','8','18','32','18','8','1'], 'block': 's', 'name': 'Φράγκιο', 'shortName': 'Fr', 'discovered': '1939 μ.Χ.'},
	'88':{'energyLevels': ['2','8','18','32','18','8','2'], 'block': 's', 'name': 'Ράδιο', 'shortName': 'Ra', 'discovered': '1898 μ.Χ.'},
	'89':{'energyLevels': ['2','8','18','32','18','9','2'], 'block': 'f', 'name': 'Ακτίνιο', 'shortName': 'Ac', 'discovered': '1899 μ.Χ.', 'linkElementName': 'Ακτίνιο (στοιχείο)'},
	'90':{'energyLevels': ['2','8','18','32','18','10','2'], 'block': 'f', 'name': 'Θόριο', 'shortName': 'Th', 'discovered': '1829 μ.Χ.'},
	'91':{'energyLevels': ['2','8','18','32','20','9','2'], 'block': 'f', 'name': 'Πρωτακτίνιο', 'shortName': 'Pa', 'discovered': '1913 μ.Χ.'},
	'92':{'energyLevels': ['2','8','18','32','21','9','2'], 'block': 'f', 'name': 'Ουράνιο', 'shortName': 'U', 'discovered': '1789 μ.Χ.'},
	'93':{'energyLevels': ['2','8','18','32','22','9','2'], 'block': 'f', 'name': 'Ποσειδώνιο', 'shortName': 'Np', 'discovered': '1940 μ.Χ.'},
	'94':{'energyLevels': ['2','8','18','32','24','8','2'], 'block': 'f', 'name': 'Πλουτώνιο', 'shortName': 'Pu', 'discovered': '1940 μ.Χ.'},
	'95':{'energyLevels': ['2','8','18','32','25','8','2'], 'block': 'f', 'name': 'Αμερίκιο', 'shortName': 'Am', 'discovered': '1944 μ.Χ.'},
	'96':{'energyLevels': ['2','8','18','32','25','9','2'], 'block': 'f', 'name': 'Κιούριο', 'shortName': 'Cm', 'discovered': '1944 μ.Χ.'},
	'97':{'energyLevels': ['2','8','18','32','27','8','2'], 'block': 'f', 'name': 'Μπερκέλιο', 'shortName': 'Bk', 'discovered': '1949 μ.Χ.'},
	'98':{'energyLevels': ['2','8','18','32','28','8','2'], 'block': 'f', 'name': 'Καλιφόρνιο', 'shortName': 'Cf', 'discovered': '1950 μ.Χ.'},
	'99':{'energyLevels': ['2','8','18','32','29','8','2'], 'block': 'f', 'name': 'Αϊνσταΐνιο', 'shortName': 'Es', 'discovered': '1952 μ.Χ.'},
	'100':{'energyLevels': ['2','8','18','32','30','8','2'], 'block': 'f', 'name': 'Φέρμιο', 'shortName': 'Fm', 'discovered': '1952 μ.Χ.'},
	'101':{'energyLevels': ['2','8','18','32','31','8','2'], 'block': 'f', 'name': 'Μεντελέβιο', 'shortName': 'Md', 'discovered': '1955 μ.Χ.'},
	'102':{'energyLevels': ['2','8','18','32','32','8','2'], 'block': 'f', 'name': 'Νομπέλιο', 'shortName': 'No', 'discovered': '1958 μ.Χ.'},
	'103':{'energyLevels': ['2','8','18','32','32','8','3'], 'block': 'd', 'name': 'Λωρένσιο', 'shortName': 'Lr', 'discovered': '1961 μ.Χ.'},
	'104':{'energyLevels': ['2','8','18','32','32','10','2'], 'block': 'd', 'name': 'Ραδερφόρντιο', 'shortName': 'Rf', 'discovered': '1964 μ.Χ.'},
	'105':{'energyLevels': ['2','8','18','32','32','11','2'], 'block': 'd', 'name': 'Ντούμπνιο', 'shortName': 'Db', 'discovered': '1967 μ.Χ.'},
	'106':{'energyLevels': ['2','8','18','32','32','12','2'], 'block': 'd', 'name': 'Σιμπόργκιο', 'shortName': 'Sg', 'discovered': '1974 μ.Χ.'},
	'107':{'energyLevels': ['2','8','18','32','32','13','2'], 'block': 'd', 'name': 'Μπόριο', 'shortName': 'Bh', 'discovered': '1981 μ.Χ.'},
	'108':{'energyLevels': ['2','8','18','32','32','14','2'], 'block': 'd', 'name': 'Χάσιο', 'shortName': 'Hs', 'discovered': '1984 μ.Χ.'},
	'109':{'energyLevels': ['2','8','18','32','32','15','2'], 'block': 'd', 'name': 'Μαϊτνέριο', 'shortName': 'Mt', 'discovered': '1982 μ.Χ.'},
	'110':{'energyLevels': ['2','8','18','32','32','17','1'], 'block': 'd', 'name': 'Νταρμστάντιο', 'shortName': 'Ds', 'discovered': '1994 μ.Χ.'},
	'111':{'energyLevels': ['2','8','18','32','32','17','2'], 'block': 'd', 'name': 'Ρεντγκένιο', 'shortName': 'Rg', 'discovered': '1994 μ.Χ.'},
	'112':{'energyLevels': ['2','8','18','32','32','18','2'], 'block': 'd', 'name': 'Κοπερνίκιο', 'shortName': 'Cn', 'discovered': '1996 μ.Χ.'},
	'113':{'energyLevels': ['2','8','18','32','32','18','3'], 'block': 'p', 'name': 'Νιχόνιο', 'shortName': 'Nh', 'discovered': '2004 μ.Χ.'},
	'114':{'energyLevels': ['2','8','18','32','32','18','4'], 'block': 'p', 'name': 'Φλερόβιο', 'shortName': 'Fl', 'discovered': '1998 μ.Χ.'},
	'115':{'energyLevels': ['2','8','18','32','32','18','5'], 'block': 'p', 'name': 'Μοσκόβιο', 'shortName': 'Mc', 'discovered': '2004 μ.Χ.'},
	'116':{'energyLevels': ['2','8','18','32','32','18','6'], 'block': 'p', 'name': 'Λιβερμόριο', 'shortName': 'Lv', 'discovered': '2000 μ.Χ.'},
	'117':{'energyLevels': ['2','8','18','32','32','18','7'], 'block': 'p', 'name': 'Τενέσιο', 'shortName': 'Ts', 'discovered': '2010 μ.Χ.'},
	'118':{'energyLevels': ['2','8','18','32','32','18','8'], 'block': 'p', 'name': 'Ογκανέσσιο', 'shortName': 'Og', 'discovered': '2006 μ.Χ.'},
};

function energyLevel(elementName) {
	closeUp.querySelector('small').innerHTML = '';

	if (elementData.hasOwnProperty(elementName)) {

		var element = elementData[elementName];

		for (var i = 0; i < element.energyLevels.length; i++) {

			var spanElement = document.createElement('span');
			spanElement.textContent = (element.energyLevels[i]);
			closeUp.querySelector('small').appendChild(spanElement);
			//console.log('Energy Level ' + (i + 1) + ': ' + element.energyLevels[i]);
		}
	} else {
		console.log('Element with name "' + elementName + '" does not exist.');
	}
}

function generateAtom(atomicNumber) {
	const atomContainer = document.getElementById('atom');
	const atom = elementData[atomicNumber];
	if (!atom) {console.error('Atomic number not found in the data.'); return;}

	atomContainer.innerHTML = '<div class="atom"></div>';

	atom.energyLevels.forEach((numElectrons, index) => {
		const energyLevelDiv = document.createElement('div');
		const radius = (index + 2) * 9;
		const animationSpeed = radius / 2
		const xPos = '50%';
		const yPos = '50%';

		energyLevelDiv.classList.add('energy-level');
		energyLevelDiv.style.width = radius * 2 + 'px';
		energyLevelDiv.style.height = radius * 2 + 'px';
		energyLevelDiv.style.top = yPos;
		energyLevelDiv.style.left = xPos;
		energyLevelDiv.style.animation = `spin ${animationSpeed}s linear infinite`;
		atomContainer.appendChild(energyLevelDiv);

		for (let i = 0; i < numElectrons; i++) {
			const angle = (360 / numElectrons) * i - 90;
			const electron = document.createElement('div');
			electron.classList.add('electron');
			const electronX = radius * Math.cos(angle * Math.PI / 180) + radius - 5;
			const electronY = radius * Math.sin(angle * Math.PI / 180) + radius - 5;
			electron.style.top = electronY + 'px';
			electron.style.left = electronX + 'px';
			energyLevelDiv.appendChild(electron);
		}
	});
}

function showElementData(target) {
	const targetClasses = Array.from(target.classList);

	function update(onElement) {
		const atomic = closeUp.querySelector('.closeUp-atomic');
		const symbol = closeUp.querySelector('.closeUp-shortName');
		const name = closeUp.querySelector('.closeUp-name');
		const mass = closeUp.querySelector('.closeUp-mass');
					
		atomic.textContent = elementAtomicNumber;
		energyLevel(elementAtomicNumber);
		generateAtom(elementAtomicNumber)
		name.textContent = elementData[elementAtomicNumber].name;
					
		const allChildElements = onElement.children;//getChildrenElements(onElement);
		symbol.textContent = elementData[elementAtomicNumber].shortName;
		mass.textContent = allChildElements[3].textContent;
		closeUp.classList = [];
		closeUp.classList.add(onElement.classList[0]);
	}
	if (targetClasses.some(cls => classes.includes(cls))) {
		update(target);
	}
}
			
generateAtom('1');

function openLink(rowId) {
	var link = "https://el.wikipedia.org/wiki/" + elementData[rowId].name;

	window.open(link);
}

function openLinkInIframe(rowId) {
	const sitePopup = document.getElementById('sitePopup');
	//var link = "Files/ElementsPDF/" + elementData[rowId].name + ".pdf";
	//var link = "https://mozilla.github.io/pdf.js/web/viewer.html?file=https://el.wikipedia.org/api/rest_v1/page/pdf/" + elementData[rowId].name + "#view=Fit"
	//var link = "https://el.wikipedia.org/wiki/" + elementData[rowId].name;
	var link;
	if (elementData[rowId].linkElementName) {
		link = "https://mozilla.github.io/pdf.js/web/viewer.html?file=https://el.wikipedia.org/api/rest_v1/page/pdf/" + elementData[rowId].linkElementName + "#view=Fit";
	} else {
		link = "https://mozilla.github.io/pdf.js/web/viewer.html?file=https://el.wikipedia.org/api/rest_v1/page/pdf/" + elementData[rowId].name + "#view=Fit";
	}
	
	sitePopup.querySelector('iframe').src = link;
	
	sitePopup.style.display = "block";
	function closePopup(event) {
		sitePopup.querySelector('iframe').src = '';
		sitePopup.style.display = "none";
		sitePopup.querySelector('.close').removeEventListener('click', closePopup);
		//document.querySelector('#sitePopup').removeEventListener('click', closePopup);
	}
	sitePopup.querySelector('.close').addEventListener('click', closePopup);
	//document.querySelector('#sitePopup').addEventListener('click', closePopup);
}

//-----------------------------------------------------------------------------------------------

function elementClicked(clickedElement) {
	while (clickedElement !== null) {
		if (clickedElement.tagName === 'LI' && clickedElement.id !== 'ignore' && !clickedElement.classList.contains('empty')) {
			if (clickedElement.hasAttribute('data-linkedElement')) {
				elementAtomicNumber = clickedElement.getAttribute('data-linkedElement');
				showElementData(document.querySelector(`[data-atomic="${elementAtomicNumber}"]`));
				return;
			} else {
				elementAtomicNumber = clickedElement.getAttribute("data-atomic");
				showElementData(clickedElement);
				return;
			}
		}
		clickedElement = clickedElement.parentElement;
	}
}

document.getElementById('elements').addEventListener('click', function(event) {
	var clickedElement = event.target;
	const targetClasses = Array.from(clickedElement.classList);
	elementClicked(clickedElement);
});

closeUp.addEventListener('click', function(event) {
	infoElement()
});

function infoElement() {
	const infoPopup = document.getElementById('infoPopup');
	var element;
				
	if (typeof elementAtomicNumber !== 'undefined') {
		element = elementAtomicNumber;
	} else {
		element = '1';
	}
	function updateInfoPopup() {
		function copyCloseUp() {
			var clonedElement = closeUp.cloneNode(true);
			var closeUp2 = document.getElementById('CloseUp2');
			closeUp2.innerHTML = '';
			closeUp2.appendChild(clonedElement);
			return clonedElement
		}
		const closeUp2 = copyCloseUp()
					
		const name = infoPopup.querySelector('.popup-name');
		const atomic = infoPopup.querySelector('.popup-atomic');
		const energyLevels = infoPopup.querySelector('.popup-energyLevels');
		const discovered = infoPopup.querySelector('.popup-discovered');
		const block = infoPopup.querySelector('.popup-block');
		const elementClass = infoPopup.querySelector('.popup-class');
		const wikipediaLink = infoPopup.querySelector('.popup-wikipediaLink');
		const downloadPDF = infoPopup.querySelector('.popup-pdfDownload');

		var link = "https://el.wikipedia.org/wiki/" + elementData[element].name;
		var pdf = "https://el.wikipedia.org/api/rest_v1/page/pdf/" + elementData[element].name;
		
		name.innerHTML = elementData[element].name;
		atomic.innerHTML = element;
					
		energyLevels.innerHTML = elementData[element].energyLevels.join(', ');
		discovered.innerHTML = elementData[element].discovered;
		block.innerHTML = elementData[element].block + '-block';
		elementClass.innerHTML = closeUp2.classList[0];
					
		function wikipediaLinkOpen(event) {
			openLink(element);
		}
		
		function wikipediaIframeOpen(event) {
			openLinkInIframe(element);
		}
					
		function closePopup(event) {
			infoPopup.style.display = "none";
			wikipediaLink.href = "";
			downloadPDF.href = "";
			//wikipediaLink.removeEventListener('click', wikipediaLinkOpen);
			closeUp2.removeEventListener('click', wikipediaIframeOpen);
			infoPopup.querySelector('.close').removeEventListener('click', closePopup);
			//document.querySelector('#infoPopup').removeEventListener('click', closePopup);
		}
					
		//wikipediaLink.addEventListener('click', wikipediaLinkOpen);
		closeUp2.addEventListener('click', wikipediaIframeOpen);
		infoPopup.querySelector('.close').addEventListener('click', closePopup);
		wikipediaLink.href = link;
		downloadPDF.href = pdf;
		//document.querySelector('#infoPopup').addEventListener('click', closePopup);
	}
				
				
	infoPopup.style.display = "block";
	updateInfoPopup();
}
