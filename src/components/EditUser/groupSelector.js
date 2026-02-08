/*
 * Copyright (c) 2026, marcelomachado
 * Licensed under The MIT License [see LICENSE for details]
 */

import { IconButton, Typography } from "@mui/material";
import { Close, SwapHoriz } from '@mui/icons-material';
import styles from "../../style/groupSelector.module.css"
import { useTranslation } from "react-i18next";


const GroupSelector = ({isVisible, closeModal, userId, groups, addUserToGroup}) => {
    const { t } = useTranslation();

    return (
        <div className={isVisible ? styles.screen : styles.hidden} onClick={closeModal}>
            <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
            >
                <Typography variant="h4" component="h1" gutterBottom align="center" marginBottom={1}>
                    {t('select_group')}
                </Typography>

                <div className={styles.groupList}>
                    {groups.map(group => (
                        <div key={group.groupName} className={styles.groupContainer}>
                            <strong>{group.groupName}</strong>
                            <IconButton
                                onClick={() => addUserToGroup(userId, group.id)}
                                style={{backgroundColor: '#007bff', color: '#fff'}}
                            >
                                <SwapHoriz />
                            </IconButton>
                        </div>
                    ))}
                </div>
                <span className={styles.closeButton} onClick={closeModal}><Close/></span>
            </div>
        </div>
    )
}

export default GroupSelector;