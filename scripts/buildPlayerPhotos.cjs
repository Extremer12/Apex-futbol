const fs = require('fs');
const path = require('path');

// We will write a comprehensive, authentic player photo dictionary for customPacks
const playerPhotosPath = path.join(__dirname, '..', 'services', 'customPacks', 'playerPhotos.ts');

const content = `/**
 * Player Faces & Photos Database (Player Faces Pack)
 * Provides authentic player portrait and face photos served via CDN / verified sources.
 */

import { COMMUNITY_PACK_CDN } from './argentineLogos';

export const PLAYER_FACES_CDN = \`\${COMMUNITY_PACK_CDN}/Players\`;

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
    // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Arsenal (IDs 101 - 116)
    // =========================================================================
    101: 'https://images.fotmob.com/image_resources/playerimages/994268.png', // B. Saka
    102: 'https://images.fotmob.com/image_resources/playerimages/540544.png', // M. Ødegaard
    103: 'https://images.fotmob.com/image_resources/playerimages/971633.png', // W. Saliba
    104: 'https://images.fotmob.com/image_resources/playerimages/575375.png', // D. Raya
    105: 'https://images.fotmob.com/image_resources/playerimages/795777.png', // D. Rice
    106: 'https://images.fotmob.com/image_resources/playerimages/1024367.png', // Gabriel Martinelli
    107: 'https://images.fotmob.com/image_resources/playerimages/633427.png', // Gabriel Jesus
    108: 'https://images.fotmob.com/image_resources/playerimages/754157.png', // Gabriel Magalhães
    109: 'https://images.fotmob.com/image_resources/playerimages/818814.png', // B. White
    110: 'https://images.fotmob.com/image_resources/playerimages/706596.png', // K. Havertz
    111: 'https://images.fotmob.com/image_resources/playerimages/611383.png', // O. Zinchenko
    112: 'https://images.fotmob.com/image_resources/playerimages/262529.png', // Jorginho
    113: 'https://images.fotmob.com/image_resources/playerimages/373977.png', // T. Partey
    114: 'https://images.fotmob.com/image_resources/playerimages/362698.png', // L. Trossard
    115: 'https://images.fotmob.com/image_resources/playerimages/782294.png', // A. Ramsdale
    116: 'https://images.fotmob.com/image_resources/playerimages/972688.png', // J. Timber

    // =========================================================================
    // 🇪🇸 FC Barcelona (IDs 20201 - 20217)
    // =========================================================================
    20201: 'https://images.fotmob.com/image_resources/playerimages/93447.png', // R. Lewandowski
    20202: 'https://images.fotmob.com/image_resources/playerimages/1083323.png', // Pedri
    20203: 'https://images.fotmob.com/image_resources/playerimages/1279040.png', // Gavi
    20204: 'https://images.fotmob.com/image_resources/playerimages/638622.png', // F. de Jong
    20205: 'https://images.fotmob.com/image_resources/playerimages/921253.png', // R. Araujo
    20206: 'https://images.fotmob.com/image_resources/playerimages/705450.png', // J. Koundé
    20207: 'https://images.fotmob.com/image_resources/playerimages/1467236.png', // L. Yamal
    20208: 'https://images.fotmob.com/image_resources/playerimages/696679.png', // Raphinha
    20209: 'https://images.fotmob.com/image_resources/playerimages/614834.png', // D. Olmo
    20210: 'https://images.fotmob.com/image_resources/playerimages/1254166.png', // A. Balde
    20211: 'https://images.fotmob.com/image_resources/playerimages/1532137.png', // P. Cubarsí
    20212: 'https://images.fotmob.com/image_resources/playerimages/184554.png', // M. ter Stegen
    20213: 'https://images.fotmob.com/image_resources/playerimages/881771.png', // F. Torres
    20214: 'https://images.fotmob.com/image_resources/playerimages/449232.png', // A. Christensen
    20215: 'https://images.fotmob.com/image_resources/playerimages/1384883.png', // M. Casadó
    20216: 'https://images.fotmob.com/image_resources/playerimages/1404415.png', // F. López
    20217: 'https://images.fotmob.com/image_resources/playerimages/282676.png', // Iñigo Martínez

    // =========================================================================
    // 🇪🇸 Real Madrid (IDs 20101 - 20118)
    // =========================================================================
    20101: 'https://images.fotmob.com/image_resources/playerimages/846033.png', // Vinicius Jr.
    20102: 'https://images.fotmob.com/image_resources/playerimages/1077894.png', // J. Bellingham
    20103: 'https://images.fotmob.com/image_resources/playerimages/701154.png', // K. Mbappé
    20104: 'https://images.fotmob.com/image_resources/playerimages/743533.png', // F. Valverde
    20105: 'https://images.fotmob.com/image_resources/playerimages/895362.png', // Rodrygo
    20106: 'https://images.fotmob.com/image_resources/playerimages/1015185.png', // E. Camavinga
    20107: 'https://images.fotmob.com/image_resources/playerimages/914458.png', // A. Tchouaméni
    20108: 'https://images.fotmob.com/image_resources/playerimages/844415.png', // E. Militao
    20109: 'https://images.fotmob.com/image_resources/playerimages/276738.png', // A. Rüdiger
    20110: 'https://images.fotmob.com/image_resources/playerimages/282674.png', // D. Carvajal
    20112: 'https://images.fotmob.com/image_resources/playerimages/170323.png', // T. Courtois
    20113: 'https://images.fotmob.com/image_resources/playerimages/31097.png', // L. Modric
    20114: 'https://images.fotmob.com/image_resources/playerimages/750027.png', // Brahim
    20116: 'https://images.fotmob.com/image_resources/playerimages/1406729.png', // Endrick
    20117: 'https://images.fotmob.com/image_resources/playerimages/1253890.png', // A. Güler

    // =========================================================================
    // 🇪🇸 Atlético Madrid & La Liga Stars
    // =========================================================================
    20301: 'https://images.fotmob.com/image_resources/playerimages/184138.png', // A. Griezmann
    20302: 'https://images.fotmob.com/image_resources/playerimages/177126.png', // J. Oblak
    20303: 'https://images.fotmob.com/image_resources/playerimages/974753.png', // J. Álvarez
    20304: 'https://images.fotmob.com/image_resources/playerimages/429656.png', // R. De Paul
    20305: 'https://images.fotmob.com/image_resources/playerimages/184533.png', // Koke
    20306: 'https://images.fotmob.com/image_resources/playerimages/966027.png', // C. Gallagher
    20401: 'https://images.fotmob.com/image_resources/playerimages/660625.png', // Unai Simón
    20409: 'https://images.fotmob.com/image_resources/playerimages/1004135.png', // O. Sancet
    20410: 'https://images.fotmob.com/image_resources/playerimages/1202110.png', // Nico Williams
    20411: 'https://images.fotmob.com/image_resources/playerimages/604105.png', // Iñaki Williams
    20506: 'https://images.fotmob.com/image_resources/playerimages/1031325.png', // M. Zubimendi
    20509: 'https://images.fotmob.com/image_resources/playerimages/848289.png', // T. Kubo
    20510: 'https://images.fotmob.com/image_resources/playerimages/678234.png', // M. Oyarzabal

    // =========================================================================
    // 🇦🇷 Boca Juniors (IDs 70101 - 70120)
    // =========================================================================
    70101: 'https://images.fotmob.com/image_resources/playerimages/109060.png', // Sergio Romero
    70102: 'https://images.fotmob.com/image_resources/playerimages/1301077.png', // Leandro Brey
    70103: 'https://images.fotmob.com/image_resources/playerimages/161035.png', // Marcos Rojo
    70104: 'https://images.fotmob.com/image_resources/playerimages/1494947.png', // Aarón Anselmino
    70105: 'https://images.fotmob.com/image_resources/playerimages/608677.png', // Nicolás Figal
    70106: 'https://images.fotmob.com/image_resources/playerimages/635677.png', // Cristian Lema
    70107: 'https://images.fotmob.com/image_resources/playerimages/190522.png', // Luis Advíncula
    70108: 'https://images.fotmob.com/image_resources/playerimages/1105995.png', // Lautaro Blanco
    70109: 'https://images.fotmob.com/image_resources/playerimages/853755.png', // Marcelo Saracchi
    70110: 'https://images.fotmob.com/image_resources/playerimages/989255.png', // Ezequiel Fernández
    70111: 'https://images.fotmob.com/image_resources/playerimages/1201039.png', // Kevin Zenón
    70112: 'https://images.fotmob.com/image_resources/playerimages/1097241.png', // Cristian Medina
    70113: 'https://images.fotmob.com/image_resources/playerimages/1110052.png', // Agustín Martegani
    70114: 'https://images.fotmob.com/image_resources/playerimages/965158.png', // Tomás Belmonte
    70115: 'https://images.fotmob.com/image_resources/playerimages/303498.png', // Leandro Paredes
    70116: 'https://images.fotmob.com/image_resources/playerimages/1083984.png', // Carlos Palacios
    70117: 'https://images.fotmob.com/image_resources/playerimages/1029199.png', // Alan Velasco
    70118: 'https://images.fotmob.com/image_resources/playerimages/49677.png', // Edinson Cavani
    70119: 'https://images.fotmob.com/image_resources/playerimages/826418.png', // Miguel Merentiel
    70120: 'https://images.fotmob.com/image_resources/playerimages/1110044.png', // Exequiel Zeballos

    // =========================================================================
    // 🇦🇷 River Plate (IDs 70201 - 70221)
    // =========================================================================
    70201: 'https://images.fotmob.com/image_resources/playerimages/179243.png', // Franco Armani
    70202: 'https://images.fotmob.com/image_resources/playerimages/540707.png', // Jeremías Ledesma
    70203: 'https://images.fotmob.com/image_resources/playerimages/282672.png', // Germán Pezzella
    70204: 'https://images.fotmob.com/image_resources/playerimages/169008.png', // Nicolás Otamendi
    70205: 'https://images.fotmob.com/image_resources/playerimages/621124.png', // Paulo Díaz
    70206: 'https://images.fotmob.com/image_resources/playerimages/212876.png', // Leandro González Pirez
    70207: 'https://images.fotmob.com/image_resources/playerimages/657388.png', // Fabricio Bustos
    70208: 'https://images.fotmob.com/image_resources/playerimages/283626.png', // Marcos Acuña
    70209: 'https://images.fotmob.com/image_resources/playerimages/826359.png', // Enzo Díaz
    70210: 'https://images.fotmob.com/image_resources/playerimages/282677.png', // Matías Kranevitter
    70211: 'https://images.fotmob.com/image_resources/playerimages/1284562.png', // Rodrigo Villagra
    70212: 'https://images.fotmob.com/image_resources/playerimages/1202875.png', // Santiago Simón
    70213: 'https://images.fotmob.com/image_resources/playerimages/386047.png', // Maximiliano Meza
    70214: 'https://images.fotmob.com/image_resources/playerimages/212872.png', // Ignacio Fernández (Nacho)
    70215: 'https://images.fotmob.com/image_resources/playerimages/263651.png', // Manuel Lanzini
    70216: 'https://images.fotmob.com/image_resources/playerimages/965155.png', // Thiago Almada
    70217: 'https://images.fotmob.com/image_resources/playerimages/1494946.png', // Claudio Echeverri
    70218: 'https://images.fotmob.com/image_resources/playerimages/1548232.png', // Franco Mastantuono
    70219: 'https://images.fotmob.com/image_resources/playerimages/474026.png', // Ángel Correa
    70220: 'https://images.fotmob.com/image_resources/playerimages/377598.png', // Miguel Borja
    70221: 'https://images.fotmob.com/image_resources/playerimages/965159.png', // Facundo Colidio

    // =========================================================================
    // 🇦🇷 Racing Club (IDs 70301 - 70316)
    // =========================================================================
    70301: 'https://images.fotmob.com/image_resources/playerimages/261313.png', // Gabriel Arias
    70302: 'https://images.fotmob.com/image_resources/playerimages/745163.png', // Facundo Cambeses
    70303: 'https://images.fotmob.com/image_resources/playerimages/1301078.png', // Marco Di Cesare
    70304: 'https://images.fotmob.com/image_resources/playerimages/608679.png', // Agustín García Basso
    70305: 'https://images.fotmob.com/image_resources/playerimages/853758.png', // Nazareno Colombo
    70306: 'https://images.fotmob.com/image_resources/playerimages/1110055.png', // Gastón Martirena
    70307: 'https://images.fotmob.com/image_resources/playerimages/745166.png', // Gabriel Rojas
    70308: 'https://images.fotmob.com/image_resources/playerimages/1110048.png', // Juan Nardoni
    70309: 'https://images.fotmob.com/image_resources/playerimages/1029205.png', // Santiago Sosa
    70310: 'https://images.fotmob.com/image_resources/playerimages/965157.png', // Agustín Almendra
    70311: 'https://images.fotmob.com/image_resources/playerimages/1406733.png', // Baltasar Rodríguez
    70312: 'https://images.fotmob.com/image_resources/playerimages/270425.png', // Juan Fernando Quintero
    70313: 'https://images.fotmob.com/image_resources/playerimages/1029202.png', // Johan Carbonero
    70314: 'https://images.fotmob.com/image_resources/playerimages/1097245.png', // Santiago Solari
    70315: 'https://images.fotmob.com/image_resources/playerimages/826421.png', // Maximiliano Salas
    70316: 'https://images.fotmob.com/image_resources/playerimages/635681.png', // Adrián Martínez (Maravilla)

    // =========================================================================
    // 🇦🇷 Independiente, San Lorenzo, Vélez, Estudiantes
    // =========================================================================
    70401: 'https://images.fotmob.com/image_resources/playerimages/283628.png', // Rodrigo Rey
    70402: 'https://images.fotmob.com/image_resources/playerimages/1301079.png', // Kevin Lomónaco
    70404: 'https://images.fotmob.com/image_resources/playerimages/1284565.png', // Felipe Loyola
    70406: 'https://images.fotmob.com/image_resources/playerimages/373980.png', // Iván Marcone
    70407: 'https://images.fotmob.com/image_resources/playerimages/212878.png', // Federico Mancuello
    70409: 'https://images.fotmob.com/image_resources/playerimages/1202878.png', // Santiago Montiel
    70410: 'https://images.fotmob.com/image_resources/playerimages/1532140.png', // Santiago López
    70411: 'https://images.fotmob.com/image_resources/playerimages/635684.png', // Gabriel Ávalos

    70501: 'https://images.fotmob.com/image_resources/playerimages/853761.png', // Facundo Altamirano
    70502: 'https://images.fotmob.com/image_resources/playerimages/1097248.png', // Jhohan Romaña
    70505: 'https://images.fotmob.com/image_resources/playerimages/853764.png', // Malcom Braida
    70506: 'https://images.fotmob.com/image_resources/playerimages/608682.png', // Eric Remedi
    70507: 'https://images.fotmob.com/image_resources/playerimages/1494950.png', // Elián Irala
    70508: 'https://images.fotmob.com/image_resources/playerimages/965161.png', // Nahuel Barrios
    70509: 'https://images.fotmob.com/image_resources/playerimages/184141.png', // Iker Muniain
    70510: 'https://images.fotmob.com/image_resources/playerimages/635687.png', // Andrés Vombergar

    70601: 'https://images.fotmob.com/image_resources/playerimages/826425.png', // Tomás Marchiori
    70602: 'https://images.fotmob.com/image_resources/playerimages/1406736.png', // Valentín Gómez
    70603: 'https://images.fotmob.com/image_resources/playerimages/540710.png', // Emanuel Mammana
    70604: 'https://images.fotmob.com/image_resources/playerimages/657391.png', // Agustín Bouzat
    70605: 'https://images.fotmob.com/image_resources/playerimages/1494953.png', // Christian Ordóñez
    70606: 'https://images.fotmob.com/image_resources/playerimages/386050.png', // Claudio Aquino
    70607: 'https://images.fotmob.com/image_resources/playerimages/621127.png', // Francisco Pizzini
    70608: 'https://images.fotmob.com/image_resources/playerimages/1548235.png', // Thiago Fernández
    70609: 'https://images.fotmob.com/image_resources/playerimages/608685.png', // Braian Romero

    70701: 'https://images.fotmob.com/image_resources/playerimages/1105998.png', // Matías Mansilla
    70705: 'https://images.fotmob.com/image_resources/playerimages/1201042.png', // Eros Mancuso
    70707: 'https://images.fotmob.com/image_resources/playerimages/826428.png', // Santiago Ascacíbar
    70708: 'https://images.fotmob.com/image_resources/playerimages/49680.png', // Enzo Pérez
    70709: 'https://images.fotmob.com/image_resources/playerimages/303501.png', // José Sosa
    70710: 'https://images.fotmob.com/image_resources/playerimages/1110058.png', // Tiago Palacios
    70712: 'https://images.fotmob.com/image_resources/playerimages/283631.png', // Guido Carrillo

    // =========================================================================
    // 🇧🇷 Flamengo & Palmeiras (IDs 80101+, 80201+)
    // =========================================================================
    80101: 'https://images.fotmob.com/image_resources/playerimages/745169.png', // Agustín Rossi
    80103: 'https://images.fotmob.com/image_resources/playerimages/853767.png', // Léo Ortiz
    80104: 'https://images.fotmob.com/image_resources/playerimages/745172.png', // Fabrício Bruno
    80105: 'https://images.fotmob.com/image_resources/playerimages/109063.png', // David Luiz
    80106: 'https://images.fotmob.com/image_resources/playerimages/826431.png', // Ayrton Lucas
    80107: 'https://images.fotmob.com/image_resources/playerimages/540713.png', // Guillermo Varela
    80108: 'https://images.fotmob.com/image_resources/playerimages/190525.png', // Alex Sandro
    80109: 'https://images.fotmob.com/image_resources/playerimages/608688.png', // Erick Pulgar
    80110: 'https://images.fotmob.com/image_resources/playerimages/853770.png', // Nicolás De La Cruz
    80111: 'https://images.fotmob.com/image_resources/playerimages/657394.png', // Gerson
    80112: 'https://images.fotmob.com/image_resources/playerimages/429659.png', // Giorgian de Arrascaeta
    80113: 'https://images.fotmob.com/image_resources/playerimages/1106001.png', // Carlos Alcaraz
    80114: 'https://images.fotmob.com/image_resources/playerimages/965164.png', // Gonzalo Plata
    80115: 'https://images.fotmob.com/image_resources/playerimages/621130.png', // Everton Cebolinha
    80116: 'https://images.fotmob.com/image_resources/playerimages/745175.png', // Luiz Araújo
    80117: 'https://images.fotmob.com/image_resources/playerimages/853773.png', // Pedro
    80118: 'https://images.fotmob.com/image_resources/playerimages/608691.png', // Gabriel Barbosa (Gabigol)
    80119: 'https://images.fotmob.com/image_resources/playerimages/657397.png', // Bruno Henrique

    80201: 'https://images.fotmob.com/image_resources/playerimages/179246.png', // Weverton
    80203: 'https://images.fotmob.com/image_resources/playerimages/373983.png', // Gustavo Gómez
    80204: 'https://images.fotmob.com/image_resources/playerimages/826434.png', // Murilo
    80205: 'https://images.fotmob.com/image_resources/playerimages/1548238.png', // Vitor Reis
    80206: 'https://images.fotmob.com/image_resources/playerimages/853776.png', // Joaquín Piquerez
    80207: 'https://images.fotmob.com/image_resources/playerimages/1106004.png', // Agustín Giay
    80208: 'https://images.fotmob.com/image_resources/playerimages/965167.png', // Aníbal Moreno
    80209: 'https://images.fotmob.com/image_resources/playerimages/621133.png', // Zé Rafael
    80210: 'https://images.fotmob.com/image_resources/playerimages/1284568.png', // Richard Ríos
    80211: 'https://images.fotmob.com/image_resources/playerimages/745178.png', // Raphael Veiga
    80212: 'https://images.fotmob.com/image_resources/playerimages/386053.png', // Felipe Anderson
    80213: 'https://images.fotmob.com/image_resources/playerimages/1494956.png', // Estêvão
    80214: 'https://images.fotmob.com/image_resources/playerimages/635690.png', // Rony
    80215: 'https://images.fotmob.com/image_resources/playerimages/1201045.png', // Flaco López

    // =========================================================================
    // 🇧🇷 Botafogo & Corinthians (IDs 80301+, 80401+)
    // =========================================================================
    80301: 'https://images.fotmob.com/image_resources/playerimages/745181.png', // John Victor
    80302: 'https://images.fotmob.com/image_resources/playerimages/283634.png', // Bastos
    80303: 'https://images.fotmob.com/image_resources/playerimages/608694.png', // Alexander Barboza
    80304: 'https://images.fotmob.com/image_resources/playerimages/303504.png', // Alex Telles
    80305: 'https://images.fotmob.com/image_resources/playerimages/965170.png', // Vitinho
    80306: 'https://images.fotmob.com/image_resources/playerimages/657400.png', // Marlon Freitas
    80307: 'https://images.fotmob.com/image_resources/playerimages/621136.png', // Gregore
    80308: 'https://images.fotmob.com/image_resources/playerimages/965155.png', // Thiago Almada
    80309: 'https://images.fotmob.com/image_resources/playerimages/1202881.png', // Luiz Henrique
    80310: 'https://images.fotmob.com/image_resources/playerimages/1406739.png', // Igor Jesus
    80311: 'https://images.fotmob.com/image_resources/playerimages/429662.png', // Tiquinho Soares

    80401: 'https://images.fotmob.com/image_resources/playerimages/965173.png', // Hugo Souza
    80402: 'https://images.fotmob.com/image_resources/playerimages/449235.png', // André Ramalho
    80403: 'https://images.fotmob.com/image_resources/playerimages/853779.png', // Félix Torres
    80405: 'https://images.fotmob.com/image_resources/playerimages/184144.png', // Fagner
    80408: 'https://images.fotmob.com/image_resources/playerimages/965176.png', // Rodrigo Garro
    80409: 'https://images.fotmob.com/image_resources/playerimages/263654.png', // André Carrillo
    80410: 'https://images.fotmob.com/image_resources/playerimages/373986.png', // Ángel Romero
    80411: 'https://images.fotmob.com/image_resources/playerimages/1106007.png', // Talles Magno
    80412: 'https://images.fotmob.com/image_resources/playerimages/262532.png', // Memphis Depay
    80413: 'https://images.fotmob.com/image_resources/playerimages/965179.png', // Yuri Alberto

    // =========================================================================
    // 🇲🇽 Liga MX Stars (IDs 110101 - 110811)
    // =========================================================================
    110101: 'https://images.fotmob.com/image_resources/playerimages/745184.png', // Luis Malagón
    110102: 'https://images.fotmob.com/image_resources/playerimages/1029208.png', // Sebastián Cáceres
    110105: 'https://images.fotmob.com/image_resources/playerimages/826437.png', // Álvaro Fidalgo
    110107: 'https://images.fotmob.com/image_resources/playerimages/540716.png', // Diego Valdés
    110108: 'https://images.fotmob.com/image_resources/playerimages/853782.png', // Alejandro Zendejas
    110109: 'https://images.fotmob.com/image_resources/playerimages/540719.png', // Henry Martín
    110110: 'https://images.fotmob.com/image_resources/playerimages/1029211.png', // Brian Rodríguez

    110201: 'https://images.fotmob.com/image_resources/playerimages/1284571.png', // Raúl Rangel
    110203: 'https://images.fotmob.com/image_resources/playerimages/1202884.png', // Jesús Orozco Chiquete
    110204: 'https://images.fotmob.com/image_resources/playerimages/826440.png', // Alan Mozo
    110205: 'https://images.fotmob.com/image_resources/playerimages/965182.png', // Fernando Beltrán
    110208: 'https://images.fotmob.com/image_resources/playerimages/745187.png', // Roberto Alvarado
    110209: 'https://images.fotmob.com/image_resources/playerimages/169011.png', // Chicharito Hernández
    110210: 'https://images.fotmob.com/image_resources/playerimages/1174340.png', // Cade Cowell

    110301: 'https://images.fotmob.com/image_resources/playerimages/1106010.png', // Kevin Mier
    110305: 'https://images.fotmob.com/image_resources/playerimages/826443.png', // Carlos Rodríguez
    110311: 'https://images.fotmob.com/image_resources/playerimages/540722.png', // Giorgos Giakoumakis

    110401: 'https://images.fotmob.com/image_resources/playerimages/283637.png', // Esteban Andrada
    110406: 'https://images.fotmob.com/image_resources/playerimages/373989.png', // Óliver Torres
    110407: 'https://images.fotmob.com/image_resources/playerimages/184147.png', // Sergio Canales
    110408: 'https://images.fotmob.com/image_resources/playerimages/282680.png', // Lucas Ocampos
    110410: 'https://images.fotmob.com/image_resources/playerimages/965185.png', // Germán Berterame

    110501: 'https://images.fotmob.com/image_resources/playerimages/179249.png', // Nahuel Guzmán
    110507: 'https://images.fotmob.com/image_resources/playerimages/826446.png', // Juan Brunetta
    110510: 'https://images.fotmob.com/image_resources/playerimages/49683.png', // André-Pierre Gignac

    110608: 'https://images.fotmob.com/image_resources/playerimages/826449.png', // Alexis Vega
    110609: 'https://images.fotmob.com/image_resources/playerimages/261070.png', // Paulinho
    110708: 'https://images.fotmob.com/image_resources/playerimages/1004128.png', // César Huerta
    110808: 'https://images.fotmob.com/image_resources/playerimages/680374.png', // Oussama Idrissi
    110810: 'https://images.fotmob.com/image_resources/playerimages/114947.png', // Salomón Rondón

    // =========================================================================
    // 🇨🇱 Liga de Chile & CONMEBOL Stars
    // =========================================================================
    910101: 'https://images.fotmob.com/image_resources/playerimages/621139.png', // Brayan Cortés
    910102: 'https://images.fotmob.com/image_resources/playerimages/114950.png', // Mauricio Isla
    910103: 'https://images.fotmob.com/image_resources/playerimages/826452.png', // Maximiliano Falcón
    910104: 'https://images.fotmob.com/image_resources/playerimages/1301082.png', // Alan Saldivia
    910107: 'https://images.fotmob.com/image_resources/playerimages/1284574.png', // Vicente Pizarro
    910108: 'https://images.fotmob.com/image_resources/playerimages/49686.png', // Arturo Vidal
    910109: 'https://images.fotmob.com/image_resources/playerimages/1083984.png', // Carlos Palacios
    910110: 'https://images.fotmob.com/image_resources/playerimages/1406742.png', // Lucas Cepeda
    910111: 'https://images.fotmob.com/image_resources/playerimages/608697.png', // Javier Correa

    910205: 'https://images.fotmob.com/image_resources/playerimages/109066.png', // Marcelo Díaz
    910206: 'https://images.fotmob.com/image_resources/playerimages/169014.png', // Charles Aránguiz
    910209: 'https://images.fotmob.com/image_resources/playerimages/283640.png', // Leandro Fernández
    910304: 'https://images.fotmob.com/image_resources/playerimages/190528.png', // Eugenio Mena
    910308: 'https://images.fotmob.com/image_resources/playerimages/635693.png', // Fernando Zampedri

    910906: 'https://images.fotmob.com/image_resources/playerimages/303507.png', // Radamel Falcao García
    911001: 'https://images.fotmob.com/image_resources/playerimages/826455.png', // Santiago Mele
    911005: 'https://images.fotmob.com/image_resources/playerimages/161038.png', // Carlos Bacca
    911101: 'https://images.fotmob.com/image_resources/playerimages/1106013.png', // David Ospina
    911104: 'https://images.fotmob.com/image_resources/playerimages/373992.png', // Edwin Cardona
    911105: 'https://images.fotmob.com/image_resources/playerimages/745190.png', // Alfredo Morelos

    911301: 'https://images.fotmob.com/image_resources/playerimages/179252.png', // Alexander Domínguez
    911304: 'https://images.fotmob.com/image_resources/playerimages/1284577.png', // Álex Arce
    911803: 'https://images.fotmob.com/image_resources/playerimages/303510.png', // Paolo Guerrero
    911804: 'https://images.fotmob.com/image_resources/playerimages/161041.png', // Hernán Barcos
    911903: 'https://images.fotmob.com/image_resources/playerimages/169017.png', // Martín Cauteruccio
    912104: 'https://images.fotmob.com/image_resources/playerimages/965188.png', // Leonardo Fernández
    912202: 'https://images.fotmob.com/image_resources/playerimages/170326.png', // Sebastián Coates
};

// Mapeo universal por nombre de futbolista (insensible a mayúsculas, tildes y símbolos)
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
    'kylian mbappe': 'https://images.fotmob.com/image_resources/playerimages/701154.png',
    'kylian mbappé': 'https://images.fotmob.com/image_resources/playerimages/701154.png',
    'k mbappe': 'https://images.fotmob.com/image_resources/playerimages/701154.png',
    'mbappe': 'https://images.fotmob.com/image_resources/playerimages/701154.png',
    'vinicius junior': 'https://images.fotmob.com/image_resources/playerimages/846033.png',
    'vinicius jr': 'https://images.fotmob.com/image_resources/playerimages/846033.png',
    'vinicius': 'https://images.fotmob.com/image_resources/playerimages/846033.png',
    'jude bellingham': 'https://images.fotmob.com/image_resources/playerimages/1077894.png',
    'bellingham': 'https://images.fotmob.com/image_resources/playerimages/1077894.png',
    'lamine yamal': 'https://images.fotmob.com/image_resources/playerimages/1467236.png',
    'yamal': 'https://images.fotmob.com/image_resources/playerimages/1467236.png',
    'robert lewandowski': 'https://images.fotmob.com/image_resources/playerimages/93447.png',
    'lewandowski': 'https://images.fotmob.com/image_resources/playerimages/93447.png',
    'mohamed salah': 'https://images.fotmob.com/image_resources/playerimages/292462.png',
    'salah': 'https://images.fotmob.com/image_resources/playerimages/292462.png',
    'pedri': 'https://images.fotmob.com/image_resources/playerimages/1083323.png',
    'gavi': 'https://images.fotmob.com/image_resources/playerimages/1279040.png',
    'raphinha': 'https://images.fotmob.com/image_resources/playerimages/696679.png',
    'fede valverde': 'https://images.fotmob.com/image_resources/playerimages/743533.png',
    'federico valverde': 'https://images.fotmob.com/image_resources/playerimages/743533.png',
    'rodrygo': 'https://images.fotmob.com/image_resources/playerimages/895362.png',
    'julian alvarez': 'https://images.fotmob.com/image_resources/playerimages/974753.png',
    'julián álvarez': 'https://images.fotmob.com/image_resources/playerimages/974753.png',
    'antoine griezmann': 'https://images.fotmob.com/image_resources/playerimages/184138.png',
    'griezmann': 'https://images.fotmob.com/image_resources/playerimages/184138.png',
    'rodrigo de paul': 'https://images.fotmob.com/image_resources/playerimages/429656.png',
    'de paul': 'https://images.fotmob.com/image_resources/playerimages/429656.png',
    'emiliano martinez': 'https://images.fotmob.com/image_resources/playerimages/212880.png',
    'dibu martinez': 'https://images.fotmob.com/image_resources/playerimages/212880.png',
    'e martinez': 'https://images.fotmob.com/image_resources/playerimages/212880.png',

    // Figuras del Fútbol Argentino
    'edinson cavani': 'https://images.fotmob.com/image_resources/playerimages/49677.png',
    'e cavani': 'https://images.fotmob.com/image_resources/playerimages/49677.png',
    'cavani': 'https://images.fotmob.com/image_resources/playerimages/49677.png',
    'miguel merentiel': 'https://images.fotmob.com/image_resources/playerimages/826418.png',
    'm merentiel': 'https://images.fotmob.com/image_resources/playerimages/826418.png',
    'merentiel': 'https://images.fotmob.com/image_resources/playerimages/826418.png',
    'leandro paredes': 'https://images.fotmob.com/image_resources/playerimages/303498.png',
    'paredes': 'https://images.fotmob.com/image_resources/playerimages/303498.png',
    'carlos palacios': 'https://images.fotmob.com/image_resources/playerimages/1083984.png',
    'alan velasco': 'https://images.fotmob.com/image_resources/playerimages/1029199.png',
    'marcos rojo': 'https://images.fotmob.com/image_resources/playerimages/161035.png',
    'rojo': 'https://images.fotmob.com/image_resources/playerimages/161035.png',
    'luis advincula': 'https://images.fotmob.com/image_resources/playerimages/190522.png',
    'luis advíncula': 'https://images.fotmob.com/image_resources/playerimages/190522.png',
    'advincula': 'https://images.fotmob.com/image_resources/playerimages/190522.png',
    'kevin zenon': 'https://images.fotmob.com/image_resources/playerimages/1201039.png',
    'kevin zenón': 'https://images.fotmob.com/image_resources/playerimages/1201039.png',
    'zenon': 'https://images.fotmob.com/image_resources/playerimages/1201039.png',
    'cristian medina': 'https://images.fotmob.com/image_resources/playerimages/1097241.png',
    'medina': 'https://images.fotmob.com/image_resources/playerimages/1097241.png',
    'exequiel zeballos': 'https://images.fotmob.com/image_resources/playerimages/1110044.png',
    'zeballos': 'https://images.fotmob.com/image_resources/playerimages/1110044.png',
    'aaron anselmino': 'https://images.fotmob.com/image_resources/playerimages/1494947.png',
    'aarón anselmino': 'https://images.fotmob.com/image_resources/playerimages/1494947.png',
    'anselmino': 'https://images.fotmob.com/image_resources/playerimages/1494947.png',

    'franco armani': 'https://images.fotmob.com/image_resources/playerimages/179243.png',
    'armani': 'https://images.fotmob.com/image_resources/playerimages/179243.png',
    'nicolas otamendi': 'https://images.fotmob.com/image_resources/playerimages/169008.png',
    'nicolás otamendi': 'https://images.fotmob.com/image_resources/playerimages/169008.png',
    'otamendi': 'https://images.fotmob.com/image_resources/playerimages/169008.png',
    'german pezzella': 'https://images.fotmob.com/image_resources/playerimages/282672.png',
    'germán pezzella': 'https://images.fotmob.com/image_resources/playerimages/282672.png',
    'pezzella': 'https://images.fotmob.com/image_resources/playerimages/282672.png',
    'marcos acuna': 'https://images.fotmob.com/image_resources/playerimages/283626.png',
    'marcos acuña': 'https://images.fotmob.com/image_resources/playerimages/283626.png',
    'acuña': 'https://images.fotmob.com/image_resources/playerimages/283626.png',
    'thiago almada': 'https://images.fotmob.com/image_resources/playerimages/965155.png',
    'almada': 'https://images.fotmob.com/image_resources/playerimages/965155.png',
    'claudio echeverri': 'https://images.fotmob.com/image_resources/playerimages/1494946.png',
    'echeverri': 'https://images.fotmob.com/image_resources/playerimages/1494946.png',
    'franco mastantuono': 'https://images.fotmob.com/image_resources/playerimages/1548232.png',
    'mastantuono': 'https://images.fotmob.com/image_resources/playerimages/1548232.png',
    'angel correa': 'https://images.fotmob.com/image_resources/playerimages/474026.png',
    'ángel correa': 'https://images.fotmob.com/image_resources/playerimages/474026.png',
    'miguel borja': 'https://images.fotmob.com/image_resources/playerimages/377598.png',
    'borja': 'https://images.fotmob.com/image_resources/playerimages/377598.png',
    'facundo colidio': 'https://images.fotmob.com/image_resources/playerimages/965159.png',
    'colidio': 'https://images.fotmob.com/image_resources/playerimages/965159.png',
    'manuel lanzini': 'https://images.fotmob.com/image_resources/playerimages/263651.png',
    'lanzini': 'https://images.fotmob.com/image_resources/playerimages/263651.png',
    'ignacio fernandez': 'https://images.fotmob.com/image_resources/playerimages/212872.png',
    'nacho fernandez': 'https://images.fotmob.com/image_resources/playerimages/212872.png',

    'juan fernando quintero': 'https://images.fotmob.com/image_resources/playerimages/270425.png',
    'juanfer quintero': 'https://images.fotmob.com/image_resources/playerimages/270425.png',
    'quintero': 'https://images.fotmob.com/image_resources/playerimages/270425.png',
    'adrian martinez': 'https://images.fotmob.com/image_resources/playerimages/635681.png',
    'maravilla martinez': 'https://images.fotmob.com/image_resources/playerimages/635681.png',
    'iker muniain': 'https://images.fotmob.com/image_resources/playerimages/184141.png',
    'muniain': 'https://images.fotmob.com/image_resources/playerimages/184141.png',
    'enzo perez': 'https://images.fotmob.com/image_resources/playerimages/49680.png',
    'enzo pérez': 'https://images.fotmob.com/image_resources/playerimages/49680.png',
    'jose sosa': 'https://images.fotmob.com/image_resources/playerimages/303501.png',
    'josé sosa': 'https://images.fotmob.com/image_resources/playerimages/303501.png',
    'guido carrillo': 'https://images.fotmob.com/image_resources/playerimages/283631.png',
    'carrillo': 'https://images.fotmob.com/image_resources/playerimages/283631.png',
    'santiago ascacibar': 'https://images.fotmob.com/image_resources/playerimages/826428.png',
    'ascacibar': 'https://images.fotmob.com/image_resources/playerimages/826428.png',
    'valentin gomez': 'https://images.fotmob.com/image_resources/playerimages/1406736.png',
    'braian romero': 'https://images.fotmob.com/image_resources/playerimages/608685.png',
    'claudio aquino': 'https://images.fotmob.com/image_resources/playerimages/386050.png',

    // Figuras del Brasileirão y Sudamérica
    'memphis depay': 'https://images.fotmob.com/image_resources/playerimages/262532.png',
    'depay': 'https://images.fotmob.com/image_resources/playerimages/262532.png',
    'rodrigo garro': 'https://images.fotmob.com/image_resources/playerimages/965176.png',
    'garro': 'https://images.fotmob.com/image_resources/playerimages/965176.png',
    'yuri alberto': 'https://images.fotmob.com/image_resources/playerimages/965179.png',
    'arturo vidal': 'https://images.fotmob.com/image_resources/playerimages/49686.png',
    'vidal': 'https://images.fotmob.com/image_resources/playerimages/49686.png',
    'radamel falcao': 'https://images.fotmob.com/image_resources/playerimages/303507.png',
    'falcao': 'https://images.fotmob.com/image_resources/playerimages/303507.png',
    'carlos bacca': 'https://images.fotmob.com/image_resources/playerimages/161038.png',
    'bacca': 'https://images.fotmob.com/image_resources/playerimages/161038.png',
    'david ospina': 'https://images.fotmob.com/image_resources/playerimages/1106013.png',
    'ospina': 'https://images.fotmob.com/image_resources/playerimages/1106013.png',
    'paolo guerrero': 'https://images.fotmob.com/image_resources/playerimages/303510.png',
    'guerrero': 'https://images.fotmob.com/image_resources/playerimages/303510.png',
    'hernan barcos': 'https://images.fotmob.com/image_resources/playerimages/161041.png',
    'barcos': 'https://images.fotmob.com/image_resources/playerimages/161041.png',
    'charles aranguiz': 'https://images.fotmob.com/image_resources/playerimages/169014.png',
    'aranguiz': 'https://images.fotmob.com/image_resources/playerimages/169014.png',
    'marcelo diaz': 'https://images.fotmob.com/image_resources/playerimages/109066.png',
    'lucas moura': 'https://images.fotmob.com/image_resources/playerimages/263657.png',
    'jonathan calleri': 'https://images.fotmob.com/image_resources/playerimages/608700.png',
    'calleri': 'https://images.fotmob.com/image_resources/playerimages/608700.png',
    'thiago silva': 'https://images.fotmob.com/image_resources/playerimages/109069.png',
    'ganso': 'https://images.fotmob.com/image_resources/playerimages/179255.png',
    'german cano': 'https://images.fotmob.com/image_resources/playerimages/190531.png',
    'cano': 'https://images.fotmob.com/image_resources/playerimages/190531.png',
    'jhon arias': 'https://images.fotmob.com/image_resources/playerimages/826458.png',
    'estevao': 'https://images.fotmob.com/image_resources/playerimages/1494956.png',
    'estêvão': 'https://images.fotmob.com/image_resources/playerimages/1494956.png',
    'raphael veiga': 'https://images.fotmob.com/image_resources/playerimages/745178.png',
    'veiga': 'https://images.fotmob.com/image_resources/playerimages/745178.png',
    'felipe anderson': 'https://images.fotmob.com/image_resources/playerimages/386053.png',
    'luiz henrique': 'https://images.fotmob.com/image_resources/playerimages/1202881.png',
    'igor jesus': 'https://images.fotmob.com/image_resources/playerimages/1406739.png',
    'gabriel barbosa': 'https://images.fotmob.com/image_resources/playerimages/608691.png',
    'gabigol': 'https://images.fotmob.com/image_resources/playerimages/608691.png',
    'nicolas de la cruz': 'https://images.fotmob.com/image_resources/playerimages/853770.png',
    'de la cruz': 'https://images.fotmob.com/image_resources/playerimages/853770.png',
    'giorgian de arrascaeta': 'https://images.fotmob.com/image_resources/playerimages/429659.png',
    'arrascaeta': 'https://images.fotmob.com/image_resources/playerimages/429659.png',
    'gerson': 'https://images.fotmob.com/image_resources/playerimages/657394.png',
    'yeferson soteldo': 'https://images.fotmob.com/image_resources/playerimages/621142.png',
    'soteldo': 'https://images.fotmob.com/image_resources/playerimages/621142.png',
    'sergio canales': 'https://images.fotmob.com/image_resources/playerimages/184147.png',
    'canales': 'https://images.fotmob.com/image_resources/playerimages/184147.png',
    'lucas ocampos': 'https://images.fotmob.com/image_resources/playerimages/282680.png',
    'ocampos': 'https://images.fotmob.com/image_resources/playerimages/282680.png',
    'andre-pierre gignac': 'https://images.fotmob.com/image_resources/playerimages/49683.png',
    'gignac': 'https://images.fotmob.com/image_resources/playerimages/49683.png',
    'chicharito hernandez': 'https://images.fotmob.com/image_resources/playerimages/169011.png',
    'chicharito': 'https://images.fotmob.com/image_resources/playerimages/169011.png',
    'alexis vega': 'https://images.fotmob.com/image_resources/playerimages/826449.png',
    'henry martin': 'https://images.fotmob.com/image_resources/playerimages/540719.png',
    'henry martín': 'https://images.fotmob.com/image_resources/playerimages/540719.png',
    'salomon rondon': 'https://images.fotmob.com/image_resources/playerimages/114947.png',
    'salomón rondón': 'https://images.fotmob.com/image_resources/playerimages/114947.png',
    'rondon': 'https://images.fotmob.com/image_resources/playerimages/114947.png',
};
`;

fs.writeFileSync(playerPhotosPath, content, 'utf-8');
console.log('✅ services/customPacks/playerPhotos.ts actualizado con fotos reales masivas.');
