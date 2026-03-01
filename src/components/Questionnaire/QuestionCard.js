/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import React from 'react';
import {v4 as uuidv4} from 'uuid';
import {
    Box, TextField, FormControl, InputLabel, Select, MenuItem,
    IconButton, Typography, Divider, FormControlLabel, Switch,
    Chip, Tooltip, Radio, Checkbox,
} from '@mui/material';
import {Delete as DeleteIcon} from '@mui/icons-material';
import ClearIcon from '@mui/icons-material/Clear';

const QuestionCard = ({q, index, questionTypes, t, onUpdate, onRemove}) => {
    const isChoice = q.type === 'multiple-selection' || q.type === 'multiple-choices';
    const hasNoOptions = isChoice && q.options.length === 0;
    const OptionIcon = q.type === 'multiple-choices' ? Radio : Checkbox;

    const addOption = () =>
        onUpdate(q.id, 'options', [
            ...q.options,
            {id: uuidv4(), statement: '', score: 0},
        ]);

    const removeOption = (optId) =>
        onUpdate(q.id, 'options', q.options.filter((o) => o.id !== optId));

    const updateOption = (optId, field, value) =>
        onUpdate(
            q.id,
            'options',
            q.options.map((o) => (o.id === optId ? {...o, [field]: value} : o))
        );

    return (
        <Box
            sx={{
                mb: 2,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid #e0e0e0',
                borderLeft: '5px solid #0d5086',
                backgroundColor: '#fff',
                boxShadow: 1,
                transition: 'box-shadow 0.2s',
                '&:hover': {boxShadow: 3},
            }}
        >
            <Box sx={{p: 2, display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap'}}>
                <TextField
                    label={t('questionStatement', {index: index + 1})}
                    value={q.statement}
                    onChange={(e) => onUpdate(q.id, 'statement', e.target.value)}
                    required
                    variant="filled"
                    sx={{flex: 3, minWidth: 180}}
                />
                <FormControl variant="filled" sx={{flex: 1, minWidth: 150}}>
                    <InputLabel>{t('questionType')}</InputLabel>
                    <Select
                        value={q.type}
                        onChange={(e) => {
                            onUpdate(q.id, 'type', e.target.value);
                            if (e.target.value === 'open') onUpdate(q.id, 'options', []);
                        }}
                    >
                        {questionTypes.map((qt) => (
                            <MenuItem key={qt.value} value={qt.value}>{qt.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {isChoice && (
                <Box sx={{px: 2, pb: 1}}>
                    {hasNoOptions && (
                        <Typography variant="caption" color="error" sx={{display: 'block', mb: 1}}>
                            {t('at_least_one_option_required')}
                        </Typography>
                    )}

                    {q.options.map((opt, optIdx) => (
                        <Box
                            key={opt.id}
                            sx={{display: 'flex', alignItems: 'flex-end', gap: 1, mb: 0.5}}
                        >
                            <OptionIcon disabled sx={{color: '#bbb', flexShrink: 0, mb: 0.5}}/>

                            <TextField
                                placeholder={`${t('option')} ${optIdx + 1}`}
                                value={opt.statement}
                                onChange={(e) => updateOption(opt.id, 'statement', e.target.value)}
                                variant="standard"
                                fullWidth
                                required
                            />

                            {q.hasscore && (
                                <TextField
                                    label={t('weight')}
                                    type="number"
                                    value={opt.score || 0}
                                    onChange={(e) => updateOption(opt.id, 'score', Number(e.target.value))}
                                    variant="standard"
                                    inputProps={{style: {textAlign: 'center'}}}
                                    sx={{width: 70, flexShrink: 0}}
                                />
                            )}

                            <Tooltip title={t('excluiopt')}>
                                <IconButton size="small" sx={{mb: 0.5}} onClick={() => removeOption(opt.id)}>
                                    <ClearIcon fontSize="small"/>
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ))}

                    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, mb: 1}}>
                        <OptionIcon disabled sx={{color: '#ccc', flexShrink: 0}}/>
                        <Typography
                            variant="body2"
                            sx={{color: 'text.secondary', cursor: 'pointer', '&:hover': {color: 'primary.main'}}}
                            onClick={addOption}
                        >
                            {t('addOption')}
                        </Typography>
                    </Box>
                </Box>
            )}

            <Divider/>
            <Box sx={{
                px: 2, py: 1,
                backgroundColor: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
            }}>
                <FormControlLabel
                    control={
                        <Switch size="small" checked={Boolean(q.required)}
                                onChange={(e) => onUpdate(q.id, 'required', e.target.checked)}/>
                    }
                    label={<Typography variant="caption">{t('required')}</Typography>}
                />

                {isChoice && (
                    <>
                        <FormControlLabel
                            control={
                                <Switch size="small" checked={Boolean(q.hasscore)}
                                        onChange={(e) => onUpdate(q.id, 'hasscore', e.target.checked)}/>
                            }
                            label={<Typography variant="caption">{t('score')}</Typography>}
                        />
                        {q.type === 'multiple-choices' && (
                            <Chip
                                size="small"
                                label={t('unique_answer')}
                                color={q.uniqueAnswer ? 'primary' : 'default'}
                                onClick={() => onUpdate(q.id, 'uniqueAnswer', !q.uniqueAnswer)}
                                variant={q.uniqueAnswer ? 'filled' : 'outlined'}
                            />
                        )}
                    </>
                )}

                <Box sx={{marginLeft: 'auto'}}>
                    <Tooltip title={t('delete')}>
                        <IconButton color="error" size="small" onClick={() => onRemove(q.id)}>
                            <DeleteIcon/>
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        </Box>
    );
};

export default QuestionCard;