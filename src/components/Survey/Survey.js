/*
 * Copyright (c) 2026, marcelomachado
 * Licensed under The MIT License [see LICENSE for details]
 */

import React from 'react';
import { useState, useEffect, useRef } from 'react';


import {
  Typography,
  FormControlLabel,
  FormControl,
  Checkbox,
  RadioGroup,
  FormGroup,
  Radio,
  TextField,
  Paper,
  Divider,
} from '@mui/material';

import { FunctionsToOptions } from './FunctionsToOptions';

const Survey = ({ survey, callback, params }) => {
  const [formData, setFormData] = useState({});

  const joinResponses = (question, questionIndex, option, event, responseToOneQuestion) => {
    if (question.type === 'multiple-selection') {
      if (formData[questionIndex]) {
        if (!formData[questionIndex].selectedOption) {
          formData[questionIndex].selectedOption = [];
        }

        if (event.target.checked) {
          if (option.score !== undefined) {
            formData[questionIndex].selectedOption.push({ statement: option.statement, score: option.score });
          } else {
            formData[questionIndex].selectedOption.push({ statement: option });
          }
        } else {
          if (option.score !== undefined) {
            formData[questionIndex].selectedOption = formData[questionIndex]
              .selectedOption.filter(so => so.statement !== option.statement)
          } else {
            formData[questionIndex].selectedOption = formData[questionIndex]
              .selectedOption.filter(so => so.statement !== option)
          }
        }
      }
      else {
        setFormData(Object.assign(formData, responseToOneQuestion));
      }
    }
    else {
      setFormData(Object.assign(formData, responseToOneQuestion));
    }
    callback(formData);
  };

  return (
    <Paper elevation={3} style={{ padding: '16px' }}>
      <Typography variant="h5" gutterBottom>
        {survey.title}
      </Typography>
      <Typography variant="body1" paragraph>
        {survey.description}
      </Typography>
      {survey.questions.map(
        (question, questionIndex) =>
          <Question
            key={questionIndex}
            question={question}
            questionIndex={questionIndex}
            callback={joinResponses}
            params={params} />
      )}
    </Paper>
  );
};


