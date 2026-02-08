/*
 * Copyright (c) 2026, marcelomachado
 * Licensed under The MIT License [see LICENSE for details]
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../config/axios";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Typography,
    Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrow from "@mui/icons-material/PlayArrow";
import { useTranslation } from "react-i18next";
import { LoadingIndicator } from "../components/LoadIndicator";

import { ExperimentTemplate, mountSteps } from "./ExperimentTemplate";

const Tasks = () => {
    const navigate = useNavigate();
    const { experimentId } = useParams();

    const { t } = useTranslation();

    const [user] = useState(JSON.parse(localStorage.getItem("user")));
    const [, setExperiment] = useState(null);
    const [tasks, setTasks] = useState();
    const [expanded, setExpanded] = useState(`panel-0`);
    const [steps, setSteps] = useState([]);

    const [isLoading, setIsLoading] = useState(false);

    const [userTasks, setUserTasks] = useState(null);

    useEffect(() => {
        const fetchTaskData = async () => {
            try {
                setIsLoading(true);
                const [experimentResponse, userExperimentResponse] =
                    await Promise.all([
                        api.get(`experiments2/${experimentId}`, {
                            headers: {
                                Authorization: `Bearer ${user.accessToken}`,
                            },
                        }),
                        api.get(
                            `user-experiments2?experimentId=${experimentId}&userId=${user.id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${user.accessToken}`,
                                },
                            }
                        ),
                    ]);

                let experimentResult = experimentResponse.data;
                let userExperimentResult = userExperimentResponse.data;
                setExperiment(experimentResult);

                let response = await api.get(`user-task2/user/${user.id}/experiment/${experimentId}`, {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                });
                let userTasks = response?.data;


                setUserTasks(userTasks);

                let taskList = [];

                for (let userTask of userTasks) {
                    const task = userTask.task
                    if (task.isActive) {
                        taskList.push(task);
                    }
                }
                const steps = await api.get(`experiments2/${experimentId}/step`, {
                        headers: {
                            Authorization: `Bearer ${user.accessToken}`,
                        },
                    });
                const experimentSteps = mountSteps(
                    steps.data,
                    userExperimentResult.stepsCompleted
                 );
                setSteps(experimentSteps);

                setTasks(taskList);
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
                console.error(error);
            }
        };
        fetchTaskData();
    }, [experimentId, user?.id, user?.accessToken]);

    const handleStartTaskClick = async (e) => {
        try {
            const userTask = userTasks.filter(
                (userTask) => userTask['task_id'] === e
            )[0];
            await api.patch(`user-task2/${userTask._id}/start`, userTask, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });

            navigate(`/experiments/${experimentId}/tasks/${e}`, {
                state: {
                    task: tasks.filter((s) => s._id === e)[0],
                    userTask: userTask,
                },
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleContinueTaskClick = async (e) => {
        try {
            const userTask = userTasks.filter(
                (userTask) => userTask.taskId === e
            )[0];
            await api.patch(`user-task2/${userTask._id}/resume`, userTask, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });

            navigate(`/experiments/${experimentId}/tasks/${e}`, {
                state: {
                    task: tasks.filter((s) => s._id === e)[0],
                    userTask: userTask,
                },
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <ExperimentTemplate
            headerTitle={t("see_tasks_list_title")}
            steps={steps}
        >
            {!tasks && (
                <Typography variant="body1">Carregando tarefas...</Typography>
            )}
            {!tasks && isLoading && <LoadingIndicator size={70} />}
            {tasks?.length === 0 && (
                <Typography variant="body1">
                    No momento você não foi inscrito em nenhuma tarefa.
                    Obrigad@!
                </Typography>
            )}
            {tasks?.map((task, index) => {
                const userTask = userTasks.find((ut) => ut.task._id === task._id);
                const hasFinished = userTask?.hasFinishedTask;

                return (
                    <Accordion
                        sx={{ marginBottom: "5px" }}
                        key={task._id}
                        elevation={3}
                        expanded={true}
                        // expanded=true{expanded === `panel-${index}`}
                        onChange={handleChange(`panel-${index}`)}
                        disabled={hasFinished}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`panel-${index}bh-content`}
                            id={`panel-${index}bh-header`}
                            sx={{
                                "&:hover": {
                                    backgroundColor: "lightgray",
                                },
                            }}
                        >
                            <Typography>
                                <span>{task.title}</span>
                                {hasFinished && (
                                    <span
                                        style={{
                                            color: "red",
                                            marginLeft: "10px",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        - {t("task_finished") || "Você já completou esta tarefa."}
                                    </span>
                                )}
                            </Typography>
                        </AccordionSummary>
                        <Divider />
                        <AccordionDetails>
                            <Typography
                                dangerouslySetInnerHTML={{
                                    __html: task.description,
                                }}
                            />
                            <div style={{ textAlign: "right" }}>
                                {!hasFinished &&
                                    (userTask?.isPaused ? (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            style={{ margin: "16px" }}
                                            onClick={() =>
                                                handleContinueTaskClick(task._id)
                                            }
                                        >
                                            Retomar
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            color="success"
                                            style={{ margin: "16px" }}
                                            onClick={() =>
                                                handleStartTaskClick(task._id)
                                            }
                                        >
                                            Start <PlayArrow />
                                        </Button>
                                    ))}
                            </div>
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </ExperimentTemplate>
    );
};

export { Tasks };
