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
import { CustomSnackbar } from "../components/CustomSnackbar";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingIndicator } from "../components/LoadIndicator";

import { useTranslation } from "react-i18next";
import { ExperimentTemplate, mountSteps } from "./ExperimentTemplate";

const SurveyType = {
    PRE: "pre",
    POST: "post",
    OTHER: "other",
};

const Surveys = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { experimentId } = useParams();

    const [user] = useState(JSON.parse(localStorage.getItem("user")));
    const [steps, setSteps] = useState([]);
    const [experiment, setExperiment] = useState(null);
    const [, setUserExperiment] = useState(null);
    const [surveys, setSurveys] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [preSurveys, setPreSurveys] = useState([]);
    const [postSurveys, setPostSurveys] = useState([]);
    const [answeredPreSurveys, setAnsweredPreSurveys] = useState({});
    const [answeredPostSurveys, setAnsweredPostSurveys] = useState({});
    const [, setIsSuccess] = useState(false);
    const [open, setOpen] = useState(false);
    const [severity, setSeverity] = useState("success");
    const [message, setMessage] = useState("success");
    const [shouldActivateTask, setShouldActivateTask] = useState(false);
    const [showWarning, setShowWarning] = useState(false);
    const [expanded, setExpanded] = useState(`panel-0`);
    const [hasFinishedTasks, setHasFinishedTasks] = useState(false);

    useEffect(() => {
        const fetchSurveyData = async () => {
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
                let userExperimentResult = userExperimentResponse?.data;

                if (!userExperimentResult) {
                    navigate(`/experiments`);
                }

                if (!userExperimentResult.stepsCompleted) {
                    userExperimentResult.stepsCompleted = {};
                }

                if (!userExperimentResult.stepsCompleted["icf"]) {
                    navigate(`/experiments/${experimentId}/icf`);
                    return;
                }

                setHasFinishedTasks(
                    userExperimentResult?.stepsCompleted["task"]
                );

                let surveyList = [];
                let localPre = [];
                let localPost = [];
                const surveys = await api.get(`survey2/experiment/${experimentId}`, {
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                });

                for (const survey of surveys.data) {

                    if (survey.isActive) {
                        surveyList.push(survey);

                        const response = await api.get(
                            `survey-answer2?userId=${user.id}&surveyId=${survey._id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${user.accessToken}`,
                                },
                            }
                        );

                        const answeredSurvey = response?.data;

                        let hasAnswered = false;
                        if (answeredSurvey) {
                            hasAnswered = true;
                        }
                        if (survey.type === SurveyType.PRE) {
                            localPre.push(survey);

                            if (hasAnswered) {
                                setAnsweredPreSurveys((prev) => ({ ...prev, [survey._id]: true }));
                            }
                        } else if (survey.type === SurveyType.POST) {
                            localPost.push(survey);

                            if (hasAnswered) {
                                setAnsweredPostSurveys((prev) => ({ ...prev, [survey._id]: true }));
                            }
                        }
                    }
                }

                setPreSurveys(localPre);
                setPostSurveys(localPost);

                if (surveyList.length === 0) {
                    navigate(`/experiments/${experimentId}/tasks`);
                }

                const activate =
                    userExperimentResult.stepsCompleted["pre"] || false;
                setShowWarning(!activate);
                setShouldActivateTask(activate);

                const steps = await api.get(`experiments2/${experimentId}/step`, {
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                    },
                });
                const experimentSteps = mountSteps(
                    steps.data,
                    userExperimentResult.stepsCompleted
                );

                setExperiment(experimentResult);
                setUserExperiment(userExperimentResult);
                setSurveys(surveyList);
                setSteps(experimentSteps);
                setIsLoading(false);

            } catch (error) {
                setIsLoading(false);
                setOpen(true);
                setIsSuccess(false);
                setSeverity("error");
                setMessage(error);
                console.log(error);
            }
        };

        fetchSurveyData();
    }, [experimentId, user?.id, user?.accessToken, navigate]);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const handleEnterTasks = () => {
        navigate(`/experiments/${experimentId}/tasks`);
    };

    const handleEnterSurvey = (e) => {
        navigate(`/experiments/${experimentId}/surveys/${e}`, {
            state: {
                survey: surveys.filter((s) => s._id === e)[0],
                experiment: experiment,
            },
        });


    };

    return (
        <ExperimentTemplate
            headerTitle={t("questionnaire_list_header")}
            steps={steps}
        >
            <CustomSnackbar
                open={open}
                time={1500}
                message={message}
                severity={severity}
            />
            <div style={{ display: "flex", marginBottom: 10 }}>
                {showWarning && (
                    <ErrorMessage
                        style={{ flex: 1 }}
                        message={t("attention_message")}
                        messageType={"warning"}
                    />
                )}
                {!showWarning && !hasFinishedTasks && (
                    <Button
                        variant="contained"
                        color="primary"
                        style={{
                            justifyContent: "flex-end",
                            marginLeft: "auto",
                        }}
                        onClick={handleEnterTasks}
                        disabled={!shouldActivateTask}
                    >
                        {t("go_to_tasks")}
                    </Button>
                )}
            </div>
            {!surveys && (
                <Typography variant="body1">{t("loading_surveys")}</Typography>
            )}
            {!surveys && isLoading && <LoadingIndicator size={70} />}
            {surveys?.length === 0 && (
                <Typography variant="body1">{t("no_surveys")}</Typography>
            )}

            <div>
                {!hasFinishedTasks &&
                    preSurveys?.map((survey, index) => (
                        <Accordion
                            sx={{ marginBottom: "5px" }}
                            key={survey._id}
                            elevation={3}
                            expanded={expanded === `panel-${index}`}
                            onChange={handleChange(`panel-${index}`)}
                            disabled={
                                answeredPreSurveys[survey._id] &&
                                survey?.uniqueAnswer
                            }
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
                                <span>{survey.title}</span>
                                {answeredPreSurveys[survey._id] &&
                                    survey?.uniqueAnswer ? (
                                    <span
                                        style={{
                                            color: "red",
                                            display: "flex",
                                            justifyContent: "end",
                                        }}
                                    >
                                        {" "}
                                        Você já respondeu este questionário.
                                    </span>
                                ) : (
                                    ""
                                )}
                            </Typography>
                        </AccordionSummary>
                        <Divider />
                        <AccordionDetails>
                            <Typography>{survey.description}</Typography>
                            <div style={{ textAlign: "right" }}>
                                {answeredPreSurveys[survey._id] &&
                                    !survey?.uniqueAnswer && (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            style={{ margin: "16px" }}
                                            onClick={() =>
                                                handleEnterSurvey(survey._id)
                                            }
                                        >
                                            Editar
                                        </Button>
                                    )}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    style={{ margin: "16px" }}
                                    onClick={() =>
                                        handleEnterSurvey(survey._id)
                                    }
                                    disabled={answeredPreSurveys[survey._id]}
                                >
                                    {t('enter_label')}
                                </Button>
                            </div>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </div>

            {hasFinishedTasks && (
                <div>
                    {console.log("answeredPostSurveys:", answeredPostSurveys)}
                    {postSurveys?.map((survey, index) =>
                            (!answeredPostSurveys[survey._id] ||
                                (answeredPostSurveys[survey._id] &&
                                        !experiment?.surveysProps?.[survey._id]
                                            ?.uniqueAnswer)) && (
                                <Accordion
                                    sx={{ marginBottom: "5px" }}
                                    key={survey._id}
                                    elevation={3}
                                    expanded={expanded === `panel-${index}`}
                                    onChange={handleChange(`panel-${index}`)}
                                    disabled={
                                        answeredPostSurveys[survey._id] &&
                                        experiment?.surveysProps?.[survey._id]
                                            ?.uniqueAnswer
                                    }
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls={`panel-${index}bh-content`}
                                        id={`panel-${index}bh-header`}
                                        csx={{
                                            "&:hover": {
                                                backgroundColor: "lightgray",
                                            },
                                        }}
                                    >
                                        <Typography>
                                            <span>{survey.title}</span>
                                            {answeredPostSurveys[survey._id] &&
                                                experiment?.surveysProps?.[survey._id]
                                                    ?.uniqueAnswer ? (
                                                <span
                                                    style={{
                                                        color: "red",
                                                        display: "flex",
                                                        justifyContent: "end",
                                                    }}
                                                >
                                                    {" "}
                                                    Você já respondeu este
                                                    questionário.
                                                </span>
                                            ) : (
                                                ""
                                            )}
                                        </Typography>
                                    </AccordionSummary>
                                    <Divider />
                                    <AccordionDetails>
                                        <Typography>
                                            {survey.description}
                                        </Typography>
                                        <div style={{ textAlign: "right" }}>
                                            {answeredPostSurveys[survey._id] &&
                                                !experiment?.surveysProps?.[
                                                    survey._id
                                                ]?.uniqueAnswer && (
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        style={{
                                                            margin: "16px",
                                                        }}
                                                        onClick={() =>
                                                            handleEnterSurvey(
                                                                survey._id
                                                            )
                                                        }
                                                    >
                                                        Editar
                                                    </Button>
                                                )}
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                style={{ margin: "16px" }}
                                                onClick={() =>
                                                    handleEnterSurvey(
                                                        survey._id
                                                    )
                                                }
                                                disabled={
                                                    answeredPostSurveys[
                                                    survey._id
                                                    ]
                                                }
                                            >
                                                Entrar
                                            </Button>
                                        </div>
                                    </AccordionDetails>
                                </Accordion>
                            )
                    )}
                </div>
            )}
        </ExperimentTemplate>
    );
};

export { Surveys };