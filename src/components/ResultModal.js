/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Typography } from '@mui/material';

const ResultModal = (props) => {

  return (
    props.show && (
      <Box style={{
        display: 'flex',
        position: 'fixed',
        zIndex: 9999,
        top: '0vh',
        left: '0vw',
        minWidth: '100vw',
        height: '100%',
        flexDirection: 'column'
      }}>

        <Box
          sx={{
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            padding: "0 10px",
            borderBottom: '2px solid #000'
          }}
        >
          <Typography noWrap component="div"
            sx={{ flexGrow: 1, display: 'inline-block', fontSize: { sm: '1.1rem', xs: '0.8rem' } }}
            variant='h7'>{props.title}</Typography>
          <IconButton
            sx={{ display: "inline-flex" }}
            onClick={() => props.onClose()}
            style={{
              color: '#000',
            }}
          >
            <CloseIcon fontSize='large' />
          </IconButton>
        </Box>
        <Box sx={{
          overflow: 'hidden',
          backgroundColor: '#fff',
          height: '100vh',
        }}>
          {
            <iframe
              src={props.pageUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title={props.title}
            />
          }
        </Box>
      </Box>
    )
  )
}

export { ResultModal }