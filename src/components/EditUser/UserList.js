/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useState } from 'react';
import { IconButton } from '@mui/material';
import {
    Add as AddIcon,
    Remove as RemoveIcon,
    SwapHoriz as SwapIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import styles from "../../style/userList.module.css"

const UserList = ({ title, users, buttonAction, buttonType }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const buttonStyles = {
        add: {
            backgroundColor: '#007bff',
            color: '#fff',
            icon: <AddIcon />,
        },
        delete: {
            backgroundColor: '#ff4d4d',
            color: '#fff',
            icon: <RemoveIcon />,
        },
        change: {
            backgroundColor: '#007bff',
            color: '#fff',
            icon: <SwapIcon />,
        },
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={styles.container}>
            <h3 style={{ textAlign: 'center', marginTop: '0' }}>{title}</h3>
            <input
                type="text"
                placeholder={t('search_by_name_or_email')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                    width: '100%',
                    padding: '15px',
                    marginBottom: '15px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '14px',
                }}
            />
            {filteredUsers.length ? (
                filteredUsers.map((user) => (
                    <div
                        key={user.id}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                            padding: '10px 15px',
                            margin: '5px 0',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            backgroundColor: '#fff',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <div className={styles.UserInfoArea}>
                            <strong className={styles.forceLineBreak}>{user.name}</strong>
                            <br />
                            <small className={styles.forceLineBreak}>{user.email}</small>
                        </div>
                        <IconButton
                            onClick={() => buttonAction(user.id ?? user._id)}
                            style={buttonStyles[buttonType]}
                        >
                            {buttonStyles[buttonType].icon}
                        </IconButton>
                    </div>
                ))
            ) : (
                <p style={{ textAlign: 'center' }}>{t('no_users_found')}</p>
            )}
        </div>
    );
};

export default UserList;