import { useEffect, useState } from "react";
import {
    useParams,
    useNavigate,
    Navigate,
    useLocation,
} from "react-router-dom";
import { api } from "../config/axios";
import {
    Typography,
    Container,
    Paper,
    Button,
    FormControlLabel,
    Checkbox,
    Link,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const ICF = () => {
    const { experimentId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [user] = useState(JSON.parse(localStorage.getItem("user")));
    const [icf, setICF] = useState(null);
    const [accepted, setAccepted] = useState(false);
    const [userExperiment, setUserExperiment] = useState(
        location?.state?.data[0]
    );
    const { t } = useTranslation();
    const isAuthenticated = !!(
        user &&
        user.expirationTime &&
        new Date().getTime() < user.expirationTime
    );

    if (!isAuthenticated) {
        localStorage.removeItem("user");
    }

    useEffect(() => {
        async function fetchData() {
            try {
                let experiment = (
                    await api.get(`experiments2/${experimentId}`, {
                        headers: {
                            Authorization: `Bearer ${user.accessToken}`,
                        },
                    })
                ).data;

                // Buscar ICF pelo experimentId, não icf_id
                const icfResponse = (
                    await api.get(`icf2/experiment/${experimentId}`, {
                        headers: {
                            Authorization: `Bearer ${user.accessToken}`,
                        },
                    })
                ).data;

                setICF(icfResponse);

                if (!userExperiment) {
                    let response = await api.get(
                        `user-experiments2?userId=${user.id}&experimentId=${experimentId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${user.accessToken}`,
                            },
                        }
                    );
                    const userExperimentsData = response.data;
                    setUserExperiment(userExperimentsData);

                    if (
                        userExperimentsData?.stepsCompleted?.["icf"]
                    ) {
                        navigate(`/experiments/${experiment._id}/surveys`);
                    }
                }
            } catch (error) {
                console.log(error);
                navigate("/experiments");
            }
        }

        if (isAuthenticated) {
            fetchData();
        }
    }, [
        user?.id,
        user?.accessToken,
        userExperiment,
        experimentId,
        isAuthenticated,
        navigate,
    ]);

    const handleChange = async (e) => {
        try {
            if (!userExperiment.stepsCompleted) {
                userExperiment.stepsCompleted = {};
            }
            userExperiment.stepsCompleted["icf"] = true;
            await api.patch(
                `user-experiments2/${userExperiment._id}`,
                userExperiment,
                { headers: { Authorization: `Bearer ${user.accessToken}` } }
            );
            navigate(`/experiments/${experimentId}/surveys`);
        } catch (error) {
            /**
             * TODO
             */
            console.log(error);
        }
    };

    if (!icf) {
        return (
            <Container maxWidth="md">
                <Paper elevation={3} style={{ padding: "16px" }}>
                    <Typography variant="body1">{t("loading_icf")}</Typography>
                </Paper>
            </Container>
        );
    }

    return isAuthenticated ? (
        <Paper elevation={3} style={{ padding: "16px" }}>
            <Container elevation={3} maxWidth="md">
                <Paper elevation={3} style={{ padding: "16px" }}>
                    <Typography variant="h5" gutterBottom>
                        {icf.title}
                    </Typography>

                    <Typography
                        variant="body1"
                        paragraph
                        dangerouslySetInnerHTML={{ __html: icf.description }}
                    />

                    {/* 
                    <Typography variant="h6" gutterBottom>
                        {t("researchers_title")}
                    </Typography>

                    {icf.researchers.map((r, index) => (
                        <Typography variant="body1" gutterBottom key={index}>
                            {r}
                        </Typography>
                    ))} 
                    */}

                    <Typography
                        variant="body1"
                        gutterBottom
                        dangerouslySetInnerHTML={{ __html: icf.icfText }}
                    />
                    <Typography variant="body1" paragraph>
                        {t("view_signed_document")}{" "}
                        <Link
                            target="_blank"
                            href="https://drive.google.com/file/d/1_SdcAhNBvnLjamilScjOkHJAP4q5_-em/view?usp=sharing"
                        >
                            {t("click_here")}
                        </Link>
                    </Typography>
                    <Typography
                        variant="body1"
                        gutterBottom
                        dangerouslySetInnerHTML={{
                            __html: icf.agreementStatement,
                        }}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={accepted}
                                onChange={() => setAccepted(!accepted)}
                            />
                        }
                        label={t("accept_terms")}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleChange}
                        disabled={!accepted} // Disable button until terms are accepted
                    >
                        {t("accept_button")}
                    </Button>
                </Paper>
            </Container>
        </Paper>
    ) : (
        <Navigate to="/" />
    );
};

export { ICF };