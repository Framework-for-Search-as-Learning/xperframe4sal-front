/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { api } from "../config/axios";
import { Button, Typography } from "@mui/material";
import { Survey as SurveyComponent } from "../components/Survey/Survey";
import { CustomSnackbar } from "../components/CustomSnackbar";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingIndicator } from "../components/LoadIndicator";
import { useTranslation } from "react-i18next";

function wasAllRequiredQuestionsAnswered(formData, survey) {
    const questionsNotAnswered = Object.keys(survey?.questions).filter(
        (key) =>
            survey.questions[key].required &&
            !Object.keys(formData).includes(key)
    );
    return questionsNotAnswered.length === 0;
}
async function updateUserExperimentStatus(
    userSurveysApiCalls,
    stepName,
    userExperiment,
    user,
    api
) {
    try {
        if (userSurveysApiCalls.length > 0) {
            let answeredSurveys = await Promise.all(userSurveysApiCalls);
            answeredSurveys = answeredSurveys.reduce(
                (accumulator, answeredSurvey) => {
                    //Removi a verificação do length pois o data é objeto, não array
                    if (answeredSurvey.data /*&& answeredSurvey.data.length > 0*/) {
                        
                        return accumulator.concat(answeredSurvey.data);
                    }
                    return accumulator;
                },
                []
            );

            if (answeredSurveys.length === userSurveysApiCalls.length) {
                userExperiment.stepsCompleted = Object.assign(
                    userExperiment.stepsCompleted,
                    { [stepName]: true }
                );
                await api.patch(
                    `user-experiment/${userExperiment._id}`,
                    userExperiment,
                    { headers: { Authorization: `Bearer ${user.accessToken}` } }
                );
                const stepsCompleted = userExperiment.stepsCompleted;
                let finishedExperiment = false;
                for (let step of Object.keys(stepsCompleted)) {
                    if (!stepsCompleted[step]) {
                        finishedExperiment = false;
                        break;
                    }
                    finishedExperiment = true;
                }
                if (finishedExperiment) {
                    await api.patch(
                        `user-experiment/${userExperiment._id}`,
                        { hasFinished: true },
                        {
                            headers: {
                                Authorization: `Bearer ${user.accessToken}`,
                            },
                        }
                    );
                }
            }
        }
    } catch (error) {
        throw error;
    }
}

async function separateUsersInGroup(api, user, userScore, experiment) {
    /**
     * TODO: think where to put this logic of select the tasks for the use
     *
     **/
    if (userScore) {
        let taskId;
        if (userScore < 2) {
            taskId = Object.values(experiment.tasksProps).filter(
                (taskProps) => taskProps.toWhom === "negative"
            )[0]?.id;
        } else if (userScore >= 10) {
            taskId = Object.values(experiment.tasksProps).filter(
                (taskProps) => taskProps.toWhom === "positive"
            )[0]?.id;
        } else if (userScore >= 2 && userScore <= 8) {
            taskId = Object.values(experiment.tasksProps).filter(
                (taskProps) => taskProps.toWhom === "neutral"
            )[0]?.id;
        } else {
            const words = ["positive", "negative", "neutral"];
            const randomIndex = Math.floor(Math.random() * words.length);
            const randomWord = words[randomIndex];
            taskId = Object.values(experiment.tasksProps).filter(
                (taskProps) => taskProps.toWhom === randomWord
            )[0]?.id;
        }
        if (!taskId) {
            taskId = Object.values(experiment.tasksProps).filter(
                (taskProps) => taskProps.toWhom === "neutral"
            )[0]?.id;
        }

        const userTask = {
            userId: user.id,
            taskId: taskId,
        };

        const response = await api.get(
            `user-task?userId=${user.id}&taskId=${taskId}`,
            { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );

        if (response?.data) {
            await api.patch(`user-task/${response.data._id}`, userTask, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });
        } else {
            await api.post(`user-task`, userTask, {
                headers: { Authorization: `Bearer ${user.accessToken}` },
            });
        }
    }
}

