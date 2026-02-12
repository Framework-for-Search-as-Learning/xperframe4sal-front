/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useState } from 'react';
import { api } from "../../config/axios.js";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Container, Paper, TextField, Button } from '@mui/material';
import { ErrorMessage } from '../ErrorMessage.js';
import { LoadingIndicator } from '../LoadIndicator.js';
import { InputAdornment, IconButton } from '@mui/material';

const EditPassword = ({ t, isLoading, setIsLoading, alertMessage, messageType, setMessageType, setAlertMessage, user, setUser }) => {
    const [isValidCPassword, setIsValidCPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isValidPassword, setIsValidPassword] = useState(true);
    const [password, setPassword] = useState(user.password);
    const [showPassword, setShowPassword] = useState(false);

    const handlePasswordChange = (e) => {
        const inputPassword = e.target.value;
        setPassword(inputPassword);
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\]*@#$%^<>'";|}{:,./?~()`&\-_+=![]).{6,}$/;
        setIsValidPassword(passwordRegex.test(inputPassword));
    };

    const handleConfirmPasswordChange = (e) => {
        const inputConfirmPassword = e.target.value
        setConfirmPassword(inputConfirmPassword)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\]*@#$%^<>'";|}{:,./?~()`&\-_+=![]).{6,}$/;
        setIsValidCPassword(passwordRegex.test(inputConfirmPassword))
    }

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const enableEditButton = () => {

    }
    const handleEdit = async (e) => {

    }

    return (
        <Container
            maxWidth="xs"
            style={{
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
                height: "80vh",
                justifyContent: "center",
                position: "relative",
            }}
        >
            <Paper elevation={3} sx={{ padding: 2 }}>
                {isLoading && <LoadingIndicator size={50} />}
                {alertMessage && (
                    <ErrorMessage
                        message={alertMessage}
                        messageType={messageType}
                        onClose={() => setAlertMessage(null)}
                    />
                )}
                <form onSubmit={handleEdit} disabled={isLoading}>
                    <TextField
                        label={t('Senha')}
                        error={!isValidPassword}
                        helperText={!isValidPassword ? t('isValidPassword') : ''}
                        fullWidth
                        margin="normal"
                        autoComplete="current-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={handlePasswordChange}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleTogglePasswordVisibility}
                                        edge="end"
                                    >
                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        type="submit"
                        style={{ margin: "16px 0" }}
                        disabled={!enableEditButton || isLoading}
                    >
                        {t("edit")}
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default EditPassword;