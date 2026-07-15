import { Avatar, Tooltip } from '@mui/material';
import { initials } from '../utils/format';

interface Props {
  name: string;
  color: string;
  size?: number;
}

export function UserAvatar({ name, color, size = 30 }: Props) {
  return (
    <Tooltip title={name}>
      <Avatar sx={{ bgcolor: color, width: size, height: size, fontSize: size * 0.42, fontWeight: 700 }}>
        {initials(name)}
      </Avatar>
    </Tooltip>
  );
}
