import React from 'react';
import { Box } from '@mui/material';

const FormStepContainer = ({ children }) => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                marginTop: 5,
            }}
        >
            <Box
                sx={{
                    width: { xs: '100%', sm: '60%' },
                    padding: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    boxShadow: 4,
                    mx: 'auto',
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        margin: 0,
                        padding: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        '& > *': {
                            marginBottom: 2,
                            width: '100%',
                        },
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default FormStepContainer;