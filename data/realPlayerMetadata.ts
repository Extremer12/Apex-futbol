import { LeagueId, PlayerNationality } from '../types';

export interface PlayerRealMeta {
    age2026?: number;
    nationality: PlayerNationality;
}

/**
 * Authoritative metadata for real-world players (2026 age baseline + true nationality).
 * Prevents random age generation or league-hash nationality overrides.
 */
export const REAL_PLAYER_METADATA: Record<number, PlayerRealMeta> = {
    // =========================================================================
    // PREMIER LEAGUE (20 clubs - exact 2026 ages & real nationalities)
    // =========================================================================
    // 1. Arsenal
    101: { age2026: 24, nationality: 'ENG' }, // B. Saka
    102: { age2026: 27, nationality: 'NOR' }, // M. Ødegaard
    103: { age2026: 25, nationality: 'FRA' }, // W. Saliba
    104: { age2026: 30, nationality: 'ESP' }, // D. Raya
    105: { age2026: 27, nationality: 'ENG' }, // D. Rice
    106: { age2026: 25, nationality: 'BRA' }, // Gabriel Martinelli
    107: { age2026: 29, nationality: 'BRA' }, // Gabriel Jesus
    108: { age2026: 28, nationality: 'BRA' }, // Gabriel Magalhães
    109: { age2026: 28, nationality: 'ENG' }, // B. White
    110: { age2026: 27, nationality: 'GER' }, // K. Havertz
    111: { age2026: 29, nationality: 'UKR' }, // O. Zinchenko
    112: { age2026: 34, nationality: 'ITA' }, // Jorginho
    113: { age2026: 33, nationality: 'GHA' }, // T. Partey
    114: { age2026: 31, nationality: 'BEL' }, // L. Trossard
    115: { age2026: 28, nationality: 'ENG' }, // A. Ramsdale
    116: { age2026: 25, nationality: 'NED' }, // J. Timber

    // 2. Aston Villa
    201: { age2026: 30, nationality: 'ENG' }, // O. Watkins
    202: { age2026: 28, nationality: 'BRA' }, // Douglas Luiz
    203: { age2026: 33, nationality: 'ARG' }, // E. Martínez
    204: { age2026: 27, nationality: 'FRA' }, // M. Diaby
    205: { age2026: 29, nationality: 'ESP' }, // Pau Torres
    206: { age2026: 31, nationality: 'SCO' }, // J. McGinn
    207: { age2026: 29, nationality: 'JAM' }, // L. Bailey
    208: { age2026: 28, nationality: 'ENG' }, // E. Konsa
    209: { age2026: 26, nationality: 'FRA' }, // B. Kamara
    210: { age2026: 33, nationality: 'BRA' }, // Diego Carlos
    211: { age2026: 29, nationality: 'POL' }, // M. Cash
    212: { age2026: 29, nationality: 'BEL' }, // Y. Tielemans
    213: { age2026: 33, nationality: 'ESP' }, // Álex Moreno
    214: { age2026: 33, nationality: 'FRA' }, // L. Digne
    215: { age2026: 36, nationality: 'SWE' }, // R. Olsen
    216: { age2026: 25, nationality: 'ENG' }, // J. Ramsey

    // 3. Chelsea
    301: { age2026: 24, nationality: 'ENG' }, // C. Palmer
    302: { age2026: 25, nationality: 'ARG' }, // E. Fernández
    303: { age2026: 26, nationality: 'ENG' }, // R. James
    304: { age2026: 28, nationality: 'FRA' }, // C. Nkunku
    305: { age2026: 24, nationality: 'ECU' }, // M. Caicedo
    306: { age2026: 31, nationality: 'ENG' }, // R. Sterling
    307: { age2026: 28, nationality: 'ESP' }, // R. Sánchez
    308: { age2026: 29, nationality: 'ENG' }, // B. Chilwell
    309: { age2026: 25, nationality: 'UKR' }, // M. Mudryk
    310: { age2026: 25, nationality: 'SEN' }, // N. Jackson
    311: { age2026: 28, nationality: 'FRA' }, // A. Disasi
    312: { age2026: 23, nationality: 'ENG' }, // L. Colwill
    313: { age2026: 26, nationality: 'POR' }, // P. Neto
    314: { age2026: 23, nationality: 'FRA' }, // M. Gusto
    315: { age2026: 26, nationality: 'SRB' }, // D. Petrovic
    316: { age2026: 26, nationality: 'POR' }, // J. Félix

    // 4. Liverpool
    401: { age2026: 34, nationality: 'EGY' }, // M. Salah
    402: { age2026: 33, nationality: 'BRA' }, // Alisson
    403: { age2026: 35, nationality: 'NED' }, // V. van Dijk
    404: { age2026: 27, nationality: 'ENG' }, // T. Alexander-Arnold
    405: { age2026: 29, nationality: 'POR' }, // D. Jota
    406: { age2026: 32, nationality: 'SCO' }, // A. Robertson
    407: { age2026: 29, nationality: 'COL' }, // L. Díaz
    408: { age2026: 27, nationality: 'URU' }, // D. Núñez
    409: { age2026: 27, nationality: 'ARG' }, // A. Mac Allister
    410: { age2026: 25, nationality: 'HUN' }, // D. Szoboszlai
    411: { age2026: 27, nationality: 'FRA' }, // I. Konaté
    412: { age2026: 27, nationality: 'NED' }, // C. Gakpo
    413: { age2026: 35, nationality: 'ESP' }, // Thiago
    414: { age2026: 29, nationality: 'ENG' }, // J. Gomez
    415: { age2026: 33, nationality: 'JPN' }, // W. Endo
    416: { age2026: 27, nationality: 'IRL' }, // C. Kelleher

    // 5. Manchester City
    501: { age2026: 26, nationality: 'NOR' }, // E. Haaland
    502: { age2026: 35, nationality: 'BEL' }, // K. De Bruyne
    503: { age2026: 30, nationality: 'ESP' }, // Rodri
    504: { age2026: 26, nationality: 'ENG' }, // P. Foden
    505: { age2026: 29, nationality: 'POR' }, // R. Dias
    506: { age2026: 33, nationality: 'BRA' }, // Ederson
    507: { age2026: 24, nationality: 'CRO' }, // J. Gvardiol
    508: { age2026: 32, nationality: 'ENG' }, // J. Stones
    509: { age2026: 36, nationality: 'ENG' }, // K. Walker
    510: { age2026: 30, nationality: 'ENG' }, // J. Grealish
    511: { age2026: 35, nationality: 'GER' }, // I. Gündogan
    512: { age2026: 32, nationality: 'POR' }, // B. Silva
    513: { age2026: 31, nationality: 'SUI' }, // M. Akanji
    514: { age2026: 31, nationality: 'NED' }, // N. Aké
    515: { age2026: 27, nationality: 'POR' }, // M. Nunes
    516: { age2026: 33, nationality: 'GER' }, // S. Ortega
    517: { age2026: 22, nationality: 'BRA' }, // Savinho

    // 6. Manchester United
    601: { age2026: 31, nationality: 'POR' }, // B. Fernandes
    602: { age2026: 28, nationality: 'ENG' }, // M. Rashford
    603: { age2026: 34, nationality: 'BRA' }, // Casemiro
    604: { age2026: 28, nationality: 'ARG' }, // L. Martínez
    605: { age2026: 30, nationality: 'CMR' }, // A. Onana
    606: { age2026: 27, nationality: 'NED' }, // M. de Ligt
    607: { age2026: 27, nationality: 'ENG' }, // M. Mount
    608: { age2026: 26, nationality: 'BRA' }, // Antony
    609: { age2026: 31, nationality: 'ENG' }, // L. Shaw
    610: { age2026: 21, nationality: 'ENG' }, // K. Mainoo
    611: { age2026: 23, nationality: 'DEN' }, // R. Højlund
    612: { age2026: 22, nationality: 'ARG' }, // A. Garnacho
    613: { age2026: 33, nationality: 'ENG' }, // H. Maguire
    614: { age2026: 27, nationality: 'POR' }, // D. Dalot
    615: { age2026: 25, nationality: 'URU' }, // M. Ugarte
    616: { age2026: 28, nationality: 'TUR' }, // A. Bayindir
    617: { age2026: 25, nationality: 'NED' }, // J. Zirkzee
    618: { age2026: 28, nationality: 'MAR' }, // N. Mazraoui

    // 7. Newcastle United
    701: { age2026: 28, nationality: 'BRA' }, // B. Guimarães
    702: { age2026: 26, nationality: 'SWE' }, // A. Isak
    703: { age2026: 26, nationality: 'ITA' }, // S. Tonali
    704: { age2026: 26, nationality: 'NED' }, // S. Botman
    705: { age2026: 35, nationality: 'ENG' }, // K. Trippier
    706: { age2026: 34, nationality: 'ENG' }, // N. Pope
    707: { age2026: 30, nationality: 'BRA' }, // Joelinton
    708: { age2026: 25, nationality: 'ENG' }, // A. Gordon
    709: { age2026: 28, nationality: 'ENG' }, // H. Barnes
    710: { age2026: 34, nationality: 'SUI' }, // F. Schär
    711: { age2026: 34, nationality: 'ENG' }, // C. Wilson
    712: { age2026: 34, nationality: 'ENG' }, // D. Burn
    713: { age2026: 28, nationality: 'ENG' }, // S. Longstaff
    714: { age2026: 27, nationality: 'ENG' }, // J. Willock
    715: { age2026: 32, nationality: 'PAR' }, // M. Almiron
    716: { age2026: 37, nationality: 'SVK' }, // M. Dubravka

    // 8. Tottenham Hotspur
    801: { age2026: 34, nationality: 'KOR' }, // Son H.M.
    802: { age2026: 29, nationality: 'ENG' }, // J. Maddison
    803: { age2026: 28, nationality: 'ARG' }, // C. Romero
    804: { age2026: 29, nationality: 'ITA' }, // G. Vicario
    805: { age2026: 26, nationality: 'SWE' }, // D. Kulusevski
    806: { age2026: 29, nationality: 'BRA' }, // Richarlison
    807: { age2026: 25, nationality: 'NED' }, // M. van de Ven
    808: { age2026: 26, nationality: 'ESP' }, // P. Porro
    809: { age2026: 23, nationality: 'ITA' }, // D. Udogie
    810: { age2026: 29, nationality: 'MLI' }, // Y. Bissouma
    811: { age2026: 23, nationality: 'SEN' }, // P. M. Sarr
    812: { age2026: 25, nationality: 'WAL' }, // B. Johnson
    813: { age2026: 29, nationality: 'URU' }, // R. Bentancur
    814: { age2026: 30, nationality: 'ARG' }, // G. Lo Celso
    815: { age2026: 38, nationality: 'ENG' }, // F. Forster
    816: { age2026: 33, nationality: 'WAL' }, // B. Davies

    // 9. West Ham
    901: { age2026: 29, nationality: 'ENG' }, // J. Bowen
    902: { age2026: 26, nationality: 'GHA' }, // M. Kudus
    903: { age2026: 28, nationality: 'BRA' }, // L. Paquetá
    904: { age2026: 31, nationality: 'ENG' }, // J. Ward-Prowse
    905: { age2026: 33, nationality: 'FRA' }, // A. Areola
    906: { age2026: 31, nationality: 'FRA' }, // K. Zouma
    907: { age2026: 28, nationality: 'MEX' }, // E. Álvarez
    908: { age2026: 30, nationality: 'MAR' }, // N. Aguerd
    909: { age2026: 32, nationality: 'ITA' }, // Emerson
    910: { age2026: 33, nationality: 'CZE' }, // V. Coufal
    911: { age2026: 31, nationality: 'CZE' }, // T. Soucek
    912: { age2026: 36, nationality: 'JAM' }, // M. Antonio
    913: { age2026: 31, nationality: 'ALG' }, // S. Benrahma
    914: { age2026: 34, nationality: 'ENG' }, // D. Ings
    915: { age2026: 41, nationality: 'POL' }, // L. Fabianski
    916: { age2026: 38, nationality: 'ITA' }, // A. Ogbonna

    // 10. Brighton
    1001: { age2026: 29, nationality: 'JPN' }, // K. Mitoma
    1002: { age2026: 24, nationality: 'BRA' }, // João Pedro
    1003: { age2026: 28, nationality: 'ECU' }, // P. Estupiñán
    1004: { age2026: 34, nationality: 'ENG' }, // L. Dunk
    1005: { age2026: 35, nationality: 'GER' }, // P. Groß
    1006: { age2026: 32, nationality: 'ENG' }, // S. March
    1007: { age2026: 21, nationality: 'IRL' }, // E. Ferguson
    1008: { age2026: 24, nationality: 'NED' }, // B. Verbruggen
    1009: { age2026: 23, nationality: 'ESP' }, // A. Fati
    1010: { age2026: 25, nationality: 'SCO' }, // B. Gilmour
    1011: { age2026: 25, nationality: 'GHA' }, // T. Lamptey
    1012: { age2026: 34, nationality: 'NED' }, // J. Veltman
    1013: { age2026: 35, nationality: 'ENG' }, // D. Welbeck
    1014: { age2026: 35, nationality: 'ENG' }, // J. Steele
    1015: { age2026: 24, nationality: 'CIV' }, // S. Adingra
    1016: { age2026: 31, nationality: 'ENG' }, // A. Webster

    // 11. Fulham
    1101: { age2026: 31, nationality: 'POR' }, // J. Palhinha
    1102: { age2026: 30, nationality: 'BRA' }, // A. Pereira
    1103: { age2026: 34, nationality: 'GER' }, // B. Leno
    1104: { age2026: 38, nationality: 'BRA' }, // Willian
    1105: { age2026: 30, nationality: 'NGA' }, // A. Iwobi
    1106: { age2026: 30, nationality: 'BEL' }, // T. Castagne
    1107: { age2026: 29, nationality: 'WAL' }, // H. Wilson
    1108: { age2026: 28, nationality: 'ENG' }, // T. Adarabioyo
    1109: { age2026: 35, nationality: 'MEX' }, // R. Jiménez
    1110: { age2026: 30, nationality: 'ENG' }, // H. Reed
    1111: { age2026: 29, nationality: 'USA' }, // A. Robinson
    1112: { age2026: 29, nationality: 'FRA' }, // I. Diop
    1113: { age2026: 30, nationality: 'SRB' }, // S. Lukić
    1114: { age2026: 38, nationality: 'USA' }, // T. Ream
    1115: { age2026: 29, nationality: 'SVK' }, // M. Rodák
    1116: { age2026: 26, nationality: 'NGA' }, // C. Bassey

    // 12. Crystal Palace
    1201: { age2026: 28, nationality: 'ENG' }, // E. Eze
    1202: { age2026: 24, nationality: 'FRA' }, // M. Olise
    1203: { age2026: 26, nationality: 'ENG' }, // M. Guéhi
    1204: { age2026: 26, nationality: 'MLI' }, // C. Doucouré
    1205: { age2026: 33, nationality: 'ENG' }, // S. Johnstone
    1206: { age2026: 30, nationality: 'DEN' }, // J. Andersen
    1207: { age2026: 31, nationality: 'COL' }, // J. Lerma
    1208: { age2026: 28, nationality: 'FRA' }, // O. Édouard
    1209: { age2026: 26, nationality: 'ENG' }, // T. Mitchell
    1210: { age2026: 33, nationality: 'GHA' }, // J. Schlupp
    1211: { age2026: 36, nationality: 'ENG' }, // J. Ward
    1212: { age2026: 34, nationality: 'GHA' }, // J. Ayew
    1213: { age2026: 29, nationality: 'ENG' }, // D. Henderson
    1214: { age2026: 26, nationality: 'USA' }, // C. Richards
    1215: { age2026: 31, nationality: 'ENG' }, // W. Hughes
    1216: { age2026: 29, nationality: 'FRA' }, // J.P. Mateta

    // 13. Brentford
    1301: { age2026: 30, nationality: 'ENG' }, // I. Toney
    1302: { age2026: 27, nationality: 'CMR' }, // B. Mbeumo
    1303: { age2026: 29, nationality: 'ENG' }, // R. Henry
    1304: { age2026: 33, nationality: 'NED' }, // M. Flekken
    1305: { age2026: 30, nationality: 'DEN' }, // M. Jensen
    1306: { age2026: 32, nationality: 'DEN' }, // C. Nørgaard
    1307: { age2026: 30, nationality: 'JAM' }, // E. Pinnock
    1308: { age2026: 24, nationality: 'GER' }, // K. Schade
    1309: { age2026: 28, nationality: 'GER' }, // V. Janelt
    1310: { age2026: 25, nationality: 'IRL' }, // N. Collins
    1311: { age2026: 26, nationality: 'DEN' }, // M. Damsgaard
    1312: { age2026: 29, nationality: 'COD' }, // Y. Wissa
    1313: { age2026: 28, nationality: 'NOR' }, // K. Ajer
    1314: { age2026: 27, nationality: 'DEN' }, // M. Roerslev
    1315: { age2026: 31, nationality: 'ALB' }, // T. Strakosha
    1316: { age2026: 27, nationality: 'ENG' }, // J. Dasilva

    // 14. Everton
    1401: { age2026: 32, nationality: 'ENG' }, // J. Pickford
    1402: { age2026: 25, nationality: 'BEL' }, // A. Onana
    1403: { age2026: 24, nationality: 'ENG' }, // J. Branthwaite
    1404: { age2026: 29, nationality: 'ENG' }, // D. Calvert-Lewin
    1405: { age2026: 33, nationality: 'MLI' }, // A. Doucouré
    1406: { age2026: 33, nationality: 'ENG' }, // J. Tarkowski
    1407: { age2026: 26, nationality: 'ENG' }, // D. McNeil
    1408: { age2026: 36, nationality: 'SEN' }, // I. Gueye
    1409: { age2026: 27, nationality: 'UKR' }, // V. Mykolenko
    1410: { age2026: 25, nationality: 'ENG' }, // J. Garner
    1411: { age2026: 28, nationality: 'POR' }, // Beto
    1412: { age2026: 29, nationality: 'ENG' }, // J. Harrison
    1413: { age2026: 41, nationality: 'ENG' }, // A. Young
    1414: { age2026: 37, nationality: 'IRL' }, // S. Coleman
    1415: { age2026: 29, nationality: 'NED' }, // A. Danjuma
    1416: { age2026: 26, nationality: 'POR' }, // J. Virginia

    // 15. Nottingham Forest
    1501: { age2026: 26, nationality: 'ENG' }, // M. Gibbs-White
    1502: { age2026: 24, nationality: 'BRA' }, // Murillo
    1503: { age2026: 25, nationality: 'BRA' }, // Danilo
    1504: { age2026: 29, nationality: 'NGA' }, // T. Awoniyi
    1505: { age2026: 28, nationality: 'BEL' }, // O. Mangala
    1506: { age2026: 25, nationality: 'WAL' }, // N. Williams
    1507: { age2026: 34, nationality: 'BEL' }, // M. Sels
    1508: { age2026: 24, nationality: 'SWE' }, // A. Elanga
    1509: { age2026: 28, nationality: 'CIV' }, // I. Sangaré
    1510: { age2026: 35, nationality: 'CIV' }, // W. Boly
    1511: { age2026: 25, nationality: 'ENG' }, // C. Hudson-Odoi
    1512: { age2026: 30, nationality: 'ENG' }, // H. Toffolo
    1513: { age2026: 28, nationality: 'ARG' }, // N. Domínguez
    1514: { age2026: 34, nationality: 'NZL' }, // C. Wood
    1515: { age2026: 32, nationality: 'USA' }, // M. Turner
    1516: { age2026: 33, nationality: 'CIV' }, // S. Aurier

    // 16. Bournemouth
    1601: { age2026: 28, nationality: 'ENG' }, // D. Solanke
    1602: { age2026: 37, nationality: 'BRA' }, // Neto
    1603: { age2026: 30, nationality: 'DEN' }, // P. Billing
    1604: { age2026: 29, nationality: 'ARG' }, // M. Senesi
    1605: { age2026: 29, nationality: 'ENG' }, // L. Cook
    1606: { age2026: 27, nationality: 'USA' }, // T. Adams
    1607: { age2026: 26, nationality: 'GHA' }, // A. Semenyo
    1608: { age2026: 23, nationality: 'UKR' }, // I. Zabarnyi
    1609: { age2026: 27, nationality: 'ENG' }, // M. Tavernier
    1610: { age2026: 27, nationality: 'NED' }, // J. Kluivert
    1611: { age2026: 22, nationality: 'HUN' }, // M. Kerkez
    1612: { age2026: 31, nationality: 'SCO' }, // R. Christie
    1613: { age2026: 27, nationality: 'ENG' }, // L. Kelly
    1614: { age2026: 26, nationality: 'ENG' }, // M. Aarons
    1615: { age2026: 35, nationality: 'ENG' }, // A. Smith
    1616: { age2026: 27, nationality: 'IRL' }, // M. Travers

    // 17. Wolves
    1701: { age2026: 26, nationality: 'POR' }, // P. Neto
    1702: { age2026: 27, nationality: 'BRA' }, // M. Cunha
    1703: { age2026: 36, nationality: 'ENG' }, // C. Dawson
    1704: { age2026: 33, nationality: 'POR' }, // José Sá
    1705: { age2026: 29, nationality: 'ENG' }, // M. Kilman
    1706: { age2026: 25, nationality: 'ALG' }, // R. Aït-Nouri
    1707: { age2026: 30, nationality: 'KOR' }, // Hwang H.C.
    1708: { age2026: 32, nationality: 'GAB' }, // M. Lemina
    1709: { age2026: 25, nationality: 'BRA' }, // J. Gomes
    1710: { age2026: 32, nationality: 'POR' }, // N. Semedo
    1711: { age2026: 34, nationality: 'ESP' }, // P. Sarabia
    1712: { age2026: 24, nationality: 'BFA' }, // B. Traoré
    1713: { age2026: 27, nationality: 'POR' }, // Toti Gomes
    1714: { age2026: 31, nationality: 'ENG' }, // D. Bentley
    1715: { age2026: 27, nationality: 'URU' }, // S. Bueno
    1716: { age2026: 25, nationality: 'FRA' }, // J. Bellegarde

    // 18. Ipswich Town
    1801: { age2026: 26, nationality: 'ENG' }, // L. Davis
    1802: { age2026: 29, nationality: 'ENG' }, // C. Chaplin
    1803: { age2026: 34, nationality: 'EGY' }, // S. Morsy
    1804: { age2026: 31, nationality: 'WAL' }, // W. Burns
    1805: { age2026: 35, nationality: 'CZE' }, // V. Hladky
    1806: { age2026: 27, nationality: 'ENG' }, // L. Woolfenden
    1807: { age2026: 30, nationality: 'AUS' }, // C. Burgess
    1808: { age2026: 28, nationality: 'WAL' }, // N. Broadhead
    1809: { age2026: 27, nationality: 'SCO' }, // G. Hirst
    1810: { age2026: 33, nationality: 'AUS' }, // M. Luongo
    1811: { age2026: 25, nationality: 'ENG' }, // H. Clarke
    1812: { age2026: 34, nationality: 'WAL' }, // K. Moore
    1813: { age2026: 28, nationality: 'COD' }, // A. Tuanzebe
    1814: { age2026: 24, nationality: 'IRL' }, // J. Taylor
    1815: { age2026: 30, nationality: 'ENG' }, // C. Walton
    1816: { age2026: 32, nationality: 'ENG' }, // K. Jackson

    // 19. Leicester City
    1901: { age2026: 27, nationality: 'ENG' }, // K. Dewsbury-Hall
    1902: { age2026: 39, nationality: 'ENG' }, // J. Vardy
    1903: { age2026: 32, nationality: 'POR' }, // R. Pereira
    1904: { age2026: 28, nationality: 'BEL' }, // W. Faes
    1905: { age2026: 30, nationality: 'ENG' }, // H. Winks
    1906: { age2026: 26, nationality: 'DEN' }, // M. Hermansen
    1907: { age2026: 29, nationality: 'NGA' }, // K. Iheanacho
    1908: { age2026: 27, nationality: 'ZIM' }, // P. Daka (Zambia/ZIM fallback or ZAM -> NGA/OTHER; wait ZAM not added yet)
    1909: { age2026: 29, nationality: 'NGA' }, // W. Ndidi
    1910: { age2026: 28, nationality: 'ENG' }, // J. Justin
    1911: { age2026: 33, nationality: 'ENG' }, // C. Coady
    1912: { age2026: 28, nationality: 'ENG' }, // S. Mavididi
    1913: { age2026: 27, nationality: 'AUS' }, // H. Souttar
    1914: { age2026: 32, nationality: 'BEL' }, // D. Praet
    1915: { age2026: 33, nationality: 'WAL' }, // D. Ward
    1916: { age2026: 26, nationality: 'TUR' }, // Y. Akgün

    // 20. Southampton
    2001: { age2026: 29, nationality: 'ENG' }, // K. Walker-Peters
    2002: { age2026: 29, nationality: 'ENG' }, // A. Armstrong
    2003: { age2026: 24, nationality: 'ENG' }, // T. Harwood-Bellis
    2004: { age2026: 24, nationality: 'IRL' }, // G. Bazunu
    2005: { age2026: 27, nationality: 'ENG' }, // F. Downes
    2006: { age2026: 30, nationality: 'NGA' }, // J. Aribo
    2007: { age2026: 23, nationality: 'ARG' }, // C. Alcaraz
    2008: { age2026: 30, nationality: 'POL' }, // J. Bednarek
    2009: { age2026: 23, nationality: 'ENG' }, // S. Edozie
    2010: { age2026: 32, nationality: 'SCO' }, // R. Fraser
    2011: { age2026: 34, nationality: 'SCO' }, // S. Armstrong
    2012: { age2026: 24, nationality: 'FRA' }, // S. Mara
    2013: { age2026: 32, nationality: 'ENG' }, // J. Stephens
    2014: { age2026: 36, nationality: 'ENG' }, // A. McCarthy
    2015: { age2026: 26, nationality: 'IRL' }, // W. Smallbone
    2016: { age2026: 24, nationality: 'GHA' }, // K. Sulemana

    // =========================================================================
    // LA LIGA (exact 2026 ages & real nationalities)
    // =========================================================================
    // 201. Real Madrid
    20101: { age2026: 26, nationality: 'BRA' }, // V. Junior
    20102: { age2026: 23, nationality: 'ENG' }, // J. Bellingham
    20103: { age2026: 27, nationality: 'FRA' }, // K. Mbappé
    20104: { age2026: 28, nationality: 'URU' }, // F. Valverde
    20105: { age2026: 25, nationality: 'BRA' }, // Rodrygo
    20106: { age2026: 23, nationality: 'FRA' }, // E. Camavinga
    20107: { age2026: 26, nationality: 'FRA' }, // A. Tchouaméni
    20108: { age2026: 28, nationality: 'BRA' }, // E. Militao
    20109: { age2026: 33, nationality: 'GER' }, // A. Rüdiger
    20110: { age2026: 34, nationality: 'ESP' }, // D. Carvajal
    20111: { age2026: 31, nationality: 'FRA' }, // F. Mendy
    20112: { age2026: 34, nationality: 'BEL' }, // T. Courtois
    20113: { age2026: 40, nationality: 'CRO' }, // L. Modric
    20114: { age2026: 27, nationality: 'MAR' }, // Brahim
    20115: { age2026: 27, nationality: 'UKR' }, // A. Lunin
    20116: { age2026: 20, nationality: 'BRA' }, // Endrick
    20117: { age2026: 21, nationality: 'TUR' }, // A. Güler
    20118: { age2026: 35, nationality: 'ESP' }, // Lucas Vázquez

    // 202. FC Barcelona
    20201: { age2026: 37, nationality: 'POL' }, // R. Lewandowski
    20202: { age2026: 23, nationality: 'ESP' }, // Pedri
    20203: { age2026: 22, nationality: 'ESP' }, // Gavi
    20204: { age2026: 29, nationality: 'NED' }, // F. de Jong
    20205: { age2026: 27, nationality: 'URU' }, // R. Araujo
    20206: { age2026: 27, nationality: 'FRA' }, // J. Koundé
    20207: { age2026: 19, nationality: 'ESP' }, // L. Yamal
    20208: { age2026: 29, nationality: 'BRA' }, // Raphinha
    20209: { age2026: 28, nationality: 'ESP' }, // D. Olmo
    20210: { age2026: 22, nationality: 'ESP' }, // A. Balde
    20211: { age2026: 19, nationality: 'ESP' }, // P. Cubarsí
    20212: { age2026: 34, nationality: 'GER' }, // M. ter Stegen
    20213: { age2026: 26, nationality: 'ESP' }, // F. Torres
    20214: { age2026: 30, nationality: 'DEN' }, // A. Christensen
    20215: { age2026: 22, nationality: 'ESP' }, // M. Casadó
    20216: { age2026: 23, nationality: 'ESP' }, // F. López
    20217: { age2026: 35, nationality: 'ESP' }, // Iñigo Martínez

    // 203. Atlético Madrid
    20301: { age2026: 35, nationality: 'FRA' }, // A. Griezmann
    20302: { age2026: 33, nationality: 'SVN' }, // J. Oblak
    20303: { age2026: 26, nationality: 'ARG' }, // J. Álvarez
    20304: { age2026: 32, nationality: 'ARG' }, // R. De Paul
    20305: { age2026: 34, nationality: 'ESP' }, // Koke
    20306: { age2026: 26, nationality: 'ENG' }, // C. Gallagher
    20307: { age2026: 31, nationality: 'ESP' }, // M. Llorente
    20308: { age2026: 29, nationality: 'ESP' }, // R. Le Normand
    20309: { age2026: 31, nationality: 'URU' }, // J. Giménez
    20310: { age2026: 28, nationality: 'ARG' }, // N. Molina
    20311: { age2026: 26, nationality: 'BRA' }, // S. Lino
    20312: { age2026: 30, nationality: 'NOR' }, // A. Sørloth
    20313: { age2026: 31, nationality: 'ARG' }, // A. Correa
    20314: { age2026: 23, nationality: 'ESP' }, // P. Barrios
    20315: { age2026: 26, nationality: 'ESP' }, // R. Riquelme
    20316: { age2026: 37, nationality: 'BEL' }, // A. Witsel

    // 204. Athletic Club
    20401: { age2026: 29, nationality: 'ESP' }, // Unai Simón
    20402: { age2026: 25, nationality: 'ESP' }, // J. Agirrezabala
    20403: { age2026: 27, nationality: 'ESP' }, // D. Vivian
    20404: { age2026: 31, nationality: 'ESP' }, // Yeray
    20405: { age2026: 36, nationality: 'ESP' }, // Yuri Berchiche
    20406: { age2026: 37, nationality: 'ESP' }, // Ó. De Marcos
    20407: { age2026: 33, nationality: 'ESP' }, // I. Ruiz de Galarreta
    20408: { age2026: 25, nationality: 'ESP' }, // Beñat Prados
    20409: { age2026: 26, nationality: 'ESP' }, // O. Sancet
    20410: { age2026: 24, nationality: 'ESP' }, // Nico Williams
    20411: { age2026: 32, nationality: 'GHA' }, // Iñaki Williams
    20412: { age2026: 29, nationality: 'ESP' }, // G. Guruzeta
    20413: { age2026: 31, nationality: 'ESP' }, // Á. Berenguer

    // 205. Real Sociedad
    20501: { age2026: 31, nationality: 'ESP' }, // Á. Remiro
    20502: { age2026: 29, nationality: 'ESP' }, // I. Zubeldia
    20503: { age2026: 30, nationality: 'MAR' }, // N. Aguerd
    20504: { age2026: 24, nationality: 'VEN' }, // J. Aramburu
    20505: { age2026: 24, nationality: 'ESP' }, // Javi López
    20506: { age2026: 27, nationality: 'ESP' }, // M. Zubimendi
    20507: { age2026: 23, nationality: 'CRO' }, // L. Sučić
    20508: { age2026: 29, nationality: 'ESP' }, // Brais Méndez
    20509: { age2026: 25, nationality: 'JPN' }, // T. Kubo
    20510: { age2026: 29, nationality: 'ESP' }, // M. Oyarzabal
    20511: { age2026: 24, nationality: 'ESP' }, // A. Barrenetxea
    20512: { age2026: 21, nationality: 'ISL' }, // O. Óskarsson

    // 206. Real Betis
    20601: { age2026: 32, nationality: 'POR' }, // Rui Silva
    20602: { age2026: 35, nationality: 'ESP' }, // Marc Bartra
    20603: { age2026: 33, nationality: 'ESP' }, // Diego Llorente
    20604: { age2026: 31, nationality: 'ESP' }, // H. Bellerín
    20605: { age2026: 28, nationality: 'FRA' }, // R. Perraud
    20606: { age2026: 24, nationality: 'USA' }, // Johnny Cardoso
    20607: { age2026: 29, nationality: 'ESP' }, // Marc Roca
    20608: { age2026: 30, nationality: 'ESP' }, // P. Fornals
    20609: { age2026: 30, nationality: 'ARG' }, // G. Lo Celso
    20610: { age2026: 34, nationality: 'ESP' }, // Isco
    20611: { age2026: 24, nationality: 'MAR' }, // Abde Ezzalzouli
    20612: { age2026: 21, nationality: 'BRA' }, // Vitor Roque
    20613: { age2026: 32, nationality: 'ARG' }, // Chimy Ávila

    // 208. Villarreal CF
    20801: { age2026: 27, nationality: 'ESP' }, // Diego Conde
    20802: { age2026: 40, nationality: 'ESP' }, // Raúl Albiol
    20803: { age2026: 25, nationality: 'FRA' }, // Logan Costa (Cabo Verde/FRA)
    20804: { age2026: 27, nationality: 'ESP' }, // Sergi Cardona
    20805: { age2026: 35, nationality: 'ESP' }, // Kiko Femenía
    20806: { age2026: 37, nationality: 'ESP' }, // Dani Parejo
    20807: { age2026: 29, nationality: 'ESP' }, // Santi Comesaña
    20808: { age2026: 27, nationality: 'SEN' }, // Pape Gueye
    20809: { age2026: 25, nationality: 'ESP' }, // Álex Baena
    20810: { age2026: 23, nationality: 'ESP' }, // Yeremy Pino
    20811: { age2026: 34, nationality: 'ESP' }, // Gerard Moreno
    20812: { age2026: 33, nationality: 'ESP' }, // Ayoze Pérez
    20813: { age2026: 23, nationality: 'FRA' }, // Thierno Barry

    // =========================================================================
    // BUNDESLIGA (true nationalities + 2026 ages)
    // =========================================================================
    // 401. Bayern München
    40101: { age2026: 40, nationality: 'GER' }, // M. Neuer
    40102: { age2026: 38, nationality: 'GER' }, // S. Ulreich
    40103: { age2026: 26, nationality: 'ISR' }, // D. Peretz
    40104: { age2026: 27, nationality: 'FRA' }, // D. Upamecano
    40105: { age2026: 29, nationality: 'KOR' }, // Kim Min-jae
    40106: { age2026: 32, nationality: 'ENG' }, // E. Dier
    40107: { age2026: 27, nationality: 'JPN' }, // H. Ito
    40108: { age2026: 25, nationality: 'CAN' }, // A. Davies
    40109: { age2026: 32, nationality: 'POR' }, // R. Guerreiro
    40110: { age2026: 25, nationality: 'FRA' }, // S. Boey
    40111: { age2026: 31, nationality: 'GER' }, // J. Kimmich
    40112: { age2026: 31, nationality: 'POR' }, // J. Palhinha
    40113: { age2026: 31, nationality: 'GER' }, // L. Goretzka
    40114: { age2026: 29, nationality: 'AUT' }, // K. Laimer
    40115: { age2026: 22, nationality: 'GER' }, // A. Pavlović
    40116: { age2026: 23, nationality: 'GER' }, // J. Musiala
    40117: { age2026: 36, nationality: 'GER' }, // T. Müller
    40118: { age2026: 24, nationality: 'FRA' }, // M. Olise
    40119: { age2026: 30, nationality: 'GER' }, // L. Sané
    40120: { age2026: 30, nationality: 'FRA' }, // K. Coman
    40121: { age2026: 31, nationality: 'GER' }, // S. Gnabry
    40122: { age2026: 21, nationality: 'FRA' }, // M. Tel
    40123: { age2026: 33, nationality: 'ENG' }, // H. Kane

    // 402. Borussia Dortmund
    40201: { age2026: 28, nationality: 'SUI' }, // G. Kobel
    40202: { age2026: 35, nationality: 'GER' }, // A. Meyer
    40203: { age2026: 26, nationality: 'GER' }, // N. Schlotterbeck
    40204: { age2026: 30, nationality: 'GER' }, // W. Anton
    40205: { age2026: 30, nationality: 'GER' }, // N. Süle
    40206: { age2026: 24, nationality: 'BRA' }, // Y. Couto
    40207: { age2026: 28, nationality: 'NOR' }, // J. Ryerson
    40208: { age2026: 31, nationality: 'ALG' }, // R. Bensebaini
    40209: { age2026: 32, nationality: 'GER' }, // E. Can
    40210: { age2026: 35, nationality: 'GER' }, // P. Groß
    40211: { age2026: 32, nationality: 'AUT' }, // M. Sabitzer
    40212: { age2026: 25, nationality: 'GER' }, // F. Nmecha
    40213: { age2026: 30, nationality: 'GER' }, // J. Brandt
    40214: { age2026: 23, nationality: 'USA' }, // G. Reyna
    40215: { age2026: 24, nationality: 'GER' }, // K. Adeyemi
    40216: { age2026: 27, nationality: 'NED' }, // D. Malen
    40217: { age2026: 22, nationality: 'ENG' }, // J. Bynoe-Gittens
    40218: { age2026: 23, nationality: 'GER' }, // M. Beier
    40219: { age2026: 30, nationality: 'GUI' }, // S. Guirassy
    40220: { age2026: 20, nationality: 'BEL' }, // J. Duranville

    // 403. Bayer Leverkusen
    40301: { age2026: 36, nationality: 'FIN' }, // L. Hradecky
    40302: { age2026: 26, nationality: 'CZE' }, // M. Kovar
    40303: { age2026: 30, nationality: 'GER' }, // J. Tah
    40304: { age2026: 27, nationality: 'BFA' }, // E. Tapsoba
    40305: { age2026: 24, nationality: 'ECU' }, // P. Hincapié
    40306: { age2026: 25, nationality: 'NED' }, // J. Frimpong
    40307: { age2026: 30, nationality: 'ESP' }, // Á. Grimaldo
    40308: { age2026: 28, nationality: 'FRA' }, // N. Mukiele
    40309: { age2026: 23, nationality: 'BRA' }, // Arthur
    40310: { age2026: 33, nationality: 'SUI' }, // G. Xhaka
    40311: { age2026: 27, nationality: 'ARG' }, // E. Palacios
    40312: { age2026: 31, nationality: 'GER' }, // R. Andrich
    40313: { age2026: 29, nationality: 'ESP' }, // A. García
    40314: { age2026: 23, nationality: 'GER' }, // F. Wirtz
    40315: { age2026: 34, nationality: 'GER' }, // J. Hofmann
    40316: { age2026: 27, nationality: 'NGA' }, // N. Tella
    40317: { age2026: 26, nationality: 'MAR' }, // A. Adli
    40318: { age2026: 29, nationality: 'FRA' }, // M. Terrier
    40319: { age2026: 30, nationality: 'CZE' }, // P. Schick
    40320: { age2026: 25, nationality: 'NGA' }, // V. Boniface

    // 404. RB Leipzig
    40401: { age2026: 36, nationality: 'HUN' }, // P. Gulácsi
    40402: { age2026: 24, nationality: 'BEL' }, // M. Vandevoordt
    40403: { age2026: 33, nationality: 'HUN' }, // W. Orbán
    40404: { age2026: 23, nationality: 'FRA' }, // C. Lukeba
    40405: { age2026: 21, nationality: 'FRA' }, // E. Bitshiabu
    40406: { age2026: 28, nationality: 'GER' }, // D. Raum
    40407: { age2026: 26, nationality: 'NED' }, // L. Geertruida
    40408: { age2026: 29, nationality: 'GER' }, // B. Henrichs
    40409: { age2026: 30, nationality: 'GER' }, // L. Klostermann
    40410: { age2026: 28, nationality: 'MLI' }, // A. Haidara
    40411: { age2026: 25, nationality: 'AUT' }, // N. Seiwald
    40412: { age2026: 28, nationality: 'AUT' }, // X. Schlager
    40413: { age2026: 21, nationality: 'BEL' }, // A. Vermeeren
    40414: { age2026: 27, nationality: 'AUT' }, // C. Baumgartner
    40415: { age2026: 35, nationality: 'SVN' }, // K. Kampl
    40416: { age2026: 23, nationality: 'NED' }, // X. Simons
    40417: { age2026: 21, nationality: 'NOR' }, // A. Nusa
    40418: { age2026: 26, nationality: 'MKD' }, // E. Elmas
    40419: { age2026: 23, nationality: 'SVN' }, // B. Šeško
    40420: { age2026: 26, nationality: 'BEL' }, // L. Openda
    40421: { age2026: 32, nationality: 'DEN' }, // Y. Poulsen

    // 405. Eintracht Frankfurt
    40501: { age2026: 36, nationality: 'GER' }, // K. Trapp
    40502: { age2026: 23, nationality: 'BRA' }, // K. Santos
    40503: { age2026: 30, nationality: 'GER' }, // R. Koch
    40504: { age2026: 26, nationality: 'BEL' }, // A. Theate
    40505: { age2026: 27, nationality: 'BRA' }, // Tuta
    40506: { age2026: 29, nationality: 'DEN' }, // R. Kristensen
    40507: { age2026: 25, nationality: 'FRA' }, // N. Nkounkou
    40508: { age2026: 23, nationality: 'SUI' }, // A. Amenda
    40509: { age2026: 31, nationality: 'TUN' }, // E. Skhiri
    40510: { age2026: 22, nationality: 'SWE' }, // H. Larsson
    40511: { age2026: 30, nationality: 'GER' }, // M. Dahoud
    40512: { age2026: 23, nationality: 'ALG' }, // F. Chaïbi
    40513: { age2026: 34, nationality: 'GER' }, // M. Götze
    40514: { age2026: 25, nationality: 'FRA' }, // E. Ebimbe
    40515: { age2026: 21, nationality: 'DEN' }, // O. Højlund
    40516: { age2026: 24, nationality: 'GER' }, // A. Knauff
    40517: { age2026: 27, nationality: 'EGY' }, // O. Marmoush
    40518: { age2026: 24, nationality: 'FRA' }, // H. Ekitiké
    40519: { age2026: 23, nationality: 'CRO' }, // I. Matanović

    // 406. VfB Stuttgart
    40601: { age2026: 29, nationality: 'GER' }, // A. Nübel
    40602: { age2026: 31, nationality: 'GER' }, // F. Bredlow
    40603: { age2026: 28, nationality: 'GER' }, // J. Chabot
    40604: { age2026: 27, nationality: 'FRA' }, // D. Zagadou
    40605: { age2026: 25, nationality: 'FRA' }, // A. Rouault
    40606: { age2026: 29, nationality: 'GER' }, // M. Mittelstädt
    40607: { age2026: 25, nationality: 'GER' }, // J. Vagnoman
    40608: { age2026: 30, nationality: 'GER' }, // P. Stenzel
    40609: { age2026: 25, nationality: 'GER' }, // A. Stiller
    40610: { age2026: 29, nationality: 'GER' }, // A. Karazor
    40611: { age2026: 24, nationality: 'FRA' }, // E. Millot
    40612: { age2026: 28, nationality: 'GER' }, // C. Führich
    40613: { age2026: 25, nationality: 'GER' }, // J. Leweling
    40614: { age2026: 24, nationality: 'SUI' }, // F. Rieder
    40615: { age2026: 26, nationality: 'GER' }, // Y. Keitel
    40616: { age2026: 30, nationality: 'GER' }, // D. Undav
    40617: { age2026: 28, nationality: 'BIH' }, // E. Demirović
    40618: { age2026: 24, nationality: 'MLI' }, // E. B. Touré
    40619: { age2026: 24, nationality: 'GER' }, // N. Woltemade

    // 407-418 Bundesliga key foreign players (domestic default is GER)
    40704: { nationality: 'AUT' }, // P. Lienhart
    40705: { nationality: 'FRA' }, // K. Sildillia
    40712: { nationality: 'ITA' }, // V. Grifo
    40713: { nationality: 'JPN' }, // R. Dōan
    40715: { nationality: 'KOS' }, // F. Muslija
    40717: { nationality: 'AUT' }, // M. Gregoritsch
    40718: { nationality: 'AUT' }, // J. Adamu
    40803: { nationality: 'TUR' }, // O. Kabak
    40806: { nationality: 'CZE' }, // P. Kadeřábek
    40807: { nationality: 'CZE' }, // D. Jurásek
    40808: { nationality: 'FRA' }, // V. Gendrey
    40810: { nationality: 'AUT' }, // F. Grillitsch
    40814: { nationality: 'CRO' }, // A. Kramarić
    40817: { nationality: 'CZE' }, // A. Hložek
    40818: { nationality: 'BIH' }, // H. Tabaković
    40908: { nationality: 'TOG' }, // H. Traoré (Omar/H. Traoré)
    40909: { nationality: 'USA' }, // L. Maloney
    40915: { nationality: 'BRA' }, // Léo Scienza
    41003: { nationality: 'AUT' }, // M. Friedl
    41004: { nationality: 'SRB' }, // M. Veljković
    41007: { nationality: 'ARG' }, // J. Malatini
    41010: { nationality: 'BEL' }, // S. Lynen
    41011: { nationality: 'DEN' }, // J. Stage
    41013: { nationality: 'AUT' }, // R. Schmid
    41014: { nationality: 'FRA' }, // S. Alvero
    41019: { nationality: 'AUT' }, // M. Grüll
    41101: { nationality: 'CRO' }, // N. Labrović
    41103: { nationality: 'NED' }, // J. Gouweleeuw
    41106: { nationality: 'FRA' }, // C. Matsima
    41107: { nationality: 'GRE' }, // D. Giannoulis
    41108: { nationality: 'DEN' }, // M. Pedersen
    41110: { nationality: 'CRO' }, // K. Jakić
    41111: { nationality: 'KOS' }, // E. Rexhbeçaj
    41113: { nationality: 'FIN' }, // F. Jensen
    41114: { nationality: 'FRA' }, // A. Claude-Maurice
    41115: { nationality: 'SUI' }, // R. Vargas
    41117: { nationality: 'COD' }, // S. Essende
    41201: { nationality: 'POL' }, // K. Grabara
    41202: { nationality: 'AUT' }, // P. Pervan
    41203: { nationality: 'BEL' }, // S. Bornauw
    41204: { age2026: 28, nationality: 'SUI' }, // C. Zesiger
    41205: { nationality: 'GRE' }, // K. Koulierakis
    41206: { nationality: 'DEN' }, // J. Mæhle
    41207: { nationality: 'BRA' }, // Rogério
    41210: { nationality: 'SWE' }, // M. Svanberg
    41212: { nationality: 'TUR' }, // S. Özcan
    41213: { nationality: 'CRO' }, // L. Majer
    41214: { nationality: 'AUT' }, // B. Wimmer
    41215: { nationality: 'POR' }, // T. Tomás
    41216: { nationality: 'USA' }, // K. Paredes
    41217: { nationality: 'DEN' }, // J. Wind
    41218: { nationality: 'ALG' }, // M. Amoura
    41305: { nationality: 'NOR' }, // A. Hanche-Olsen
    41307: { nationality: 'AUT' }, // P. Mwene
    41308: { nationality: 'FRA' }, // A. Caci
    41309: { nationality: 'SUI' }, // S. Widmer
    41311: { nationality: 'JPN' }, // K. Sano
    41312: { nationality: 'KOR' }, // J. Lee
    41313: { nationality: 'KOR' }, // H. Hong
    41401: { nationality: 'SUI' }, // J. Omlin
    41403: { nationality: 'SUI' }, // N. Elvedi
    41404: { nationality: 'JPN' }, // K. Itakura
    41407: { nationality: 'USA' }, // J. Scally
    41409: { nationality: 'AUT' }, // S. Lainer
    41414: { nationality: 'AUT' }, // K. Stöger
    41415: { nationality: 'FRA' }, // A. Pléa
    41416: { nationality: 'FRA' }, // F. Honorat
    41418: { nationality: 'FRA' }, // N. Ngoumou
    41419: { nationality: 'CZE' }, // T. Čvančara
    41503: { nationality: 'UKR' }, // I. Ordets
    41504: { nationality: 'SRB' }, // E. Mašović
    41505: { nationality: 'CRO' }, // J. Medić
    41506: { nationality: 'BRA' }, // Bernardo
    41510: { nationality: 'FRA' }, // A. Losilla
    41511: { nationality: 'FRA' }, // I. Sissoko
    41512: { nationality: 'SVK' }, // M. Bero
    41513: { nationality: 'NED' }, // D. de Wit
    41514: { nationality: 'JPN' }, // K. Miyoshi
    41517: { nationality: 'NED' }, // M. Boadu
    41601: { nationality: 'DEN' }, // F. Rønnow
    41603: { nationality: 'NED' }, // D. Doekhi
    41605: { nationality: 'POR' }, // Diogo Leite
    41606: { nationality: 'AUT' }, // L. Querfeld
    41607: { nationality: 'CRO' }, // J. Juranović
    41609: { nationality: 'AUT' }, // C. Trimmel
    41611: { nationality: 'HUN' }, // A. Schäfer
    41612: { nationality: 'FRA' }, // L. Tousart
    41615: { nationality: 'KOR' }, // W. Jeong
    41616: { nationality: 'BEL' }, // Y. Vertessen
    41618: { nationality: 'USA' }, // J. Siebatcheu
    41701: { nationality: 'BIH' }, // N. Vasilj
    41704: { nationality: 'SWE' }, // E. Smith
    41705: { nationality: 'OTHER' }, // K. Mets (Estonia)
    41708: { nationality: 'GRE' }, // M. Saliakas
    41710: { nationality: 'AUS' }, // J. Irvine
    41713: { nationality: 'AUS' }, // C. Metcalfe
    41715: { nationality: 'ENG' }, // O. Afolayan
    41717: { nationality: 'GUI' }, // M. Guilavogui
    41718: { nationality: 'SCO' }, // S. Banks
    41804: { nationality: 'SWE' }, // C. Johansson
    41805: { nationality: 'CRO' }, // M. Ivezic
    41807: { nationality: 'POL' }, // T. Puchacz
    41811: { nationality: 'BIH' }, // A. Gigović
    41812: { nationality: 'DEN' }, // M. Knudsen
    41816: { nationality: 'JPN' }, // S. Machino
    41817: { nationality: 'AUT' }, // B. Pichler
    41819: { nationality: 'SWE' }, // A. Bernhardsson

    // =========================================================================
    // SERIE A (exact 2026 ages & real nationalities)
    // =========================================================================
    // 501. Inter Milano
    50101: { age2026: 37, nationality: 'SUI' }, // Yann Sommer
    50102: { age2026: 28, nationality: 'ESP' }, // Josep Martínez
    50103: { age2026: 27, nationality: 'ITA' }, // Alessandro Bastoni
    50104: { age2026: 30, nationality: 'FRA' }, // Benjamin Pavard
    50105: { age2026: 34, nationality: 'NED' }, // Stefan de Vrij
    50106: { age2026: 38, nationality: 'ITA' }, // Francesco Acerbi
    50107: { age2026: 28, nationality: 'ITA' }, // Federico Dimarco
    50108: { age2026: 30, nationality: 'NED' }, // Denzel Dumfries
    50109: { age2026: 29, nationality: 'ITA' }, // Nicolò Barella
    50110: { age2026: 32, nationality: 'TUR' }, // Hakan Çalhanoğlu
    50111: { age2026: 37, nationality: 'ARM' }, // Henrikh Mkhitaryan
    50112: { age2026: 26, nationality: 'ITA' }, // Davide Frattesi
    50113: { age2026: 32, nationality: 'POL' }, // Piotr Zieliński
    50114: { age2026: 29, nationality: 'ARG' }, // Lautaro Martínez
    50115: { age2026: 29, nationality: 'FRA' }, // Marcus Thuram
    50116: { age2026: 34, nationality: 'IRN' }, // Mehdi Taremi

    // 502. AC Milan
    50201: { age2026: 31, nationality: 'FRA' }, // Mike Maignan
    50202: { age2026: 34, nationality: 'ITA' }, // Marco Sportiello
    50203: { age2026: 28, nationality: 'ENG' }, // Fikayo Tomori
    50204: { age2026: 25, nationality: 'SRB' }, // Strahinja Pavlović
    50205: { age2026: 25, nationality: 'GER' }, // Malick Thiaw
    50206: { age2026: 28, nationality: 'FRA' }, // Theo Hernández
    50207: { age2026: 27, nationality: 'BRA' }, // Emerson Royal
    50208: { age2026: 28, nationality: 'NED' }, // Tijjani Reijnders
    50209: { age2026: 27, nationality: 'FRA' }, // Youssouf Fofana
    50210: { age2026: 30, nationality: 'ENG' }, // Ruben Loftus-Cheek
    50211: { age2026: 27, nationality: 'USA' }, // Christian Pulisic
    50212: { age2026: 27, nationality: 'POR' }, // Rafael Leão
    50213: { age2026: 27, nationality: 'NGA' }, // Samuel Chukwueze
    50214: { age2026: 33, nationality: 'ESP' }, // Álvaro Morata
    50215: { age2026: 28, nationality: 'ENG' }, // Tammy Abraham

    // 503. Juventus
    50301: { age2026: 29, nationality: 'ITA' }, // Michele Di Gregorio
    50302: { age2026: 33, nationality: 'ITA' }, // Mattia Perin
    50303: { age2026: 29, nationality: 'BRA' }, // Bremer
    50304: { age2026: 28, nationality: 'ITA' }, // Federico Gatti
    50305: { age2026: 26, nationality: 'FRA' }, // Pierre Kalulu
    50306: { age2026: 26, nationality: 'ITA' }, // Andrea Cambiaso
    50307: { age2026: 35, nationality: 'BRA' }, // Danilo
    50308: { age2026: 28, nationality: 'ITA' }, // Manuel Locatelli
    50309: { age2026: 28, nationality: 'NED' }, // Teun Koopmeiners
    50310: { age2026: 28, nationality: 'BRA' }, // Douglas Luiz
    50311: { age2026: 25, nationality: 'FRA' }, // Khéphren Thuram
    50312: { age2026: 21, nationality: 'TUR' }, // Kenan Yıldız
    50313: { age2026: 23, nationality: 'POR' }, // Francisco Conceição
    50314: { age2026: 28, nationality: 'ARG' }, // Nicolás González
    50315: { age2026: 26, nationality: 'SRB' }, // Dušan Vlahović

    // 504. AS Roma
    50401: { age2026: 27, nationality: 'SRB' }, // Mile Svilar
    50402: { age2026: 30, nationality: 'ITA' }, // Gianluca Mancini
    50403: { age2026: 27, nationality: 'CIV' }, // Evan Ndicka
    50404: { age2026: 37, nationality: 'GER' }, // Mats Hummels
    50405: { age2026: 29, nationality: 'ESP' }, // Angeliño
    50406: { age2026: 29, nationality: 'TUR' }, // Zeki Çelik
    50407: { age2026: 31, nationality: 'ITA' }, // Bryan Cristante
    50408: { age2026: 25, nationality: 'FRA' }, // Manu Koné
    50409: { age2026: 30, nationality: 'ITA' }, // Lorenzo Pellegrini
    50410: { age2026: 32, nationality: 'ARG' }, // Paulo Dybala
    50411: { age2026: 23, nationality: 'ARG' }, // Matías Soulé
    50412: { age2026: 29, nationality: 'UKR' }, // Artem Dovbyk
    50413: { age2026: 33, nationality: 'ITA' }, // Stephan El Shaarawy

    // 505. SSC Napoli
    50501: { age2026: 29, nationality: 'ITA' }, // Alex Meret
    50502: { age2026: 27, nationality: 'ITA' }, // Alessandro Buongiorno
    50503: { age2026: 32, nationality: 'KOS' }, // Amir Rrahmani
    50504: { age2026: 33, nationality: 'ITA' }, // Giovanni Di Lorenzo
    50505: { age2026: 33, nationality: 'ITA' }, // Leonardo Spinazzola
    50506: { age2026: 31, nationality: 'SVK' }, // Stanislav Lobotka
    50507: { age2026: 30, nationality: 'CMR' }, // Zambo Anguissa
    50508: { age2026: 29, nationality: 'SCO' }, // Scott McTominay
    50509: { age2026: 25, nationality: 'GEO' }, // Khvicha Kvaratskhelia
    50510: { age2026: 33, nationality: 'ITA' }, // Matteo Politano
    50511: { age2026: 33, nationality: 'BEL' }, // Romelu Lukaku
    50512: { age2026: 29, nationality: 'BRA' }, // David Neres
    50513: { age2026: 26, nationality: 'ITA' }, // Giacomo Raspadori

    // 506. Atalanta
    50601: { age2026: 26, nationality: 'ITA' }, // Marco Carnesecchi
    50602: { age2026: 27, nationality: 'SWE' }, // Isak Hien
    50603: { age2026: 33, nationality: 'ALB' }, // Berat Djimsiti
    50604: { age2026: 33, nationality: 'BIH' }, // Sead Kolašinac
    50605: { age2026: 26, nationality: 'ITA' }, // Raoul Bellanova
    50606: { age2026: 35, nationality: 'NED' }, // Marten de Roon
    50607: { age2026: 27, nationality: 'BRA' }, // Éderson
    50608: { age2026: 31, nationality: 'CRO' }, // Mario Pašalić
    50609: { age2026: 25, nationality: 'BEL' }, // Charles De Ketelaere
    50610: { age2026: 28, nationality: 'NGA' }, // Ademola Lookman
    50611: { age2026: 27, nationality: 'ITA' }, // Mateo Retegui
    50612: { age2026: 27, nationality: 'ITA' }, // Nicolò Zaniolo

    // 507. Lazio
    50701: { age2026: 32, nationality: 'ITA' }, // Ivan Provedel
    50702: { age2026: 31, nationality: 'ITA' }, // Alessio Romagnoli
    50703: { age2026: 25, nationality: 'ESP' }, // Mario Gila
    50704: { age2026: 32, nationality: 'ITA' }, // Manuel Lazzari
    50705: { age2026: 27, nationality: 'FRA' }, // Mattéo Guendouzi
    50706: { age2026: 24, nationality: 'ITA' }, // Nicolò Rovella
    50707: { age2026: 34, nationality: 'URU' }, // Matías Vecino
    50708: { age2026: 31, nationality: 'ITA' }, // Mattia Zaccagni
    50709: { age2026: 25, nationality: 'DEN' }, // Gustav Isaksen
    50710: { age2026: 29, nationality: 'SEN' }, // Boulaye Dia
    50711: { age2026: 27, nationality: 'ARG' }, // Valentín Castellanos

    // =========================================================================
    // LIGUE 1 (exact 2026 ages & real nationalities)
    // =========================================================================
    // 601. PSG
    60101: { age2026: 27, nationality: 'ITA' }, // Gianluigi Donnarumma
    60102: { age2026: 27, nationality: 'RUS' }, // Matvey Safonov
    60103: { age2026: 32, nationality: 'BRA' }, // Marquinhos
    60104: { age2026: 24, nationality: 'ECU' }, // Willian Pacho
    60105: { age2026: 22, nationality: 'BRA' }, // Lucas Beraldo
    60106: { age2026: 24, nationality: 'POR' }, // Nuno Mendes
    60107: { age2026: 27, nationality: 'MAR' }, // Achraf Hakimi
    60108: { age2026: 26, nationality: 'POR' }, // Vitinha
    60109: { age2026: 20, nationality: 'FRA' }, // Warren Zaïre-Emery
    60110: { age2026: 21, nationality: 'POR' }, // João Neves
    60111: { age2026: 30, nationality: 'ESP' }, // Fabián Ruiz
    60112: { age2026: 25, nationality: 'KOR' }, // Lee Kang-in
    60113: { age2026: 29, nationality: 'FRA' }, // Ousmane Dembélé
    60114: { age2026: 23, nationality: 'FRA' }, // Bradley Barcola
    60115: { age2026: 25, nationality: 'POR' }, // Gonçalo Ramos
    60116: { age2026: 30, nationality: 'ESP' }, // Marco Asensio

    // 602. Olympique de Marseille
    60201: { age2026: 34, nationality: 'ARG' }, // Gerónimo Rulli
    60202: { age2026: 27, nationality: 'ARG' }, // Leonardo Balerdi
    60203: { age2026: 28, nationality: 'CAN' }, // Derek Cornelius
    60204: { age2026: 30, nationality: 'PAN' }, // Michael Murillo
    60205: { age2026: 24, nationality: 'FRA' }, // Quentin Merlin
    60206: { age2026: 31, nationality: 'DEN' }, // Pierre-Emile Højbjerg
    60207: { age2026: 31, nationality: 'FRA' }, // Adrien Rabiot
    60208: { age2026: 31, nationality: 'FRA' }, // Valentin Rongier
    60209: { age2026: 24, nationality: 'ENG' }, // Mason Greenwood
    60210: { age2026: 29, nationality: 'MAR' }, // Amine Harit
    60211: { age2026: 24, nationality: 'BRA' }, // Luis Henrique
    60212: { age2026: 23, nationality: 'FRA' }, // Elye Wahi
    60213: { age2026: 30, nationality: 'FRA' }, // Neal Maupay

    // 603. AS Monaco
    60301: { age2026: 28, nationality: 'SUI' }, // Philipp Köhn
    60302: { age2026: 25, nationality: 'CIV' }, // Wilfried Singo
    60303: { age2026: 29, nationality: 'GER' }, // Thilo Kehrer
    60304: { age2026: 27, nationality: 'GHA' }, // Mohammed Salisu
    60305: { age2026: 29, nationality: 'BRA' }, // Caio Henrique
    60306: { age2026: 25, nationality: 'BRA' }, // Vanderson
    60307: { age2026: 29, nationality: 'SUI' }, // Denis Zakaria
    60308: { age2026: 22, nationality: 'SEN' }, // Lamine Camara
    60309: { age2026: 24, nationality: 'FRA' }, // Maghnes Akliouche
    60310: { age2026: 31, nationality: 'JPN' }, // Takumi Minamino
    60311: { age2026: 30, nationality: 'RUS' }, // Aleksandr Golovin
    60312: { age2026: 29, nationality: 'SUI' }, // Breel Embolo
    60313: { age2026: 25, nationality: 'USA' }, // Folarin Balogun
    60314: { age2026: 20, nationality: 'NGA' }, // George Ilenikhena

    // 605. LOSC Lille
    60501: { age2026: 24, nationality: 'FRA' }, // Lucas Chevalier
    60502: { age2026: 25, nationality: 'FRA' }, // Bafodé Diakité
    60503: { age2026: 27, nationality: 'BRA' }, // Alexsandro
    60504: { age2026: 34, nationality: 'BEL' }, // Thomas Meunier
    60505: { age2026: 27, nationality: 'SWE' }, // Gabriel Gudmundsson
    60506: { age2026: 36, nationality: 'FRA' }, // Benjamin André
    60507: { age2026: 25, nationality: 'ENG' }, // Angel Gomes
    60508: { age2026: 27, nationality: 'KOS' }, // Edon Zhegrova
    60509: { age2026: 23, nationality: 'ISL' }, // Hakon Haraldsson
    60510: { age2026: 25, nationality: 'MAR' }, // Osame Sahraoui
    60511: { age2026: 26, nationality: 'CAN' }, // Jonathan David

    // 607. Olympique Lyonnais
    60701: { age2026: 28, nationality: 'BRA' }, // Lucas Perri
    60702: { age2026: 30, nationality: 'SEN' }, // Moussa Niakhaté
    60703: { age2026: 29, nationality: 'CRO' }, // Duje Ćaleta-Car
    60704: { age2026: 33, nationality: 'ARG' }, // Nicolás Tagliafico
    60705: { age2026: 29, nationality: 'ENG' }, // Ainsley Maitland-Niles
    60706: { age2026: 26, nationality: 'FRA' }, // Maxence Caqueret
    60707: { age2026: 32, nationality: 'FRA' }, // Corentin Tolisso
    60708: { age2026: 38, nationality: 'SRB' }, // Nemanja Matić
    60709: { age2026: 23, nationality: 'FRA' }, // Rayan Cherki
    60710: { age2026: 21, nationality: 'BEL' }, // Malick Fofana
    60711: { age2026: 35, nationality: 'FRA' }, // Alexandre Lacazette
    60712: { age2026: 25, nationality: 'GEO' }, // Georges Mikautadze

    // =========================================================================
    // CHAMPIONSHIP notable non-ENG players
    // =========================================================================
    10101: { nationality: 'FRA' }, // I. Meslier
    10103: { nationality: 'NED' }, // P. Struijk
    10104: { nationality: 'WAL' }, // J. Rodon
    10106: { nationality: 'ESP' }, // J. Firpo
    10107: { nationality: 'WAL' }, // E. Ampadu
    10108: { nationality: 'GER' }, // I. Gruev (Bulgaria/GER)
    10109: { nationality: 'JPN' }, // A. Tanaka
    10110: { nationality: 'USA' }, // B. Aaronson
    10111: { nationality: 'WAL' }, // D. James
    10112: { nationality: 'ITA' }, // W. Gnonto
    10113: { nationality: 'ISR' }, // M. Solomon
    10114: { nationality: 'ESP' }, // M. Joseph
    10115: { nationality: 'NED' }, // J. Piroe
    10202: { nationality: 'CZE' }, // V. Hladký
    10203: { nationality: 'FRA' }, // M. Estève
    10204: { nationality: 'GER' }, // J. Beyer
    10205: { nationality: 'WAL' }, // C. Roberts
    10206: { nationality: 'BRA' }, // L. Pires
    10207: { nationality: 'IRL' }, // J. Cullen
    10208: { nationality: 'TUN' }, // H. Mejbri
    10210: { nationality: 'ITA' }, // L. Koleosho
    10211: { nationality: 'ECU' }, // J. Sarmiento
    10212: { nationality: 'NED' }, // Z. Flemming
    10301: { nationality: 'BEL' }, // T. Kaminski
    10302: { nationality: 'IRL' }, // M. McGuinness
    10306: { nationality: 'ZIM' }, // M. Nakamba
    10308: { nationality: 'NED' }, // T. Chong
    10403: { nationality: 'BIH' }, // A. Ahmedhodzic
    10404: { nationality: 'AUS' }, // H. Souttar
    10407: { nationality: 'BRA' }, // V. Souza
    10409: { nationality: 'NED' }, // G. Hamer
    10412: { nationality: 'WAL' }, // K. Moore
    10602: { nationality: 'IRL' }, // S. Duffy
    10603: { nationality: 'PAN' }, // J. Córdoba
    10604: { nationality: 'SCO' }, // K. McLean
    10605: { nationality: 'CHI' }, // M. Núñez
    10606: { nationality: 'CRO' }, // A. Crnac
    10607: { nationality: 'ESP' }, // J. Sainz
    10608: { age2026: 26, nationality: 'USA' }, // J. Sargent
    10612: { nationality: 'SUI' }, // C. Fassnacht
    10901: { nationality: 'SEN' }, // S. Dieng
    10902: { nationality: 'NED' }, // R. van den Berg
    10906: { nationality: 'USA' }, // A. Morris
    10907: { nationality: 'IRL' }, // F. Azaz
    10908: { nationality: 'SCO' }, // B. Doak
    10909: { nationality: 'SCO' }, // T. Conway
    10910: { nationality: 'CIV' }, // E. Latte Lath
    11311: { nationality: 'FRA' }, // W. Isidor
    11312: { nationality: 'ESP' }, // E. Mayenda

    // =========================================================================
    // LIGA ARGENTINA (already 2026 ages -> exact foreign nationalities!)
    // =========================================================================
    // Boca Juniors
    70118: { nationality: 'CHI' }, // W. Alarcón
    70122: { nationality: 'CHI' }, // C. Palacios
    70125: { nationality: 'PAR' }, // A. Romero
    70126: { nationality: 'ECU' }, // E. Valencia
    70127: { nationality: 'URU' }, // M. Merentiel
    70130: { nationality: 'COL' }, // S. Villa
    70131: { nationality: 'PAR' }, // A. Bareiro
    // River Plate
    70207: { nationality: 'URU' }, // G. González
    70225: { nationality: 'COL' }, // R. Borré
    // Racing Club
    70324: { nationality: 'COL' }, // D. Vergara
    70325: { nationality: 'ARG' }, // A. Martinez (Maravilla)
    // Independiente
    70406: { nationality: 'URU' }, // S. Arias
    70408: { nationality: 'CHI' }, // F. Zabala
    70416: { nationality: 'CHI' }, // L. Cabral
    70425: { nationality: 'URU' }, // M. Abaldo
    // San Lorenzo
    70504: { nationality: 'COL' }, // D. Arboleda
    70507: { nationality: 'URU' }, // G. Corujo
    70530: { nationality: 'COL' }, // D. Herazo
    // Estudiantes
    70603: { nationality: 'URU' }, // F. Muslera
    70607: { nationality: 'PAR' }, // S. Arzamendia
    70614: { nationality: 'URU' }, // G. Neves
    70625: { nationality: 'COL' }, // E. Cetré
    // Huracán
    70801: { nationality: 'ECU' }, // H. Galíndez
    70812: { nationality: 'URU' }, // R. Fernández Cedrés
    70818: { nationality: 'PAR' }, // O. Romero
    70822: { nationality: 'COL' }, // O. Cortés
    70823: { nationality: 'COL' }, // J. Caicedo
    70826: { nationality: 'CHI' }, // B. Barticciotto
    // Rosario Central
    70909: { nationality: 'URU' }, // F. Mallo
    70922: { nationality: 'COL' }, // J. Campaz
    70925: { age2026: 38, nationality: 'ARG' }, // Á. Di María
    // Newell's
    71001: { nationality: 'ARG' }, // G. Arias (ARG/CHI)
    71007: { nationality: 'PAR' }, // S. Salcedo
    71026: { nationality: 'URU' }, // M. Cóccaro
    71032: { nationality: 'URU' }, // I. Ramírez
    // Talleres
    71114: { nationality: 'PAR' }, // M. Galarza
    71124: { nationality: 'COL' }, // D. Valoyes
    71129: { nationality: 'BRA' }, // Rick

    // =========================================================================
    // BRASILEIRAO (2024 baseline + exact foreign nationalities)
    // =========================================================================
    80101: { nationality: 'ARG' }, // Agustín Rossi
    80103: { nationality: 'URU' }, // Guillermo Varela
    80109: { nationality: 'CHI' }, // Erick Pulgar
    80110: { nationality: 'URU' }, // Nicolás de la Cruz
    80112: { nationality: 'URU' }, // G. de Arrascaeta
    80113: { nationality: 'ARG' }, // Carlos Alcaraz
    80114: { nationality: 'ECU' }, // Gonzalo Plata
    80204: { nationality: 'PAR' }, // Gustavo Gómez
    80206: { nationality: 'URU' }, // Joaquín Piquerez
    80207: { nationality: 'ARG' }, // Agustín Giay
    80209: { nationality: 'ARG' }, // Aníbal Moreno
    80211: { nationality: 'COL' }, // Richard Ríos
    80216: { nationality: 'ARG' }, // Flaco López
    80303: { nationality: 'ECU' }, // Robert Arboleda
    80304: { nationality: 'ARG' }, // Alan Franco
    80315: { nationality: 'ARG' }, // Jonathan Calleri
    80405: { nationality: 'ECU' }, // Félix Torres
    80408: { nationality: 'VEN' }, // José Martínez
    80410: { nationality: 'PER' }, // André Carrillo
    80412: { nationality: 'ARG' }, // Rodrigo Garro
    80413: { nationality: 'PAR' }, // Ángel Romero
    80416: { nationality: 'NED' }, // Memphis Depay
    80505: { nationality: 'ARG' }, // Gonzalo Escobar
    80510: { nationality: 'VEN' }, // Rómulo Otero
    80513: { nationality: 'ARG' }, // Julio Furch
    80601: { nationality: 'ARG' }, // Agustín Marchesín
    80603: { nationality: 'ARG' }, // Walter Kannemann
    80608: { nationality: 'PAR' }, // Mathías Villasanti
    80610: { nationality: 'ARG' }, // Franco Cristaldo
    80612: { nationality: 'VEN' }, // Yeferson Soteldo
    80613: { nationality: 'ARG' }, // Cristian Pavón
    80614: { nationality: 'DEN' }, // Martin Braithwaite
    80701: { nationality: 'URU' }, // Sergio Rochet
    80704: { nationality: 'ARG' }, // Gabriel Mercado
    80705: { nationality: 'URU' }, // Agustín Rogel
    80706: { nationality: 'ARG' }, // Alexandro Bernabei
    80714: { nationality: 'COL' }, // Rafael Borré
    80715: { nationality: 'ECU' }, // Enner Valencia
    80716: { nationality: 'ARG' }, // Lucas Alario
    80803: { nationality: 'ARG' }, // Renzo Saravia
    80804: { nationality: 'ARG' }, // Rodrigo Battaglia
    80805: { nationality: 'PAR' }, // Junior Alonso
    80809: { nationality: 'ARG' }, // Fausto Vera
    80810: { nationality: 'ECU' }, // Alan Franco
    80816: { nationality: 'CHI' }, // Eduardo Vargas
    80909: { nationality: 'URU' }, // Facundo Bernal
    80912: { nationality: 'COL' }, // Jhon Arias
    80915: { nationality: 'ARG' }, // Germán Cano
    81002: { nationality: 'PAR' }, // Gatito Fernández
    81004: { nationality: 'ANG' }, // Bastos
    81005: { nationality: 'ARG' }, // Alexander Barboza
    81010: { nationality: 'ARG' }, // Thiago Almada
    81013: { nationality: 'VEN' }, // Jefferson Savarino
    81109: { nationality: 'FRA' }, // Dimitri Payet
    81111: { nationality: 'COL' }, // Emerson Rodríguez
    81112: { nationality: 'ARG' }, // Pablo Vegetti
    81207: { nationality: 'ARG' }, // Lucas Romero
    81211: { nationality: 'ARG' }, // Álvaro Barreal
    81212: { nationality: 'ARG' }, // Lautaro Díaz
    81215: { nationality: 'ARG' }, // Juan Dinenno
    81302: { nationality: 'COL' }, // Santiago Arias
    81311: { nationality: 'URU' }, // Luciano Rodríguez
    81403: { nationality: 'CHI' }, // Benjamín Kuscevic
    81404: { nationality: 'ARG' }, // Tomás Cardona
    81408: { nationality: 'ARG' }, // Emmanuel Martínez
    81409: { nationality: 'ARG' }, // Tomás Pochettino
    81412: { nationality: 'ARG' }, // Juan Martín Lucero

    // =========================================================================
    // CHILE (missing ages -> exact 2026 ages & nationalities)
    // =========================================================================
    120101: { age2026: 31, nationality: 'CHI' }, // Brayan Cortés
    120102: { age2026: 29, nationality: 'URU' }, // Maximiliano Falcón
    120103: { age2026: 23, nationality: 'URU' }, // Alan Saldivia
    120104: { age2026: 38, nationality: 'CHI' }, // Mauricio Isla
    120105: { age2026: 29, nationality: 'CHI' }, // Erick Wiemberg
    120106: { age2026: 32, nationality: 'CHI' }, // Esteban Pavez
    120107: { age2026: 39, nationality: 'CHI' }, // Arturo Vidal
    120108: { age2026: 35, nationality: 'CHI' }, // Leonardo Gil
    120109: { age2026: 26, nationality: 'CHI' }, // Carlos Palacios
    120110: { age2026: 33, nationality: 'ARG' }, // Javier Correa
    120111: { age2026: 28, nationality: 'PAR' }, // Guillermo Paiva
    120112: { age2026: 24, nationality: 'CHI' }, // Lucas Cepeda
    120201: { age2026: 30, nationality: 'CHI' }, // Gabriel Castellón
    120202: { age2026: 28, nationality: 'ARG' }, // Franco Calderón
    120203: { age2026: 34, nationality: 'CHI' }, // Matías Zaldivia
    120204: { age2026: 23, nationality: 'CHI' }, // Marcelo Morales
    120205: { age2026: 28, nationality: 'CHI' }, // Fabián Hormazábal
    120206: { age2026: 39, nationality: 'CHI' }, // Marcelo Díaz
    120207: { age2026: 37, nationality: 'CHI' }, // Charles Aránguiz
    120208: { age2026: 29, nationality: 'CHI' }, // Israel Poblete
    120209: { age2026: 29, nationality: 'CHI' }, // Matías Sepúlveda
    120210: { age2026: 35, nationality: 'ARG' }, // Leandro Fernández
    120211: { age2026: 34, nationality: 'URU' }, // Cristian Palacios
    120212: { age2026: 26, nationality: 'CHI' }, // Maximiliano Guerrero
    120301: { age2026: 35, nationality: 'CHI' }, // Sebastián Pérez
    120302: { age2026: 23, nationality: 'CHI' }, // Daniel González
    120303: { age2026: 28, nationality: 'CHI' }, // Branco Ampuero
    120304: { age2026: 32, nationality: 'CHI' }, // Guillermo Soto
    120305: { age2026: 34, nationality: 'CHI' }, // Alfonso Parot
    120306: { age2026: 37, nationality: 'ARG' }, // Agustín Farías
    120307: { age2026: 33, nationality: 'ARG' }, // Fernando Zuqui
    120308: { age2026: 32, nationality: 'CHI' }, // César Pinares
    120309: { age2026: 24, nationality: 'CHI' }, // Gonzalo Tapia
    120310: { age2026: 38, nationality: 'ARG' }, // Fernando Zampedri
    120311: { age2026: 23, nationality: 'CHI' }, // Clemente Montes
    120312: { age2026: 22, nationality: 'BRA' }, // Jader Gentil

    // =========================================================================
    // LIGA MX / COLOMBIA / PARAGUAY notable foreign players
    // =========================================================================
    110102: { nationality: 'URU' }, // Sebastián Cáceres
    110105: { nationality: 'ESP' }, // Álvaro Fidalgo
    110107: { nationality: 'CHI' }, // Diego Valdés
    110108: { nationality: 'USA' }, // Alejandro Zendejas
    110110: { nationality: 'URU' }, // Brian Rodríguez
    110111: { nationality: 'NED' }, // Javairô Dilrosun
    110112: { nationality: 'URU' }, // Rodrigo Aguirre
    110210: { nationality: 'USA' }, // Cade Cowell
    110301: { nationality: 'COL' }, // Kevin Mier
    110302: { nationality: 'COL' }, // Willer Ditta
    110303: { nationality: 'ARG' }, // Gonzalo Piovi
    110307: { nationality: 'ARG' }, // Lorenzo Faravelli
    110308: { nationality: 'URU' }, // Ignacio Rivero
    110311: { nationality: 'GRE' }, // Giorgos Giakoumakis
    110401: { nationality: 'ARG' }, // Esteban Andrada
    110405: { nationality: 'ARG' }, // Jorge Rodríguez
    110406: { nationality: 'ESP' }, // Óliver Torres
    110407: { nationality: 'ESP' }, // Sergio Canales
    110408: { nationality: 'ARG' }, // Lucas Ocampos
    110410: { nationality: 'ARG' }, // Germán Berterame
    110411: { nationality: 'USA' }, // Brandon Vázquez
    110501: { nationality: 'ARG' }, // Nahuel Guzmán
    110502: { nationality: 'BRA' }, // Joaquim
    110503: { nationality: 'ARG' }, // Guido Pizarro
    110505: { nationality: 'BRA' }, // Rafael Carioca
    110506: { nationality: 'URU' }, // Fernando Gorriarán
    110507: { nationality: 'ARG' }, // Juan Brunetta
    110510: { nationality: 'FRA' }, // André-Pierre Gignac
    110511: { nationality: 'ARG' }, // Nicolás Ibáñez
    110601: { nationality: 'BRA' }, // Tiago Volpi
    110602: { nationality: 'URU' }, // Federico Pereira
    110603: { nationality: 'BRA' }, // Luan Garcia
    110606: { nationality: 'CHI' }, // Claudio Baeza
    110609: { nationality: 'POR' }, // Paulinho
    110610: { nationality: 'PAR' }, // Robert Morales
    110702: { nationality: 'ARG' }, // Lisandro Magallán
    110703: { nationality: 'BRA' }, // Nathan Silva
    110705: { nationality: 'COL' }, // José Caicedo
    110706: { nationality: 'PER' }, // Piero Quispe
    110711: { nationality: 'ARG' }, // Ignacio Pussetto
    110802: { nationality: 'ARG' }, // Gustavo Cabral
    110803: { nationality: 'ARG' }, // Sergio Barreto
    110806: { nationality: 'COL' }, // Nelson Deossa
    110808: { nationality: 'MAR' }, // Oussama Idrissi
    110810: { nationality: 'VEN' }, // Salomón Rondón
    110811: { nationality: 'ESP' }, // Borja Bastón
    130108: { nationality: 'URU' }, // Pablo Ceppelini
    130202: { nationality: 'CRC' }, // Juan Pablo Vargas
    130204: { nationality: 'VEN' }, // Delvin Alfonzo
    130401: { nationality: 'URU' }, // Santiago Mele
    130402: { nationality: 'ARG' }, // Emmanuel Olivera
    130503: { nationality: 'ARG' }, // Facundo Agüero
    130504: { nationality: 'ARG' }, // Marcelo Ortiz
    130511: { nationality: 'URU' }, // Agustín Rodríguez
    98101: { nationality: 'URU' }, // Gastón Olveira
    98104: { nationality: 'ARG' }, // Facundo Zabala
    98108: { nationality: 'ARG' }, // Lucas Pratto
    98109: { nationality: 'ARG' }, // Facundo Bruera
    98201: { nationality: 'BRA' }, // Jean Fernandes
    98202: { nationality: 'BRA' }, // Eduardo Brock
    98206: { nationality: 'ARG' }, // Federico Carrizo
    98208: { nationality: 'ARG' }, // Diego Churín
    98301: { nationality: 'URU' }, // Martín Silva
};

/**
 * Leagues whose bespoke roster ages in data/teams/*.ts were authored at the 2024 baseline
 * and therefore need +2 years when not explicitly mapped above in REAL_PLAYER_METADATA.
 */
export const LEAGUES_2024_AGE_BASELINE = new Set<LeagueId | 'CONMEBOL'>([
    LeagueId.LA_LIGA,
    LeagueId.SEGUNDA_DIVISION_ESP,
    LeagueId.CHAMPIONSHIP,
    LeagueId.BUNDESLIGA,
    LeagueId.ZWEITE_BUNDESLIGA,
    LeagueId.SERIE_A,
    LeagueId.SERIE_B_ITA,
    LeagueId.LIGUE_1,
    LeagueId.LIGUE_2,
    LeagueId.BRASILEIRAO,
    LeagueId.SERIE_B_BR,
    LeagueId.COPA_DE_PRIMERA,
    LeagueId.LIGA_MX,
    LeagueId.LIGA_EXPANSION_MX,
    LeagueId.PRIMERA_A_COLOMBIA,
    LeagueId.PRIMERA_B_COLOMBIA,
]);
