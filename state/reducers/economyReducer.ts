import { GameState, NewsItem } from '../../types';
import { formatDate, formatCurrency } from '../../utils';
import type { GameAction } from '../reducer';

// Actions handled by this reducer
type EconomyAction = Extract<GameAction,
    | { type: 'ACCEPT_SPONSOR' }
    | { type: 'TERMINATE_SPONSOR' }
    | { type: 'TAKE_LOAN' }
    | { type: 'REPAY_LOAN' }
    | { type: 'SET_TICKET_POLICY' }
    | { type: 'REALLOCATE_BUDGET' }
    | { type: 'UPDATE_CLUB_DIRECTIVES' }
    | { type: 'UPGRADE_FACILITY' }
    | { type: 'REMOVE_SPONSOR_OFFER' }
    | { type: 'EXPAND_STADIUM' }
    | { type: 'UPDATE_FINANCES' }
    | { type: 'UPDATE_STADIUM' }
>;

export function handleEconomyAction(state: GameState, action: EconomyAction): GameState {
    switch (action.type) {
        case 'ACCEPT_SPONSOR': {
            const { sponsorId, negotiatedIncome, customSigningBonus, fanImpact } = action.payload;
            const sponsorOffer = state.availableSponsors.find(s => s.id === sponsorId);

            if (!sponsorOffer) return state;

            const finalWeeklyIncome = negotiatedIncome || sponsorOffer.weeklyIncome;
            const sponsor = { 
                ...sponsorOffer, 
                weeklyIncome: finalWeeklyIncome,
                duration: sponsorOffer.duration || 52
            };

            const signingBonus = customSigningBonus !== undefined 
                ? customSigningBonus 
                : (sponsorOffer.signingBonus ?? Math.floor(finalWeeklyIncome * 4));
            const newBalance = state.finances.balance + signingBonus;

            const sponsorTypeLabel = sponsor.type === 'shirt' 
                ? 'de camiseta principal' 
                : sponsor.type === 'stadium' 
                ? 'de naming del estadio' 
                : sponsor.type === 'training' 
                ? 'secundario / manga' 
                : 'de proveedor técnico';

            const newsItem: NewsItem = {
                id: `sponsor_${Date.now()}`,
                headline: '🤝 Nuevo Acuerdo de Patrocinio',
                body: `${sponsor.name} ha firmado como patrocinador ${sponsorTypeLabel}. Ingreso: ${formatCurrency(sponsor.weeklyIncome)}/semana con un bono de firma de ${formatCurrency(signingBonus)}.`,
                date: formatDate(state.currentDate)
            };

            // Impact on fan approval if specified
            const currentApproval = state.fanApproval || { rating: 60, trend: 'stable', factors: { results: 0, transfers: 0, finances: 0, promises: 0 } };
            const deltaApproval = fanImpact ?? (sponsor.fanApprovalImpact ?? 0);
            const updatedFanApproval = deltaApproval !== 0 ? {
                ...currentApproval,
                rating: Math.max(10, Math.min(100, currentApproval.rating + deltaApproval)),
                factors: {
                    ...currentApproval.factors,
                    finances: Math.max(-10, Math.min(10, currentApproval.factors.finances + (deltaApproval > 0 ? 2 : -2)))
                }
            } : currentApproval;

            // Check if already have sponsor of this type
            const existingSponsor = state.sponsors.find(s => s.type === sponsor.type);
            const newSponsors = existingSponsor
                ? state.sponsors.map(s => s.type === sponsor.type ? sponsor : s)
                : [...state.sponsors, sponsor];

            const newMarket = state.availableSponsors.filter(s => s.id !== sponsorId && s.type !== sponsor.type);

            return {
                ...state,
                sponsors: newSponsors,
                availableSponsors: newMarket,
                fanApproval: updatedFanApproval,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                newsFeed: [newsItem, ...state.newsFeed].slice(0, 25)
            };
        }

        case 'TERMINATE_SPONSOR': {
            const { sponsorId, indemnityCost } = action.payload;
            const targetSponsor = state.sponsors.find(s => s.id === sponsorId);
            if (!targetSponsor) return state;

            const newBalance = state.finances.balance - indemnityCost;
            const remainingSponsors = state.sponsors.filter(s => s.id !== sponsorId);

            const newsItem: NewsItem = {
                id: `terminate_sponsor_${Date.now()}`,
                headline: '⚠️ Rescisión Comercial Anticipada',
                body: `El club ha acordado la rescisión anticipada del contrato con ${targetSponsor.name} abonando una indemnización compensatoria de ${formatCurrency(indemnityCost)}. El espacio queda libre para nuevas ofertas.`,
                date: formatDate(state.currentDate)
            };

            return {
                ...state,
                sponsors: remainingSponsors,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                newsFeed: [newsItem, ...state.newsFeed].slice(0, 25)
            };
        }

        case 'TAKE_LOAN': {
            const { loan } = action.payload;
            const currentLoans = state.finances.activeLoans || [];
            const newBalance = state.finances.balance + loan.principal;

            const newsItem: NewsItem = {
                id: `loan_taken_${Date.now()}`,
                headline: '🏦 Línea de Crédito Otorgada',
                body: `La entidad bancaria ha aprobado el préstamo "${loan.name}" por ${formatCurrency(loan.principal)}. Se amortizará a razón de ${formatCurrency(loan.weeklyPayment)}/semana durante ${loan.remainingWeeks} semanas.`,
                date: formatDate(state.currentDate)
            };

            return {
                ...state,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    activeLoans: [...currentLoans, loan],
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                newsFeed: [newsItem, ...state.newsFeed].slice(0, 25)
            };
        }

        case 'REPAY_LOAN': {
            const { loanId } = action.payload;
            const currentLoans = state.finances.activeLoans || [];
            const targetLoan = currentLoans.find(l => l.id === loanId);
            if (!targetLoan) return state;

            if (state.finances.balance < targetLoan.remainingAmount) return state;

            const newBalance = state.finances.balance - targetLoan.remainingAmount;
            const updatedLoans = currentLoans.filter(l => l.id !== loanId);

            const newsItem: NewsItem = {
                id: `loan_repaid_${Date.now()}`,
                headline: '✅ Deuda Bancaria Cancelada',
                body: `El club ha amortizado anticipadamente la totalidad del préstamo "${targetLoan.name}" (${formatCurrency(targetLoan.remainingAmount)}). Se suprime la cuota semanal de amortización.`,
                date: formatDate(state.currentDate)
            };

            return {
                ...state,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    activeLoans: updatedLoans,
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                newsFeed: [newsItem, ...state.newsFeed].slice(0, 25)
            };
        }

        case 'SET_TICKET_POLICY': {
            return {
                ...state,
                finances: {
                    ...state.finances,
                    ticketPolicy: action.payload.policy
                }
            };
        }

        case 'REALLOCATE_BUDGET': {
            const { amount, direction } = action.payload;
            if (amount <= 0) return state;

            if (direction === 'to_transfers') {
                const transferAmount = Math.min(amount, Math.max(0, state.finances.balance));
                if (transferAmount <= 0) return state;

                return {
                    ...state,
                    finances: {
                        ...state.finances,
                        balance: state.finances.balance - transferAmount,
                        transferBudget: state.finances.transferBudget + transferAmount,
                        balanceHistory: [...state.finances.balanceHistory, state.finances.balance - transferAmount]
                    }
                };
            } else {
                const transferAmount = Math.min(amount, Math.max(0, state.finances.transferBudget));
                if (transferAmount <= 0) return state;

                return {
                    ...state,
                    finances: {
                        ...state.finances,
                        balance: state.finances.balance + transferAmount,
                        transferBudget: state.finances.transferBudget - transferAmount,
                        balanceHistory: [...state.finances.balanceHistory, state.finances.balance + transferAmount]
                    }
                };
            }
        }

        case 'UPDATE_CLUB_DIRECTIVES': {
            const currentDirectives = state.finances.clubDirectives || {
                youthInvestment: 'low',
                globalMarketing: false,
                winBonuses: 'none'
            };

            return {
                ...state,
                finances: {
                    ...state.finances,
                    clubDirectives: {
                        ...currentDirectives,
                        ...action.payload
                    }
                }
            };
        }

        case 'UPGRADE_FACILITY': {
            const { cost } = action.payload;
            if (state.stadium.facilityLevel >= 5) return state;
            if (state.finances.balance < cost) return state;

            const nextLevel = state.stadium.facilityLevel + 1;
            const newBalance = state.finances.balance - cost;

            const newsItem: NewsItem = {
                id: `stadium_facility_${Date.now()}`,
                headline: '🏗️ Instalaciones VIP Modernizadas',
                body: `Las zonas de hospitalidad y palcos VIP de ${state.stadium.name} han alcanzado el Nivel ${nextLevel}. Los ingresos comerciales por día de partido aumentan un 12.5%.`,
                date: formatDate(state.currentDate)
            };

            return {
                ...state,
                finances: {
                    ...state.finances,
                    balance: newBalance,
                    balanceHistory: [...state.finances.balanceHistory, newBalance]
                },
                stadium: {
                    ...state.stadium,
                    facilityLevel: nextLevel
                },
                newsFeed: [newsItem, ...state.newsFeed].slice(0, 25)
            };
        }

        case 'REMOVE_SPONSOR_OFFER': {
            const { sponsorId } = action.payload;
            return {
                ...state,
                availableSponsors: state.availableSponsors.filter(s => s.id !== sponsorId)
            };
        }

        case 'EXPAND_STADIUM': {
            if (!state.stadium.expansionCost || !state.stadium.expansionCapacity) return state;
            if (state.finances.balance < state.stadium.expansionCost) return state;

            return {
                ...state,
                finances: {
                    ...state.finances,
                    balance: state.finances.balance - state.stadium.expansionCost,
                    balanceHistory: [...state.finances.balanceHistory, state.finances.balance - state.stadium.expansionCost]
                },
                stadium: {
                    ...state.stadium,
                    capacity: state.stadium.expansionCapacity,
                    expansionCost: undefined,
                    expansionCapacity: undefined
                },
                newsFeed: [{
                    id: `stadium_expansion_${Date.now()}`,
                    headline: '🏟️ Estadio Ampliado',
                    body: `Las obras de ampliación del ${state.stadium.name} han finalizado. La nueva capacidad es de ${state.stadium.expansionCapacity} espectadores.`,
                    date: formatDate(state.currentDate)
                }, ...state.newsFeed].slice(0, 20)
            };
        }

        case 'UPDATE_FINANCES':
            return { ...state, finances: { ...state.finances, ...action.payload } };

        case 'UPDATE_STADIUM':
            return { ...state, stadium: action.payload };

        default:
            return state;
    }
}
