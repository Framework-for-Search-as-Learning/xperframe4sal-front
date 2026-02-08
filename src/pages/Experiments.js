/*
 * Copyright (c) 2026, marcelomachado
 * Licensed under The MIT License [see LICENSE for details]
 */

import React, { useEffect, useState } from 'react';
import Researcher from './components/Researcher';
import NotResearcher from './components/NotResearcher';


const Experiments = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  const renderContent = () => {
    if (user?.researcher) {
      return <Researcher />;
    }
    return <NotResearcher />;
  };

  return <div>{user ? renderContent() : <p></p>}</div>;
};

export { Experiments };
