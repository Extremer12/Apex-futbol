import { Screen } from '../types';

/**
 * Preloads screen bundle chunks into browser cache ahead of user click (triggered on hover / touch / focus).
 * This ensures zero-latency instantaneous tab transitions without ballooning the initial entry bundle.
 */
export const prefetchScreen = (screen: Screen): void => {
    switch (screen) {
        case Screen.Squad:
            import('../components/screens/SquadScreen');
            break;
        case Screen.Transfers:
            import('../components/screens/TransfersScreen');
            break;
        case Screen.League:
            import('../components/screens/LeagueScreen');
            break;
        case Screen.Staff:
            import('../components/screens/StaffScreen');
            break;
        case Screen.Finances:
            import('../components/screens/FinancesScreen');
            break;
        case Screen.Calendar:
            import('../components/screens/CalendarScreen');
            break;
        case Screen.Statistics:
            import('../components/screens/StatisticsScreen');
            break;
        case Screen.Settings:
            import('../components/screens/SettingsScreen');
            break;
        case Screen.Stadium:
            import('../components/screens/StadiumScreen');
            break;
        case Screen.Sponsorships:
            import('../components/screens/SponsorshipScreen');
            break;
        case Screen.Club:
            import('../components/screens/ClubHubScreen');
            break;
        case Screen.Trophies:
            import('../components/screens/TrophyRoomScreen');
            break;
        case Screen.Profile:
            import('../components/screens/ProfileScreen');
            break;
        default:
            break;
    }
};
