import { Routes, Route } from 'react-router-dom';
import { PrivateRoutes } from './PrivateRoutes';
import {
  Login,
  ICF,
  Tasks,
  Task,
  Contact,
  Surveys,
  Survey,
  Experiments,
  Register,
  ForgotPassword,
  NotFoundPage,
  Account,
  CreateExperiment,
  ResetPassword,
  Instructions,
  Researcher,
  NotResearcher,
  EditExperiment,
  Chatbot
} from './pages';


const Router = () => {
  return (
    <Routes>
      <Route path='/' element={<Login />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/reset-password' element={<ResetPassword />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />
      <Route path='/account' element={<PrivateRoutes />}>
        <Route index element={<Account />} />
      </Route>
      <Route path='/contact' element={<PrivateRoutes />}>
        <Route index element={<Contact />} />
      </Route>
      <Route path='/instructions' element={<PrivateRoutes />}>
        <Route index element={<Instructions />} />
      </Route>

      <Route path='/CreateExperiment' element={<PrivateRoutes />}>
        <Route index element={<CreateExperiment />} />
      </Route>

      <Route path='/EditExperiment' element={<PrivateRoutes />}>
        <Route path=':experimentId' element={<EditExperiment />} />
      </Route>


      <Route path='/experiments' element={<PrivateRoutes />}>
        <Route index element={<Experiments />} />
        <Route path=':experimentId/icf' element={<ICF />} />
        <Route path=':experimentId/surveys' element={<Surveys />} />
        <Route path=':experimentId/surveys/:surveyId' element={<Survey />} />
        <Route path=':experimentId/tasks/' element={<Tasks />} />
        <Route path=':experimentId/tasks/:taskId' element={<Task />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />

      <Route path='/chatbot' element={<Chatbot />} />
    </Routes>
  )
}

export { Router };