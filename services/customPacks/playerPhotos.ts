/**
 * Player Faces & Photos Database (Player Faces Pack)
 * Provides authentic player portrait and face photos served via CDN / verified sources.
 */

import { COMMUNITY_PACK_CDN } from './argentineLogos';

export const PLAYER_FACES_CDN = `${COMMUNITY_PACK_CDN}/Players`;

// Mapeo por ID específico de jugador dentro del juego
export const PLAYER_PHOTOS_BY_ID: Record<number, string> = {
    // =========================================================================
    // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Manchester City (IDs 501 - 517)
    // =========================================================================
    501: 'https://images.fotmob.com/image_resources/playerimages/737066.png', // E. Haaland
    502: 'https://images.fotmob.com/image_resources/playerimages/169200.png', // K. De Bruyne
    503: 'https://images.fotmob.com/image_resources/playerimages/675088.png', // Rodri
    504: 'https://images.fotmob.com/image_resources/playerimages/815006.png', // P. Foden
    505: 'https://images.fotmob.com/image_resources/playerimages/614006.png', // R. Dias
    506: 'https://images.fotmob.com/image_resources/playerimages/957203.png', // Ederson
    507: 'https://images.fotmob.com/image_resources/playerimages/1070712.png', // J. Gvardiol
    508: 'https://images.fotmob.com/image_resources/playerimages/263653.png', // J. Stones
    509: 'https://images.fotmob.com/image_resources/playerimages/159833.png', // K. Walker
    510: 'https://images.fotmob.com/image_resources/playerimages/312765.png', // J. Grealish
    511: 'https://images.fotmob.com/image_resources/playerimages/178818.png', // I. Gündogan
    512: 'https://images.fotmob.com/image_resources/playerimages/488139.png', // B. Silva
    513: 'https://images.fotmob.com/image_resources/playerimages/521318.png', // M. Akanji
    514: 'https://images.fotmob.com/image_resources/playerimages/417068.png', // N. Aké
    515: 'https://images.fotmob.com/image_resources/playerimages/955529.png', // M. Nunes
    516: 'https://images.fotmob.com/image_resources/playerimages/276729.png', // S. Ortega
    517: 'https://images.fotmob.com/image_resources/playerimages/1174337.png', // Savinho

    // =========================================================================
    // 🇦🇷 Boca Juniors (IDs 70101 - 70119)
    // =========================================================================
    70101: 'https://images.fotmob.com/image_resources/playerimages/109060.png', // S. Romero
    70103: 'https://images.fotmob.com/image_resources/playerimages/1494947.png', // A. Anselmino
    70104: 'https://images.fotmob.com/image_resources/playerimages/161035.png', // M. Rojo
    70108: 'https://images.fotmob.com/image_resources/playerimages/190522.png', // L. Advíncula
    70110: 'https://images.fotmob.com/image_resources/playerimages/1201039.png', // K. Zenón
    70115: 'https://images.fotmob.com/image_resources/playerimages/49677.png', // E. Cavani
    70116: 'https://images.fotmob.com/image_resources/playerimages/826418.png', // M. Merentiel
    70117: 'https://images.fotmob.com/image_resources/playerimages/1110044.png', // E. Zeballos

    // =========================================================================
    // 🇦🇷 River Plate (IDs 70201 - 70219)
    // =========================================================================
    70201: 'https://images.fotmob.com/image_resources/playerimages/206758.png', // F. Armani
    70203: 'https://images.fotmob.com/image_resources/playerimages/186991.png', // G. Pezzella
    70204: 'https://images.fotmob.com/image_resources/playerimages/447556.png', // P. Díaz
    70205: 'https://images.fotmob.com/image_resources/playerimages/561187.png', // M. Acuña
    70206: 'https://images.fotmob.com/image_resources/playerimages/798148.png', // F. Bustos
    70211: 'https://images.fotmob.com/image_resources/playerimages/1902022.png', // I. Fernández (Nacho)
    70214: 'https://images.fotmob.com/image_resources/playerimages/210276.png', // M. Lanzini
    70215: 'https://images.fotmob.com/image_resources/playerimages/1607566.png', // C. Mastantuono
    70216: 'https://images.fotmob.com/image_resources/playerimages/1486264.png', // C. Echeverri
    70217: 'https://images.fotmob.com/image_resources/playerimages/281995.png', // M. Borja
    70218: 'https://images.fotmob.com/image_resources/playerimages/949735.png', // F. Colidio

    // =========================================================================
    // 🇦🇷 Racing Club (IDs 70301 - 70313)
    // =========================================================================
    70301: 'https://images.fotmob.com/image_resources/playerimages/210706.png', // G. Arias
    70310: 'https://images.fotmob.com/image_resources/playerimages/207617.png', // J. Quintero (Juanfer)
    70312: 'https://images.fotmob.com/image_resources/playerimages/882933.png', // A. Martínez (Maravilla)

    // =========================================================================
    // 🇦🇷 Independiente (IDs 70401 - 70412)
    // =========================================================================
    70401: 'https://images.fotmob.com/image_resources/playerimages/322964.png', // R. Rey
    70402: 'https://images.fotmob.com/image_resources/playerimages/1269385.png', // K. Lomónaco
    70403: 'https://images.fotmob.com/image_resources/playerimages/322966.png', // J. Laso
    70404: 'https://images.fotmob.com/image_resources/playerimages/1131112.png', // F. Loyola
    70405: 'https://images.fotmob.com/image_resources/playerimages/1004127.png', // D. Pérez
    70406: 'https://images.fotmob.com/image_resources/playerimages/226160.png', // I. Marcone
    70407: 'https://images.fotmob.com/image_resources/playerimages/226161.png', // F. Mancuello
    70408: 'https://images.fotmob.com/image_resources/playerimages/1221776.png', // L. González
    70409: 'https://images.fotmob.com/image_resources/playerimages/1458997.png', // D. Tarzia
    70410: 'https://images.fotmob.com/image_resources/playerimages/1244307.png', // S. Montiel
    70411: 'https://images.fotmob.com/image_resources/playerimages/680378.png', // G. Ávalos
    70412: 'https://images.fotmob.com/image_resources/playerimages/1075728.png', // M. Giménez

    // =========================================================================
    // 🇦🇷 San Lorenzo (IDs 70501 - 70511)
    // =========================================================================
    70501: 'https://images.fotmob.com/image_resources/playerimages/846670.png', // F. Altamirano
    70502: 'https://images.fotmob.com/image_resources/playerimages/680382.png', // G. Gómez
    70503: 'https://images.fotmob.com/image_resources/playerimages/1039862.png', // J. Romaña
    70504: 'https://images.fotmob.com/image_resources/playerimages/386052.png', // G. Campi
    70505: 'https://images.fotmob.com/image_resources/playerimages/990670.png', // M. Braida
    70506: 'https://images.fotmob.com/image_resources/playerimages/680383.png', // E. Remedi
    70507: 'https://images.fotmob.com/image_resources/playerimages/152774.png', // I. Muniain
    70508: 'https://images.fotmob.com/image_resources/playerimages/1458998.png', // E. Irala
    70509: 'https://images.fotmob.com/image_resources/playerimages/1221777.png', // I. Leguizamón
    70510: 'https://images.fotmob.com/image_resources/playerimages/1004132.png', // M. Reali
    70511: 'https://images.fotmob.com/image_resources/playerimages/1131113.png', // A. Cuello

    // =========================================================================
    // 🇦🇷 Estudiantes de La Plata (IDs 70601 - 70610)
    // =========================================================================
    70601: 'https://images.fotmob.com/image_resources/playerimages/846671.png', // M. Mansilla
    70602: 'https://images.fotmob.com/image_resources/playerimages/191285.png', // L. Lollo
    70603: 'https://images.fotmob.com/image_resources/playerimages/1131114.png', // F. Rodríguez
    70604: 'https://images.fotmob.com/image_resources/playerimages/1244308.png', // G. Benedetti
    70605: 'https://images.fotmob.com/image_resources/playerimages/74714.png', // E. Pérez (Enzo)
    70606: 'https://images.fotmob.com/image_resources/playerimages/680378.png', // S. Ascacíbar
    70607: 'https://images.fotmob.com/image_resources/playerimages/28549.png', // J. Sosa (Principito)
    70608: 'https://images.fotmob.com/image_resources/playerimages/1301038.png', // T. Palacios
    70609: 'https://images.fotmob.com/image_resources/playerimages/1039863.png', // E. Cetré
    70610: 'https://images.fotmob.com/image_resources/playerimages/226162.png', // G. Carrillo

    // =========================================================================
    // 🇦🇷 Vélez Sarsfield (IDs 70701 - 70710)
    // =========================================================================
    70701: 'https://images.fotmob.com/image_resources/playerimages/680384.png', // T. Marchiori
    70702: 'https://images.fotmob.com/image_resources/playerimages/1301039.png', // V. Gómez
    70703: 'https://images.fotmob.com/image_resources/playerimages/351479.png', // E. Mammana
    70704: 'https://images.fotmob.com/image_resources/playerimages/823027.png', // E. Gómez
    70705: 'https://images.fotmob.com/image_resources/playerimages/1458999.png', // C. Ordóñez
    70706: 'https://images.fotmob.com/image_resources/playerimages/570769.png', // A. Bouzat
    70707: 'https://images.fotmob.com/image_resources/playerimages/386050.png', // C. Aquino
    70708: 'https://images.fotmob.com/image_resources/playerimages/570770.png', // F. Pizzini
    70709: 'https://images.fotmob.com/image_resources/playerimages/1459000.png', // T. Fernández
    70710: 'https://images.fotmob.com/image_resources/playerimages/680379.png', // B. Romero

    // =========================================================================
    // 🇦🇷 Huracán (IDs 70801 - 70809)
    // =========================================================================
    70801: 'https://images.fotmob.com/image_resources/playerimages/183191.png', // H. Galíndez
    70802: 'https://images.fotmob.com/image_resources/playerimages/1004133.png', // F. Pereyra
    70803: 'https://images.fotmob.com/image_resources/playerimages/823028.png', // L. Carrizo
    70804: 'https://images.fotmob.com/image_resources/playerimages/1039864.png', // C. Ibáñez
    70805: 'https://images.fotmob.com/image_resources/playerimages/846672.png', // R. Echeverría
    70806: 'https://images.fotmob.com/image_resources/playerimages/680385.png', // F. Fattori
    70807: 'https://images.fotmob.com/image_resources/playerimages/1149467.png', // W. Alarcón
    70808: 'https://images.fotmob.com/image_resources/playerimages/990671.png', // W. Mazzantti
    70809: 'https://images.fotmob.com/image_resources/playerimages/266210.png', // R. Ábila (Wanchope)

    // =========================================================================
    // 🇦🇷 Rosario Central & Newell's (IDs 70901 - 71008)
    // =========================================================================
    70901: 'https://images.fotmob.com/image_resources/playerimages/226163.png', // J. Broun (Fatura)
    70902: 'https://images.fotmob.com/image_resources/playerimages/846673.png', // F. Mallo
    70903: 'https://images.fotmob.com/image_resources/playerimages/191286.png', // C. Quintana
    70904: 'https://images.fotmob.com/image_resources/playerimages/1149468.png', // A. Sández
    70907: 'https://images.fotmob.com/image_resources/playerimages/386051.png', // I. Malcorra
    70908: 'https://images.fotmob.com/image_resources/playerimages/1004130.png', // J. Campaz
    70909: 'https://images.fotmob.com/image_resources/playerimages/883575.png', // M. Copetti
    70910: 'https://images.fotmob.com/image_resources/playerimages/30982.png', // M. Ruben
    71001: 'https://images.fotmob.com/image_resources/playerimages/846674.png', // R. Macagno
    71002: 'https://images.fotmob.com/image_resources/playerimages/680386.png', // G. Velázquez
    71006: 'https://images.fotmob.com/image_resources/playerimages/30894.png', // É. Banega

    // =========================================================================
    // 🇦🇷 Talleres & Lanús (IDs 71101 - 71508)
    // =========================================================================
    71101: 'https://images.fotmob.com/image_resources/playerimages/680380.png', // G. Herrera
    71102: 'https://images.fotmob.com/image_resources/playerimages/494542.png', // M. Catalán
    71108: 'https://images.fotmob.com/image_resources/playerimages/183190.png', // R. Botta
    71110: 'https://images.fotmob.com/image_resources/playerimages/1004131.png', // F. Girotti
    71501: 'https://images.fotmob.com/image_resources/playerimages/680387.png', // N. Losada
    71502: 'https://images.fotmob.com/image_resources/playerimages/226164.png', // C. Izquierdoz
    71507: 'https://images.fotmob.com/image_resources/playerimages/152775.png', // E. Salvio (Toto)
    71508: 'https://images.fotmob.com/image_resources/playerimages/680381.png', // W. Bou

    // =========================================================================
    // 🇲🇽 Liga MX (IDs 110101 - 110812)
    // =========================================================================
    // Club América
    110101: 'https://images.fotmob.com/image_resources/playerimages/828751.png', // Luis Malagón
    110102: 'https://images.fotmob.com/image_resources/playerimages/883507.png', // Sebastián Cáceres
    110103: 'https://images.fotmob.com/image_resources/playerimages/1063625.png', // Israel Reyes
    110104: 'https://images.fotmob.com/image_resources/playerimages/864319.png', // Cristian Calderón
    110105: 'https://images.fotmob.com/image_resources/playerimages/807096.png', // Álvaro Fidalgo
    110106: 'https://images.fotmob.com/image_resources/playerimages/125219.png', // Jonathan dos Santos
    110107: 'https://images.fotmob.com/image_resources/playerimages/409941.png', // Diego Valdés
    110108: 'https://images.fotmob.com/image_resources/playerimages/841221.png', // Alejandro Zendejas
    110109: 'https://images.fotmob.com/image_resources/playerimages/520150.png', // Henry Martín
    110110: 'https://images.fotmob.com/image_resources/playerimages/922244.png', // Brian Rodríguez
    110111: 'https://images.fotmob.com/image_resources/playerimages/918070.png', // Javairô Dilrosun
    110112: 'https://images.fotmob.com/image_resources/playerimages/883569.png', // Kevin Álvarez

    // CD Guadalajara (Chivas)
    110201: 'https://images.fotmob.com/image_resources/playerimages/1221764.png', // Raúl Rangel
    110202: 'https://images.fotmob.com/image_resources/playerimages/1054366.png', // Gilberto Sepúlveda
    110203: 'https://images.fotmob.com/image_resources/playerimages/1301036.png', // Jesús Orozco Chiquete
    110204: 'https://images.fotmob.com/image_resources/playerimages/850550.png', // Alan Mozo
    110205: 'https://images.fotmob.com/image_resources/playerimages/846663.png', // Fernando Beltrán
    110206: 'https://images.fotmob.com/image_resources/playerimages/418386.png', // Érick Gutiérrez
    110207: 'https://images.fotmob.com/image_resources/playerimages/683709.png', // Víctor Guzmán
    110208: 'https://images.fotmob.com/image_resources/playerimages/805175.png', // Roberto Alvarado
    110209: 'https://images.fotmob.com/image_resources/playerimages/74712.png', // Chicharito Hernández
    110210: 'https://images.fotmob.com/image_resources/playerimages/1063624.png', // Cade Cowell

    // Cruz Azul
    110301: 'https://images.fotmob.com/image_resources/playerimages/1089201.png', // Kevin Mier
    110302: 'https://images.fotmob.com/image_resources/playerimages/685025.png', // Gonzalo Piovi
    110303: 'https://images.fotmob.com/image_resources/playerimages/896695.png', // Willer Ditta
    110304: 'https://images.fotmob.com/image_resources/playerimages/753383.png', // Jorge Sánchez
    110305: 'https://images.fotmob.com/image_resources/playerimages/486255.png', // Lorenzo Faravelli
    110306: 'https://images.fotmob.com/image_resources/playerimages/805183.png', // Carlos Rodríguez
    110307: 'https://images.fotmob.com/image_resources/playerimages/409940.png', // Ignacio Rivero
    110308: 'https://images.fotmob.com/image_resources/playerimages/1004125.png', // Carlos Rotondi
    110309: 'https://images.fotmob.com/image_resources/playerimages/680373.png', // Giorgos Giakoumakis
    110310: 'https://images.fotmob.com/image_resources/playerimages/322961.png', // Ángel Sepúlveda

    // Tigres UANL
    110401: 'https://images.fotmob.com/image_resources/playerimages/52026.png', // Nahuel Guzmán
    110402: 'https://images.fotmob.com/image_resources/playerimages/89006.png', // Guido Pizarro
    110404: 'https://images.fotmob.com/image_resources/playerimages/846664.png', // Jesús Angulo
    110405: 'https://images.fotmob.com/image_resources/playerimages/128362.png', // Rafael Carioca
    110406: 'https://images.fotmob.com/image_resources/playerimages/698711.png', // Fernando Gorriarán
    110407: 'https://images.fotmob.com/image_resources/playerimages/864320.png', // Juan Brunetta
    110408: 'https://images.fotmob.com/image_resources/playerimages/846665.png', // Diego Lainez
    110409: 'https://images.fotmob.com/image_resources/playerimages/30349.png', // André-Pierre Gignac
    110410: 'https://images.fotmob.com/image_resources/playerimages/805177.png', // Nicolás Ibáñez
    110411: 'https://images.fotmob.com/image_resources/playerimages/846666.png', // Sebastián Córdova

    // CF Monterrey
    110501: 'https://images.fotmob.com/image_resources/playerimages/183188.png', // Esteban Andrada
    110502: 'https://images.fotmob.com/image_resources/playerimages/183189.png', // Stefan Medina
    110503: 'https://images.fotmob.com/image_resources/playerimages/33423.png', // Héctor Moreno
    110504: 'https://images.fotmob.com/image_resources/playerimages/883570.png', // Gerardo Arteaga
    110506: 'https://images.fotmob.com/image_resources/playerimages/386047.png', // Óliver Torres
    110507: 'https://images.fotmob.com/image_resources/playerimages/169004.png', // Sergio Canales
    110508: 'https://images.fotmob.com/image_resources/playerimages/294711.png', // Lucas Ocampos
    110509: 'https://images.fotmob.com/image_resources/playerimages/896696.png', // Germán Berterame
    110510: 'https://images.fotmob.com/image_resources/playerimages/864321.png', // Brandon Vázquez

    // Toluca & Pachuca & Pumas
    110601: 'https://images.fotmob.com/image_resources/playerimages/266205.png', // Tiago Volpi
    110608: 'https://images.fotmob.com/image_resources/playerimages/742137.png', // Alexis Vega
    110609: 'https://images.fotmob.com/image_resources/playerimages/261070.png', // Paulinho
    110708: 'https://images.fotmob.com/image_resources/playerimages/680374.png', // Oussama Idrissi
    110709: 'https://images.fotmob.com/image_resources/playerimages/114947.png', // Salomón Rondón
    110808: 'https://images.fotmob.com/image_resources/playerimages/1004128.png', // César Huerta
};

