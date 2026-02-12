import React from "react";
import {
  Box,
  TextField,
  IconButton,
  FormControl,
  Typography,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";

/**
 * Task List Component
 */
const TaskList = ({
  tasks,
  searchTerm,
  onSearchChange,
  openTaskIds,
  onToggleDescription,
  onEditTask,
  onDeleteTask,
  t,
}) => {
  return (
    <FormControl fullWidth>
      {/* <TextField
        fullWidth
        placeholder={t("search_task")}
        variant="outlined"
        value={searchTerm}
        onChange={onSearchChange}
        sx={{ marginBottom: 2 }}
      /> */}

      <Box sx={{ maxHeight: 400, overflowY: "auto", marginTop: 2 }}>
        {tasks.map((task, index) => (
          <Box
            key={index}
            sx={{
              marginBottom: 2,
              padding: 2,
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ maxWidth: "70%" }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    marginBottom: 0.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {task.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#666",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {task.summary}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconButton
                  color="error"
                  onClick={() => onDeleteTask(index)}
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  color="primary"
                  onClick={() => onEditTask(index)}
                  sx={{ ml: 2 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="primary"
                  onClick={() => onToggleDescription(index)}
                  sx={{ ml: 1 }}
                >
                  {openTaskIds.includes(index) ? (
                    <ExpandLessIcon />
                  ) : (
                    <ExpandMoreIcon />
                  )}
                </IconButton>
              </Box>
            </Box>

            {openTaskIds.includes(index) && (
              <Box
                sx={{
                  marginTop: 0,
                  padding: 1,
                  backgroundColor: "#E8E8E8",
                  borderRadius: "4px",
                  maxHeight: "150px",
                  overflowY: "auto",
                  wordBreak: "break-word",
                }}
                dangerouslySetInnerHTML={{ __html: task.description }}
              />
            )}
          </Box>
        ))}
      </Box>
    </FormControl>
  );
};

export default TaskList;
