# Overview

Inside this directory you can find the files related to the project Web Client, the UI developed to consume the framework and present the experiment and its related tasks to the user (the participant in this case). The _public_ directory is created by the React Library when starting a new project and contains some files like _robots.txt_ and the _index.html_ file where the project is embedded.

The _src_ directory is where the files of interest are located. Inside this folder are the scripts to control the system's routes (_Routes.js_ and _Privateroutes.js_) and to render the app (index.js). The other directories have the following files:

**components**: in this directory are the scripts related to the system's interface (_App.js_), some elements of the search system (_SearchBar.js_, _SearchResult.js_ and _SearchResultPageView.js_), to the questionnaires (LikertScaleForm.js - inside _forms_ folder).

**config**: contains just the configuration of the axios library (_axios.js_) to communicate with the framework. The JSON format was setted. 

**pages**: contains the pages where the information required along the experiment will be shown. In this directory you can find the code related to the page of surveys, to the page of the informed consent form (ICF.js).
