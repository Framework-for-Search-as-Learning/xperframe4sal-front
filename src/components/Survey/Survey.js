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

const Survey = ({ survey, callback, params, existingAnswers }) => {
  const [formData, setFormData] = useState({});

  // Função para converter as respostas existentes para o formato do formData
  const convertExistingAnswersToFormData = (answers) => {
    if (!answers || !Array.isArray(answers)) return {};

    const convertedData = {};
    answers.forEach((answer) => {
      // Encontrar o índice da questão no survey baseado no questionStatement ou id
      const questionIndex = survey.questions.findIndex(q =>
        q.statement === answer.questionStatement ||
        q.id === answer.id ||
        q._id === answer.id
      );

      if (questionIndex !== -1) {
        if (answer.questionType === 'open') {
          convertedData[questionIndex] = {
            questionStatement: answer.questionStatement,
            answer: answer.textAnswer,
            selectedOption: {
              statement: answer.textAnswer
            }
          };
        } else {
          // Para multiple-choice e multiple-selection
          convertedData[questionIndex] = {
            questionStatement: answer.questionStatement,
            selectedOption: answer.selectedOptions || []
          };
        }
      }
    });
    return convertedData;
  };

  // Inicializar formData com respostas existentes
  useEffect(() => {
    if (existingAnswers && existingAnswers.length > 0) {
      console.log('Loading existing answers:', existingAnswers);
      const initialFormData = convertExistingAnswersToFormData(existingAnswers);
      console.log('Converted form data:', initialFormData);
      setFormData(initialFormData);
      callback(initialFormData);
    }
  }, [existingAnswers]);

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
            params={params}
            initialValue={formData[questionIndex]} />
      )}
    </Paper>
  );
};


const Question = ({ question, questionIndex, callback, params, initialValue }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [externalOptions, setExternalOptions] = useState(null);
  const [textValue, setTextValue] = useState('');
  const [checkedOptions, setCheckedOptions] = useState([]);

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
    const value = event.target.value;
    setTextValue(value);

    const questionData = {
      questionStatement: statement,
      answer: value,
      selectedOption: {
        statement: value
      }
    };

    callback(question, questionIndex, undefined, event, { [questionIndex]: questionData });
  };

  const handleCheckboxChange = (statement, questionIndex, event, option) => {
    const optionStatement = option.statement || option;
    let newCheckedOptions;

    if (event.target.checked) {
      newCheckedOptions = [...checkedOptions, optionStatement];
    } else {
      newCheckedOptions = checkedOptions.filter(opt => opt !== optionStatement);
    }

    setCheckedOptions(newCheckedOptions);

    const questionData = {
      questionStatement: statement,
      selectedOption: newCheckedOptions.map(optStatement => {
        const foundOption = question.options.find(opt =>
          (opt.statement || opt) === optStatement
        );
        return foundOption && foundOption.score !== undefined
          ? { statement: optStatement, score: foundOption.score }
          : { statement: optStatement };
      })
    };

    callback(question, questionIndex, option, event, { [questionIndex]: questionData });
  };


  const initialized = useRef(false);

  // Inicializar valores com base na resposta existente
  useEffect(() => {
    if (initialValue) {
      if (question.type === 'open' && initialValue.answer) {
        setTextValue(initialValue.answer);
      }
      // Para multiple-choices, encontrar o índice da opção selecionada
      if (question.type === 'multiple-choices' && initialValue.selectedOption) {
        const selectedStatement = initialValue.selectedOption.statement;
        const optionIndex = question.options.findIndex(option =>
          (option.statement || option) === selectedStatement
        );
        if (optionIndex !== -1) {
          setSelectedOption(optionIndex);
        }
      }
      // Para multiple-selection, marcar as opções selecionadas
      if (question.type === 'multiple-selection' && initialValue.selectedOption && Array.isArray(initialValue.selectedOption)) {
        const selectedStatements = initialValue.selectedOption.map(opt => opt.statement);
        setCheckedOptions(selectedStatements);
      }
    }
  }, [initialValue, question]);

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
              value={selectedOption !== null ? selectedOption.toString() : ''}
              onChange={
                (event) => {
                  const optionIndex = parseInt(event.target.value);
                  setSelectedOption(optionIndex);
                  handleChangeMultipleChoices(
                    question.statement,
                    questionIndex,
                    event,
                    question.options[optionIndex]
                  )
                }
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
                  checked={checkedOptions.includes(option?.statement || option)}
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
                  checked={checkedOptions.includes(option.statement || option)}
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
            value={textValue}
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