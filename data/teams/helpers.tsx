import React from 'react';
import { Player } from '../../types';

import { customPacksService } from '../../services/customPacks/packService';

export const getTeamInitials = (name?: string): string => {
  if (!name) return 'FC';
  // Remove parentheticals like "(Córdoba)", "(SdE)", "(Santa Fe)", etc.
  const clean = name.replace(/\(.*?\)/g, '').replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  
  if (words.length === 0) return 'FC';
  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }
  if (words.length === 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  // 3 or more words
  return words.slice(0, 3).map(w => w[0]).join('').toUpperCase();
};

// Generic Team Shield Component (renders when no custom pack is installed)
export const GenericTeamShield: React.FC<{
  name?: string;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
}> = ({ name = 'Club', primaryColor = '#1E293B', secondaryColor = '#3B82F6', className = 'w-full h-full' }) => {
  const initials = getTeamInitials(name);
  const pColor = primaryColor || '#1E293B';
  const sColor = secondaryColor || '#3B82F6';
  const idSuffix = React.useId().replace(/:/g, '');

  return (
    <div className={`${className} relative flex items-center justify-center select-none`}>
      <svg
        viewBox="0 0 100 120"
        className="w-full h-full drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={`shield-clip-${idSuffix}`}>
            {/* Modern Football Shield Shape */}
            <path d="M 50,4 C 74,4 92,16 92,36 C 92,78 68,104 50,116 C 32,104 8,78 8,36 C 8,16 26,4 50,4 Z" />
          </clipPath>
          
          <linearGradient id={`gloss-${idSuffix}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Shield Body with Half/Half Color Split */}
        <g clipPath={`url(#shield-clip-${idSuffix})`}>
          {/* Left half - primary color */}
          <rect x="0" y="0" width="50" height="120" fill={pColor} />
          {/* Right half - secondary color */}
          <rect x="50" y="0" width="50" height="120" fill={sColor} />

          {/* Diagonal separator line */}
          <line x1="50" y1="0" x2="50" y2="120" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

          {/* Lighting overlay */}
          <rect x="0" y="0" width="100" height="120" fill={`url(#gloss-${idSuffix})`} />

          {/* Central emblem circle */}
          <circle cx="50" cy="56" r="25" fill="#0A0E17" fillOpacity="0.65" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

          {/* Initials Text */}
          <text
            x="50"
            y={initials.length > 2 ? "62" : "63"}
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize={initials.length > 2 ? "16" : "20"}
            fontWeight="900"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
            letterSpacing="0.5px"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)'
            }}
          >
            {initials}
          </text>
        </g>

        {/* Outer Shield Border */}
        <path
          d="M 50,4 C 74,4 92,16 92,36 C 92,78 68,104 50,116 C 32,104 8,78 8,36 C 8,16 26,4 50,4 Z"
          fill="none"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="2.5"
        />
        <path
          d="M 50,6 C 72,6 88,17 88,36 C 88,75 66,99 50,111 C 34,99 12,75 12,36 C 12,17 28,6 50,6 Z"
          fill="none"
          stroke="rgba(0, 0, 0, 0.5)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
};

// Team Logo Component (Used for rendering with Community Pack support)
export const TeamLogo: React.FC<{
  team?: {
    id?: number | string;
    logo?: string;
    name?: string;
    shortName?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  className?: string;
}> = ({ team, className = "w-full h-full" }) => {
  const [error, setError] = React.useState(false);
  const [, setTick] = React.useState(0);

  // Subscribe to pack updates so logo updates in real-time
  React.useEffect(() => {
    return customPacksService.subscribe(() => {
      setError(false);
      setTick(t => t + 1);
    });
  }, []);

  if (!team) {
    return <GenericTeamShield name="Club" className={className} />;
  }

  const logoUrl = customPacksService.resolveTeamLogo(team);

  if (!logoUrl || error) {
    return (
      <GenericTeamShield
        name={team.name || team.shortName || 'Club'}
        primaryColor={team.primaryColor}
        secondaryColor={team.secondaryColor}
        className={className}
      />
    );
  }

  return (
    <div className={className + " relative flex items-center justify-center"}>
      <img
        src={logoUrl}
        alt={`${team.name || 'Club'} logo`}
        onError={() => setError(true)}
        className="w-full h-full object-contain drop-shadow-md"
      />
    </div>
  );
};

// Player Photo Component (Used for rendering with Community Pack support)
export const PlayerPhoto: React.FC<{ player?: { id?: number | string; name: string; photo?: string }, className?: string }> = ({ player, className = "w-10 h-10" }) => {
  const [error, setError] = React.useState(false);
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    return customPacksService.subscribe(() => {
      setError(false);
      setTick(t => t + 1);
    });
  }, []);

  if (!player) {
    return (
      <div className={`${className} relative flex items-center justify-center shrink-0`}>
        <img src="/sinrostro.png" alt="Foto jugador" className="w-full h-full object-cover rounded-full" />
      </div>
    );
  }

  const photoUrl = customPacksService.resolvePlayerPhoto(player);

  return (
    <div className={`${className} relative flex items-center justify-center shrink-0`}>
      <img
        src={!error && photoUrl ? photoUrl : "/sinrostro.png"}
        alt={`${player.name} photo`}
        onError={() => setError(true)}
        className="w-full h-full object-cover rounded-full drop-shadow-md"
      />
    </div>
  );
};

export const createTeamLogo = (logoPath: string, teamName: string) => {
  return logoPath;
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
  'Leicester City': 'https://tmssl.akamaized.net/images/wappen/head/1003.png',
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
  'Real Madrid': 'https://tmssl.akamaized.net/images/wappen/head/418.png',
  'FC Barcelona': 'https://tmssl.akamaized.net/images/wappen/head/131.png',
  'Atletico Madrid': 'https://tmssl.akamaized.net/images/wappen/head/13.png',
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
