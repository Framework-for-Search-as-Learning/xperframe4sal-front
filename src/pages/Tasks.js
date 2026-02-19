/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {api} from "../config/axios";
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
import {useTranslation} from "react-i18next";
import {LoadingIndicator} from "../components/LoadIndicator";

import {ExperimentTemplate, mountSteps} from "./ExperimentTemplate";

const Tasks = () => {
    const navigate = useNavigate();
    const {experimentId} = useParams();
    const {t} = useTranslation();

    const [user] = useState(JSON.parse(localStorage.getItem("user")));
    const [tasks, setTasks] = useState([]);
    const [userTasks, setUserTasks] = useState([]);
    const [steps, setSteps] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchTaskData = async () => {
        try {
            setIsLoading(true);
            const [experimentRes, userExpRes, userTasksRes, stepsRes] = await Promise.all([
                api.get(`experiment/${experimentId}`, {headers: {Authorization: `Bearer ${user.accessToken}`}}),
                api.get(`user-experiment?experimentId=${experimentId}&userId=${user.id}`, {headers: {Authorization: `Bearer ${user.accessToken}`}}),
                api.get(`user-task/user/${user.id}/experiment/${experimentId}`, {headers: {Authorization: `Bearer ${user.accessToken}`}}),
                api.get(`experiment/${experimentId}/step`, {headers: {Authorization: `Bearer ${user.accessToken}`}})
            ]);

            const userTasksData = userTasksRes.data || [];
            setUserTasks(userTasksData);

            const activeTasks = userTasksData
                .filter(ut => ut.task && ut.task.isActive)
                .map(ut => ut.task);

            setTasks(activeTasks);

            const experimentSteps = mountSteps(stepsRes.data, userExpRes.data.stepsCompleted);
            setSteps(experimentSteps);

        } catch (error) {
            console.error("Erro ao carregar tarefas:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTaskData();
    }, [experimentId]);

    const handleTaskAction = async (taskId, actionType) => {
        try {
            const userTask = userTasks.find(ut => ut.task?._id === taskId || ut.task_id === taskId || ut.taskId === taskId);

            if (!userTask) {
                console.error("UserTask não encontrada para o ID:", taskId);
                return;
            }

            const endpoint = actionType === 'resume' ? 'resume' : 'start';
            await api.patch(`user-task/${userTask._id}/${endpoint}`, userTask, {
                headers: {Authorization: `Bearer ${user.accessToken}`},
            });

            navigate(`/experiments/${experimentId}/tasks/${taskId}`, {
                state: {
                    task: tasks.find(t => t._id === taskId),
                    userTask: userTask,
                },
            });
        } catch (error) {
            console.error(`Erro ao ${actionType} tarefa:`, error);
        }
    };

    return (
        <ExperimentTemplate headerTitle={t("see_tasks_list_title")} steps={steps}>
            {isLoading && <LoadingIndicator size={70}/>}

            {!isLoading && tasks?.length === 0 && (
                <Typography variant="body1">Obrigad@! No momento você não tem tarefas.</Typography>
            )}

            {tasks?.map((task, index) => {
                const userTask = userTasks.find(ut => (ut.task?._id === task._id) || (ut.task_id === task._id));
                const hasFinished = userTask?.hasFinishedTask;
                const isPaused = userTask?.isPaused;

                return (
                    <Accordion key={task._id} elevation={3} defaultExpanded={true} disabled={hasFinished}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography>
                                <strong>{task.title}</strong>
                                {hasFinished && (
                                    <span style={{color: "red", marginLeft: "10px"}}>
                                        - {t("task_finished")}
                                    </span>
                                )}
                            </Typography>
                        </AccordionSummary>
                        <Divider/>
                        <AccordionDetails>
                            <Typography dangerouslySetInnerHTML={{__html: task.description}}/>
                            <div style={{textAlign: "right", marginTop: "15px"}}>
                                {!hasFinished && (
                                    isPaused ? (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleTaskAction(task._id, 'resume')}
                                        >
                                            {t("resume") || "Retomar"}
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            color="success"
                                            onClick={() => handleTaskAction(task._id, 'start')}
                                        >
                                            {t("start") || "Começar"} <PlayArrow/>
                                        </Button>
                                    )
                                )}
                            </div>
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </ExperimentTemplate>
    );
};

export {Tasks};
