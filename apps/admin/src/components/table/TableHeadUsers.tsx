// @mui
import { Theme } from '@mui/material/styles';
import {
  Box,
  SxProps,
  Checkbox,
  TableRow,
  TableCell,
  TableHead,
  TableSortLabel,
} from '@mui/material';

// ----------------------------------------------------------------------

const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
} as const;

// ----------------------------------------------------------------------

type Props = {
  order?: 'asc' | 'desc';
  orderBy?: string;
  showCheckBox?: boolean;
  headLabel: any[];
  rowCount?: number;
  numSelected?: number;
  onSort?: (id: string) => void;
  onSelectAllRows?: (checked: boolean) => void;
  unSortableHeader?: string[];
  sx?: SxProps<Theme>;
};

export default function TableHeadCustom({
  order,
  orderBy,
  rowCount = 0,
  headLabel,
  numSelected = 0,
  showCheckBox,
  onSort,
  onSelectAllRows,
  unSortableHeader,
  sx,
}: Props) {
  return (
    <TableHead sx={sx}>
      <TableRow>
        {showCheckBox && onSelectAllRows && (
          <TableCell padding="checkbox">
            <Checkbox
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={(e: any) =>
                onSelectAllRows(e)
              }
            />
          </TableCell>
        )}

        {headLabel?.map((headCell, index) => (
          <TableCell
            key={index}
            align={headCell.align || 'left'}
            sx={{ width: headCell.width, minWidth: headCell.minWidth, whiteSpace: 'nowrap' }}
          >
            {onSort ? (
              <TableSortLabel
                hideSortIcon
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={() => {!unSortableHeader?.includes(headCell.id) && onSort(headCell.id);}}
                sx={{ textTransform: 'capitalize', cursor: !unSortableHeader?.includes(headCell.id) ?'pointer' : 'default'  }}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box sx={{ ...visuallyHidden }}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
