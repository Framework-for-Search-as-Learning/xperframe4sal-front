import React from "react";
import { Box, Button } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

/**
 * Navigation Buttons Component (Desktop and Mobile)
 */
const NavigationButtons = ({
  onBack,
  onNext,
  onToggleCreate,
  isCreateOpen,
  t,
  isMobile = false,
}) => {
  if (isMobile) {
    return (
      <Box
        sx={{
          display: { xs: "flex", sm: "none" },
          justifyContent: "space-between",
          mt: 2,
          width: "100%",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={onBack}
          sx={{ maxWidth: 150, fontWeight: "bold", boxShadow: 2 }}
        >
          <ArrowBack />
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onToggleCreate}
          sx={{ maxWidth: "170px" }}
        >
          {isCreateOpen ? t("cancel") : t("create_task")}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onNext}
          sx={{ maxWidth: 150, fontWeight: "bold", boxShadow: 2 }}
        >
          <ArrowForward />
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: { xs: "none", sm: "flex" },
        justifyContent: "space-between",
        marginTop: "auto",
        width: "100%",
        mt: 2,
      }}
    >
      <Box>
        <Button
          variant="contained"
          color="primary"
          onClick={onBack}
          sx={{ maxWidth: 150, fontWeight: "bold", boxShadow: 2 }}
        >
          {t("back")}
        </Button>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ marginRight: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={onToggleCreate}
          >
            {isCreateOpen ? t("cancel") : t("create_task")}
          </Button>
        </Box>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={onNext}
            sx={{ maxWidth: "120px" }}
          >
            {t("next")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default NavigationButtons;
