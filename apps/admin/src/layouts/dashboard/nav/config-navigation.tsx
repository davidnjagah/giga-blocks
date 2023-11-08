// routes
import { PATH_DASHBOARD, PATH_USER, PATH_SCHOOL, PATH_CONTRIBUTE, PATH_VALID } from '../../../routes/paths';
// components
import SvgColor from '../../../components/svg-color';
import { ROLES } from '../../../config-global';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  dashboard: icon('ic_dashboard'),
  user: icon('ic_user'),
  analytics: icon('ic_analytics'),
  catalog: icon('ic_file'),
};

const navConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'General',
    items: [
      {
        title: 'Dashboard',
        path: PATH_DASHBOARD.root,
        icon: ICONS.dashboard,
      },
    ],
  },
  {
    items: [
      {
        title: 'School',
        path: PATH_SCHOOL.verified,
        children: [
          {
            title: 'Minted School',
            path: PATH_SCHOOL.verified,
          },
          {
            title: 'Unminted School',
            path: PATH_SCHOOL.contributed,
          },
          {
            title: 'Minting In Progress',
            path: PATH_SCHOOL.minting,
          },
          {
            title: 'Import School',
            path: PATH_SCHOOL.import,
          },
        ],
        icon: ICONS.user,
      },
    ],
  },
  {
    items: [
      {
        title: 'Contribute',
        path: PATH_CONTRIBUTE.root,
        icon: ICONS.user,
      },
    ],
  },
  {
    items: [
      {
        title: 'Valid Data',
        path: PATH_VALID.root,
        icon: ICONS.user,
      },
    ],
  },
  {
    items: [
      {
        title: 'Users',
        path: PATH_USER.list,
        icon: ICONS.user,
      },
    ],
  },
 
];

export default navConfig;
