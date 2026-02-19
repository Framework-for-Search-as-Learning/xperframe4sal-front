/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {useState, useEffect, useRef} from "react";
import {Box, Pagination} from "@mui/material";
import {SearchResult} from "../SearchResult.js";
import {SearchBar} from "../SearchBar.js";
import {LoadingIndicator} from "../LoadIndicator";
import {useCookies} from "react-cookie";
import md5 from "md5";
import {ReactComponent as GoogleLogo} from "../../assets/search-engines-logos/Google.svg";

const Google = ({
                    user,
                    taskId,
                    api,
                    session,
                    setSession,
                    setUrlResultModal,
                    setTitleResultModal,
                    setIsShowingResultModal,
                    setClickedResultRank
                }) => {

    const [result, setResult] = useState({});
    const [query, setQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [resultsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [cookies, setCookie] = useCookies();

    const isMounted = useRef(true);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const search = async (searchQuery, start = 1, num = resultsPerPage) => {

        if (!searchQuery?.trim()) return;

        setIsLoading(true);
        const trimmedQuery = searchQuery.trim();
        setQuery(trimmedQuery);

        const cacheKey = md5(user.id + trimmedQuery + start + num);

        if (cookies[cacheKey]) {
            setResult(cookies[cacheKey]);
            setTotalResults(cookies[cacheKey]?.totalResults || 0);
            setIsLoading(false);
            return;
        }

        try {
            const serpNumber = Math.ceil(start / num);

            const [searchResults, userTaskSession] = await Promise.all([
                api.get(
                    `/search-engine/google?query=${trimmedQuery}&start=${start}&num=${num}&taskId=${taskId}`,
                    {headers: {Authorization: `Bearer ${user.accessToken}`}}
                ),
                api.post(
                    `/user-task-session/`,
                    {
                        user_id: user.id,
                        task_id: taskId,
                        query: trimmedQuery,
                        serpNumber
                    },
                    {headers: {Authorization: `Bearer ${user.accessToken}`}}
                )
            ]);

            if (!isMounted.current) return;

            const sessionData = userTaskSession?.data;
            setSession(sessionData);
            localStorage.setItem("userTaskSession", JSON.stringify(sessionData));

            setCookie(cacheKey, searchResults?.data, {path: "/"});
            setResult(searchResults?.data || {});
            setTotalResults(searchResults?.data?.totalResults || 0);

        } catch (error) {
            console.error("Error fetching search results:", error);
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    };

    const openModal = async (url, rank, title) => {

        const storedSession = JSON.parse(localStorage.getItem("userTaskSession") || "{}");
        const sessionId = session?._id || storedSession?._id;

        if (!sessionId) {
            console.error("Session not initialized");
            return;
        }

        window.history.pushState({modal: true}, "");

        setUrlResultModal(url);
        setTitleResultModal(title);
        setIsShowingResultModal(true);
        setClickedResultRank(rank);
        document.body.style.overflow = "hidden";

        try {
            const response = await api.patch(
                `/user-task-session/${sessionId}/open-page/${rank}`,
                {title, url},
                {headers: {Authorization: `Bearer ${user.accessToken}`}}
            );

            if (!isMounted.current) return;

            setSession(response.data);
            localStorage.setItem("userTaskSession", JSON.stringify(response.data));

        } catch (error) {
            console.error("Error updating session:", error);
        }
    };

    useEffect(() => {
        const handlePopState = () => {
            setIsShowingResultModal(false);
            document.body.style.overflow = "auto";
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    return (
        <>
            <div style={{marginBottom: "45px", marginTop: "20px"}}>
                <GoogleLogo
                    alt="Google"
                    style={{
                        display: "flex",
                        margin: "0 auto",
                        paddingBottom: "10px",
                    }}
                />

                <SearchBar
                    userId={user.id}
                    taskId={taskId}
                    handleSearch={search}
                />
            </div>

            {isLoading && <LoadingIndicator size={50}/>}

            {!isLoading && result?.items?.length > 0 && (
                <>
                    <div>
                        {result.items.map((searchResult, index) => (
                            <SearchResult
                                key={index}
                                userId={user.id}
                                rank={searchResult.rank}
                                title={searchResult.title}
                                snippet={searchResult.snippet}
                                link={searchResult.link}
                                openModalHandle={openModal}
                                taskId={taskId}
                            />
                        ))}
                    </div>

                    <Box mt={3} display="flex" justifyContent="center">
                        <Pagination
                            count={Math.ceil(totalResults / resultsPerPage)}
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
                </>
            )}
        </>
    );
};

export {Google};