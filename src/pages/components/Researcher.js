/*
 * Copyright (c) 2026, marcelomachado
 * Licensed under The MIT License [see LICENSE for details]
 */

import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../config/axios";
import { Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import EditUser from "./EditUser";
import { ExperimentAccordion } from "../../components/Researcher/ExperimentAccordion";
import styles from '../../style/researcher.module.css'
import { LoadingState } from "../../components/Researcher/LoadingState";

const Researcher = () => {
    const navigate = useNavigate();
    const [experiments, setExperiments] = useState(null);
    const [experimentsOwner, setOwnerExperiments] = useState(null);
    const [expanded, setExpanded] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const user = JSON.parse(localStorage.getItem("user"));
    const { t } = useTranslation();
    const fileInputRef = useRef(null);

    const fetchAllExperiments = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            /*
      const { data: allExperiments } = await api.get('experiments', {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      */

            const { data: ownedExperiments } = await api.get(
                `experiments/owner/${user.id}`,
                {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                }
            );

            const { data: participatedExperiments } = await api.get(
                `user-experiments/user/${user.id}`,
                {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                }
            );

            /*
      const participatedExperiments = [];
      const ownedExperiments = [];
      */
            /*
            allExperiments.forEach((experiment) => {
                if (experiment.owner_id === user.id) {
                    ownedExperiments.push(experiment);
                } else if (experiment.userProps?.includes(user.id)) {
                    participatedExperiments.push(experiment);
                }
            });
            */

            setExperiments(participatedExperiments);
            setOwnerExperiments(ownedExperiments);

            if (ownedExperiments.length > 0) {
                setExpanded(`panel-owner-0`);
            } else if (participatedExperiments.length > 0) {
                setExpanded(`panel-0`);
            }
        } catch (err) {
            setError(t("error_loading_experiments"));
        } finally {
            setIsLoading(false);
        }
    }, [user.accessToken, user.id, t]);

    useEffect(() => {
        fetchAllExperiments();
    }, [fetchAllExperiments]);

    const handleCreateExperiment = () => navigate("/experiments/new");

    const handleAccessExperiment = (experimentId) => {
        navigate(`/experiments/${experimentId}/surveys`);
    };

    const handleExportExperiment = async (experimentId) => {
        try {
            const response = await api.get(`experiments/export/${experimentId}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/x-yaml' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `experiment_export_${experimentId}.yaml`;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Export error:', error);
            setError(t("export_error") || "Erro ao exportar experimento");
        }
    }

    const handleImportExperiment = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file extension
        if (!file.name.endsWith('.yaml') && !file.name.endsWith('.yml')) {
            setError(t("import_invalid_file"));
            return;
        }

        // Create FormData to send the file
        const formData = new FormData();
        formData.append('file', file);

        try {
            setIsLoading(true);
            setError(null);

            const response = await api.post(`experiments/import/${user.id}`, formData, {
                headers: {
                    Authorization: `Bearer ${user.accessToken}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Reset file input
            event.target.value = '';

            // Check if there are validation errors
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                // Display translated error messages
                const translatedErrors = response.data.map(errorKey => t(errorKey) || errorKey);
                setError(translatedErrors.join('\n'));
                return;
            }

            // Refresh experiments list
            await fetchAllExperiments();

            // Navigate to the newly created experiment for editing
            if (response.data && response.data._id) {
                navigate(`/experiments/${response.data._id}/edit`);
            }

        } catch (error) {
            console.error('Import error:', error);
            if (error.response && error.response.data && Array.isArray(error.response.data)) {
                // Handle validation errors from server
                const translatedErrors = error.response.data.map(errorKey => t(errorKey) || errorKey);
                setError(translatedErrors.join('\n'));
            } else {
                setError(t("import_error"));
            }
            event.target.value = '';
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditExperiment = (experimentId) => {
        navigate(`/experiments/${experimentId}/edit`);
    };

    const handleDeleteExperiment = async (experimentId) => {
        try {
            await api.delete(`experiments/${experimentId}`, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });

            fetchAllExperiments();
        } catch (error) {
            setError(t("error_deleting_experiment"));
        }
    };

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : null);
    };

    const handleEditUser = (experimentId) => {
        setEditingUser(experimentId);
    };

    if (editingUser) {
        return <EditUser experimentId={editingUser} />;
    }

    return (
        <>
            <div className={styles.titleContainer} >
                <Typography variant="h6" gutterBottom>
                    {t("researcher_experiments_title")}
                </Typography>
                <div className={styles.buttonContainer}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreateExperiment}
                    >
                        {t("create_experiment_button")}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleImportExperiment}
                    >
                        {t("import")}
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".yaml,.yml"
                        style={{ display: 'none' }}
                    />
                </div>
            </div>

            {isLoading && <LoadingState />}
            {error && (
                <Typography
                    variant="body1"
                    color="error"
                    style={{ marginTop: "16px" }}
                >
                    {error}
                </Typography>
            )}

            {experimentsOwner?.length > 0
                ? experimentsOwner.map((experiment, index) => (
                    <ExperimentAccordion
                        key={experiment._id}
                        experiment={experiment}
                        expanded={expanded === `panel-owner-${index}`}
                        onChange={handleChange(`panel-owner-${index}`)}
                        onAccess={handleExportExperiment}
                        onEdit={handleEditExperiment}
                        onDelete={handleDeleteExperiment}
                        onEdituser={handleEditUser}
                        isOwner={true}
                        t={t}
                    />
                ))
                : !isLoading && <Typography>{t("no_experiments")}</Typography>}

            <Typography variant="h6" gutterBottom style={{ marginTop: "16px" }}>
                {t("see_experiment_list_title")}
            </Typography>

            {experiments?.length > 0
                ? experiments.map((experiment, index) => (
                    <ExperimentAccordion
                        key={experiment._id}
                        experiment={experiment}
                        expanded={expanded === `panel-${index}`}
                        onChange={handleChange(`panel-${index}`)}
                        onAccess={handleAccessExperiment}
                        onEdit={handleEditExperiment}
                        onEdituser={handleEditUser}
                        isOwner={false}
                        t={t}
                    />
                ))
                : !isLoading && <Typography>{t("no_experiments")}</Typography>}
        </>
    );
};

export default Researcher;
