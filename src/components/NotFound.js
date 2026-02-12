/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { EmojiObjectsOutlined } from "@mui/icons-material"
import { Box, Typography } from "@mui/material"

const NotFound = ({ title, subTitle }) => {
    return (
        <Box sx={{ textAlign: 'center', padding: 5, minHeight: 300, maxHeight: 300, overflowY: 'auto' }}>
            <EmojiObjectsOutlined sx={{ fontSize: 60, color: '#f5a623' }} />
            <Typography variant="h6" sx={{ mt: 2 }}>
                {title}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
                {subTitle}
            </Typography>
        </Box>
    )
}

export default NotFound;