// Mapeo por nombre de futbolista (insensible a mayúsculas y acentos)
export const PLAYER_PHOTOS_BY_NAME: Record<string, string> = {
    // Superestrellas Mundiales
    'lionel messi': 'https://images.fotmob.com/image_resources/playerimages/30981.png',
    'messi': 'https://images.fotmob.com/image_resources/playerimages/30981.png',
    'cristiano ronaldo': 'https://images.fotmob.com/image_resources/playerimages/30893.png',
    'cr7': 'https://images.fotmob.com/image_resources/playerimages/30893.png',
    'erling haaland': 'https://images.fotmob.com/image_resources/playerimages/737066.png',
    'e haaland': 'https://images.fotmob.com/image_resources/playerimages/737066.png',
    'haaland': 'https://images.fotmob.com/image_resources/playerimages/737066.png',
    'kevin de bruyne': 'https://images.fotmob.com/image_resources/playerimages/169200.png',
    'k de bruyne': 'https://images.fotmob.com/image_resources/playerimages/169200.png',
    'de bruyne': 'https://images.fotmob.com/image_resources/playerimages/169200.png',
    'rodri': 'https://images.fotmob.com/image_resources/playerimages/675088.png',
    'phil foden': 'https://images.fotmob.com/image_resources/playerimages/815006.png',
    'p foden': 'https://images.fotmob.com/image_resources/playerimages/815006.png',
    'foden': 'https://images.fotmob.com/image_resources/playerimages/815006.png',
    'ruben dias': 'https://images.fotmob.com/image_resources/playerimages/614006.png',
    'r dias': 'https://images.fotmob.com/image_resources/playerimages/614006.png',
    'rúben dias': 'https://images.fotmob.com/image_resources/playerimages/614006.png',
    'ederson': 'https://images.fotmob.com/image_resources/playerimages/957203.png',
    'josko gvardiol': 'https://images.fotmob.com/image_resources/playerimages/1070712.png',
    'joško gvardiol': 'https://images.fotmob.com/image_resources/playerimages/1070712.png',
    'j gvardiol': 'https://images.fotmob.com/image_resources/playerimages/1070712.png',
    'gvardiol': 'https://images.fotmob.com/image_resources/playerimages/1070712.png',
    'john stones': 'https://images.fotmob.com/image_resources/playerimages/263653.png',
    'j stones': 'https://images.fotmob.com/image_resources/playerimages/263653.png',
    'stones': 'https://images.fotmob.com/image_resources/playerimages/263653.png',
    'kyle walker': 'https://images.fotmob.com/image_resources/playerimages/159833.png',
    'k walker': 'https://images.fotmob.com/image_resources/playerimages/159833.png',
    'walker': 'https://images.fotmob.com/image_resources/playerimages/159833.png',
    'jack grealish': 'https://images.fotmob.com/image_resources/playerimages/312765.png',
    'j grealish': 'https://images.fotmob.com/image_resources/playerimages/312765.png',
    'grealish': 'https://images.fotmob.com/image_resources/playerimages/312765.png',
    'ilkay gundogan': 'https://images.fotmob.com/image_resources/playerimages/178818.png',
    'ilkay gündogan': 'https://images.fotmob.com/image_resources/playerimages/178818.png',
    'ilkay gündoğan': 'https://images.fotmob.com/image_resources/playerimages/178818.png',
    'i gundogan': 'https://images.fotmob.com/image_resources/playerimages/178818.png',
    'i gündogan': 'https://images.fotmob.com/image_resources/playerimages/178818.png',
    'gundogan': 'https://images.fotmob.com/image_resources/playerimages/178818.png',
    'gündogan': 'https://images.fotmob.com/image_resources/playerimages/178818.png',
    'bernardo silva': 'https://images.fotmob.com/image_resources/playerimages/488139.png',
    'b silva': 'https://images.fotmob.com/image_resources/playerimages/488139.png',
    'bernardo': 'https://images.fotmob.com/image_resources/playerimages/488139.png',
    'manuel akanji': 'https://images.fotmob.com/image_resources/playerimages/521318.png',
    'm akanji': 'https://images.fotmob.com/image_resources/playerimages/521318.png',
    'akanji': 'https://images.fotmob.com/image_resources/playerimages/521318.png',
    'nathan ake': 'https://images.fotmob.com/image_resources/playerimages/417068.png',
    'nathan aké': 'https://images.fotmob.com/image_resources/playerimages/417068.png',
    'n ake': 'https://images.fotmob.com/image_resources/playerimages/417068.png',
    'n aké': 'https://images.fotmob.com/image_resources/playerimages/417068.png',
    'ake': 'https://images.fotmob.com/image_resources/playerimages/417068.png',
    'aké': 'https://images.fotmob.com/image_resources/playerimages/417068.png',
    'matheus nunes': 'https://images.fotmob.com/image_resources/playerimages/955529.png',
    'm nunes': 'https://images.fotmob.com/image_resources/playerimages/955529.png',
    'stefan ortega': 'https://images.fotmob.com/image_resources/playerimages/276729.png',
    's ortega': 'https://images.fotmob.com/image_resources/playerimages/276729.png',
    'ortega': 'https://images.fotmob.com/image_resources/playerimages/276729.png',
    'savinho': 'https://images.fotmob.com/image_resources/playerimages/1174337.png',
    'savio': 'https://images.fotmob.com/image_resources/playerimages/1174337.png',
    'sávio': 'https://images.fotmob.com/image_resources/playerimages/1174337.png',
    'kylian mbappe': 'https://images.fotmob.com/image_resources/playerimages/701154.png',
    'kylian mbappé': 'https://images.fotmob.com/image_resources/playerimages/701154.png',
    'mbappe': 'https://images.fotmob.com/image_resources/playerimages/701154.png',
    'mbappé': 'https://images.fotmob.com/image_resources/playerimages/701154.png',
    'vinicius junior': 'https://images.fotmob.com/image_resources/playerimages/846033.png',
    'vinicius jr': 'https://images.fotmob.com/image_resources/playerimages/846033.png',
    'vinicius': 'https://images.fotmob.com/image_resources/playerimages/846033.png',
    'jude bellingham': 'https://images.fotmob.com/image_resources/playerimages/1077894.png',
    'bellingham': 'https://images.fotmob.com/image_resources/playerimages/1077894.png',
    'mohamed salah': 'https://images.fotmob.com/image_resources/playerimages/292462.png',
    'salah': 'https://images.fotmob.com/image_resources/playerimages/292462.png',
    'robert lewandowski': 'https://images.fotmob.com/image_resources/playerimages/93447.png',
    'lewandowski': 'https://images.fotmob.com/image_resources/playerimages/93447.png',
    'lamine yamal': 'https://images.fotmob.com/image_resources/playerimages/1467236.png',
    'yamal': 'https://images.fotmob.com/image_resources/playerimages/1467236.png',
    'bukayo saka': 'https://images.fotmob.com/image_resources/playerimages/961995.png',
    'saka': 'https://images.fotmob.com/image_resources/playerimages/961995.png',
    'cole palmer': 'https://images.fotmob.com/image_resources/playerimages/1096353.png',
    'palmer': 'https://images.fotmob.com/image_resources/playerimages/1096353.png',
    'lautaro martinez': 'https://images.fotmob.com/image_resources/playerimages/690230.png',
    'lautaro martínez': 'https://images.fotmob.com/image_resources/playerimages/690230.png',
    'lautaro': 'https://images.fotmob.com/image_resources/playerimages/690230.png',
    'julian alvarez': 'https://images.fotmob.com/image_resources/playerimages/974753.png',
    'julián álvarez': 'https://images.fotmob.com/image_resources/playerimages/974753.png',
    'alvarez': 'https://images.fotmob.com/image_resources/playerimages/974753.png',
    'álvarez': 'https://images.fotmob.com/image_resources/playerimages/974753.png',
    'emiliano martinez': 'https://images.fotmob.com/image_resources/playerimages/268375.png',
    'emiliano martínez': 'https://images.fotmob.com/image_resources/playerimages/268375.png',
    'dibu martinez': 'https://images.fotmob.com/image_resources/playerimages/268375.png',

    // Jugadores Liga Argentina - Boca Juniors
    'edinson cavani': 'https://images.fotmob.com/image_resources/playerimages/49677.png',
    'e cavani': 'https://images.fotmob.com/image_resources/playerimages/49677.png',
    'cavani': 'https://images.fotmob.com/image_resources/playerimages/49677.png',
    'miguel merentiel': 'https://images.fotmob.com/image_resources/playerimages/826418.png',
    'm merentiel': 'https://images.fotmob.com/image_resources/playerimages/826418.png',
    'merentiel': 'https://images.fotmob.com/image_resources/playerimages/826418.png',
    'kevin zenon': 'https://images.fotmob.com/image_resources/playerimages/1201039.png',
    'kevin zenón': 'https://images.fotmob.com/image_resources/playerimages/1201039.png',
    'k zenon': 'https://images.fotmob.com/image_resources/playerimages/1201039.png',
    'zenon': 'https://images.fotmob.com/image_resources/playerimages/1201039.png',
    'zenón': 'https://images.fotmob.com/image_resources/playerimages/1201039.png',
    'sergio romero': 'https://images.fotmob.com/image_resources/playerimages/109060.png',
    's romero': 'https://images.fotmob.com/image_resources/playerimages/109060.png',
    'chiquito romero': 'https://images.fotmob.com/image_resources/playerimages/109060.png',
    'luis advincula': 'https://images.fotmob.com/image_resources/playerimages/190522.png',
    'luis advíncula': 'https://images.fotmob.com/image_resources/playerimages/190522.png',
    'l advincula': 'https://images.fotmob.com/image_resources/playerimages/190522.png',
    'advincula': 'https://images.fotmob.com/image_resources/playerimages/190522.png',
    'advíncula': 'https://images.fotmob.com/image_resources/playerimages/190522.png',
    'marcos rojo': 'https://images.fotmob.com/image_resources/playerimages/161035.png',
    'm rojo': 'https://images.fotmob.com/image_resources/playerimages/161035.png',
    'aaron anselmino': 'https://images.fotmob.com/image_resources/playerimages/1494947.png',
    'a anselmino': 'https://images.fotmob.com/image_resources/playerimages/1494947.png',
    'anselmino': 'https://images.fotmob.com/image_resources/playerimages/1494947.png',
    'exequiel zeballos': 'https://images.fotmob.com/image_resources/playerimages/1110044.png',
    'e zeballos': 'https://images.fotmob.com/image_resources/playerimages/1110044.png',
    'changuito zeballos': 'https://images.fotmob.com/image_resources/playerimages/1110044.png',
    'changuito': 'https://images.fotmob.com/image_resources/playerimages/1110044.png',
    'zeballos': 'https://images.fotmob.com/image_resources/playerimages/1110044.png',

    // Jugadores Liga Argentina - River Plate
    'franco armani': 'https://images.fotmob.com/image_resources/playerimages/206758.png',
    'f armani': 'https://images.fotmob.com/image_resources/playerimages/206758.png',
    'armani': 'https://images.fotmob.com/image_resources/playerimages/206758.png',
    'german pezzella': 'https://images.fotmob.com/image_resources/playerimages/186991.png',
    'germán pezzella': 'https://images.fotmob.com/image_resources/playerimages/186991.png',
    'g pezzella': 'https://images.fotmob.com/image_resources/playerimages/186991.png',
    'pezzella': 'https://images.fotmob.com/image_resources/playerimages/186991.png',
    'marcos acuna': 'https://images.fotmob.com/image_resources/playerimages/561187.png',
    'marcos acuña': 'https://images.fotmob.com/image_resources/playerimages/561187.png',
    'm acuna': 'https://images.fotmob.com/image_resources/playerimages/561187.png',
    'm acuña': 'https://images.fotmob.com/image_resources/playerimages/561187.png',
    'huevo acuna': 'https://images.fotmob.com/image_resources/playerimages/561187.png',
    'huevo acuña': 'https://images.fotmob.com/image_resources/playerimages/561187.png',
    'acuna': 'https://images.fotmob.com/image_resources/playerimages/561187.png',
    'acuña': 'https://images.fotmob.com/image_resources/playerimages/561187.png',
    'paulo diaz': 'https://images.fotmob.com/image_resources/playerimages/447556.png',
    'paulo díaz': 'https://images.fotmob.com/image_resources/playerimages/447556.png',
    'p diaz': 'https://images.fotmob.com/image_resources/playerimages/447556.png',
    'p díaz': 'https://images.fotmob.com/image_resources/playerimages/447556.png',
    'fabricio bustos': 'https://images.fotmob.com/image_resources/playerimages/798148.png',
    'f bustos': 'https://images.fotmob.com/image_resources/playerimages/798148.png',
    'ignacio fernandez': 'https://images.fotmob.com/image_resources/playerimages/1902022.png',
    'i fernandez': 'https://images.fotmob.com/image_resources/playerimages/1902022.png',
    'nacho fernandez': 'https://images.fotmob.com/image_resources/playerimages/1902022.png',
    'nacho fernández': 'https://images.fotmob.com/image_resources/playerimages/1902022.png',
    'manuel lanzini': 'https://images.fotmob.com/image_resources/playerimages/210276.png',
    'm lanzini': 'https://images.fotmob.com/image_resources/playerimages/210276.png',
    'lanzini': 'https://images.fotmob.com/image_resources/playerimages/210276.png',
    'franco mastantuono': 'https://images.fotmob.com/image_resources/playerimages/1607566.png',
    'f mastantuono': 'https://images.fotmob.com/image_resources/playerimages/1607566.png',
    'mastantuono': 'https://images.fotmob.com/image_resources/playerimages/1607566.png',
    'claudio echeverri': 'https://images.fotmob.com/image_resources/playerimages/1486264.png',
    'c echeverri': 'https://images.fotmob.com/image_resources/playerimages/1486264.png',
    'diablito echeverri': 'https://images.fotmob.com/image_resources/playerimages/1486264.png',
    'echeverri': 'https://images.fotmob.com/image_resources/playerimages/1486264.png',
    'miguel borja': 'https://images.fotmob.com/image_resources/playerimages/281995.png',
    'm borja': 'https://images.fotmob.com/image_resources/playerimages/281995.png',
    'borja': 'https://images.fotmob.com/image_resources/playerimages/281995.png',
    'facundo colidio': 'https://images.fotmob.com/image_resources/playerimages/949735.png',
    'f colidio': 'https://images.fotmob.com/image_resources/playerimages/949735.png',
    'colidio': 'https://images.fotmob.com/image_resources/playerimages/949735.png',

    // Racing Club
    'gabriel arias': 'https://images.fotmob.com/image_resources/playerimages/210706.png',
    'g arias': 'https://images.fotmob.com/image_resources/playerimages/210706.png',
    'juan fernando quintero': 'https://images.fotmob.com/image_resources/playerimages/207617.png',
    'juanfer quintero': 'https://images.fotmob.com/image_resources/playerimages/207617.png',
    'j quintero': 'https://images.fotmob.com/image_resources/playerimages/207617.png',
    'juanfer': 'https://images.fotmob.com/image_resources/playerimages/207617.png',
    'adrian martinez': 'https://images.fotmob.com/image_resources/playerimages/882933.png',
    'adrián martínez': 'https://images.fotmob.com/image_resources/playerimages/882933.png',
    'a martinez': 'https://images.fotmob.com/image_resources/playerimages/882933.png',
    'a martínez': 'https://images.fotmob.com/image_resources/playerimages/882933.png',
    'maravilla martinez': 'https://images.fotmob.com/image_resources/playerimages/882933.png',
    'maravilla martínez': 'https://images.fotmob.com/image_resources/playerimages/882933.png',
    'maravilla': 'https://images.fotmob.com/image_resources/playerimages/882933.png',
    'maximiliano salas': 'https://images.fotmob.com/image_resources/playerimages/846668.png',
    'maxi salas': 'https://images.fotmob.com/image_resources/playerimages/846668.png',
    'm salas': 'https://images.fotmob.com/image_resources/playerimages/846668.png',
    'santiago sosa': 'https://images.fotmob.com/image_resources/playerimages/846669.png',
    's sosa': 'https://images.fotmob.com/image_resources/playerimages/846669.png',
    'agustin almendra': 'https://images.fotmob.com/image_resources/playerimages/883574.png',
    'a almendra': 'https://images.fotmob.com/image_resources/playerimages/883574.png',
    'almendra': 'https://images.fotmob.com/image_resources/playerimages/883574.png',
    'juan nardoni': 'https://images.fotmob.com/image_resources/playerimages/1221775.png',
    'j nardoni': 'https://images.fotmob.com/image_resources/playerimages/1221775.png',
    'nardoni': 'https://images.fotmob.com/image_resources/playerimages/1221775.png',

    // Independiente & San Lorenzo
    'rodrigo rey': 'https://images.fotmob.com/image_resources/playerimages/322964.png',
    'r rey': 'https://images.fotmob.com/image_resources/playerimages/322964.png',
    'ivan marcone': 'https://images.fotmob.com/image_resources/playerimages/226160.png',
    'i marcone': 'https://images.fotmob.com/image_resources/playerimages/226160.png',
    'marcone': 'https://images.fotmob.com/image_resources/playerimages/226160.png',
    'federico mancuello': 'https://images.fotmob.com/image_resources/playerimages/226161.png',
    'f mancuello': 'https://images.fotmob.com/image_resources/playerimages/226161.png',
    'mancuello': 'https://images.fotmob.com/image_resources/playerimages/226161.png',
    'iker muniain': 'https://images.fotmob.com/image_resources/playerimages/152774.png',
    'i muniain': 'https://images.fotmob.com/image_resources/playerimages/152774.png',
    'muniain': 'https://images.fotmob.com/image_resources/playerimages/152774.png',
    'malcom braida': 'https://images.fotmob.com/image_resources/playerimages/990670.png',
    'm braida': 'https://images.fotmob.com/image_resources/playerimages/990670.png',
    'braida': 'https://images.fotmob.com/image_resources/playerimages/990670.png',

    // Estudiantes & Vélez
    'enzo perez': 'https://images.fotmob.com/image_resources/playerimages/74714.png',
    'enzo pérez': 'https://images.fotmob.com/image_resources/playerimages/74714.png',
    'e perez': 'https://images.fotmob.com/image_resources/playerimages/74714.png',
    'e pérez': 'https://images.fotmob.com/image_resources/playerimages/74714.png',
    'santiago ascacibar': 'https://images.fotmob.com/image_resources/playerimages/680378.png',
    's ascacibar': 'https://images.fotmob.com/image_resources/playerimages/680378.png',
    'ascacibar': 'https://images.fotmob.com/image_resources/playerimages/680378.png',
    'jose sosa': 'https://images.fotmob.com/image_resources/playerimages/28549.png',
    'josé sosa': 'https://images.fotmob.com/image_resources/playerimages/28549.png',
    'j sosa': 'https://images.fotmob.com/image_resources/playerimages/28549.png',
    'principito sosa': 'https://images.fotmob.com/image_resources/playerimages/28549.png',
    'guido carrillo': 'https://images.fotmob.com/image_resources/playerimages/226162.png',
    'g carrillo': 'https://images.fotmob.com/image_resources/playerimages/226162.png',
    'carrillo': 'https://images.fotmob.com/image_resources/playerimages/226162.png',
    'claudio aquino': 'https://images.fotmob.com/image_resources/playerimages/386050.png',
    'c aquino': 'https://images.fotmob.com/image_resources/playerimages/386050.png',
    'aquino': 'https://images.fotmob.com/image_resources/playerimages/386050.png',
    'braian romero': 'https://images.fotmob.com/image_resources/playerimages/680379.png',
    'b romero': 'https://images.fotmob.com/image_resources/playerimages/680379.png',

    // Huracán, Central, Newell's, Talleres, Lanús
    'ever banega': 'https://images.fotmob.com/image_resources/playerimages/30894.png',
    'éver banega': 'https://images.fotmob.com/image_resources/playerimages/30894.png',
    'e banega': 'https://images.fotmob.com/image_resources/playerimages/30894.png',
    'banega': 'https://images.fotmob.com/image_resources/playerimages/30894.png',
    'jorge broun': 'https://images.fotmob.com/image_resources/playerimages/226163.png',
    'j broun': 'https://images.fotmob.com/image_resources/playerimages/226163.png',
    'fatura broun': 'https://images.fotmob.com/image_resources/playerimages/226163.png',
    'ignacio malcorra': 'https://images.fotmob.com/image_resources/playerimages/386051.png',
    'i malcorra': 'https://images.fotmob.com/image_resources/playerimages/386051.png',
    'malcorra': 'https://images.fotmob.com/image_resources/playerimages/386051.png',
    'jaminton campaz': 'https://images.fotmob.com/image_resources/playerimages/1004130.png',
    'j campaz': 'https://images.fotmob.com/image_resources/playerimages/1004130.png',
    'campaz': 'https://images.fotmob.com/image_resources/playerimages/1004130.png',
    'ruben botta': 'https://images.fotmob.com/image_resources/playerimages/183190.png',
    'r botta': 'https://images.fotmob.com/image_resources/playerimages/183190.png',
    'botta': 'https://images.fotmob.com/image_resources/playerimages/183190.png',
    'federico girotti': 'https://images.fotmob.com/image_resources/playerimages/1004131.png',
    'f girotti': 'https://images.fotmob.com/image_resources/playerimages/1004131.png',
    'girotti': 'https://images.fotmob.com/image_resources/playerimages/1004131.png',
    'eduardo salvio': 'https://images.fotmob.com/image_resources/playerimages/152775.png',
    'e salvio': 'https://images.fotmob.com/image_resources/playerimages/152775.png',
    'toto salvio': 'https://images.fotmob.com/image_resources/playerimages/152775.png',
    'salvio': 'https://images.fotmob.com/image_resources/playerimages/152775.png',
    'walter bou': 'https://images.fotmob.com/image_resources/playerimages/680381.png',
    'w bou': 'https://images.fotmob.com/image_resources/playerimages/680381.png',
    'ramon abila': 'https://images.fotmob.com/image_resources/playerimages/266210.png',
    'ramón ábila': 'https://images.fotmob.com/image_resources/playerimages/266210.png',
    'r abila': 'https://images.fotmob.com/image_resources/playerimages/266210.png',
    'wanchope abila': 'https://images.fotmob.com/image_resources/playerimages/266210.png',
    'wanchope': 'https://images.fotmob.com/image_resources/playerimages/266210.png',

    // Jugadores Liga MX
    'luis malagon': 'https://images.fotmob.com/image_resources/playerimages/828751.png',
    'malagon': 'https://images.fotmob.com/image_resources/playerimages/828751.png',
    'henry martin': 'https://images.fotmob.com/image_resources/playerimages/520150.png',
    'henry martín': 'https://images.fotmob.com/image_resources/playerimages/520150.png',
    'alvaro fidalgo': 'https://images.fotmob.com/image_resources/playerimages/807096.png',
    'fidalgo': 'https://images.fotmob.com/image_resources/playerimages/807096.png',
    'chicharito': 'https://images.fotmob.com/image_resources/playerimages/74712.png',
    'javier hernandez': 'https://images.fotmob.com/image_resources/playerimages/74712.png',
    'chicharito hernandez': 'https://images.fotmob.com/image_resources/playerimages/74712.png',
    'andre-pierre gignac': 'https://images.fotmob.com/image_resources/playerimages/30349.png',
    'gignac': 'https://images.fotmob.com/image_resources/playerimages/30349.png',
    'sergio canales': 'https://images.fotmob.com/image_resources/playerimages/169004.png',
    'canales': 'https://images.fotmob.com/image_resources/playerimages/169004.png',
    'lucas ocampos': 'https://images.fotmob.com/image_resources/playerimages/294711.png',
    'ocampos': 'https://images.fotmob.com/image_resources/playerimages/294711.png',
    'alexis vega': 'https://images.fotmob.com/image_resources/playerimages/742137.png',
    'salomon rondon': 'https://images.fotmob.com/image_resources/playerimages/114947.png',
    'rondon': 'https://images.fotmob.com/image_resources/playerimages/114947.png',
    'cesar huerta': 'https://images.fotmob.com/image_resources/playerimages/1004128.png',
    'chino huerta': 'https://images.fotmob.com/image_resources/playerimages/1004128.png',
    'roberto alvarado': 'https://images.fotmob.com/image_resources/playerimages/805175.png',
    'piojo alvarado': 'https://images.fotmob.com/image_resources/playerimages/805175.png',
    'kevin mier': 'https://images.fotmob.com/image_resources/playerimages/1089201.png',
    'nahuel guzman': 'https://images.fotmob.com/image_resources/playerimages/52026.png',
    'esteban andrada': 'https://images.fotmob.com/image_resources/playerimages/183188.png',

    // Nuevas Estrellas La Liga 2026
    'nico williams': 'https://images.fotmob.com/image_resources/playerimages/1221778.png',
    'n williams': 'https://images.fotmob.com/image_resources/playerimages/1221778.png',
    'inaki williams': 'https://images.fotmob.com/image_resources/playerimages/520152.png',
    'iñaki williams': 'https://images.fotmob.com/image_resources/playerimages/520152.png',
    'unai simon': 'https://images.fotmob.com/image_resources/playerimages/680387.png',
    'unai simón': 'https://images.fotmob.com/image_resources/playerimages/680387.png',
    'oihan sancet': 'https://images.fotmob.com/image_resources/playerimages/1004135.png',
    'sancet': 'https://images.fotmob.com/image_resources/playerimages/1004135.png',
    'dani olmo': 'https://images.fotmob.com/image_resources/playerimages/680388.png',
    'd olmo': 'https://images.fotmob.com/image_resources/playerimages/680388.png',
    'endrick': 'https://images.fotmob.com/image_resources/playerimages/1459002.png',
    'arda guler': 'https://images.fotmob.com/image_resources/playerimages/1301042.png',
    'arda güler': 'https://images.fotmob.com/image_resources/playerimages/1301042.png',
    'alexander sorloth': 'https://images.fotmob.com/image_resources/playerimages/570773.png',
    'alexander sørloth': 'https://images.fotmob.com/image_resources/playerimages/570773.png',
    'sorloth': 'https://images.fotmob.com/image_resources/playerimages/570773.png',
    'conor gallagher': 'https://images.fotmob.com/image_resources/playerimages/1039867.png',
    'c gallagher': 'https://images.fotmob.com/image_resources/playerimages/1039867.png',
    'takefusa kubo': 'https://images.fotmob.com/image_resources/playerimages/1004136.png',
    'kubo': 'https://images.fotmob.com/image_resources/playerimages/1004136.png',
    'mikel oyarzabal': 'https://images.fotmob.com/image_resources/playerimages/680389.png',
    'oyarzabal': 'https://images.fotmob.com/image_resources/playerimages/680389.png',
    'martin zubimendi': 'https://images.fotmob.com/image_resources/playerimages/1004137.png',
    'zubimendi': 'https://images.fotmob.com/image_resources/playerimages/1004137.png',
    'isco': 'https://images.fotmob.com/image_resources/playerimages/226164.png',
    'giovani lo celso': 'https://images.fotmob.com/image_resources/playerimages/680390.png',
    'lo celso': 'https://images.fotmob.com/image_resources/playerimages/680390.png',
    'vitor roque': 'https://images.fotmob.com/image_resources/playerimages/1459003.png',
    'alex baena': 'https://images.fotmob.com/image_resources/playerimages/1149470.png',
    'álex baena': 'https://images.fotmob.com/image_resources/playerimages/1149470.png',
    'baena': 'https://images.fotmob.com/image_resources/playerimages/1149470.png',
    'gerard moreno': 'https://images.fotmob.com/image_resources/playerimages/351482.png',
    'ayoze perez': 'https://images.fotmob.com/image_resources/playerimages/386054.png',
    'ayoze pérez': 'https://images.fotmob.com/image_resources/playerimages/386054.png',

    // Nuevas Estrellas Serie A 2026
    'marcus thuram': 'https://images.fotmob.com/image_resources/playerimages/680391.png',
    'thuram': 'https://images.fotmob.com/image_resources/playerimages/680391.png',
    'rafael leao': 'https://images.fotmob.com/image_resources/playerimages/990673.png',
    'rafael leão': 'https://images.fotmob.com/image_resources/playerimages/990673.png',
    'leao': 'https://images.fotmob.com/image_resources/playerimages/990673.png',
    'christian pulisic': 'https://images.fotmob.com/image_resources/playerimages/680392.png',
    'pulisic': 'https://images.fotmob.com/image_resources/playerimages/680392.png',
    'alvaro morata': 'https://images.fotmob.com/image_resources/playerimages/226165.png',
    'álvaro morata': 'https://images.fotmob.com/image_resources/playerimages/226165.png',
    'morata': 'https://images.fotmob.com/image_resources/playerimages/226165.png',
    'dusan vlahovic': 'https://images.fotmob.com/image_resources/playerimages/823030.png',
    'dušan vlahović': 'https://images.fotmob.com/image_resources/playerimages/823030.png',
    'vlahovic': 'https://images.fotmob.com/image_resources/playerimages/823030.png',
    'khvicha kvaratskhelia': 'https://images.fotmob.com/image_resources/playerimages/1004138.png',
    'kvaratskhelia': 'https://images.fotmob.com/image_resources/playerimages/1004138.png',
    'kvara': 'https://images.fotmob.com/image_resources/playerimages/1004138.png',
    'scott mctominay': 'https://images.fotmob.com/image_resources/playerimages/807097.png',
    'mctominay': 'https://images.fotmob.com/image_resources/playerimages/807097.png',
    'romelu lukaku': 'https://images.fotmob.com/image_resources/playerimages/169006.png',
    'lukaku': 'https://images.fotmob.com/image_resources/playerimages/169006.png',
    'ademola lookman': 'https://images.fotmob.com/image_resources/playerimages/742140.png',
    'lookman': 'https://images.fotmob.com/image_resources/playerimages/742140.png',
    'mateo retegui': 'https://images.fotmob.com/image_resources/playerimages/1004139.png',
    'retegui': 'https://images.fotmob.com/image_resources/playerimages/1004139.png',

    // Nuevas Estrellas Ligue 1 2026
    'bradley barcola': 'https://images.fotmob.com/image_resources/playerimages/1301043.png',
    'barcola': 'https://images.fotmob.com/image_resources/playerimages/1301043.png',
    'ousmane dembele': 'https://images.fotmob.com/image_resources/playerimages/680393.png',
    'ousmane dembélé': 'https://images.fotmob.com/image_resources/playerimages/680393.png',
    'dembele': 'https://images.fotmob.com/image_resources/playerimages/680393.png',
    'joao neves': 'https://images.fotmob.com/image_resources/playerimages/1459004.png',
    'joão neves': 'https://images.fotmob.com/image_resources/playerimages/1459004.png',
    'mason greenwood': 'https://images.fotmob.com/image_resources/playerimages/1004140.png',
    'greenwood': 'https://images.fotmob.com/image_resources/playerimages/1004140.png',
    'alexandre lacazette': 'https://images.fotmob.com/image_resources/playerimages/183193.png',
    'lacazette': 'https://images.fotmob.com/image_resources/playerimages/183193.png',

    // Nuevas Estrellas Premier League 2026
    'pedro neto': 'https://images.fotmob.com/image_resources/playerimages/846675.png',
    'joao felix': 'https://images.fotmob.com/image_resources/playerimages/990674.png',
    'joão félix': 'https://images.fotmob.com/image_resources/playerimages/990674.png',
    'matthijs de ligt': 'https://images.fotmob.com/image_resources/playerimages/742141.png',
    'de ligt': 'https://images.fotmob.com/image_resources/playerimages/742141.png',
    'joshua zirkzee': 'https://images.fotmob.com/image_resources/playerimages/1039868.png',
    'zirkzee': 'https://images.fotmob.com/image_resources/playerimages/1039868.png',
    'manuel ugarte': 'https://images.fotmob.com/image_resources/playerimages/1149471.png',
    'ugarte': 'https://images.fotmob.com/image_resources/playerimages/1149471.png',

    // Nuevas Estrellas Brasileirao 2026
    'memphis depay': 'https://images.fotmob.com/image_resources/playerimages/266212.png',
    'depay': 'https://images.fotmob.com/image_resources/playerimages/266212.png',
    'rodrigo garro': 'https://images.fotmob.com/image_resources/playerimages/1004141.png',
    'garro': 'https://images.fotmob.com/image_resources/playerimages/1004141.png',
    'thiago silva': 'https://images.fotmob.com/image_resources/playerimages/386055.png',
    'estevao': 'https://images.fotmob.com/image_resources/playerimages/1545622.png',
    'estêvão': 'https://images.fotmob.com/image_resources/playerimages/1545622.png',
    'luiz henrique': 'https://images.fotmob.com/image_resources/playerimages/1221779.png',
    'thiago almada': 'https://images.fotmob.com/image_resources/playerimages/1004142.png',
    'almada': 'https://images.fotmob.com/image_resources/playerimages/1004142.png',
    'cassio': 'https://images.fotmob.com/image_resources/playerimages/74716.png',
    'cássio': 'https://images.fotmob.com/image_resources/playerimages/74716.png',

    // Nuevas Estrellas Copa Libertadores 2026
    'arturo vidal': 'https://images.fotmob.com/image_resources/playerimages/37626.png',
    'vidal': 'https://images.fotmob.com/image_resources/playerimages/37626.png',
    'carlos palacios': 'https://images.fotmob.com/image_resources/playerimages/1004143.png',
    'alex arce': 'https://images.fotmob.com/image_resources/playerimages/1039869.png',
    'leonardo fernandez': 'https://images.fotmob.com/image_resources/playerimages/823031.png',
    'leo fernandez': 'https://images.fotmob.com/image_resources/playerimages/823031.png',
    'sebastian coates': 'https://images.fotmob.com/image_resources/playerimages/191287.png',
};
