import { Grid, Column } from '@carbon/react';
import '../../components/landing-page/styles/preview.scss';
import { Tile } from '@carbon/react';
import './school-detail.scss';
import { toSvg } from 'jdenticon';

const Introduction = ({ schooldata }) => {
  const generateIdenticon = (image) => {
    const size = 50;
    const svgString = toSvg(image, size);
    return `data:image/svg+xml,${encodeURIComponent(svgString)}`;
  };

  return (
    <Grid fullWidth className="mt-50px">
      <Column md={4} lg={5} sm={4}>
        <span style={{ fontSize: '1.5em' }}>Introduction</span>
      </Column>
      <Column md={4} lg={4} sm={4} className="school-detail-card">
        <Tile className={`tile-school`}>
          <p className="heading2">School Name</p>
          <p className="heading5">{schooldata?.schoolName}</p>
        </Tile>
        <Tile className={`tile-school tile-white`}>
          <p className="heading2">Exact Location</p>
          <p className="heading5">
            {schooldata?.latitude}, {schooldata?.longitude}
          </p>
        </Tile>
        <Tile className={`tile-school tile-white`}>
          <p className="heading2">Country</p>
          <p className="heading5">{schooldata?.country}</p>
        </Tile>
      </Column>
      <Column
        md={4}
        lg={7}
        sm={4}
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        <img
          style={{
            width: '60%',
          }}
          alt="School Map"
          src={generateIdenticon(schooldata?.image)}
        />
      </Column>
    </Grid>
  );
};

export default Introduction;