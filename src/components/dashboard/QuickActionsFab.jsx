import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArticleIcon from '@mui/icons-material/Article';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PaymentIcon from '@mui/icons-material/Payment';
import { useNavigate } from 'react-router-dom';

export default function QuickActionsFab() {
  const navigate = useNavigate();

  const actions = [
    { icon: <PersonAddIcon />, name: 'Students', onClick: () => navigate('/students') },
    { icon: <ArticleIcon />, name: 'Add Blog', onClick: () => navigate('/blogs') },
    { icon: <EmojiEventsIcon />, name: 'Achievement', onClick: () => navigate('/achievements') },
    { icon: <PaymentIcon />, name: 'Payments', onClick: () => navigate('/payments') },
  ];

  return (
    <SpeedDial
      ariaLabel="Quick actions"
      sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1200 }}
      icon={<SpeedDialIcon openIcon={<PaymentIcon />} />}
    >
      {actions.map((a) => (
        <SpeedDialAction key={a.name} icon={a.icon} tooltipTitle={a.name} onClick={a.onClick} />
      ))}
    </SpeedDial>
  );
}
