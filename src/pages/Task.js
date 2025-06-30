import { SearchResult } from "../components/SearchResult.js";
import { SearchBar } from "../components/SearchBar.js";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { api } from "../config/axios.js";
import { ResultModal } from "../components/ResultModal.js";
import { Tooltip, IconButton, Box, Pagination } from "@mui/material";
import Pause from "@mui/icons-material/Pause";
import Stop from "@mui/icons-material/Stop";
import PlayArrow from "@mui/icons-material/PlayArrow";
import { LoadingIndicator } from "../components/LoadIndicator";
import { useCookies } from "react-cookie";
import md5 from "md5";
import { ReactComponent as GoogleLogo } from "./../assets/search-engines-logos/Google.svg";
import { ErrorMessage } from "../components/ErrorMessage";
import { ConfirmDialog } from "../components/ConfirmDialog.js";
import { CustomSnackbar } from "../components/CustomSnackbar";
import { useTranslation } from "react-i18next";

async function updateUserExperimentStatus(userExperiment, user, api) {
    try {
        userExperiment.stepsCompleted = Object.assign(
            userExperiment.stepsCompleted,
            { task: true }
        );
        await api.patch(
            `user-experiments2/${userExperiment._id}`,
            userExperiment,
            { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );
    } catch (error) {
        throw new Error(error.message);
    }
}

const Task = () => {
    const { t } = useTranslation();
    const [result, setResult] = useState({});
    const navigate = useNavigate();
    const location = useLocation();
    const { experimentId, taskId } = useParams();
    const [task, setTask] = useState(location?.state?.task);
    const [userTask, setUserTask] = useState(null);
    const [showSearchBar] = useState(true);
    const [defaultQuery] = useState();
    const [user] = useState(JSON.parse(localStorage.getItem("user")));
    const [, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [resultsPerPage] = useState(10);
    const [isSuccess, setIsSuccess] = useState(false);
    const [redirect, setRedirect] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isShowingResultModal, setIsShowingResultModal] = useState(false);
    const [urlResultModal, setUrlResultModal] = useState("");
    const [titleResultModal, setTitleResultModal] = useState("");
    const [session, setSession] = useState({});
    const [cookies, setCookie] = useCookies();
    const [clickedResultRank, setClickedResultRank] = useState(null);
    const [paused, setPaused] = useState(false);
    const [finished, setFinished] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [showSnackBar, setShowSnackBar] = useState(false);
    const [severity, setSeverity] = useState("success");
    const [message, setMessage] = useState("success");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [taskResponse, userTaskResponse] = await Promise.all([
                    api.get(`/task2/${taskId}`, {
                        headers: {
                            Authorization: `Bearer ${user.accessToken}`,
                        },
                    }),
                    api.get(`/user-task2?taskId=${taskId}&userId=${user.id}`, {
                        headers: {
                            Authorization: `Bearer ${user.accessToken}`,
                        },
                    }),
                ]);

                const taskResult = taskResponse?.data;
                const userTaskResult = userTaskResponse?.data;
                setTask(taskResult);
                setUserTask(userTaskResult);
                setFinished(userTaskResult.hasFinishedTask);
                setPaused(userTaskResult.isPaused);
            } catch (error) {
                setOpen(true);
                setIsSuccess(false);
                setSeverity("error");
                setMessage(error.message);
            }
        };

        fetchData();
    }, [taskId, user?.accessToken, user?.id]);

    useEffect(() => {
        if (finished) {
            navigate(`/experiments/${experimentId}/surveys`);
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [finished, experimentId, navigate]);

    const handlePauseTask = async () => {
        try {
            const userTaskBackup = await api.patch(
                `user-task2/${userTask._id}/pause`,
                userTask,
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            setUserTask(userTaskBackup.data);
            setPaused(true);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        const handleBeforeUnload = async () => {
            if (!paused) {
                try {
                    const userTaskBackup = await api.patch(
                        `user-task2/${userTask._id}/pause`,
                        userTask,
                        {
                            headers: {
                                Authorization: `Bearer ${user.accessToken}`,
                            },
                        }
                    );
                    setUserTask(userTaskBackup.data);
                    setPaused(true);
                } catch (error) {
                    console.log(error);
                }
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload, {
            passive: false,
        });
    }, [user.accessToken, userTask, paused]);

    const handleResumeTask = async () => {
        try {
            const userTaskBackup = await api.patch(
                `user-task2/${userTask._id}/resume`,
                userTask,
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            setUserTask(userTaskBackup.data);
            setPaused(false);
        } catch (error) {
            console.log(error);
        }
    };

    const openFinishDialog = () => {
        setConfirmDialogOpen(true);
    };

    const closeFinishDialog = () => {
        setConfirmDialogOpen(false);
    };

    const handleFinishTask = async () => {
        try {
            const userExperiment = await api.get(
                `user-experiments2?experimentId=${experimentId}&userId=${user.id}`,
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            await updateUserExperimentStatus(userExperiment?.data, user, api);
            const userTaskBackup = await api.patch(
                `user-task2/${userTask._id}/finish`,
                userTask,
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            setConfirmDialogOpen(false);
            setUserTask(userTaskBackup.data);
            setShowSnackBar(true);
            setIsSuccess(true);
            setSeverity("success");
            setMessage(t("taks_busc_sucess"));
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const handleCloseSuccessSnackbar = async () => {
        setShowSnackBar(false);
        if (isSuccess) {
            setIsSuccess(false);
            await new Promise((resolve) => setTimeout(resolve, 500));
            setRedirect(true);
        }
    };

    useEffect(() => {
        if (redirect) {
            navigate(`/experiments/${experimentId}/surveys`);
        }
    }, [redirect, navigate, experimentId]);

    const search = async (query, start = 1, num = resultsPerPage) => {
        setIsLoading(true);
        query = query.trim();

        if (query) {
            setQuery(query);

            let cacheKey = md5(user.id + query + start + num);

            if (cacheKey in cookies) {
                setResult(cookies[cacheKey] || {});
                setTotalResults(cookies[cacheKey]?.totalResults || 0);
            } else {
                try {
                    const serpNumber = Math.ceil(start / num);

                    /** TODO: should get the search engine from the task. Remove `google` as hardcoded */
                    const [searchResults, userTaskSession] = await Promise.all([
                        api.get(
                            `/search-engine/google?query=${query}&start=${start}&num=${num}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${user.accessToken}`,
                                },
                            }
                        ),
                        api.post(
                            `/user-task-session/`,
                            {
                                userId: user.id,
                                taskId: taskId,
                                query: query,
                                serpNumber: serpNumber,
                                pages: {},
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${user.accessToken}`,
                                },
                            }
                        ),
                    ]);

                    setSession(userTaskSession?.data);

                    setCookie(cacheKey, searchResults?.data, { path: "/" });
                    setResult(searchResults?.data || {});
                    setTotalResults(searchResults?.data?.totalResults || 0);
                } catch (error) {
                    console.error("Error fetching search results:", error);
                }
            }
        }
        setIsLoading(false);
    };

    const openModal = async (url, rank, title) => {
        setUrlResultModal(url);
        setTitleResultModal(title);
        setIsShowingResultModal(true);
        setClickedResultRank(rank);
        document.body.style.overflow = "hidden";

        const payload = {
            title: title,
            url: url,
        };
        const response = await api.patch(
            `/user-task-session/${session._id}/open-page/${rank}`,
            payload,
            { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );

        setSession(response.data);
    };

    const closeModal = async () => {
        setUrlResultModal("");
        setTitleResultModal("");
        setIsShowingResultModal(false);
        document.body.style.overflow = "auto";

        const response = await api.patch(
            `/user-task-session/${session._id}/close-page/${clickedResultRank}`,
            session,
            { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );
        setSession(response.data);
    };

    useEffect(() => {
        window.addEventListener("popstate", async (e) => {
            e.preventDefault();
            if (isShowingResultModal) {
                window.history.go(1);
                setUrlResultModal("");
                setTitleResultModal("");
                setIsShowingResultModal(false);
                document.body.style.overflow = "auto";

                const sessionResult = await api.patch(
                    `/user-task-session/${session._id}/close-page/${clickedResultRank}`,
                    session,
                    { headers: { Authorization: `Bearer ${user.accessToken}` } }
                );
                setSession(sessionResult.data);
            }
        });
    }, [clickedResultRank, isShowingResultModal, session, user.accessToken]);

    return (
        <div style={{ minWidth: "326px" }}>
            {(userTask?.isPaused || paused) && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0, 0, 0, 0.8)",
                        zIndex: 2,
                    }}
                />
            )}
            <Box sx={{ display: "flex" }}>
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

                <Box sx={{ flexGrow: 1, marginBottom: 2, zIndex: 2 }}>
                    {(userTask?.isPaused || paused) && (
                        <ErrorMessage
                            message={t("task_paused")}
                            messageType={"warning"}
                        />
                    )}
                </Box>
                <Box sx={{ paddingLeft: 2, paddingTop: 0.5 }}>
                    {userTask?.isPaused || paused ? (
                        <Tooltip title={t("iniciar")} placement="bottom-start">
                            <IconButton
                                size="large"
                                style={{
                                    backgroundColor: "white",
                                    marginRight: 5,
                                    border: "2px solid #dfe1e5",
                                }}
                                sx={{ zIndex: 2 }}
                                color="success"
                                onClick={handleResumeTask}
                                disabled={false}
                            >
                                <PlayArrow color="success" />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <Tooltip title={t("pausar")} placement="bottom-start">
                            <IconButton
                                size="large"
                                sx={{ zIndex: 2 }}
                                color="primary"
                                style={{
                                    backgroundColor: "white",
                                    marginRight: 5,
                                    border: "2px solid #dfe1e5",
                                }}
                                onClick={handlePauseTask}
                                disabled={false}
                            >
                                <Pause />
                            </IconButton>
                        </Tooltip>
                    )}
                    <Tooltip title={t("finalizar")} placement="bottom-start">
                        <IconButton
                            size="large"
                            color="secondary"
                            sx={{ zIndex: 2 }}
                            style={{
                                backgroundColor: "white",
                                border: "2px solid #dfe1e5",
                            }}
                            onClick={openFinishDialog}
                        >
                            <Stop />
                        </IconButton>
                    </Tooltip>
                </Box>
                <ConfirmDialog
                    open={confirmDialogOpen}
                    onClose={closeFinishDialog}
                    onConfirm={handleFinishTask}
                    title={t("tem_certeza")}
                    content={t("finalizar_tarefa")}
                />
            </Box>
            <div sx={{ marginBottom: "45px", marginTop: "20px" }}>
                <GoogleLogo
                    alt="Google"
                    style={{
                        position: "relative",
                        display: "flex",
                        width: "auto",
                        margin: "0 auto",
                        paddingBottom: "10px",
                    }}
                />
                {showSearchBar ? (
                    <SearchBar
                        userId={user._id}
                        taskId={taskId}
                        handleSearch={search}
                        defaultQuery={defaultQuery}
                    />
                ) : null}
            </div>
            {isLoading && <LoadingIndicator size={50} />}
            {!isLoading && (
                <div>
                    <div>
                        {result &&
                            result.items?.length > 0 &&
                            result.items.map((searchResult, index) => (
                                <SearchResult
                                    userId={user._id}
                                    key={index}
                                    rank={searchResult.rank}
                                    title={searchResult.title}
                                    snippet={searchResult.snippet}
                                    link={searchResult.link}
                                    openModalHandle={openModal}
                                    taskId={taskId}
                                />
                            ))}
                    </div>
                    <div>
                        {result && result.items?.length > 0 && (
                            <Box mt={3} display="flex" justifyContent="center">
                                <Pagination
                                    count={Math.ceil(
                                        totalResults / resultsPerPage
                                    )}
                                    page={currentPage}
                                    onChange={(event, page) => {
                                        setCurrentPage(page);
                                        search(
                                            query,
                                            (page - 1) * resultsPerPage + 1
                                        );
                                    }}
                                    variant="outlined"
                                    shape="rounded"
                                    size="medium"
                                    color="primary"
                                />
                            </Box>
                        )}
                    </div>
                </div>
            )}

            {isShowingResultModal && (
                <ResultModal
                    show={isShowingResultModal}
                    onClose={closeModal}
                    pageUrl={urlResultModal}
                    title={titleResultModal}
                />
            )}
        </div>
    );
};

export { Task };
