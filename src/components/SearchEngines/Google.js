/*
 * Copyright (c) 2026, marcelomachado
 * Licensed under The MIT License [see LICENSE for details]
 */

import { useState } from "react";
import { Box, Pagination } from "@mui/material";
import { SearchResult } from "../SearchResult.js";
import { SearchBar } from "../SearchBar.js";
import { LoadingIndicator } from "../LoadIndicator";
import { useCookies } from "react-cookie";
import md5 from "md5";
import { ReactComponent as GoogleLogo } from "../../assets/search-engines-logos/Google.svg";

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
    const [showSearchBar] = useState(true);
    const [defaultQuery] = useState();
    const [query, setQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [resultsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [cookies, setCookie] = useCookies();

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
                            `/user-task-session2/`,
                            {
                                user_id: user.id,
                                task_id: taskId,
                                query: query,
                                serpNumber: serpNumber,
                                //pages: {},
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
            `/user-task-session2/${session._id}/open-page/${rank}`,
            payload,
            { headers: { Authorization: `Bearer ${user.accessToken}` } }
        );

        setSession(response.data);
    };

    return (
        <>
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
                        userId={user.id}
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
                            result.items.map((searchResult, index) => (<SearchResult
                                userId={user.id}
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
        </>
    )
}

export { Google }