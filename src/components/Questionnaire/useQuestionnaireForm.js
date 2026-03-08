/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const useQuestionnaireForm = (initial = {}) => {
  const [title, setTitle] = useState(initial.title || '');
  const [description, setDescription] = useState(initial.description || '');
  const [type, setType] = useState(initial.type || 'pre');
  const [questions, setQuestions] = useState(initial.questions || []);
  const [uniqueAnswer, setUniqueAnswer] = useState(initial.uniqueAnswer || false);

  const hasInvalidChoiceQuestion = questions.some(
    (q) =>
      (q.type === 'multiple-selection' || q.type === 'multiple-choices') && q.options.length === 0,
  );

  const hasEmptyStatement = questions.some((q) => q.statement.trim().length === 0);

  const isValid =
    title.trim().length > 0 &&
    description.trim().length > 0 &&
    questions.length > 0 &&
    !hasInvalidChoiceQuestion;

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: uuidv4(),
        statement: '',
        type: 'open',
        required: false,
        hasscore: false,
        options: [],
      },
    ]);
  };

  const removeQuestion = (qId) => setQuestions((prev) => prev.filter((q) => q.id !== qId));

  const updateQuestion = (qId, field, value) =>
    setQuestions((prev) => prev.map((q) => (q.id === qId ? { ...q, [field]: value } : q)));

  const buildPayload = () => ({
    name: title,
    title,
    uuid: uuidv4(),
    description,
    type,
    uniqueAnswer,
    questions: questions.map((q) => {
      const question = {
        statement: q.statement,
        id: q.id,
        type: q.type,
        required: q.required,
        hasscore: q.hasscore,
      };
      if (q.type === 'open') {
        question.options = [];
      } else {
        question.options = q.options.map((opt) => {
          const option = { statement: opt.statement, id: opt.id };
          option.score = q.hasscore ? opt.score : 0;
          if (opt.subquestion) {
            option.subquestion = { ...opt.subquestion };
            option.hassub = true;
          } else {
            option.hassub = false;
          }
          return option;
        });
      }
      return question;
    }),
  });

  const reset = () => {
    setTitle('');
    setDescription('');
    setType('pre');
    setQuestions([]);
    setUniqueAnswer(false);
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    type,
    setType,
    questions,
    addQuestion,
    removeQuestion,
    updateQuestion,
    isValid,
    hasInvalidChoiceQuestion,
    buildPayload,
    reset,
    hasEmptyStatement,
    uniqueAnswer,
    setUniqueAnswer,
  };
};

export default useQuestionnaireForm;
