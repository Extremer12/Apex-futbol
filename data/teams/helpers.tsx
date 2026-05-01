import React from 'react';
import { Player } from '../../types';

// Premier League Team Logos
const TeamLogo: React.FC<{ logoPath: string, teamName: string }> = ({ logoPath, teamName }) => {
  const [error, setError] = React.useState(false);

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {!error ? (
        <img
          src={logoPath}
          alt={`${teamName} logo`}
          onError={() => setError(true)}
          className="w-full h-full object-contain drop-shadow-lg"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-lg">
          <span className="text-[10px] font-black text-slate-400">
            {teamName.substring(0, 2).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
};

export const createTeamLogo = (logoPath: string, teamName: string) => {
  return <TeamLogo logoPath={logoPath} teamName={teamName} />;
};

// Logo paths for all teams
export const TEAM_LOGOS = {
  'Arsenal': '/logos/Arsenal FC.png',
  'Aston Villa': '/logos/Aston Villa FC.png',
  'AFC Bournemouth': '/logos/AFC Bournemouth.png',
  'Brentford': '/logos/Brentford FC 512x.png',
  'Brighton': '/logos/Brighton Hove Albion.png',
  'Chelsea': '/logos/Chelsea FC.png',
  'Crystal Palace': '/logos/Crystal Palace FC.png',
  'Everton': '/logos/Everton FC.png',
  'Fulham': '/logos/Fulham FC.png',
  'Ipswich Town': '/logos/Ipswich Town FC.png',
  'Leicester City': '/logos/Leicester City FC.png',
  'Liverpool': '/logos/Liverpool FC.png',
  'Manchester City': '/logos/Manchester City FC.png',
  'Manchester United': '/logos/Manchester United FC.png',
  'Newcastle United': '/logos/Newcastle United FC.png',
  'Nottingham Forest': '/logos/Nottingham Forest FC.png',
  'Southampton': '/logos/Southampton FC.png',
  'Tottenham': '/logos/Tottenham Hotspur FC.png',
  'West Ham': '/logos/West Ham United FC.png',
  'Wolverhampton': '/logos/Wolverhampton Wanderers FC.png',
  // Championship
  'Leeds United': '/logos/Leeds United FC.png',
  'Burnley': '/logos/Burnley FC.png',
  'Luton Town': '/logos/Luton Town FC.png',
  'Sheffield Utd': '/logos/Sheffield United FC.png',
  'West Brom': '/logos/West Bromwich Albion FC.png',
  'Norwich City': '/logos/Norwich City FC.png',
  'Hull City': '/logos/Hull City FC.png',
  'Coventry City': '/logos/Coventry City FC.png',
  'Middlesbrough': '/logos/Middlesbrough FC.png',
  'Preston': '/logos/Preston North End FC.png',
  'Cardiff City': '/logos/Cardiff City FC.png',
  'Bristol City': '/logos/Bristol City FC.png',
  'Sunderland': '/logos/Sunderland AFC.png',
  'Swansea City': '/logos/Swansea City AFC.png',
  'Watford': '/logos/Watford FC.png',
  'Millwall': '/logos/Millwall FC.png',
  'QPR': '/logos/Queens Park Rangers FC.png',
  'Stoke City': '/logos/Stoke City FC.png',
  'Blackburn': '/logos/Blackburn Rovers FC.png',
  'Sheffield Wed': '/logos/Sheffield Wednesday FC.PNG',
  'Plymouth': '/logos/Plymouth Argyle FC.png',
  'Portsmouth': '/logos/Portsmouth FC.png',
  'Derby County': '/logos/Derby County FC.png',
  'Oxford United': '/logos/Oxford United FC.png',
  // La Liga
  'Real Madrid': '/logos/Real Madrid.png',
  'FC Barcelona': '/logos/FC Barcelona.png',
  'Atletico Madrid': '/logos/Atletico Madrid.png',
  'Athletic Club': '/logos/Athletic Club.png',
  'Real Sociedad': '/logos/Real Sociedad.png',
  'Real Betis': '/logos/Real Betis.png',
  'Girona FC': '/logos/Girona FC.png',
  'Villarreal CF': '/logos/Villarreal CF.png',
  'Valencia CF': '/logos/Valencia CF.png',
  'Sevilla FC': '/logos/Sevilla FC.png',
  'Celta Vigo': '/logos/Celta Vigo.png',
  'Osasuna': '/logos/Osasuna.png',
  'Getafe CF': '/logos/Getafe CF.png',
  'Mallorca': '/logos/Mallorca.png',
  'Rayo Vallecano': '/logos/Rayo Vallecano.png',
  'Las Palmas': '/logos/Las Palmas.png',
  'Alavés': '/logos/Alaves.png',
  'Leganés': '/logos/Leganes.png',
  'Valladolid': '/logos/Valladolid.png',
  'Espanyol': '/logos/Espanyol.png',
};

// Helper to generate generic squad for Championship teams
export const createGenericSquad = (startId: number, teamName: string): Player[] => {
  const positions: { pos: 'POR' | 'DEF' | 'CEN' | 'DEL', count: number }[] = [
    { pos: 'POR', count: 2 },
    { pos: 'DEF', count: 6 },
    { pos: 'CEN', count: 6 },
    { pos: 'DEL', count: 4 }
  ];

  let squad: Player[] = [];
  let idCounter = startId;

  positions.forEach(({ pos, count }) => {
    for (let i = 0; i < count; i++) {
      squad.push({
        id: idCounter++,
        name: `${teamName} ${pos} ${i + 1}`, // Placeholder name
        position: pos,
        rating: Math.floor(65 + Math.random() * 10), // Rating 65-75 for Championship
        value: Math.floor(1 + Math.random() * 10),
        wage: Math.floor(5000 + Math.random() * 15000),
        morale: 'Normal',
        contractYears: Math.floor(1 + Math.random() * 3),
        age: Math.floor(18 + Math.random() * 15)
      });
    }
  });

  return squad;
};
