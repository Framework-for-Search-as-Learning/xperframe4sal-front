import React, { useEffect, useState } from 'react';
import { api } from "../../config/axios.js";
import { Container, Paper, TextField, Button } from '@mui/material';
import { ErrorMessage } from '../ErrorMessage.js';
import { LoadingIndicator } from '../LoadIndicator.js';

const EditAccount = ({ t, isLoading, setIsLoading, alertMessage, messageType, setMessageType, setAlertMessage, user, setUser }) => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isValidName, setIsValidName] = useState(true);
  const [isValidLastName, setIsValidLastName] = useState(true);
  const [enableEditButton, setEnableEditButton] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setLastName(user.lastName);
      setEmail(user.email);
    }
  }, [user]);

  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const isValid = emailRegex.test(inputEmail) && inputEmail.length > 0;
    if (inputEmail !== user.email && isValid) {
      setEnableEditButton(true);
    } else {
      setEnableEditButton(false);
    }
    setIsValidEmail(isValid);
  };

  const handleNameChange = (e) => {
    const inputName = e.target.value;
    setName(inputName);
    if (inputName !== user.name && inputName.length > 0) {
      setEnableEditButton(true);
    } else {
      setEnableEditButton(false);
    }
    setIsValidName(inputName ? true : false);
  };

  const handleLastNameChange = (e) => {
    const inputName = e.target.value;
    setLastName(inputName);
    if (inputName !== user.lastName) {
      setEnableEditButton(true);
    } else {
      setEnableEditButton(false);
    }
    setIsValidLastName(inputName ? true : false);
  };

  const handleEdit = async () => {
    if (!isValidEmail) {
      setAlertMessage(t("E-mail inválido. Verifique e tente novamente."));
      setMessageType("fail");
      return;
    }
    if (!isValidName) {
      setAlertMessage(t("Preencha seu nome."));
      setMessageType("fail");
      return;
    }
    if (!isValidLastName) {
      setAlertMessage(t("Preencha seu sobrenome."));
      setMessageType("fail");
      return;
    }

    name = name.trim();
    setName(name);
    lastName = lastName.trim();
    setLastName(lastName);
    email = email.trim();
    setEmail(email);

    let userData = { name, lastName, email };

    userData = Object.assign(userData, user);

    //Correcao temporal
    const userDataTemp = { name, lastName, email };
    setIsLoading(true);
    try {
      let response = await api.patch(`/users2/${user.id}`, userDataTemp, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      setIsLoading(false);
      const expirationTime = user.expirationTime;
      setUser({ ...userData, expirationTime });
      localStorage.setItem(
        "user",
        JSON.stringify({ ...userData, expirationTime })
      );
      if (response.data) {
        setAlertMessage(t("Seu cadastro foi atualizado com sucesso!"));
        setMessageType("success");
        setEnableEditButton(false);
      }
    } catch (e) {
      setIsLoading(false);
      setAlertMessage(
        t(
          "Não foi possível atualizar o cadastro. Verifique todos os campos e tente novamente."
        )
      );
      setMessageType("fail");
    }
  };

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
            label={t("Nome")}
            error={!isValidName}
            helperText={!isValidName ? t("Preencha o campo nome.") : ""}
            fullWidth
            margin="normal"
            variant="outlined"
            value={name}
            onChange={handleNameChange}
          />
          <TextField
            label={t("Sobrenome")}
            error={!isValidLastName}
            helperText={
              !isValidLastName ? t("Preencha o campo sobrenome.") : ""
            }
            fullWidth
            margin="normal"
            variant="outlined"
            value={lastName}
            onChange={handleLastNameChange}
          />
          <TextField
            label={t("E-mail")}
            type="email"
            autoComplete="email"
            error={!isValidEmail}
            helperText={!isValidEmail ? t("E-mail inválido.") : ""}
            fullWidth
            margin="normal"
            variant="outlined"
            value={email}
            onChange={handleEmailChange}
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

export default EditAccount;