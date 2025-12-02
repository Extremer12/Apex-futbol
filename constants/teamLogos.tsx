import React from 'react';

/**
 * Creates a team logo component with hover animation and fallback for missing logos
 * @param logoPath - Path to the logo image
 * @param teamName - Name of the team for alt text
 * @returns React component with team logo or fallback
 */
export const createTeamLogo = (logoPath: string, teamName: string) => {
    const [imageError, setImageError] = React.useState(false);

    // Fallback component when logo is missing
    if (imageError || !logoPath) {
        const initials = teamName
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 3);

        return (
            <div className="w-12 h-12 relative flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border-2 border-slate-600">
                <span className="text-white font-bold text-sm">{initials}</span>
            </div>
        );
    }

    return (
        <div className="w-12 h-12 relative flex items-center justify-center">
            <img
                src={logoPath}
                alt={`${teamName} logo`}
                className="w-full h-full object-contain drop-shadow-lg hover:scale-110 transition-transform duration-300"
                onError={() => setImageError(true)}
            />
        </div>
    );
};

/**
 * Logo paths for all Premier League teams
 */
export const TEAM_LOGOS: Record<string, string> = {
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
};
