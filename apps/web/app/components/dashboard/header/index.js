import { Grid, Column, Breadcrumb, BreadcrumbItem } from '@carbon/react';
import '../dashboard.scss';

import { getCurrentUser } from '../../../utils/sessionManager';
import { useContributionCount } from '../../../hooks/useContributionList';

import { useWeb3React } from '@web3-react/core';
import { metaMaskLogout } from '../../../utils/metaMaskUtils';
import {useRouter} from 'next/navigation';

const Header = ({ name, breadcrumbs }) => {
  const route = useRouter();
  const user = getCurrentUser();
  const {account} = useWeb3React();
  const { data } = useContributionCount(user?.id);

  const disconnect = ()=>{
    metaMaskLogout();
    route.push('/signIn');

  }
  return (
    <div className="dashboard-head-wrapper">
      <Grid fullWidth>
        <Column lg={16} md={8} sm={4} className="column">
          <Breadcrumb style={{ marginBottom: '16px', display: 'flex' }}>
            {breadcrumbs?.map((breadcrumb, index) => (
              <BreadcrumbItem key={index} href={breadcrumb.link}>
                {breadcrumb.text}
              </BreadcrumbItem>
            ))}
          </Breadcrumb>
        </Column>
        <Column lg={16} md={8} sm={4} className="column">
          <div>
            <h2>My Dashboard</h2>
            <p>{user?.name}</p>
            <p>{user?.email}</p>
             {account && 
             (<>
             <p>{account}
             {" "}
             <a 
             style={{cursor:'pointer', color:'blue', textDecoration: 'underline'}}
             onClick={disconnect}>
              Disconnect
             </a>
             </p>

             </>
              )
              }
          </div>
          <div className="sub-column-1">
            <p className="head">My Contributions</p>
            <div className="sub-column-2">
              <h1>{data?.meta?.total ?? 0} </h1>
              <div>
                <p>Contributions</p>
              </div>
            </div>
          </div>
        </Column>
      </Grid>
    </div>
  );
};

export default Header;
