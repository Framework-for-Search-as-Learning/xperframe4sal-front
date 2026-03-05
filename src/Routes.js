/*
 * Copyright (c) 2026, lapic-ufjf
 * Licensed under The MIT License [see LICENSE for details]
 */

import {Routes, Route, Navigate, Outlet} from 'react-router-dom';
import {PrivateRoutes} from './PrivateRoutes';
import {
    Contact,
    Register,
    ForgotPassword,
    NotFoundPage,
    Account,
    ResetPassword,
    Instructions,
} from './pages';

import { Login } from './pages/Auth/Login';
import { 
    CreateExperiment, 
    EditExperiment, 
    Experiments,
    ExperimentMonitoring,
    ICF,
    Questionnaire,
    Questionnaires,
    Task,
    Tasks,
} from './pages/Experiment';
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import EditUser from "./pages/components/EditUser";

const RoleGuard = ({requireResearcher}) => {
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || (requireResearcher && !user.researcher)) {
        return <Navigate to="/experiments" replace/>;
    }

    return <Outlet/>;
};

const Router = () => {
    return (
        <ThemeProvider theme={theme}>
            <Routes>
                <Route path='/' element={<Login/>}/>
                <Route path='/login' element={<Login/>}/>
                <Route path='/register' element={<Register/>}/>
                <Route path='/reset-password' element={<ResetPassword/>}/>
                <Route path='/forgot-password' element={<ForgotPassword/>}/>
                <Route path='/account' element={<PrivateRoutes/>}>
                    <Route index element={<Account/>}/>
                </Route>
                <Route path='/contact' element={<PrivateRoutes/>}>
                    <Route index element={<Contact/>}/>
                </Route>
                <Route path='/instructions' element={<PrivateRoutes/>}>
                    <Route index element={<Instructions/>}/>
                </Route>

                <Route path='/experiments' element={<PrivateRoutes/>}>
                    <Route index element={<Experiments/>}/>
                    <Route element={<RoleGuard requireResearcher={true}/>}>
                        <Route path='new' element={<CreateExperiment/>}/>
                        <Route path=':experimentId/edit' element={<EditExperiment/>}/>
                        <Route path=':experimentId/participants' element={<EditUser/>}/>
                        <Route path=":experimentId/monitoring" element={<ExperimentMonitoring/>}/>
                    </Route>
                    <Route path=':experimentId/icf' element={<ICF/>}/>
                    <Route path=':experimentId/surveys' element={<Questionnaires/>}/>
                    <Route path=':experimentId/surveys/:surveyId' element={<Questionnaire/>}/>
                    <Route path=':experimentId/tasks/' element={<Tasks/>}/>
                    <Route path=':experimentId/tasks/:taskId' element={<Task/>}/>
                </Route>
                <Route path="*" element={<NotFoundPage/>}/>
            </Routes>
        </ThemeProvider>
    )
}

export {Router};
