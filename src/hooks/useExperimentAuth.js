import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../config/axios';

export const useExperimentAuth = (experimentId, user) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [data, setData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const check = async () => {
            try {
                const response = await api.get(`/experiment/${experimentId}`, {
                    headers: { Authorization: `Bearer ${user.accessToken}` },
                });

                if (response.data.owner_id !== user.id) {
                    navigate('/experiments');
                    return;
                }

                setData(response.data);
                setIsAuthorized(true);
            } catch (err) {
                navigate('/experiments');
            } finally {
                setIsLoading(false);
            }
        };
        check();
    }, [experimentId, user.id, user.accessToken, navigate]);

    return { isLoading, isAuthorized, data };
};