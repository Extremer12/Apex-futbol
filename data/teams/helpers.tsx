import React from 'react';
import { customPacksService } from '../../services/customPacks/packService';
import { resourceManager } from '../../services/resources/ResourceManager';
import { ResourceFallback } from '../../services/resources/ResourceFallback';
import { getTeamInitials, createTeamLogo, TEAM_LOGOS, createGenericSquad } from './squadHelpers';

export { getTeamInitials, createTeamLogo, TEAM_LOGOS, createGenericSquad };

// Single shared module-level subscription for all TeamLogo & PlayerPhoto instances
let packsVersionCounter = 0;
const packListeners = new Set<() => void>();
let isGlobalSubscribed = false;

function ensureGlobalPackSubscription() {
  if (isGlobalSubscribed || typeof window === 'undefined') return;
  isGlobalSubscribed = true;
  const bump = () => {
    packsVersionCounter++;
    packListeners.forEach(fn => fn());
  };
  customPacksService.subscribe(bump);
  resourceManager.subscribe(bump);
}

function subscribeToPackChanges(cb: () => void) {
  ensureGlobalPackSubscription();
  packListeners.add(cb);
  return () => {
    packListeners.delete(cb);
  };
}

function getPacksVersionSnapshot() {
  return packsVersionCounter;
}

// Generic Team Shield Component (renders when no custom pack is installed)
export const GenericTeamShield: React.FC<{
  name?: string;
  primaryColor?: string;
  secondaryColor?: string;
  className?: string;
}> = React.memo(({ name = 'Club', primaryColor = '#1E293B', secondaryColor = '#3B82F6', className = 'w-full h-full' }) => {
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
});

// Team Logo Component (Zero-subscription, centralized Zustand version reactivity)
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
}> = React.memo(({ team, className = "w-full h-full" }) => {
  const [error, setError] = React.useState(false);
  const packsVersion = React.useSyncExternalStore(subscribeToPackChanges, getPacksVersionSnapshot, getPacksVersionSnapshot);

  React.useEffect(() => {
    if (error) setError(false);
  }, [packsVersion, team?.id]);

  if (!team) {
    return <GenericTeamShield name="Club" className={className} />;
  }

  const logoUrl = resourceManager.teamLogo(team.id, team);

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
        loading="lazy"
        decoding="async"
        onError={() => setError(true)}
        className="w-full h-full object-contain"
      />
    </div>
  );
});

// Player Photo Component (Zero-subscription, single-pass render)
export const PlayerPhoto: React.FC<{ player?: { id?: number | string; name: string; photo?: string; position?: string }; className?: string; primaryColor?: string }> = React.memo(({ player, className = "w-10 h-10" }) => {
  const [hasError, setHasError] = React.useState(false);
  const packsVersion = React.useSyncExternalStore(subscribeToPackChanges, getPacksVersionSnapshot, getPacksVersionSnapshot);

  React.useEffect(() => {
    if (hasError) setHasError(false);
  }, [packsVersion, player?.id, player?.name]);

  const fallback = React.useMemo(() => ResourceFallback.playerFace(player || 'Jugador'), [player?.name, player?.position]);
  const resolved = player ? resourceManager.playerFace(player.id, player) : fallback;
  const imgSrc = (hasError || !resolved) ? fallback : resolved;

  return (
    <div className={`${className} relative flex items-center justify-center shrink-0 rounded-full overflow-hidden border border-white/10 bg-slate-900`}>
      <img
        src={imgSrc}
        alt={player?.name || 'Jugador'}
        className="w-full h-full object-cover object-top"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => {
          if (!hasError) setHasError(true);
        }}
      />
    </div>
  );
});

