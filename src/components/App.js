import { BrowserRouter } from 'react-router-dom';
import { Router } from '../Routes';
import '../config/i18n';


const App = () => {
  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  )
}

export default App;