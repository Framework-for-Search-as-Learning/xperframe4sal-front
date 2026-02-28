/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import { api } from '../../config/axios';

export class FunctionsToOptions {

  static async getUserVisitedSitesInTask(params) {

    try {
      const [experimentResponse, userTasksResponse] = await Promise.all([
        api.get(`/experiment/${params.experimentId}`, { 'headers': { Authorization: `Bearer ${params.user.accessToken}` } }),
        api.get(`/user-task?userId=${params.user.id}`, { 'headers': { Authorization: `Bearer ${params.user.accessToken}` } })
      ]);

      const experimentResult = experimentResponse?.data;
      const userTasksResult = userTasksResponse?.data;

      const userTask = userTasksResult.filter(value => Object.keys(experimentResult?.tasksProps).includes(value.taskId))[0];

      const result = []
      if (experimentResult?.tasksProps[userTask.taskId].toWhom === "positive") {
        result.push('Inteligência artificial (AI) na educação quais os benefícios - https://www.questionpro.com/blog/pt-br/inteligencia-artificial-na-educacao/')
      } else if (experimentResult?.tasksProps[userTask.taskId].toWhom === "negative") {
        result.push('Malefícios Da Inteligência Artificial Na Educação - https://medium.com/@fatec_ads2_n/malef%C3%ADcios-da-intelig%C3%AAncia-artificial-na-educa%C3%A7%C3%A3o-df8dcd9bc181/')
      }

      const response = await api.get(`/user-task-session?userId=${params.user.id}&taskId=${userTask.taskId}`, { 'headers': { Authorization: `Bearer ${params.user.accessToken}` } });
      const taskSessions = response?.data || [];
      for (let taskSession of taskSessions) {
        if (taskSession.pages) {
          const pages = Object.values(taskSession.pages);
          for (let page of pages) {
            result.push(`"${page[0].title}" --> ${page[0].url}`);
          }
        }
      }

      return result;
    } catch (error) {
      throw error;
    }
  }
}
