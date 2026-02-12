import {useCallback, useEffect, useState, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {api} from "../../config/axios";
import {Button, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from "@mui/material";
import {useTranslation} from "react-i18next";
import EditUser from "./EditUser";
import {ExperimentAccordion} from "../../components/Researcher/ExperimentAccordion";
import styles from "../../style/researcher.module.css";
import {LoadingState} from "../../components/Researcher/LoadingState";
import {TabView, TabPanel} from "primereact/tabview";

const experimentStatus = Object.freeze({
    NOT_STARTED: "NOT_STARTED",
    IN_PROGRESS: "IN_PROGRESS",
    FINISHED: "FINISHED",
});

const Researcher = () => {
    const navigate = useNavigate();
    const [experiments, setExperiments] = useState(null);
    const [experimentsOwner, setOwnerExperiments] = useState(null);
    const [expanded, setExpanded] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [experimentsWithParticipants, setExperimentsWithParticipants] = useState(new Set());
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [experimentToDelete, setExperimentToDelete] = useState(null);
    const user = JSON.parse(localStorage.getItem("user"));
    const {t} = useTranslation();
    const fileInputRef = useRef(null);

    const checkExperimentParticipants = useCallback(async (experimentId) => {
        try {
            const {data: participants} = await api.get(
                `experiment/${experimentId}/participants`,
                {
                    headers: {Authorization: `Bearer ${user.accessToken}`},
                },
            );

            const hasActiveParticipants = participants.some(
                (participant) =>
                    participant.status === experimentStatus.IN_PROGRESS ||
                    participant.status === experimentStatus.FINISHED
            );

            return hasActiveParticipants;
        } catch (error) {
            console.error("Error checking participants:", error);
            return false;
        }
    }, [user.accessToken]);

    const checkAllExperimentsParticipants = useCallback(async (experiments) => {
        if (!experiments?.length) return;

        try {
            const checks = await Promise.all(
                experiments.map(async (exp) => {
                    const hasParticipants = await checkExperimentParticipants(exp._id);
                    return {id: exp._id, hasParticipants};
                })
            );

            const experimentsWithParticipantsSet = new Set(
                checks
                    .filter((check) => check.hasParticipants)
                    .map((check) => check.id)
            );

            setExperimentsWithParticipants(experimentsWithParticipantsSet);
        } catch (error) {
            console.error("Error checking all experiments:", error);
        }
    }, [checkExperimentParticipants]);

    const fetchAllExperiments = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const {data: ownedExperiments} = await api.get(
                `experiment/owner/${user.id}`,
                {
                    headers: {Authorization: `Bearer ${user.accessToken}`},
                },
            );

            const {data: participatedExperiments} = await api.get(
                `user-experiment/user/${user.id}`,
                {
                    headers: {Authorization: `Bearer ${user.accessToken}`},
                },
            );

            setExperiments(participatedExperiments);
            setOwnerExperiments(ownedExperiments);

            await checkAllExperimentsParticipants(ownedExperiments);

            if (ownedExperiments.length > 0) {
                setActiveTab(0);
                setExpanded(`panel-owner-0`);
            } else if (participatedExperiments.length > 0) {
                setActiveTab(1);
                setExpanded(`panel-0`);
            }
        } catch (err) {
            setError(t("error_loading_experiments"));
        } finally {
            setIsLoading(false);
        }
    }, [user.accessToken, user.id, t, checkAllExperimentsParticipants]);

    useEffect(() => {
        fetchAllExperiments();
    }, [fetchAllExperiments]);

    useEffect(() => {
        if (!experiments?.length) return;

        const refreshInterval = setInterval(async () => {
            try {
                const updatedExperiments = await Promise.all(
                    experiments.map(async (exp) => {
                        try {
                            const {data} = await api.get(
                                `experiment/${exp.experiment._id}`,
                                {
                                    headers: {Authorization: `Bearer ${user.accessToken}`},
                                },
                            );
                            return {
                                ...exp,
                                experiment: data
                            };
                        } catch (error) {
                            console.error(`Error refreshing experiment ${exp.experiment._id}:`, error);
                            return exp;
                        }
                    }),
                );

                setExperiments(updatedExperiments);
            } catch (error) {
                console.error("Error refreshing experiment statuses:", error);
            }
        }, 30000);

        return () => clearInterval(refreshInterval);
    }, [experiments, user.accessToken]);

    const handleCreateExperiment = () => navigate("/CreateExperiment");

    const handleAccessExperiment = async (experiment, userExperimentId, userExperimentStatus) => {
        try {
            const {data: experimentData} = await api.get(
                `experiment/${experiment._id}`,
                {headers: {Authorization: `Bearer ${user.accessToken}`}},
            );

            if (experimentData.status !== experimentStatus.IN_PROGRESS) {
                setExperiments((prev) =>
                    prev?.map((exp) =>
                        exp.experiment._id === experiment._id
                            ? {
                                ...exp,
                                experiment: {
                                    ...exp.experiment,
                                    status: experimentData.status,
                                },
                            }
                            : exp,
                    ) ?? prev
                );
                return;
            }

            if (userExperimentStatus === experimentStatus.NOT_STARTED) {
                await api.patch(
                    `user-experiment/${userExperimentId}`,
                    {status: experimentStatus.IN_PROGRESS, startDate: new Date()},
                    {
                        headers: {Authorization: `Bearer ${user.accessToken}`},
                    },
                );
            }

            navigate(`/experiments/${experiment._id}/surveys`);
        } catch (error) {
            console.error("Error accessing experiment:", error);
            setError(t("error_accessing_experiment") || "Erro ao acessar experimento");
        }
    };

  const handleViewStats = (experimentId) => {
    navigate(`/experiments/${experimentId}/monitoring`);
  };

    const handleExportExperiment = async (experimentId) => {
        try {
            const response = await api.get(`experiment/export/${experimentId}`, {
                headers: {Authorization: `Bearer ${user.accessToken}`},
                responseType: "blob",
            });

            const blob = new Blob([response.data], {type: "application/x-yaml"});
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `experiment_export_${experimentId}.yaml`;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export error:", error);
            setError(t("export_error") || "Erro ao exportar experimento");
        }
    };

    const handleImportExperiment = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.endsWith(".yaml") && !file.name.endsWith(".yml")) {
            setError(t("import_invalid_file"));
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setIsLoading(true);
            setError(null);

            const response = await api.post(
                `experiment/import/${user.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                        "Content-Type": "multipart/form-data",
                    },
                },
            );

            event.target.value = "";

            if (
                response.data &&
                Array.isArray(response.data) &&
                response.data.length > 0
            ) {
                const translatedErrors = response.data.map(
                    (errorKey) => t(errorKey) || errorKey,
                );
                setError(translatedErrors.join("\n"));
                return;
            }

            await fetchAllExperiments();

            if (response.data && response.data._id) {
                navigate(`/EditExperiment/${response.data._id}`);
            }
        } catch (error) {
            console.error("Import error:", error);
            if (
                error.response &&
                error.response.data &&
                Array.isArray(error.response.data)
            ) {
                const translatedErrors = error.response.data.map(
                    (errorKey) => t(errorKey) || errorKey,
                );
                setError(translatedErrors.join("\n"));
            } else {
                setError(t("import_error"));
            }
            event.target.value = "";
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditExperiment = async (experimentId) => {
        const experiment = experimentsOwner?.find(
            (exp) => exp._id === experimentId,
        );

        if (!experiment) return;

        const hasActiveParticipants = await checkExperimentParticipants(experimentId);

        if (hasActiveParticipants) {
            return;
        }

        navigate(`/EditExperiment/${experimentId}`);
    };

    const handleDeleteExperiment = (experimentId) => {
        const experiment = experimentsOwner?.find((exp) => exp._id === experimentId);
        setExperimentToDelete(experiment);
        setDeleteModalOpen(true);
    };

    const confirmDeleteExperiment = async () => {
        if (!experimentToDelete) return;

        try {
            await api.delete(`experiment/${experimentToDelete._id}`, {
                headers: {Authorization: `Bearer ${user.accessToken}`},
            });

            setDeleteModalOpen(false);
            setExperimentToDelete(null);

            fetchAllExperiments();
        } catch (error) {
            console.error("Error deleting experiment:", error);
            setError(t("error_deleting_experiment") || "Erro ao excluir experimento");
            setDeleteModalOpen(false);
            setExperimentToDelete(null);
        }
    };

    const cancelDeleteExperiment = () => {
        setDeleteModalOpen(false);
        setExperimentToDelete(null);
    };

    const handleEditExperimentStatus = async (experimentId, currentStatus) => {
        const newStatus =
            currentStatus === experimentStatus.FINISHED
                ? experimentStatus.IN_PROGRESS
                : experimentStatus.FINISHED;

        try {
            await api.patch(
                `experiment/${experimentId}`,
                {status: newStatus},
                {
                    headers: {Authorization: `Bearer ${user.accessToken}`},
                },
            );

            setOwnerExperiments((prevExperiments) =>
                prevExperiments.map((exp) =>
                    exp._id === experimentId
                        ? {...exp, status: newStatus}
                        : exp
                )
            );

            setExperiments((prevExperiments) =>
                prevExperiments?.map((exp) =>
                    exp.experiment?._id === experimentId
                        ? {
                            ...exp,
                            experiment: {
                                ...exp.experiment,
                                status: newStatus
                            }
                        }
                        : exp
                ) ?? prevExperiments
            );
        } catch (error) {
            setError(t("error_updating_status") || "Erro ao atualizar status");
        }
    };

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : null);
    };

    const handleEditUser = (experimentId) => {
        setEditingUser(experimentId);
    };

    if (editingUser) {
        return <EditUser experimentId={editingUser}/>;
    }

    return (
        <div className={styles.researcherContainer}>
            <Dialog
                open={deleteModalOpen}
                onClose={cancelDeleteExperiment}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">
                    {t("delete_experiment_title") || "Confirmar Exclusão"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        {t("delete_experiment_message") ||
                            "Tem certeza que deseja excluir este experimento?"
                        }
                    </DialogContentText>
                    {experimentToDelete && (
                        <DialogContentText sx={{mt: 2, fontWeight: 'bold'}}>
                            {experimentToDelete.name}
                        </DialogContentText>
                    )}
                    <DialogContentText sx={{mt: 2, color: 'warning.main'}}>
                        {t("delete_experiment_warning") ||
                            "Esta ação não pode ser desfeita. Caso existam participantes que já iniciaram o experimento, todos os dados serão perdidos."
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{padding: '16px 24px'}}>
                    <Button
                        onClick={cancelDeleteExperiment}
                        color="primary"
                        variant="outlined"
                    >
                        {t("cancel") || "CANCELAR"}
                    </Button>
                    <Button
                        onClick={confirmDeleteExperiment}
                        color="error"
                        variant="contained"
                        autoFocus
                    >
                        {t("delete_confirm") || "EXCLUIR"}
                    </Button>
                </DialogActions>
            </Dialog>
            <div className={styles.headerRow}>
                <TabView
                    activeIndex={activeTab}
                    onTabChange={(e) => setActiveTab(e.index)}
                >
                    <TabPanel header={t("researcher_experiments_title")}/>
                    <TabPanel header={t("available_experiments_title")}/>
                </TabView>

                <div className={styles.buttonContainer}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleImportExperiment}
                    >
                        {t("import")}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCreateExperiment}
                    >
                        {t("create_experiment_button")}
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".yaml,.yml"
                        style={{display: "none"}}
                    />
                </div>
            </div>

            <div className={styles.experimentList}>
                {isLoading && <LoadingState/>}
                {error && (
                    <Typography variant="body1" color="error">
                        {error}
                    </Typography>
                )}

                {activeTab === 0 && (
                    <>
                        {experimentsOwner?.length > 0 ? (
                            experimentsOwner.map((experiment, index) => (
                                <ExperimentAccordion
                                    key={experiment._id}
                                    experiment={experiment}
                                    status={experiment.status}
                                    hasActiveParticipants={experimentsWithParticipants.has(experiment._id)}
                                    expanded={expanded === `panel-owner-${index}`}
                                    onChange={handleChange(`panel-owner-${index}`)}
                                    onAccess={handleExportExperiment}
                                    onEdit={handleEditExperiment}
                                    onEditStatus={handleEditExperimentStatus}
                                    onDelete={handleDeleteExperiment}
                                    onEdituser={handleEditUser}
                                    onViewStats={handleViewStats}
                                    isOwner={true}
                                    t={t}
                                />
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <Typography variant="h6" gutterBottom >
                                    {t("experiments_empty_title")}
                                </Typography>
                                <Typography variant="body2">
                                    {t("experiments_empty_call_to_action")}
                                </Typography>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 1 &&
                    (experiments?.length > 0 ? (
                        experiments.map((experiment, index) => (
                            <ExperimentAccordion
                                key={experiment.experiment?._id}
                                userExperimentId={experiment?._id}
                                userExperimentStatus={experiment?.status}
                                experiment={experiment.experiment}
                                status={experiment.experiment?.status}
                                expanded={expanded === `panel-${index}`}
                                onChange={handleChange(`panel-${index}`)}
                                onAccess={handleAccessExperiment}
                                onEdit={handleEditExperiment}
                                onEdituser={handleEditUser}
                                isOwner={false}
                                t={t}
                            />
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <Typography variant="h6">{t("no_experiments")}</Typography>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default Researcher;
