// @mui
import { Theme } from '@mui/material/styles';
import {
  Box,
  Switch,
  SxProps,
  TablePagination,
  FormControlLabel,
  TablePaginationProps,
  TextField,
} from '@mui/material';

//

// ----------------------------------------------------------------------

type Props = {
  dense?: boolean;
  onChangeDense?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sx?: SxProps<Theme>;
  setPage: Function;
  disablePageNumber?:boolean
};

export default function TablePaginationCustom({
  dense,
  onChangeDense,
  rowsPerPageOptions = [5, 10, 25],
  sx,
  setPage,
  disablePageNumber,
  ...other
}: Props & TablePaginationProps) {
  const handleOnChange = (e: any) => {
    const pages = Number(e.target.value)
    if(pages >= 1){
      setPage(pages - 1)
    }
    else{
      setPage(0)
    }
    
  };

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <TablePagination rowsPerPageOptions={rowsPerPageOptions} component="div" {...other} />
{/* 
      {!disablePageNumber && <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, mt: 0.5 }}>
        <TextField
          label="Enter Page Number"
          variant="outlined"
          onChange={handleOnChange}
          sx={{
            mx: 2.5,
            '& .MuiInputLabel-root': { fontSize: 12, color: '#212b36' },
            '& .MuiInputBase-root': { fontSize: 12 },
          }}
          type="number"
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
          }}
          size="small"
        />
      </Box>} */}

      {onChangeDense && (
        <FormControlLabel
          label="Dense"
          control={<Switch checked={dense} onChange={onChangeDense} />}
          sx={{
            pl: 2,
            py: 1.5,
            top: 0,
            position: {
              sm: 'absolute',
            },
          }}
        />
      )}
    </Box>
  );
}
