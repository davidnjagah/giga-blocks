// @mui
import { Typography, Stack } from '@mui/material';
import Image from '@components/image/Image';
import { APP_NAME } from 'src/config-global';
//
import { StyledRoot, StyledSectionBg, StyledSection, StyledContent } from './styles';

// components
// import Image from '../../components/image';

// ----------------------------------------------------------------------

type Props = {
  title?: string;
  illustration?: string;
  children: React.ReactNode;
};

export default function LoginLayout({ children, illustration, title }: Props) {
  return (
    <StyledRoot>
      <StyledSection>
        {/* If you have horizontal large image, use Image Component */}
        <Image
          disabledEffect
          visibleByDefault
          alt="auth"
          src={illustration || '/assets/login/logo-horizontal.png'}
          sx={{ maxWidth: 720 }}
        />
        <Typography variant="h1" sx={{ maxWidth: 720, textAlign: 'center' }}>
        {APP_NAME}
        </Typography>
        <Typography variant="h4" sx={{ maxWidth: 480, textAlign: 'center' }}>
          {title || 'Visualize the ecosystem'}
        </Typography>

        <Typography variant="body2" sx={{ position: 'absolute', bottom: 40, textAlign: 'center' }}>
          © 2023 {APP_NAME}. All rights reserved
        </Typography>

        <StyledSectionBg />
      </StyledSection>

      <StyledContent>
        <Stack sx={{ width: 1 }}> {children} </Stack>
      </StyledContent>
    </StyledRoot>
  );
}