const Survey = () => {
    const { experimentId, surveyId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const [formData, setFormData] = useState({});
    const storedUser = localStorage.getItem("user");
    const [user] = useState(storedUser ? JSON.parse(storedUser) : null);
    const [survey, setSurvey] = useState(location?.state?.survey);
    const [experiment, setExperiment] = useState(location?.state?.experiment);
    const [userExperiment, setUserExperiment] = useState(null);
    const [redirect, setRedirect] = useState(false);
    const [surveySent, setSurveySent] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showSnackBar, setShowSnackBar] = useState(false);
    const [severity, setSeverity] = useState("success");
    const [message, setMessage] = useState("success");
    const [allRequiredQuestionsAnswered, setAllRequiredQuestionsAnswered] =
        useState(false);
    const [surveyAnswer, setUserSurvey] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchSurveyData = async () => {
            setIsLoading(true);
            try {
                const [
                    userExperimentResponse,
                    experimentResponse,
                    surveyResponse,
                    userSurveyResponse,
                ] = await Promise.all([
                    api.get(
                        `user-experiment?experimentId=${experimentId}&userId=${user.id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${user.accessToken}`,
                            },
                        }
                    ),
                    !experiment
                        ? api.get(`experiment/${experimentId}`, {
                            headers: {
                                Authorization: `Bearer ${user.accessToken}`,
                            },
                        })
                        : null,
                    !survey
                        ? api.get(`survey/${surveyId}`, {
                            headers: {
                                Authorization: `Bearer ${user.accessToken}`,
                            },
                        })
                        : null,
                    api.get(
                        `survey-answer?userId=${user.id}&surveyId=${surveyId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${user.accessToken}`,
                            },
                        }
                    ),
                ]);

                const userExperimentResult = userExperimentResponse?.data;


                if (!userExperimentResult) {
                    navigate(`/experiments`);
                }

                setUserExperiment(userExperimentResult);

                const experimentResult = experimentResponse?.data;
                const surveyResult = surveyResponse?.data;
                const userSurveyResult = userSurveyResponse?.data;

                setUserSurvey(userSurveyResult);

                if (isMounted) {
                    let uniqueAnswer = false;
                    if (experimentResult) {
                        uniqueAnswer =
                            survey?.uniqueAnswer;
                        setExperiment(experimentResult);
                    }

                    if (surveyResult) {
                        setSurvey(surveyResult);
                    }

                    if (userSurveyResult?.length > 0 && uniqueAnswer) {
                        navigate(`/experiments/${experimentId}/surveys`);
                    }
                }
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
                console.error("Error fetching survey data:", error);
            }
        };

        fetchSurveyData();

        return () => {
            isMounted = false;
        };
    }, [
        surveyId,
        survey,
        user?.id,
        experimentId,
        experiment,
        user?.accessToken,
        navigate,
    ]);

    const handleChange = (result) => {
        setAllRequiredQuestionsAnswered(
            wasAllRequiredQuestionsAnswered(result, survey)
        );

        setFormData(result);
    };

    const handleSubmit = async (surveyAnswer, surveysProps) => {
        const handleSurveySubmit = async (apiCall) => {
            try {
                await apiCall();
            } catch (error) {
                setSurveySent(false);
                throw new Error(error.message);
            }
        };

        try {
            if (!wasAllRequiredQuestionsAnswered(formData, survey)) {
                setShowSnackBar(true);
                setIsSuccess(false);
                setSeverity("error");
                setMessage(t("please_answer_all_required_questions"));
                return;
            }

            const answers = Object.entries(formData).map(([index, value]) => {
                const question = survey.questions[index];
                if (!question) return null;
                if (question.type === "open") {
                    return {
                        id: question.id || question._id || index,
                        questionStatement: value.questionStatement,
                        questionType: question.type,
                        textAnswer: value.answer
                    };
                } else {
                    let selectedOptions = [];
                    if (Array.isArray(value.selectedOption)) {

                        selectedOptions = value.selectedOption.map(opt => ({
                            statement: opt.statement,
                            score: opt.score ?? 0
                        }));

                    } else if (value.selectedOption) {
                        selectedOptions = [{
                            statement: value.selectedOption.statement,
                            score: value.selectedOption.score ?? 0
                        }];
                    }
                    return {
                        id: question.id || question._id || index,
                        questionStatement: value.questionStatement,
                        questionType: question.type,
                        selectedOptions
                    };
                }
            }).filter(Boolean);
            if (surveyAnswer) {
                surveyAnswer.answers = answers;
                if (surveyAnswer.score !== undefined) delete surveyAnswer.score;
                if (surveyAnswer.score !== undefined) delete surveyAnswer.score;
                await separateUsersInGroup(
                    api,
                    user,
                    null,
                    experiment
                );

                await handleSurveySubmit(() =>
                    api.patch(
                        `survey-answer/${surveyAnswer._id}`,
                        surveyAnswer,
                        {
                            headers: {
                                Authorization: `Bearer ${user.accessToken}`,
                            },
                        }
                    )
                );
            } else {
                surveyAnswer = {
                    userId: user.id,
                    surveyId: survey._id,
                    answers
                };
                await separateUsersInGroup(
                    api,
                    user,
                    null,
                    experiment
                );
                await handleSurveySubmit(() =>
                    api.post("survey-answer", surveyAnswer, {
                        headers: {
                            Authorization: `Bearer ${user.accessToken}`,
                        },
                    })
                );
            }

            const userPreSurveysApiCalls = [];
            const userPostSurveysApiCalls = [];

            if (survey.required) {
                if (survey.type === "pre") {
                    userPreSurveysApiCalls.push(
                        api.get(
                            `survey-answer?userId=${user.id}&surveyId=${surveyId}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${user.accessToken}`,
                                },
                            }
                        )
                    );
                }
                if (survey.type === "post") {
                    userPostSurveysApiCalls.push(
                        api.get(
                            `survey-answer?userId=${user.id}&surveyId=${surveyId}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${user.accessToken}`,
                                },
                            }
                        )
                    );
                }
            }


            await updateUserExperimentStatus(
                userPreSurveysApiCalls,
                "pre",
                userExperiment,
                user,
                api
            );
            await updateUserExperimentStatus(
                userPostSurveysApiCalls,
                "post",
                userExperiment,
                user,
                api
            );
            setSurveySent(true);
            setShowSnackBar(true);
            setIsSuccess(true);
            setSeverity("success");
            setMessage(null);
        } catch (error) {
            setShowSnackBar(true);
            setIsSuccess(false);
            setSeverity("error");
            setMessage(error.message);
            setSurveySent(false);
        }
    };

    const handleCloseSuccessSnackbar = async () => {
        setShowSnackBar(false);
        if (isSuccess) {
            setIsSuccess(false);
            await new Promise((resolve) => setTimeout(resolve, 600));
            setRedirect(true);
        }
    };

    useEffect(() => {
        if (redirect) {
            navigate(`/experiments/${experimentId}/surveys`);
        }
    }, [redirect, navigate, experimentId]);

    return (
        <>
            {!survey && (
                <Typography variant="body1">
                    {t("loading_survey_message")}
                </Typography>
            )}
            {!survey && isLoading && <LoadingIndicator size={70} />}
            {survey && survey?.uniqueAnswer && (
                <ErrorMessage
                    style={{
                        flex: 1,
                        marginBottom: 10,
                    }}
                    message={t("unique_answer_survey_message")}
                    messageType={"warning"}
                />
            )}
            <CustomSnackbar
                open={showSnackBar}
                handleClose={handleCloseSuccessSnackbar}
                time={1500}
                message={message}
                severity={severity}
                slide={true}
                variant="filled"
                showLinear={true}
            />
            {survey && (
                <>
                    <SurveyComponent
                        survey={survey}
                        callback={handleChange}
                        params={{ user: user, experimentId: experimentId }}
                    />
                    <div
                        style={{
                            display: "flex",
                            marginTop: "8px",
                            justifyContent: "flex-end",
                        }}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() =>
                                handleSubmit(
                                    surveyAnswer,
                                    experiment?.surveysProps
                                )
                            }
                            disabled={
                                !allRequiredQuestionsAnswered || surveySent
                            }
                        >
                            {t("submit_button")}
                        </Button>
                    </div>
                </>
            )}
        </>
    );
};

export { Survey };
