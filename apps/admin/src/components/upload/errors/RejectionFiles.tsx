import { useState, useEffect } from 'react';
import { FileRejection } from 'react-dropzone';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Paper, Typography } from '@mui/material';
// utils
import { fData } from '../../../utils/formatNumber';
//
import { fileData } from '../../file-thumbnail';
import { MAX_FILE_SIZE } from '@constants/constantValue';

// ----------------------------------------------------------------------

type Props = {
  fileRejections: FileRejection[];
};

export default function RejectionFiles({ fileRejections }: Props) {
  const [showPaper, setShowPaper] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPaper(false);
    }, 5000);

    return () => {
      setShowPaper(true);
      clearTimeout(timer);
    };
  }, [fileRejections]);

  if (!fileRejections.length || !showPaper) {
    return null;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        py: 1,
        px: 2,
        mt: 3,
        bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
        borderColor: (theme) => alpha(theme.palette.error.main, 0.24),
      }}
    >
      {fileRejections?.map(({ file, errors }) => {
        const { path, size } = fileData(file);

        return (
          <Box key={path} sx={{ my: 1 }}>
            <Typography variant="subtitle2" noWrap>
              {path} - {size ? fData(size) : ''}
            </Typography>

            {errors?.map((error) => {
              let errorMessage = '';
              if (error.code === 'file-too-large') {
                errorMessage =
                  `File size should not exceed ${MAX_FILE_SIZE}MB. Please try uploading correct file size again!!`;
              } else if (error.code === 'file-invalid-type') {
                errorMessage = 'Invalid file type. Please try uploading correct file type again!!';
              } else {
                errorMessage = error.message;
              }

              return (
                <Box key={error.code} component="span" sx={{ typography: 'caption' }}>
                  {errorMessage}
                </Box>
              );
            })}
          </Box>
        );
      })}
    </Paper>
  );
}