const Question = ({ question, questionIndex, callback, params }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [externalOptions, setExternalOptions] = useState(null);

  const handleClickOption = (optionIndex) => {
    setSelectedOption(optionIndex);
  }

  const handleChangeMultipleChoices = (statement, questionIndex, event, option) => {
    const questionData = {
      questionStatement: statement,
      answer: event.target.value,
    };

    if (option) {
      questionData.selectedOption = option.score !== undefined
        ? { statement: option.statement, score: option.score }
        : { statement: option };
    }

    callback(question, questionIndex, option, event, { [questionIndex]: questionData });
  };

  const handleChangeOpen = (statement, questionIndex, event) => {
    const questionData = {
      questionStatement: statement,
      answer: event.target.value,
      selectedOption: {
        statement: event.target.value
      }
    };

    callback(question, questionIndex, undefined, event, { [questionIndex]: questionData });
  };

  const handleCheckboxChange = (statement, questionIndex, event, option) => {
    const questionData = {
      questionStatement: statement,
      selectedOption: []
    };

    if (option) {
      option.score !== undefined
        ? questionData.selectedOption.push({ statement: option.statement, score: option.score })
        : questionData.selectedOption.push({ statement: option });
    }
    callback(question, questionIndex, option, event, { [questionIndex]: questionData });
  };


  const initialized = useRef(false);
  useEffect(() => {
    const handleExternalOptions = async (question) => {
      try {
        const functionToOptions = FunctionsToOptions[question.options.functionName];
        const options = await functionToOptions(params);
        if (options) {
          setExternalOptions(options);
        }
        return null
      } catch (error) {
        return null;
      }
    }
    if (!initialized.current) {
      initialized.current = true
      if (question.type === 'multiple-selection' && question.options?.type === 'function') {
        handleExternalOptions(question)
      }
    }
  }, [params, question]);

  return (
    <div style={{ marginBottom: '40px' }} >

      {question.type === 'multiple-choices' && (
        <>
          <Typography variant="body1">
            {(
              <span> {questionIndex + 1}{") "}<span dangerouslySetInnerHTML={{ __html: question.statement }} /> </span>
            )}{question.required && (
              <span style={{ color: 'red' }}> *</span>
            )}
          </Typography>
          <FormControl name={questionIndex}>
            <RadioGroup
              name={Math.random().toString(36).substring(2, 10) + questionIndex}
              onChange={
                (event) => handleChangeMultipleChoices(
                  question.statement,
                  questionIndex,
                  event,
                  question.options[event.target.value]
                )
              }
            >
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex}>
                  {option.subQuestion === undefined ? (
                    <FormControlLabel
                      key={optionIndex}
                      value={optionIndex}
                      control={<Radio />}
                      label={
                        <Typography sx={{ margin: { xs: '15px 0' } }}>{option.statement ?? option}</Typography>
                      }
                    />
                  ) : (
                    <FormControlLabel
                      key={optionIndex}
                      value={optionIndex}
                      control={<Radio />}
                      label={
                        <Typography sx={{ margin: { xs: '15px 0' } }}>{option.statement ?? option}</Typography>
                      }
                      onChange={() => handleClickOption(optionIndex)}
                    />
                  )}
                  {selectedOption === optionIndex && option.subQuestion && (
                    <Paper elevation={3} style={{ padding: '16px' }}>
                      <Question question={option.subQuestion[0]} questionIndex={questionIndex} callback={callback} />
                    </Paper>
                  )}
                </div>
              ))}
            </RadioGroup>
          </FormControl>
        </>
      )}

      {externalOptions && (
        <>
          <Typography variant="body1">
            {(
              <span> {questionIndex + 1}{") "}{question.statement} </span>
            )}{question.required && (
              <span style={{ color: 'red' }}> *</span>
            )}
          </Typography>
          <FormGroup>
            {externalOptions.map((option, optionIndex) => (
              <FormControlLabel
                key={optionIndex}
                control={<Checkbox
                  onChange={(event) => handleCheckboxChange(
                    question.statement,
                    questionIndex,
                    event,
                    option)}
                />}
                label={
                  <Typography sx={{ wordBreak: 'break-all', margin: { xs: '15px 0' } }}>
                    {option?.statement ?? option}
                  </Typography>
                }
              />
            ))}
          </FormGroup>
        </>
      )}

      {question.type === 'multiple-selection' && question.options.type === undefined && (
        <>
          <Typography variant="body1">
            {(
              <span> {questionIndex + 1}{") "}<span dangerouslySetInnerHTML={{ __html: question.statement }} /> </span>
            )}{question.required && (
              <span style={{ color: 'red' }}> *</span>
            )}
          </Typography>
          <FormGroup>
            {question.options.map((option, optionIndex) => (
              <FormControlLabel
                key={optionIndex}
                control={<Checkbox
                  onChange={(event) => handleCheckboxChange(
                    question.statement,
                    questionIndex,
                    event,
                    question.options[optionIndex])}

                />}
                label={option.statement ?? option}
              />
            ))}
          </FormGroup>
        </>
      )}

      {question.type === 'open' && (
        <>
          <Typography variant="body1">
            {(
              <span> {questionIndex + 1}{") "}<span dangerouslySetInnerHTML={{ __html: question.statement }} /> </span>
            )}{question.required && (
              <span style={{ color: 'red' }}> *</span>
            )}
          </Typography>
          <TextField
            name={Math.random().toString(36).substring(2, 10) + questionIndex}
            label="Resposta"
            variant="outlined"
            fullWidth
            helperText={question.helperText ? <span dangerouslySetInnerHTML={{ __html: question.helperText }} /> : ""}

            onChange={(event) => handleChangeOpen(question.statement, questionIndex, event)}
          />
        </>
      )}
      <Divider variant="fullWidth" />
    </div>
  )
}

export { Survey };