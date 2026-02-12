/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { makeStyles } from '@mui/styles';
import Link from '@mui/material/Link';
import React from 'react';

import {
  Typography,
  Box,
} from '@mui/material';


const useStyles = makeStyles((theme) => ({
  linkCite: {
    cursor: 'pointer',
    fontSize: '12px',
    lineHeight: '18px',
    display: 'inline',
  },
  snippet: {
    fontSize: '14px',
    fontFamily: 'arial,sans-serif',
    color: '#4d5156'
  },
  supertitle: {
    color: '#202124',
    fontSize: '14px',
    display: 'inline',
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    fontFamily: 'arial,sans-serif',
  },
  title: {
    fontFamily: 'arial,sans-serif',
    fontSize: '20px',
    fontWeight: 400,
    color: '#1a0dab'
  }
}));

const SearchResult = (props) => {

  let { userId, rank, title, snippet, link, openModalHandle, taskId } = props;
  const classes = useStyles();

  const urlObject = new URL(link);
  const host = urlObject.host;
  const pathSegments = urlObject.pathname.split('/').filter(segment => segment !== '');


  return (
    <Box sx={{ marginBottom: '20px', paddingLeft: '10%', paddingRight: '45%', paddingTop: 3 }}>
      <Link rel="noopener noreferrer" color="primary" style={{ cursor: 'pointer', textDecoration: 'none' }} onClick={() => {
        openModalHandle(link, rank, title);
      }}>
        <span className={classes.supertitle}>{host.replace('www.', '').charAt(0).toUpperCase() + host.replace('www.', '').slice(1)}</span>
        <br></br>
        <Typography variant="subtitle2" color="textSecondary" className={classes.linkCite}

          sx={{
            flexGrow: 1, minWidth: '270px',
            fontSize: { xs: '0.7rem', sm: '0.8rem' }
          }}
        >
          <cite>
            <span>{host}</span>
            {pathSegments.map((segment, index) => (
              <React.Fragment key={index}>
                <span>{index === 0 ? '' : ' > '}</span>
                {index === pathSegments.length - 1 ? <strong>{segment}</strong> : segment}
              </React.Fragment>
            ))}
          </cite>
        </Typography>
      </Link>
      <Link rel="noopener noreferrer" color="primary" style={{ cursor: 'pointer' }} onClick={() => {
        openModalHandle(link, rank, title);
      }}>
        <Typography variant="h6" component="div"
          sx={{
            flexGrow: 1, minWidth: '270px',
            fontSize: { xs: '0.9rem', sm: '1.2rem' }
          }}
        >
          {title}
        </Typography>
      </Link>
      <Typography className={classes.snippet}
        sx={{
          flexGrow: 1, minWidth: '270px',
          fontSize: { xs: '0.8rem', sm: '1rem' }
        }}
      >
        {snippet}
      </Typography>
    </Box >
  )

}

export { SearchResult }
