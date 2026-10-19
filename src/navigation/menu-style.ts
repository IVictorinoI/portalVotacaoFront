import DashboardRounded from '@mui/icons-material/DashboardRounded';
import GroupsRounded from '@mui/icons-material/GroupsRounded';
import HowToVoteRounded from '@mui/icons-material/HowToVoteRounded';
import PersonAddAlt1Rounded from '@mui/icons-material/PersonAddAlt1Rounded';
import QueryStatsRounded from '@mui/icons-material/QueryStatsRounded';
import AssessmentRounded from '@mui/icons-material/AssessmentRounded';
import FactCheckRounded from '@mui/icons-material/FactCheckRounded';
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import OnlinePredictionRounded from '@mui/icons-material/OnlinePredictionRounded';
import HistoryRounded from '@mui/icons-material/HistoryRounded';
import NotificationsNoneRounded from '@mui/icons-material/NotificationsNoneRounded';
import LinkRounded from '@mui/icons-material/LinkRounded';
import ContactSupportRounded from '@mui/icons-material/ContactSupportRounded';
import type { SvgIconComponent } from '@mui/icons-material';
export const menuIcons: Record<string, SvgIconComponent> = {
  '/': DashboardRounded,
  '/credores': GroupsRounded,
  '/votos': FactCheckRounded,
  '/confirmarPresenca': PersonAddAlt1Rounded,
  '/votar': HowToVoteRounded,
  '/votacaoTempoReal': QueryStatsRounded,
  '/resultado': AssessmentRounded,
  '/aprovaAta': FactCheckRounded,
  '/chat': ChatBubbleOutlineRounded,
  '/online': OnlinePredictionRounded,
  '/logacesso': HistoryRounded,
  '/notificacoes': NotificationsNoneRounded,
  '/links': LinkRounded,
  '/links-uteis': LinkRounded,
  '/contato': ContactSupportRounded,
};
export const menuItemSx = {
  mx: 1.5,
  my: 0.5,
  px: 1.5,
  py: 1,
  minHeight: 46,
  borderRadius: 2,
  color: '#c5d3e3',
  border: '1px solid transparent',
  transition: 'background-color 150ms ease, color 150ms ease',
  '& .MuiListItemIcon-root': { minWidth: 38, color: '#8ca6c2' },
  '& .MuiListItemText-primary': { fontSize: 14, fontWeight: 500 },
  '&:hover': {
    bgcolor: '#203b56',
    color: '#fff',
    '& .MuiListItemIcon-root': { color: '#c5eaff' },
  },
  '&.Mui-selected': {
    bgcolor: '#214a68',
    color: '#fff',
    borderColor: '#376582',
    boxShadow: 'inset 3px 0 0 #6cc8f0',
    '& .MuiListItemIcon-root': { color: '#7ad4fc' },
    '& .MuiListItemText-primary': { fontWeight: 700 },
    '&:hover': { bgcolor: '#285875' },
  },
  '&.Mui-focusVisible': { outline: '2px solid #7ad4fc', outlineOffset: 2 },
} as const;
export const menuSectionSx = {
  px: 3,
  pt: 2,
  pb: 0.75,
  color: '#90a9c2',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.13em',
  textTransform: 'uppercase',
} as const;
export const sidebarPaperSx = {
  bgcolor: '#142a40',
  color: '#fff',
  borderRight: '1px solid #29425a',
} as const;
