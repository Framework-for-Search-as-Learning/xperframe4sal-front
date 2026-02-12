/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React from 'react';
import {
  Box,
  Paper,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const Instructions = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 2 }}>
      <Box component='div' >
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.0rem', sm: '2rem', marginBottom: 30 } }}>
          {t('instructions_video_text')}
        </Typography>
        <Box component='div' sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box
            sx={{ width: { sm: 654, xs: 360 }, height: { sm: 375, xs: 205 } }}
            component='iframe'
            src="https://www.youtube.com/embed/Q4C4ees0VLQ?rel=0&si=6_lCAUI5nbnHa_yJ"
            title={t('youtube_video_title')}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;"
            allowFullScreen
          />
        </Box>
      </Box>

      <Box component='div' >
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.0rem', sm: '2rem', marginBottom: 30 } }}>
          {t('instructions_export_title')}
        </Typography>
        <Box component='div' sx={{ display: 'flex' }}>
          <Box component='div' sx={{ display: 'flex', justifyContent: 'start' }}>
            <Box component='div' sx={{ maxWidth: 800, textAlign: 'left', marginBottom: 3 }}>
              <Typography variant="body1" paragraph>
                {t('yaml_instructions_intro')}
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ marginTop: 2, marginBottom: 1 }}>
                {t('yaml_structure_title')}
              </Typography>

              <Typography variant="body2" paragraph>
                {t('yaml_structure_description')}
              </Typography>

              <Typography variant="h6" gutterBottom sx={{ marginTop: 2, marginBottom: 1 }}>
                {t('yaml_field_requirements_title')}
              </Typography>

              <Typography variant="body2" component="div">
                <strong>experiment:</strong> {t('yaml_experiment_description')}<br />
                • <strong>name:</strong> {t('yaml_name_description')}<br />
                • <strong>summary:</strong> {t('yaml_summary_description')}<br />
                • <strong>typeExperiment:</strong> {t('yaml_type_experiment_description')}<br />
                • <strong>betweenExperimentType:</strong> {t('yaml_between_type_description')}<br /><br />

                <strong>icf:</strong> {t('yaml_icf_description')}<br />
                • <strong>title:</strong> {t('yaml_icf_title_description')}<br />
                • <strong>description:</strong> {t('yaml_icf_desc_description')}<br /><br />

                <strong>surveys:</strong> {t('yaml_surveys_description')}<br />
                • <strong>title:</strong> {t('yaml_survey_title_description')}<br />
                • <strong>description:</strong> {t('yaml_survey_desc_description')}<br />
                • <strong>type:</strong> {t('yaml_survey_type_description')}<br />
                • <strong>uniqueAnswer:</strong> {t('yaml_survey_unique_description')}<br />
                • <strong>required:</strong> {t('yaml_survey_required_description')}<br />
                • <strong>questions:</strong> {t('yaml_questions_description')}<br /><br />

                <strong>tasks:</strong> {t('yaml_tasks_description')}<br />
                • <strong>title:</strong> {t('yaml_task_title_description')}<br />
                • <strong>summary:</strong> {t('yaml_task_summary_description')}<br />
                • <strong>search_source:</strong> {t('yaml_search_source_description')}<br />
                • <strong>search_model:</strong> {t('yaml_search_model_description')}<br />
              </Typography>
            </Box>
          </Box>

          <Box component='div' sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end', padding: 3, borderLeft: '1px solid grey' }}>
            <Box component='div' sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box component='div' sx={{ maxWidth: 800, textAlign: 'right' }}>
                <Typography variant="h6" gutterBottom>
                  {t('yaml_template_title')}
                </Typography>
                <Typography variant="body2" paragraph>
                  {t('yaml_template_description')}
                </Typography>
              </Box>
            </Box>

            <Box component='div' sx={{ display: 'flex', justifyContent: 'center' }}>
              <Paper
                sx={{
                  backgroundColor: '#f6f8fa',
                  border: '1px solid #d1d9e0',
                  borderRadius: 1,
                  padding: 2,
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  fontSize: '14px',
                  overflow: 'auto',
                  '& pre': {
                    margin: 0,
                    whiteSpace: 'pre-wrap',
                  }
                }}
              >
                <pre>
                  <code>
                    {`experiment:
  name:
  summary:
  typeExperiment:
  betweenExperimentType:
  icf:
    title:
    description:
  surveys:
    - title:
      description:
      type: 
      uniqueAnswer:
      required:
      questions:
        - type: 
          statement:
          required:
          options:
  tasks:
    - title:
      summary:
      description: 
      rule_type:
      max_score:
      min_score:
      search_source:
      search_model:`}
                  </code>
                </pre>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export { Instructions };